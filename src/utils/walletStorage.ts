import { openDB } from "idb";
import { serverLogger } from "./server-logger";

const DB_NAME = "walletDB";
const STORE_NAME = "walletStore";

// 🏦 1️⃣ Инициализация базы данных
export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

// 🔎 2️⃣ Проверяем, существует ли кошелек (через getWallet)
export async function walletExists(): Promise<boolean> {
  return (await getEncryptedWallet()) !== null;
}

// 🗂️ 3️⃣ Получение кошелька (если есть)
export async function getEncryptedWallet(): Promise<string | null> {
  try {
    const db = await initDB();
    return await db.get(STORE_NAME, "wallet");
  } catch (error) {
    serverLogger.warn("Ошибка при получении кошелька:", { error });
    return null;
  }
}

// 💾 4️⃣ Сохранение кошелька
export async function saveEncryptedWallet(encryptedWallet: string) {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, encryptedWallet, "wallet");
    serverLogger.debug("✅ Кошелек сохранен!");
  } catch (error) {
    serverLogger.warn("Ошибка при сохранении кошелька:", { error });
  }
}

// 🗑️ 5️⃣ Удаление кошелька
export async function deleteWallet() {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, "wallet");
    serverLogger.warn("🗑️ Кошелек удален!");
  } catch (error) {
    serverLogger.warn("Ошибка при удалении кошелька:", { error });
  }
}
