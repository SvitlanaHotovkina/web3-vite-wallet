import { useState } from "react";
import { unlockWallet } from "@/utils/wallet-unlock";
import { serverLogger } from "@/utils/server-logger";

export default function PutPassword({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    try {
      const wallet = await unlockWallet(password);

      if (!wallet?.privateKey) throw new Error("Wallet was not onlocked");

      onSuccess();
    } catch (err) {
      serverLogger.warn("handleUnlock", { err });
      setError("❌ Неверный пароль!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">🔐 Введите пароль</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded p-2"
        placeholder="Пароль"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleUnlock}
        className="w-full py-2 bg-blue-600 text-white rounded"
      >
        Войти
      </button>
    </div>
  );
}
