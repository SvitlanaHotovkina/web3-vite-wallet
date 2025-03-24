import { useState, useEffect } from "react";
import { createWallet } from "@/utils/wallet-create";
import { restoreWallet } from "@/utils/wallet-restore";
import { serverLogger } from "@/utils/server-logger";

export default function OnBoarding({ onCreated }: { onCreated: () => void }) {
  const [walletData, setWalletData] = useState<null | {
    address: string;
    privateKey: string;
    mnemonic: string;
    password: string;
  }>(null);

  useEffect(() => {
    if (walletData) {
      const timeout = setTimeout(() => {
        setWalletData(null);
      }, 30000); // автоматичне очищення через 30 секунд
      return () => clearTimeout(timeout);
    }
  }, [walletData]);

  const handleCreate = async () => {
    const wallet = await createWallet();
    if (
      !wallet ||
      !wallet.privateKey ||
      !wallet.mnemonic ||
      !wallet.password ||
      !wallet.address
    ) {
      throw new Error("Wallet was not created properly");
    }
    setWalletData(wallet);
  };

  const handleRestore = async () => {
    const phrase = prompt("Введите мнемоническую фразу:");
    if (!phrase) return;
    try {
      const wallet = await restoreWallet(phrase);
      if (
        !wallet ||
        !wallet.privateKey ||
        !wallet.mnemonic ||
        !wallet.password ||
        !wallet.address
      ) {
        throw new Error("Wallet was not restored properly");
      }
      setWalletData(wallet);
    } catch (err) {
      serverLogger.warn("handleRestore", { err });
      alert("❌ Неверная мнемофраза!");
    }
  };

  if (walletData) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-4">
        <h2 className="text-xl font-bold text-green-700">
          ✅ Гаманець створено!
        </h2>
        <div className="bg-gray-100 rounded p-4 space-y-2 text-sm">
          <p>
            <strong>🔐 Пароль:</strong> {walletData.password}
          </p>
          <p>
            <strong>🧠 Фраза:</strong> {walletData.mnemonic}
          </p>
          <p>
            <strong>🔑 Приватний ключ:</strong> {walletData.privateKey}
          </p>
          <p>
            <strong>📬 Адреса:</strong> {walletData.address}
          </p>
        </div>
        <button
          onClick={onCreated}
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          Я зберіг(ла) — продовжити
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">🆕 Добро пожаловать!</h2>
      <p>Создайте новый кошелек или восстановите из фразы.</p>
      <button
        onClick={handleCreate}
        className="w-full py-2 bg-green-600 text-white rounded"
      >
        Создать новый
      </button>
      <button
        onClick={handleRestore}
        className="w-full py-2 bg-yellow-500 text-white rounded"
      >
        Восстановить кошелек
      </button>
    </div>
  );
}
