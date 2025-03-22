import { deleteWallet as clearWalletFromDB } from "@/utils/walletStorage";

export async function deleteWallet(): Promise<void> {
  try {
    console.log("🗑️ Удаляем кошелек из IndexedDB...");
    await clearWalletFromDB();
    console.log("✅ Кошелек успешно удален!");
  } catch (error) {
    console.error("Ошибка при удалении кошелька:", error);
    throw new Error("❌ Не удалось удалить кошелек!");
  }
}
