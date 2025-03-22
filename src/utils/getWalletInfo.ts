import { ethers, Contract } from "ethers";
import { getWalletSession, WalletSession } from "./walletSession";
import { JsonRpcProvider } from "ethers";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// Прості токени для прикладу
const KNOWN_TOKENS: Record<string, { symbol: string; address: string }[]> = {
  sepolia: [
    { symbol: "USDC", address: "0x6C3EA9036406852006290770BEdFcAbA0e23A0aD" },
    { symbol: "DAI", address: "0x0000000000000000000000000000000000000000" }, // приклад
  ],
};

export async function getWalletInfo(
  address: string
): Promise<WalletSession | null> {
  const session = getWalletSession();

  if (!session?.rpcUrl) {
    console.log("!session?.rpcUrl");
    return session;
  }

  const provider = new JsonRpcProvider(session.rpcUrl);

  const [network, balance] = await Promise.all([
    provider.getNetwork(),
    provider.getBalance(address),
  ]);

  const networkName = network.name.toLowerCase();

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

  return {
    address,
    network: networkName,
    balance: ethers.formatEther(balance),
    rpcUrl: session.rpcUrl,
    tokens,
  };
}
