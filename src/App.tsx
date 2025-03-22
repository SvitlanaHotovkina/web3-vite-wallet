import { useEffect, useState } from "react";
import WalletDashboard from "@/components/WalletDashboard";
import PutPassword from "@/components/PutPassword";
import OnBoarding from "@/components/OnBoarding";
import { getWalletSession, WalletSession } from "@/utils/walletSession";
import { startSessionUpdater } from "@/utils/sessionUpdater";

let isStartSessionUpdater = false;

export default function App() {
  const [walletSession, setWalletSession] = useState<null | WalletSession>(
    null
  );
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [state, setState] = useState<
    "checking" | "onboarding" | "put-password" | "dashboard"
  >("checking");

  // ⏳ Ініціалізація сесії
  useEffect(() => {
    getWalletSession().then((session) => {
      if (!isStartSessionUpdater && session) {
        startSessionUpdater(); // 🔁 Запускаємо обробник оновлення
        isStartSessionUpdater = true;
      }

      if (isUnlocked && session) {
        setWalletSession(session);
        setState("dashboard");
      } else if (session) {
        setState("put-password");
      } else {
        setState("onboarding");
      }
    });
  }, [isUnlocked]);

  const handleLogout = () => {
    setIsUnlocked(false);
    setWalletSession(null);
    setState("put-password");
  };

  if (state === "checking") {
    return <p className="p-4">⏳ Перевірка стану гаманця...</p>;
  }

  if (state === "dashboard" && walletSession) {
    return (
      <WalletDashboard walletSession={walletSession} onLogout={handleLogout} />
    );
  }

  if (state === "put-password") {
    return <PutPassword onSuccess={() => setIsUnlocked(true)} />;
  }

  return <OnBoarding onCreated={() => setIsUnlocked(true)} />;
}
