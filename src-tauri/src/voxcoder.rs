// voxcoder.rs - VoxCoder Mode: Smart formatting for developer dictation
// Converts spoken coding vocabulary into actual code symbols

use std::collections::HashMap;

/// Apply VoxCoder transformations to raw transcript text
pub fn apply_voxcoder_mode(text: &str) -> String {
    let mut result = text.to_string();

    // Apply phrase replacements (order matters - longer phrases first)
    let replacements = get_replacements();
    let mut sorted_keys: Vec<&str> = replacements.keys().map(|s| s.as_ref()).collect();
    sorted_keys.sort_by(|a, b| b.len().cmp(&a.len())); // longest first

    for key in sorted_keys {
        let pattern = format!(r"(?i)\b{}\b", regex_escape(key));
        if let Ok(re) = regex::Regex::new(&pattern) {
            let replacement: &str = replacements[key];
            result = re.replace_all(&result, replacement).to_string();
        }
    }

    // Handle camel case: "camel case <words>" -> camelCaseWords
    result = apply_naming_conventions(&result);

    // Trim excess whitespace
    result = result.trim().to_string();
    result = normalize_whitespace(&result);

    result
}

fn get_replacements() -> HashMap<&'static str, &'static str> {
    let mut m = HashMap::new();

    // Brackets & braces
    m.insert("left curly brace", "{");
    m.insert("right curly brace", "}");
    m.insert("open curly brace", "{");
    m.insert("close curly brace", "}");
    m.insert("left curly", "{");
    m.insert("right curly", "}");
    m.insert("open curly", "{");
    m.insert("close curly", "}");
    m.insert("left brace", "{");
    m.insert("right brace", "}");
    m.insert("open brace", "{");
    m.insert("close brace", "}");
    m.insert("left square bracket", "[");
    m.insert("right square bracket", "]");
    m.insert("open square bracket", "[");
    m.insert("close square bracket", "]");
    m.insert("left bracket", "[");
    m.insert("right bracket", "]");
    m.insert("open bracket", "[");
    m.insert("close bracket", "]");
    m.insert("left parenthesis", "(");
    m.insert("right parenthesis", ")");
    m.insert("open parenthesis", "(");
    m.insert("close parenthesis", ")");
    m.insert("left paren", "(");
    m.insert("right paren", ")");
    m.insert("open paren", "(");
    m.insert("close paren", ")");
    m.insert("left angle bracket", "<");
    m.insert("right angle bracket", ">");
    m.insert("open angle bracket", "<");
    m.insert("close angle bracket", ">");

    // Dollar templates
    m.insert("dollar open curly", "${");
    m.insert("dollar open brace", "${");
    m.insert("dollar curly", "${");
    m.insert("dollar brace", "${");

    // Operators
    m.insert("arrow function", "=>");
    m.insert("fat arrow", "=>");
    m.insert("thin arrow", "->");
    m.insert("skinny arrow", "->");
    m.insert("triple equals", "===");
    m.insert("triple equal", "===");
    m.insert("double equals", "==");
    m.insert("double equal", "==");
    m.insert("not equals", "!==");
    m.insert("not equal to", "!==");
    m.insert("is equal to", "===");
    m.insert("greater than or equal", ">=");
    m.insert("less than or equal", "<=");
    m.insert("greater than", ">");
    m.insert("less than", "<");
    m.insert("plus equals", "+=");
    m.insert("minus equals", "-=");
    m.insert("times equals", "*=");
    m.insert("divide equals", "/=");
    m.insert("logical and", "&&");
    m.insert("logical or", "||");
    m.insert("double ampersand", "&&");
    m.insert("double pipe", "||");
    m.insert("bang", "!");
    m.insert("exclamation mark", "!");
    m.insert("question mark", "?");
    m.insert("optional chaining", "?.");
    m.insert("nullish coalescing", "??");
    m.insert("spread operator", "...");
    m.insert("rest operator", "...");

    // Punctuation & Equals
    m.insert("equals", "=");
    m.insert("equal", "=");
    m.insert("equals sign", "=");
    m.insert("equal sign", "=");
    m.insert("semicolon", ";");
    m.insert("colon", ":");
    m.insert("dot", ".");
    m.insert("comma", ",");
    m.insert("plus sign", "+");
    m.insert("minus sign", "-");
    m.insert("asterisk", "*");
    m.insert("slash", "/");
    m.insert("backslash", "\\");
    m.insert("underscore", "_");
    m.insert("hash", "#");
    m.insert("at sign", "@");
    m.insert("dollar sign", "$");
    m.insert("percent sign", "%");
    m.insert("caret", "^");
    m.insert("tilde", "~");
    m.insert("pipe", "|");
    m.insert("ampersand", "&");

    // Quotes
    m.insert("back tick", "`");
    m.insert("backtick", "`");
    m.insert("single quote", "'");
    m.insert("double quote", "\"");
    m.insert("template literal", "`");

    // Common methods / keywords
    m.insert("dot log open paren", ".log(");
    m.insert("console dot log", "console.log(");
    m.insert("return statement", "return");
    m.insert("const variable", "const");
    m.insert("let variable", "let");
    m.insert("new line", "\n");
    m.insert("tab character", "\t");

    m
}

/// Handle "camel case <words>", "snake case <words>", "pascal case <words>"
fn apply_naming_conventions(text: &str) -> String {
    let mut result = text.to_string();

    // Regex for "camel case word1 word2 ..."
    if let Ok(re) = regex::Regex::new(r"(?i)camel\s+case\s+((?:\w+\s*)+?)(?:\s*(?:semicolon|dot|comma|open|close|$))") {
        result = re.replace_all(&result, |caps: &regex::Captures| {
            let words = caps[1].split_whitespace().collect::<Vec<_>>();
            to_camel_case(&words)
        }).to_string();
    }

    // Regex for "snake case word1 word2 ..."
    if let Ok(re) = regex::Regex::new(r"(?i)snake\s+case\s+((?:\w+\s*)+?)(?:\s*(?:semicolon|dot|comma|open|close|$))") {
        result = re.replace_all(&result, |caps: &regex::Captures| {
            let words = caps[1].split_whitespace().collect::<Vec<_>>();
            words.join("_").to_lowercase()
        }).to_string();
    }

    // Regex for "pascal case word1 word2 ..."
    if let Ok(re) = regex::Regex::new(r"(?i)pascal\s+case\s+((?:\w+\s*)+?)(?:\s*(?:semicolon|dot|comma|open|close|$))") {
        result = re.replace_all(&result, |caps: &regex::Captures| {
            let words = caps[1].split_whitespace().collect::<Vec<_>>();
            words.iter().map(|w| capitalize(w)).collect::<String>()
        }).to_string();
    }

    result
}

fn to_camel_case(words: &[&str]) -> String {
    words.iter().enumerate().map(|(i, w)| {
        if i == 0 { w.to_lowercase() } else { capitalize(w) }
    }).collect()
}

fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
    }
}

fn normalize_whitespace(s: &str) -> String {
    let re = regex::Regex::new(r" {2,}").unwrap();
    re.replace_all(s, " ").to_string()
}

fn regex_escape(s: &str) -> String {
    s.chars().map(|c| {
        if "()[]{}.*+?^$|\\".contains(c) {
            format!("\\{}", c)
        } else {
            c.to_string()
        }
    }).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_replacements() {
        assert_eq!(apply_voxcoder_mode("open curly brace"), "{");
        assert_eq!(apply_voxcoder_mode("close curly brace"), "}");
        assert_eq!(apply_voxcoder_mode("arrow function"), "=>");
        assert_eq!(apply_voxcoder_mode("triple equals"), "===");
    }

    #[test]
    fn test_camel_case() {
        let result = apply_voxcoder_mode("camel case print hello world");
        assert!(result.contains("printHelloWorld"));
    }

    #[test]
    fn test_snake_case() {
        let result = apply_voxcoder_mode("snake case print hello");
        assert!(result.contains("print_hello"));
    }
}
