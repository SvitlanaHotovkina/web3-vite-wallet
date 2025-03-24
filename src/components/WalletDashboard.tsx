import { useEffect, useState } from "react";
import { unlockWallet } from "@/utils/wallet-unlock";
import { getWalletSession, WalletSession } from "@/utils/walletSession";
import NetworkSwitcher from "@/components/NetworkSwitcher";
import Transfer from "@/components/Transfer";
import Swap from "@/components/Swap";
import Modal from "@/components/Modal";
import { serverLogger } from "@/utils/server-logger";

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
  const [showSwapModal, setShowSwapModal] = useState(false);

  const gasEstimate = 0.005;
  const balanceNum = parseFloat(sessionData.balance);
  const canPayFees = balanceNum >= gasEstimate;
  const nativeSymbol = sessionData.network.toUpperCase();

  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = await getWalletSession();
      if (latest && JSON.stringify(latest) !== JSON.stringify(sessionData)) {
        setSessionData(latest);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionData]);

  if (!sessionData) {
    return <p className="text-center text-red-500">❌ Гаманець не знайдено</p>;
  }

  const handleShowPrivateKey = async () => {
    const password = prompt("Введіть пароль для розшифровки приватного ключа:");
    if (!password) return;

    try {
      const wallet = await unlockWallet(password);
      setPrivateKey(wallet.privateKey);
      setTimeout(() => setPrivateKey(null), 30000);
    } catch (error) {
      serverLogger.warn("handleShowPrivateKey", { error });
      alert("Неправильний пароль");
    }
  };

  const handleRequestFaucet = async () => {
    alert("🎁 Симуляція запиту faucet: тестові токени були б надіслані...");
    // Тут ти можеш додати реальний fetch-запит до свого faucet API
  };

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
          <strong>💰 Нативний баланс:</strong> {sessionData.balance}{" "}
          {nativeSymbol}
          {canPayFees && (
            <>
              <button
                onClick={() => setShowTransferModal(true)}
                className="ml-4 text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded shadow"
              >
                Відправити
              </button>
              <button
                onClick={() => setShowSwapModal(true)}
                className="ml-2 text-sm bg-green-500 text-white px-3 py-1 rounded shadow"
              >
                Своп
              </button>
            </>
          )}
        </p>

        {!canPayFees && (
          <div className="text-sm text-red-500 space-y-1">
            <p>
              ❗ Недостатньо балансу для покриття комісії (мінімум ~0.005{" "}
              {nativeSymbol})
            </p>
            <button
              onClick={handleRequestFaucet}
              className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded"
            >
              Отримати тестові токени
            </button>
          </div>
        )}

        <div>
          <strong>🪙 Токени:</strong>
          <ul className="list-disc list-inside text-sm">
            <li key="native">
              {nativeSymbol}: {sessionData.balance}
            </li>
            {sessionData.tokens
              ?.filter((t) => parseFloat(t.balance) > 0)
              .map((token) => (
                <li key={token.contractAddress}>
                  {token.symbol}: {token.balance}
                </li>
              ))}
          </ul>
        </div>
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

      {showSwapModal && (
        <Modal onClose={() => setShowSwapModal(false)}>
          <Swap walletSession={sessionData} />
        </Modal>
      )}
    </div>
  );
}
