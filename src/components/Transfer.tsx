import { useState } from "react";
import { WalletSession } from "@/utils/walletSession";
import { unlockWallet } from "@/utils/wallet-unlock";
import { JsonRpcProvider, Wallet, ethers } from "ethers";

export default function Transfer({
  walletSession,
}: {
  walletSession: WalletSession;
}) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUseMax = () => {
    setAmount(walletSession.balance);
  };

  const handleTransfer = async () => {
    if (isSending) return;
    if (!to || !amount) {
      setMessage("❗ Введіть адресу та суму");
      return;
    }

    const numericAmount = parseFloat(amount);
    const numericBalance = parseFloat(walletSession.balance);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("❗ Введіть коректну суму");
      return;
    }

    if (numericAmount > numericBalance) {
      setMessage("❗ Недостатньо коштів на балансі");
      return;
    }

    const password = prompt("Введіть пароль для підпису трансакції:");
    if (!password) return;

    try {
      setIsSending(true);
      setMessage("🔓 Розблокування гаманця...");
      const wallet = await unlockWallet(password);

      setMessage("📡 Відправка трансакції...");
      const provider = new JsonRpcProvider(walletSession.rpcUrl);
      const signer = new Wallet(wallet.privateKey, provider);

      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      setMessage("✅ Трансакція відправлена: " + tx.hash);
    } catch (error) {
      console.error(error);
      setMessage("❌ Помилка при трансакції");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">💸 Переказ токенів</h2>
      <p>
        <strong>📌 Адреса:</strong> {walletSession.address}
      </p>
      <p>
        <strong>🌐 Мережа:</strong> {walletSession.network}
      </p>
      <p>
        <strong>💰 Баланс:</strong> {walletSession.balance}
      </p>

      <input
        type="text"
        placeholder="Кому (адреса)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full border rounded p-2"
      />
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Сума"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          onClick={handleUseMax}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Макс
        </button>
      </div>

      <button
        onClick={handleTransfer}
        disabled={isSending}
        className="w-full py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Відправити
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
