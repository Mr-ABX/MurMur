import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import OverlayWindow from "./components/OverlayWindow";
import SettingsPanel from "./components/SettingsPanel";
import TrayMenu from "./components/TrayMenu";
import MiniWidget from "./components/MiniWidget";
import Notch from "./components/Notch";
import { useAppState } from "./hooks/useAppState";

import { getCurrentWindow } from '@tauri-apps/api/window';

// Determine which view to show based on window label
// Tauri uses different windows for different views
const windowLabel = getCurrentWindow().label;

function App() {
  const appState = useAppState();
  const [view, setView] = useState<"tray" | "overlay" | "settings" | "widget" | "notch">(
    windowLabel === "overlay" ? "overlay" :
    windowLabel === "settings" ? "settings" :
    windowLabel === "widget" ? "widget" :
    windowLabel === "notch" ? "notch" :
    "tray"
  );

  // Global scroll listener: shows sleek scrollbar only while actively scrolling
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    const handleScroll = () => {
      document.body.classList.add("is-scrolling");
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 750);
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {view === "overlay" && (
        <OverlayWindow key="overlay" state={appState} />
      )}
      {view === "settings" && (
        <SettingsPanel key="settings" state={appState} />
      )}
      {view === "tray" && (
        <TrayMenu key="tray" state={appState} onOpenSettings={() => setView("settings")} />
      )}
      {view === "widget" && (
        <MiniWidget key="widget" />
      )}
      {view === "notch" && (
        <Notch key="notch" state={appState} />
      )}
    </AnimatePresence>
  );
}

export default App;
