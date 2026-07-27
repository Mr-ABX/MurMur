import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { X, Volume2, VolumeX } from "lucide-react";

export default function MiniWidget() {
  const [response, setResponse] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Listen for responses from the screen assistant
    const unlisten = listen<string>("assistant_response", (event) => {
      setResponse(event.payload);
      if (!isMuted) {
        speakText(event.payload);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
      window.speechSynthesis.cancel();
    };
  }, [isMuted]);

  const speakText = (text: string) => {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    
    // Clean up text (remove markdown for TTS)
    const cleanText = text.replace(/[*_#`]/g, "");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Wait for voices to load if they haven't already
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Try to find a good English voice
      const preferredVoice = voices.find(v => v.lang.startsWith("en-") && (v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Natural")));
      if (preferredVoice) utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const closeWidget = async () => {
    window.speechSynthesis.cancel();
    setResponse("");
    await getCurrentWindow().hide();
  };

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (response) {
      speakText(response);
    }
    setIsMuted(!isMuted);
  };

  return (
    <div 
      className="w-full h-full p-2 flex flex-col bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl text-zinc-200 font-sans overflow-hidden"
      data-tauri-drag-region
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-700/50 drag-region cursor-move" data-tauri-drag-region>
        <div className="flex items-center gap-2 pointer-events-none">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`} />
          <span className="text-xs font-semibold tracking-wide text-zinc-300">Murmur Assistant</span>
        </div>
        <div className="flex items-center gap-1 z-10">
          <button 
            onClick={toggleMute}
            className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-zinc-200 cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
          <button 
            onClick={closeWidget}
            className="p-1 hover:bg-red-500/20 rounded-md transition-colors text-zinc-400 hover:text-red-400 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
        <AnimatePresence mode="popLayout">
          {response ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm leading-relaxed whitespace-pre-wrap pb-2"
            >
              {response}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center text-zinc-500 text-xs italic"
            >
              Waiting for response...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
