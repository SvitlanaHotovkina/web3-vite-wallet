import { ethers, Contract, Network } from "ethers";
import { getWalletSession, WalletSession } from "./walletSession";
import { JsonRpcProvider } from "ethers";
import { serverLogger } from "./server-logger";
import { KNOWN_TOKENS } from "@/constants/networks";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

export async function getWalletInfo(
  address: string,
  rpcUrl: string,
  abortSignal?: AbortSignal
): Promise<WalletSession | null> {
  const session = await getWalletSession();
  if (!session) return null;

  serverLogger.debug("getWalletInfo", { rpcUrl });
  if (!rpcUrl) {
    serverLogger.warn("!rpcUrl");
    return null;
  }

  let provider: JsonRpcProvider;
  let network: Network;
  let balance: bigint;
  let networkName: string;

  try {
    provider = new JsonRpcProvider(rpcUrl);
    network = await provider.getNetwork();
    if (abortSignal?.aborted) throw new Error("Aborted after network fetch");

    balance = await provider.getBalance(address);
    if (abortSignal?.aborted) throw new Error("Aborted after balance fetch");

    networkName = network.name.toLowerCase();
  } catch (error) {
    serverLogger.debug("❌ Provider/network error:", { error: String(error) });
    return null;
  }

  const tokens: WalletSession["tokens"] = [];
  const knownTokens = KNOWN_TOKENS[networkName] || [];

  for (const token of knownTokens) {
    if (abortSignal?.aborted) break;
    if (token.symbol !== "tBNB") {
      try {
        const contract = new Contract(token.address, ERC20_ABI, provider);
        const rawBalance = await contract.balanceOf(address);
        if (abortSignal?.aborted) break;

        const decimals = await contract.decimals();
        if (abortSignal?.aborted) break;

        const symbol = await contract.symbol();
        if (abortSignal?.aborted) break;

        const balanceFormatted = ethers.formatUnits(rawBalance, decimals);

        tokens.push({
          symbol: symbol || token.symbol,
          balance: parseFloat(balanceFormatted).toFixed(4),
          contractAddress: token.address,
          decimals,
        });
      } catch (e) {
        serverLogger.warn(`⚠️ Не вдалося отримати токен ${token.symbol}`, {
          error: String(e),
        });
      }
    }
  }

  return {
    address,
    network: networkName,
    balance: ethers.formatEther(balance),
    rpcUrl,
    tokens,
  };
}
