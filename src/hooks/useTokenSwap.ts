// useTokenSwap.ts
import { useCallback, useState } from "react";
import { JsonRpcProvider, Wallet, ethers } from "ethers";
import { unlockWallet } from "@/utils/wallet-unlock";
import { WalletSession } from "@/utils/walletSession";
import { serverLogger } from "@/utils/server-logger";

type Token = {
  symbol: string;
  address: string;
  router: string;
  abi: string[];
};

export function useTokenSwap(
  walletSession: WalletSession,
  fromToken: Token | undefined,
  toToken: Token | undefined,
  amount: string
) {
  const [isSwapping, setIsSwapping] = useState(false);
  const [expectedAmount, setExpectedAmount] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const calculateExpectedAmount = useCallback(async () => {
    if (!fromToken || !toToken || fromToken.abi.length === 0 || !amount) return;
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
      serverLogger.debug("Expected amount calculated", {
        from: fromToken.symbol,
        to: toToken.symbol,
        amount,
        expected: amountsOut[1].toString(),
      });
    } catch (err) {
      serverLogger.warn("calculateExpectedAmount failed", {
        error: String(err),
      });
      setExpectedAmount(null);
    }
  }, [walletSession.rpcUrl, fromToken, toToken, amount]);

  const swap = useCallback(async () => {
    if (!fromToken || !toToken || fromToken.abi.length === 0 || !amount) return;

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
      const provider = new JsonRpcProvider(walletSession.rpcUrl);
      const signer = new Wallet(wallet.privateKey, provider);

      const amountIn = ethers.parseUnits(amount, 18);
      const router = new ethers.Contract(
        fromToken.router,
        fromToken.abi,
        signer
      );
      const path = [fromToken.address, toToken.address];

      serverLogger.info("Swap initiated", {
        from: fromToken.symbol,
        to: toToken.symbol,
        amount,
      });

      if (fromToken.symbol === "tBNB") {
        try {
          setMessage("🔁 Обгортання tBNB у WBNB...");
          const wbnbContract = new ethers.Contract(
            fromToken.address,
            ["function deposit() public payable"],
            signer
          );
          const wrapTx = await wbnbContract.deposit({ value: amountIn });
          await wrapTx.wait();
          serverLogger.info("tBNB wrapped to WBNB", { amount });
        } catch (wrapError) {
          serverLogger.warn("Wrap failed", { error: String(wrapError) });
          setMessage("❌ Помилка при обгортанні tBNB");
          setIsSwapping(false);
          return;
        }
      }

      try {
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
        serverLogger.debug("Current allowance checked", {
          allowance: currentAllowance.toString(),
        });

        if (currentAllowance < amountIn) {
          setMessage("✅ Апрув токенів...");
          const approveTx = await tokenInContract.approve(
            fromToken.router,
            amountIn
          );
          await approveTx.wait();
          serverLogger.info("Token approved", { amount });
        }
      } catch (approveError) {
        serverLogger.warn("Approve failed", { error: String(approveError) });
        setMessage("❌ Помилка при підтвердженні токенів");
        setIsSwapping(false);
        return;
      }

      try {
        setMessage("🔁 Своп у процесі...");
        const amountsOut = await router.getAmountsOut(amountIn, path);

        if (!Array.isArray(amountsOut) || typeof amountsOut[1] !== "bigint") {
          throw new Error("Invalid amountsOut format or missing element");
        }
        const amountOutMin = (amountsOut[1] * 90n) / 100n;

        const tx = await router.swapExactTokensForTokens(
          amountIn,
          amountOutMin,
          path,
          wallet.address,
          Math.floor(Date.now() / 1000) + 60 * 10
        );

        await tx.wait();
        setMessage("✅ Своп успішно виконано. Хеш трансакції: " + tx.hash);
        serverLogger.info("Swap success", { txHash: tx.hash });
      } catch (swapError) {
        serverLogger.warn("Swap failed", { error: String(swapError) });
        setMessage("❌ Помилка при виконанні свопу");
      }
    } catch (err) {
      serverLogger.warn("Unhandled swap error", { error: String(err) });
      setMessage("❌ Загальна помилка при обміні");
    } finally {
      setIsSwapping(false);
    }
  }, [walletSession.rpcUrl, fromToken, toToken, amount]);

  return {
    isSwapping,
    expectedAmount,
    message,
    calculateExpectedAmount,
    swap,
  };
}
