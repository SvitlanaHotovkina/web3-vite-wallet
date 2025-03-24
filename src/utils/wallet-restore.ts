import { HDNodeWallet } from "ethers/wallet";
import { toUtf8Bytes } from "ethers";
import { saveEncryptedWallet } from "@/utils/walletStorage";
import { createWalletSession } from "./walletSession";
import { serverLogger } from "./server-logger";

// --- Генерация случайного пароля ---
function generatePassword(length = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
}

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
    ["encrypt", "decrypt"]
  );
}

// --- Web Crypto: шифрование фразы ---
async function encryptMnemonic(mnemonic: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encoded = new TextEncoder().encode(mnemonic);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))), // Кодируем в Base64
    iv: btoa(String.fromCharCode(...iv)), // Кодируем в Base64
    salt: btoa(String.fromCharCode(...salt)), // Кодируем в Base64
  };
}

// --- Восстановление кошелька ---
export async function restoreWallet(mnemonic: string) {
  try {
    serverLogger.debug("🚀 Восстанавливаем кошелек...");
    const wallet = HDNodeWallet.fromPhrase(mnemonic);

    if (!wallet?.mnemonic?.phrase) {
      throw new Error("❌ Неверная мнемофраза!");
    }

    // Сохранение публичных данных в сессию
    createWalletSession({
      address: wallet.address,
      network: "Ethereum",
      balance: "0.0",
    });

    const password = generatePassword();
    serverLogger.debug("🔐 Генерируем пароль и шифруем данные...");
    const encrypted = await encryptMnemonic(mnemonic, password);

    serverLogger.debug("💾 Сохраняем кошелек в IndexedDB...");
    await saveEncryptedWallet(JSON.stringify(encrypted));

    serverLogger.debug("✅ Кошелек успешно восстановлен!");
    return {
      password,
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic,
    };
  } catch (error) {
    serverLogger.warn("Ошибка при восстановлении кошелька:", { error });
    throw new Error("❌ Неверная мнемофраза!");
  }
}
