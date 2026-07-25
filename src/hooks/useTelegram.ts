import { useEffect, useMemo } from "react";

export function useTelegram() {
  const webApp = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    webApp?.ready?.();
    webApp?.expand?.();
    webApp?.enableClosingConfirmation?.();
  }, [webApp]);

  return useMemo(() => ({
    isTelegram: Boolean(webApp),
    impact: () => webApp?.HapticFeedback?.impactOccurred("light"),
    error: () => webApp?.HapticFeedback?.notificationOccurred("error"),
    success: () => webApp?.HapticFeedback?.notificationOccurred("success")
  }), [webApp]);
}
