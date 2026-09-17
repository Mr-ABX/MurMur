import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Dashboard } from "./components/layout/Dashboard";
import { SuperNotch } from "./components/overlay/SuperNotch";
import TrayMenu from "./components/TrayMenu";
import MiniWidget from "./components/MiniWidget";
import { useAppState } from "./hooks/useAppState";
import { useLiquidSync } from "./hooks/useLiquidSync";
import { getCurrentWindow } from '@tauri-apps/api/window';

// Determine which view to show based on window label
const windowLabel = getCurrentWindow().label;

function App() {
  const appState = useAppState();
  useLiquidSync();
  const [view] = useState<"dashboard" | "overlay" | "tray" | "widget" | "notch">(
    windowLabel === "overlay" ? "overlay" :
    windowLabel === "widget" ? "widget" :
    windowLabel === "notch" ? "notch" :
    windowLabel === "tray" ? "tray" :
    "dashboard"
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

  if (view === "notch" || view === "overlay") {
    return (
      <div className="w-screen h-screen bg-transparent overflow-hidden flex flex-col items-center">
        <SuperNotch />
      </div>
    );
  }

  if (view === "widget") {
    return <MiniWidget />;
  }

  if (view === "tray") {
    return <TrayMenu state={appState} onOpenSettings={() => {}} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Dashboard key="dashboard" />
    </AnimatePresence>
  );
}

export default App;
