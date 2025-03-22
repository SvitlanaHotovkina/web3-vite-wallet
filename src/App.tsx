import { useEffect, useState } from "react";
import WalletDashboard from "@/components/WalletDashboard";
import PutPassword from "@/components/PutPassword";
import OnBoarding from "@/components/OnBoarding";
import { getWalletSession, clearWalletSession } from "@/utils/walletSession";
import { getEncryptedWallet } from "@/utils/walletStorage";

function App() {
  const [walletSession, setWalletSession] = useState(getWalletSession());
  const [state, setState] = useState<
    "checking" | "onboarding" | "put-password" | "dashboard"
  >("checking");

  useEffect(() => {
    if (walletSession) {
      setState("dashboard");
    } else {
      getEncryptedWallet().then((w) => {
        setState(w ? "put-password" : "onboarding");
      });
    }
  }, [walletSession]);

  const handleLogout = () => {
    clearWalletSession();
    location.reload(); // Перезагружаем страницу
  };

  if (state === "checking")
    return <p className="p-4">🔄 Проверка состояния кошелька...</p>;
  if (state === "dashboard" && walletSession)
    return (
      <WalletDashboard walletSession={walletSession} onLogout={handleLogout} />
    );
  if (state === "put-password")
    return (
      <PutPassword onSuccess={() => setWalletSession(getWalletSession())} />
    );
  return <OnBoarding onCreated={() => setWalletSession(getWalletSession())} />;
}

export default App;
