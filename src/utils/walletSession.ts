import { LOCAL_RPC_KEY } from "@/components/NetworkSwitcher";

const SESSION_KEY = "walletSession";

export type WalletSession = {
  address: string; // Адреса гаманця
  balance: string; // Баланс у ETH (або поточній мережі)
  network: string; // Назва мережі (Ethereum, Arbitrum, BSC тощо)
  rpcUrl?: string;
  tokens?: Array<{
    symbol: string;
    balance: string;
    contractAddress: string;
    decimals: number;
  }>;
  lastTxHash?: string; // Хеш останньої транзакції (опціонально)
};
export const NETWORKS = [
  {
    name: "Sepolia",
    rpcUrl: "https://rpc.sepolia.org",
  },
  {
    name: "Goerli",
    rpcUrl: "https://rpc.ankr.com/eth_goerli",
  },
  {
    name: "Polygon Mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
  },
  {
    name: "BSC Mainnet",
    rpcUrl: "https://bsc-dataseed.binance.org/",
  },
  {
    name: "BSC Testnet",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
  {
    name: "Polygon zkEVM Testnet-1442",
    rpcUrl: "https://rpc.public.zkevm-test.net",
  },
  {
    name: "Polygon Amoy Testnet-80002",
    rpcUrl: "https://rpc-amoy.polygon.technology",
  },
];

export function createWalletSession(data: WalletSession, rpcUrl?: string) {
  const storedRpc = localStorage.getItem(LOCAL_RPC_KEY);
  const session: WalletSession = {
    ...data,
    rpcUrl: rpcUrl || storedRpc || NETWORKS[0].rpcUrl,
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function updateWalletSession(data: WalletSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function getWalletSession(): WalletSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

// ✅ Очистить сессию (при выходе)
export function clearWalletSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
