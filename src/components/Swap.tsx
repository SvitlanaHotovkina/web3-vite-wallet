import { useState, useEffect } from "react";
import { WalletSession } from "@/utils/walletSession";
import { KNOWN_TOKENS } from "@/constants/networks";
import { useTokenSwap } from "@/hooks/useTokenSwap";
import { useTokenBalance } from "@/hooks/useTokenBalance";

export default function Swap({
  walletSession,
}: {
  walletSession: WalletSession;
}) {
  const [fromTokenKey, setFromTokenKey] = useState("");
  const [toTokenKey, setToTokenKey] = useState("");
  const [amount, setAmount] = useState("");

  const networkKey = walletSession.network.toLowerCase();
  const tokens = KNOWN_TOKENS[networkKey] || [];
  const fromToken = tokens.find((t) => t.symbol === fromTokenKey);
  const toToken = tokens.find((t) => t.symbol === toTokenKey);

  const balance = useTokenBalance(walletSession, fromToken);

  const { isSwapping, expectedAmount, message, calculateExpectedAmount, swap } =
    useTokenSwap(walletSession, fromToken, toToken, amount);

  useEffect(() => {
    calculateExpectedAmount();
  }, [amount, fromToken, toToken, calculateExpectedAmount]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">🔄 Обмін токенів</h2>
      <p>
        <strong>📌 Адреса гаманця:</strong> {walletSession.address}
      </p>
      <p>
        <strong>🌐 Мережа:</strong> {walletSession.network}
      </p>
      <p>
        <strong>💰 Баланс {fromTokenKey}:</strong> {balance ?? "-"}
      </p>

      <select
        value={fromTokenKey}
        onChange={(e) => setFromTokenKey(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">-- Оберіть токен --</option>
        {tokens.map((t) => (
          <option key={t.symbol} value={t.symbol}>
            {t.symbol} {t.abi.length === 0 && "(Не підключено)"}
          </option>
        ))}
      </select>

      <select
        value={toTokenKey}
        onChange={(e) => setToTokenKey(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">-- Оберіть токен --</option>
        {tokens
          .filter((t) => t.symbol !== fromTokenKey)
          .map((t) => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol} {t.abi.length === 0 && "(Не підключено)"}
            </option>
          ))}
      </select>

      <input
        type="number"
        placeholder="Сума для обміну"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border rounded p-2"
      />

      {expectedAmount && (
        <p>
          <strong>📈 Очікуєте отримати:</strong> {expectedAmount} {toTokenKey}
        </p>
      )}

      <button
        onClick={swap}
        disabled={
          isSwapping || !fromToken || !toToken || fromToken.abi.length === 0
        }
        className="w-full py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Обміняти
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </div>
  );
}
