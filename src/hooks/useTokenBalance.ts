// useTokenBalance.ts
import { useEffect, useState } from "react";
import { JsonRpcProvider, ethers } from "ethers";
import { WalletSession } from "@/utils/walletSession";

type Token = {
  symbol: string;
  address: string;
};

export function useTokenBalance(
  walletSession: WalletSession,
  token: Token | undefined
) {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchBalance = async () => {
      try {
        const provider = new JsonRpcProvider(walletSession.rpcUrl);

        if (token.symbol === "tBNB") {
          // Нативний баланс
          const rawBalance = await provider.getBalance(walletSession.address);
          setBalance(ethers.formatUnits(rawBalance, 18));
        } else {
          // Баланс ERC-20 токена
          const tokenContract = new ethers.Contract(
            token.address,
            ["function balanceOf(address owner) view returns (uint256)"],
            provider
          );
          const rawBalance = await tokenContract.balanceOf(
            walletSession.address
          );
          setBalance(ethers.formatUnits(rawBalance, 18));
        }
      } catch (error) {
        console.warn("useTokenBalance error:", error);
        setBalance(null);
      }
    };

    fetchBalance();
  }, [token, walletSession]);

  return balance;
}
