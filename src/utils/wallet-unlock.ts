import { HDNodeWallet } from "ethers/wallet";
import { toUtf8Bytes } from "ethers";
import { getEncryptedWallet } from "@/utils/walletStorage";
import { createWalletSession } from "./walletSession";

// --- Web Crypto: создание ключа из пароля ---
async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    toUtf8Bytes(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

// --- Декодирование из Base64 в Uint8Array ---
function decodeBase64(encoded: string): Uint8Array {
  return new Uint8Array(
    atob(encoded)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
}

// --- Разблокировка кошелька ---
export async function unlockWallet(password: string) {
  try {
    console.log("🔓 Разблокировка кошелька...");

    const encryptedWallet = await getEncryptedWallet();
    if (!encryptedWallet) {
      throw new Error("❌ Кошелек не найден!");
    }

    const { ciphertext, iv, salt } = JSON.parse(encryptedWallet);
    const key = await deriveKey(password, decodeBase64(salt));

    console.log("🔑 Расшифровываем мнемоническую фразу...");
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: decodeBase64(iv) },
      key,
      decodeBase64(ciphertext)
    );

    const mnemonic = new TextDecoder().decode(decrypted);
    const wallet = HDNodeWallet.fromPhrase(mnemonic);

    // Сохранение публичных данных в сессию
    createWalletSession({
      address: wallet.address,
      network: "Ethereum",
      balance: "0.0",
    });

    console.log("✅ Кошелек успешно разблокирован!");
    return {
      mnemonic,
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  } catch (error) {
    console.error("Ошибка при разблокировке кошелька:", error);
    throw new Error("❌ Неверный пароль!");
  }
}
