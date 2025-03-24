import { deleteWallet as clearWalletFromDB } from "@/utils/walletStorage";
import { serverLogger } from "./server-logger";

export async function deleteWallet(): Promise<void> {
  try {
    serverLogger.debug("🗑️ Удаляем кошелек из IndexedDB...");
    await clearWalletFromDB();
    serverLogger.debug("✅ Кошелек успешно удален!");
  } catch (error) {
    serverLogger.warn("Ошибка при удалении кошелька:", { error });
    throw new Error("❌ Не удалось удалить кошелек!");
  }
}
