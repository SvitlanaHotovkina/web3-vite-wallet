import { getWalletInfo } from "./getWalletInfo";
import { serverLogger } from "./server-logger";
import { getWalletSession, updateWalletSession } from "./walletSession";

let isRunning = false;
let currentAbortController: AbortController | null = null;
let lastSessionId = "";

const res = `ok ${Date.now()}`;

export async function startSessionUpdater() {
  if (isRunning) return res; // не запускаємо повторно

  isRunning = true;

  const loop = async () => {
    const session = await getWalletSession();

    if (session?.address && session?.rpcUrl) {
      const currentSessionId = `${session.address}_${session.rpcUrl}`;

      if (lastSessionId !== currentSessionId && currentAbortController) {
        serverLogger.debug(
          "🛑 Aborting previous request due to session change"
        );
        currentAbortController.abort();
      }

      lastSessionId = currentSessionId;
      currentAbortController = new AbortController();

      try {
        const newInfo = await getWalletInfo(
          session.address,
          session.rpcUrl,
          currentAbortController.signal
        );

        if (newInfo) updateWalletSession({ ...session, ...newInfo });

        serverLogger.debug("🔄 Session updated", { sUrl: session.rpcUrl });
      } catch (e) {
        serverLogger.warn("❌ Session update failed:", { e });
      } finally {
        currentAbortController = null; // 🧼 Обнуляємо після завершення
      }
    } else {
      serverLogger.warn("❌ Session not updated SESSION:", { session });
    }

    setTimeout(loop, 10000); // 🔁 повтор
    return res;
  };

  return loop();
}
