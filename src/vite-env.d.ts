/// <reference types="vite/client" />

interface TelegramWebApp {
  ready?: () => void;
  expand?: () => void;
  enableClosingConfirmation?: () => void;
  HapticFeedback?: {
    impactOccurred(style: "light" | "medium" | "heavy"): void;
    notificationOccurred(type: "error" | "success" | "warning"): void;
  };
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
