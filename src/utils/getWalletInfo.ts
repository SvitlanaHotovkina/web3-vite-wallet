import { ethers, Contract, Network } from "ethers";
import { getWalletSession, WalletSession } from "./walletSession";
import { JsonRpcProvider } from "ethers";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

const KNOWN_TOKENS: Record<string, { symbol: string; address: string }[]> = {
  sepolia: [
    { symbol: "USDC", address: "0x6C3EA9036406852006290770BEdFcAbA0e23A0aD" },
    { symbol: "DAI", address: "0x0000000000000000000000000000000000000000" },
  ],
};

// ✅ Глобальний прапорець контролю паралельного запуску
let isRunning = false;

export async function getWalletInfo(
  address: string
): Promise<WalletSession | null> {
  if (isRunning) {
    console.warn("⏳ getWalletInfo already running — skipping this tick");
    return null;
  }

  isRunning = true;

  const session = await getWalletSession();

  if (!session?.rpcUrl) {
    console.log("!session?.rpcUrl");
    isRunning = false;
    return session;
  }

  let provider: JsonRpcProvider;
  let network: Network;
  let balance: bigint;
  let networkName: string;

  try {
    provider = new JsonRpcProvider(session.rpcUrl);
    network = await provider.getNetwork();
    balance = await provider.getBalance(address);
    networkName = network.name.toLowerCase();
  } catch (error) {
    console.log("❌ Provider/network error:", error);
    isRunning = false;
    return session;
  }

  const tokens: WalletSession["tokens"] = [];
  const knownTokens = KNOWN_TOKENS[networkName] || [];

  for (const token of knownTokens) {
    try {
      const contract = new Contract(token.address, ERC20_ABI, provider);
      const [rawBalance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
      ]);

      tokens.push({
        symbol: symbol || token.symbol,
        balance: (Number(rawBalance) / 10 ** decimals).toFixed(4),
        contractAddress: token.address,
        decimals,
      });
    } catch (e) {
      console.warn(`⚠️ Не вдалося отримати токен ${token.symbol}:`, e);
    }
  }

  isRunning = false;

  return {
    address,
    network: networkName,
    balance: ethers.formatEther(balance),
    rpcUrl: session.rpcUrl,
    tokens,
  };
}
