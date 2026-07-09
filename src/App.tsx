import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import OverlayWindow from "./components/OverlayWindow";
import SettingsPanel from "./components/SettingsPanel";
import TrayMenu from "./components/TrayMenu";
import { useAppState } from "./hooks/useAppState";

import { getCurrentWindow } from '@tauri-apps/api/window';

// Determine which view to show based on window label
// Tauri uses different windows for different views
const windowLabel = getCurrentWindow().label;

function App() {
  const appState = useAppState();
  const [view, setView] = useState<"tray" | "overlay" | "settings">(
    windowLabel === "overlay" ? "overlay" :
    windowLabel === "settings" ? "settings" :
    "tray"
  );

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
    </AnimatePresence>
  );
}

export default App;
