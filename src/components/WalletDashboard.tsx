import { useState } from "react";
import { unlockWallet } from "@/utils/wallet-unlock";
import { WalletSession } from "@/utils/walletSession";

export default function WalletDashboard({
  walletSession,
  onLogout,
}: {
  walletSession: WalletSession;
  onLogout: () => void;
}) {
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  if (!walletSession) {
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

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">🏦 Ваш Web3 гаманець</h2>
      <div className="p-4 bg-gray-100 rounded-xl">
        <p>
          <strong>📌 Адреса:</strong> {walletSession.address}
        </p>
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
    </div>
  );
}
