import { useEffect, useState } from "react";
import { unlockWallet } from "@/utils/wallet-unlock";
import { getWalletSession, WalletSession } from "@/utils/walletSession";
import NetworkSwitcher from "@/components/NetworkSwitcher";
import Transfer from "@/components/Transfer";
import Modal from "@/components/Modal"; // припускаємо, що є компонент модалки

export default function WalletDashboard({
  walletSession,
  onLogout,
}: {
  walletSession: WalletSession;
  onLogout: () => void;
}) {
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<WalletSession>(walletSession);
  const [showTransferModal, setShowTransferModal] = useState(false);

  useEffect(() => {
    console.log("📦 useEffect запущено");

    const interval = setInterval(async () => {
      const latest = await getWalletSession();
      if (latest && JSON.stringify(latest) !== JSON.stringify(sessionData)) {
        console.log("🔁 Сесія змінилась — оновлюємо компонент");
        setSessionData(latest);
      }
    }, 5000);

    return () => {
      console.log("🧹 useEffect очищено");
      clearInterval(interval);
    };
  }, [sessionData]);

  if (!sessionData) {
    return <p className="text-center text-red-500">❌ Гаманець не знайдено</p>;
  }

  const handleShowPrivateKey = async () => {
    const password = prompt("Введите пароль для расшифровки приватного ключа:");
    if (!password) return;

    try {
      const wallet = await unlockWallet(password);
      setPrivateKey(wallet.privateKey);

      setTimeout(() => setPrivateKey(null), 30000); // Очистить через 30 секунд
    } catch (error) {
      console.log(error);
      alert("Неверный пароль");
    }
  };

  const nativeSymbol = sessionData.network === "bnbt" ? "BNB" : "ETH";

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">🏦 Ваш Web3 гаманець</h2>
      <div className="p-4 bg-gray-100 rounded-xl space-y-2">
        <p className="text-red-600">
          <strong>📌 Адреса:</strong> {sessionData.address}
        </p>
        <p className="text-blue-600">
          <strong>🌐 Мережа:</strong> {sessionData.network}
        </p>
        <p className="text-yellow-600">
          <strong>💰 Баланс:</strong> {sessionData.balance} {nativeSymbol}
          {parseFloat(sessionData.balance) > 0 && (
            <button
              onClick={() => setShowTransferModal(true)}
              className="ml-4 text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded shadow"
            >
              Відправити на гаманець
            </button>
          )}
        </p>
        {sessionData.tokens && sessionData.tokens.length > 0 && (
          <div>
            <strong>🪙 Токени:</strong>
            <ul className="list-disc list-inside text-sm">
              {sessionData.tokens.map((token) => (
                <li key={token.contractAddress}>
                  {token.symbol}: {token.balance}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-2">
        <NetworkSwitcher />
      </div>

      {privateKey && (
        <p className="text-red-500 mt-2">
          <strong>🔑 Приватний ключ:</strong> {privateKey}
        </p>
      )}

      <button
        onClick={onLogout}
        className="px-4 py-2 bg-red-600 text-white rounded-2xl shadow"
      >
        Вийти
      </button>
      <button
        onClick={handleShowPrivateKey}
        className="px-4 py-2 bg-blue-600 text-white rounded-2xl shadow ml-2"
      >
        Показати приватний ключ
      </button>

      {showTransferModal && (
        <Modal onClose={() => setShowTransferModal(false)}>
          <Transfer walletSession={sessionData} />
        </Modal>
      )}
    </div>
  );
}
