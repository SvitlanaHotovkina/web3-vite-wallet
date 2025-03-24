import { NETWORKS } from "@/constants/networks";
import { openDB } from "idb";

const DB_NAME = "WalletDB";
const STORE_NAME = "session";
const SESSION_KEY = "walletSession";

export type WalletSession = {
  address: string;
  balance: string;
  network: string;
  rpcUrl?: string;
  tokens?: Array<{
    symbol: string;
    balance: string;
    contractAddress: string;
    decimals: number;
  }>;
  lastTxHash?: string;
};

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function createWalletSession(
  data: WalletSession,
  rpcUrl?: string
) {
  const oldSesions = await getWalletSession();
  const session: WalletSession = {
    ...data,
    rpcUrl: rpcUrl || oldSesions?.rpcUrl || NETWORKS[0].rpcUrl,
  };

  const db = await getDB();
  await db.put(STORE_NAME, session, SESSION_KEY);
}

export async function updateWalletSession(data: WalletSession) {
  const db = await getDB();
  await db.put(STORE_NAME, data, SESSION_KEY);
}

export async function getWalletSession(): Promise<WalletSession | null> {
  const db = await getDB();
  const data = await db.get(STORE_NAME, SESSION_KEY);
  return data ?? null;
}

export async function clearWalletSession() {
  const db = await getDB();
  await db.delete(STORE_NAME, SESSION_KEY);
}
