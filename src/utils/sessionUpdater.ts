// utils/sessionUpdater.ts
import { getWalletInfo } from "./getWalletInfo";
import { getWalletSession, updateWalletSession } from "./walletSession";

let isRunning = false;

const res = `ok ${Date.now()}`;

export async function startSessionUpdater() {
  if (isRunning) return res; // не запускаємо повторно

  isRunning = true;

  const loop = async () => {
    const session = await getWalletSession();

    if (session?.address) {
      try {
        const newInfo = await getWalletInfo(session.address);
        if (newInfo) updateWalletSession({ ...session, ...newInfo });

        console.log("🔄 Session updated");
      } catch (e) {
        console.warn("❌ Session update failed:", e);
      }
    }

    setTimeout(loop, 5000); // 🔁 повтор
    return res;
  };

  return loop();
}
