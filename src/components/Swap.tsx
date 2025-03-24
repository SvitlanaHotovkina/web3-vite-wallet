import { useEffect, useState } from "react";
import { WalletSession } from "@/utils/walletSession";
import { unlockWallet } from "@/utils/wallet-unlock";
import { JsonRpcProvider, Wallet, ethers } from "ethers";
import { KNOWN_TOKENS } from "@/constants/networks";
import { serverLogger } from "@/utils/server-logger";

export default function Swap({
  walletSession,
}: {
  walletSession: WalletSession;
}) {
  const [fromTokenKey, setFromTokenKey] = useState("");
  const [toTokenKey, setToTokenKey] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedAmount, setExpectedAmount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const networkKey = walletSession.network.toLowerCase();
  const tokens = KNOWN_TOKENS[networkKey] || [];
  const fromToken = tokens.find((t) => t.symbol === fromTokenKey);
  const toToken = tokens.find((t) => t.symbol === toTokenKey);

  useEffect(() => {
    if (!fromToken) return;
    const fetchBalance = async () => {
      try {
        const provider = new JsonRpcProvider(walletSession.rpcUrl);
        const tokenContract = new ethers.Contract(
          fromToken.address,
          ["function balanceOf(address owner) view returns (uint256)"],
          provider
        );
        const bal = await tokenContract.balanceOf(walletSession.address);
        setBalance(ethers.formatUnits(bal, 18));
      } catch (err) {
        serverLogger.warn("fetchBalance", { err });
        setBalance(null);
      }
    };
    fetchBalance();
  }, [fromToken, walletSession]);

  useEffect(() => {
    if (!fromToken || !toToken || fromToken.abi.length === 0) return;
    const calculateExpectedAmount = async () => {
      if (!amount || isNaN(parseFloat(amount))) return;
      try {
        const provider = new JsonRpcProvider(walletSession.rpcUrl);
        const router = new ethers.Contract(
          fromToken.router,
          fromToken.abi,
          provider
        );
        const amountIn = ethers.parseUnits(amount, 18);
        const path = [fromToken.address, toToken.address];
        const amountsOut = await router.getAmountsOut(amountIn, path);
        setExpectedAmount(ethers.formatUnits(amountsOut[1], 18));
      } catch (err) {
        serverLogger.warn("calculateExpectedAmount", { err });
        setExpectedAmount(null);
      }
    };
    calculateExpectedAmount();
  }, [amount, fromToken, toToken, walletSession]);

  const handleSwap = async () => {
    if (isSwapping || !fromToken || !toToken || fromToken.abi.length === 0)
      return;
    if (!amount) {
      setMessage("❗ Оберіть токени та введіть суму");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("❗ Введіть коректну суму");
      return;
    }

    const password = prompt("Введіть пароль для підпису трансакції:");
    if (!password) return;

    try {
      setIsSwapping(true);
      setMessage("🔓 Розблокування гаманця...");
      const wallet = await unlockWallet(password);

      setMessage("📡 Підготовка до свопу...");
      const provider = new JsonRpcProvider(walletSession.rpcUrl);
      const signer = new Wallet(wallet.privateKey, provider);

      const router = new ethers.Contract(
        fromToken.router,
        fromToken.abi,
        signer
      );
      const amountIn = ethers.parseUnits(amount, 18);
      const path = [fromToken.address, toToken.address];

      const tokenInContract = new ethers.Contract(
        fromToken.address,
        [
          "function allowance(address owner, address spender) view returns (uint256)",
          "function approve(address spender, uint256 amount) returns (bool)",
        ],
        signer
      );

      const currentAllowance = await tokenInContract.allowance(
        wallet.address,
        fromToken.router
      );

      if (currentAllowance.lt(amountIn)) {
        setMessage("✅ Апрув токенів...");
        const approveTx = await tokenInContract.approve(
          fromToken.router,
          amountIn
        );
        await approveTx.wait();
      }

      setMessage("🔁 Своп у процесі...");
      const amountsOut = await router.getAmountsOut(amountIn, path);
      const amountOutMin = amountsOut[1].mul(90).div(100);

      const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        wallet.address,
        Math.floor(Date.now() / 1000) + 60 * 10
      );

      await tx.wait();
      setMessage("✅ Своп успішно виконано. Хеш трансакції: " + tx.hash);
    } catch (error) {
      console.error(error);
      setMessage("❌ Помилка при виконанні свопу");
    } finally {
      setIsSwapping(false);
    }
  };

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
        onClick={handleSwap}
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
