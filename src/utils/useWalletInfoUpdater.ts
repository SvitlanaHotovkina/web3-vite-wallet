import { useEffect } from "react";
import { ethers } from "ethers";
import { getWalletSession, updateWalletSession } from "./walletSession";
import { getWalletInfo } from "./getWalletInfo";

export function useWalletInfoUpdater(provider: ethers.JsonRpcProvider) {
  useEffect(() => {
    let isCancelled = false;

    const poll = async () => {
      const session = getWalletSession();
      if (!session) return;

      try {
        const newInfo = await getWalletInfo(session.address);
        const updated = {
          ...session,
          ...newInfo,
        };
        updateWalletSession(updated);
        console.log("🔄 Оновлено сесію:", updated);
      } catch (e) {
        console.error("❌ Не вдалося оновити сесію:", e);
      }

      if (!isCancelled) {
        setTimeout(poll, 5000); // через 5 секунд запускаємо знову
      }
    };

    poll(); // старт одразу при монтуванні

    return () => {
      isCancelled = true; // очищення при анмаунті компонента
    };
  }, [provider]);
}
