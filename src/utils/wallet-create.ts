import { HDNodeWallet } from "ethers/wallet";
import { toUtf8Bytes } from "ethers";
import { saveEncryptedWallet } from "@/utils/walletStorage";
import { createWalletSession } from "./walletSession";

// --- Генерация случайного пароля ---
function generatePassword(length = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
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
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
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

// --- Создание кошелька ---
export async function createWallet() {
  console.log("🚀 Создание нового кошелька...");
  const newRandom = HDNodeWallet.createRandom();
  if (!newRandom?.mnemonic) throw new Error("Не удалось создать фразу!");

  const mnemonic = newRandom.mnemonic.phrase;
  const privateKey = newRandom.privateKey;
  const address = newRandom.address;
  const password = generatePassword();

  // Сохранение публичных данных в сессию
  createWalletSession({
    address,
    network: "Ethereum", // Можно динамически менять в будущем
    balance: "0.0",
  });

  console.log("🔐 Генерируем пароль и шифруем данные...");
  const encrypted = await encryptMnemonic(mnemonic, password);

  console.log("💾 Сохраняем кошелек в IndexedDB...");
  await saveEncryptedWallet(JSON.stringify(encrypted));

  console.log("✅ Кошелек успешно создан!");
  return {
    address,
    privateKey,
    mnemonic,
    password,
  };
}
