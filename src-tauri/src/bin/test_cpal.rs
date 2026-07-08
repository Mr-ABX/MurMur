use cpal::Sample;

fn main() {
    let s: i16 = 32767;
    let f: f32 = s.to_sample::<f32>();
    println!("f: {}", f);
}
