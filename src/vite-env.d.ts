/// <reference types="vite/client" />

// Tauri global internals type augmentation
interface Window {
  __TAURI_INTERNALS__?: {
    metadata?: {
      currentWindow?: {
        label: string;
      };
    };
  };
}
