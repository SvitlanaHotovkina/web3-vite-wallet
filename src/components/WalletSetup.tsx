import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { generateMnemonic, validateMnemonic, mnemonicToSeedSync } from "bip39";
import { hdkey } from "ethereumjs-wallet";

interface WalletSetupProps {
  onWalletCreated: (wallet: { address: string; privateKey: string }) => void;
}

const WalletSetup: React.FC<WalletSetupProps> = ({ onWalletCreated }) => {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const createWallet = (): void => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    encryptAndStoreMnemonic(newMnemonic);
    deriveWallet(newMnemonic);
  };

  const importWallet = (): void => {
    if (!validateMnemonic(mnemonic)) {
      alert("Невірна мнемонічна фраза!");
      return;
    }
    encryptAndStoreMnemonic(mnemonic);
    deriveWallet(mnemonic);
  };

  const encryptAndStoreMnemonic = (mnemonic: string): void => {
    if (!password) {
      alert("Введіть пароль для шифрування!");
      return;
    }
    const encrypted = CryptoJS.AES.encrypt(mnemonic, password).toString();
    localStorage.setItem("wallet_mnemonic", encrypted);
  };

  const deriveWallet = (mnemonic: string): void => {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdWallet = hdkey.fromMasterSeed(seed);
    const derivedWallet = hdWallet.derivePath("m/44'/60'/0'/0/0").getWallet();
    onWalletCreated({
      address: `0x${derivedWallet.getAddress().toString("hex")}`,
      privateKey: `0x${derivedWallet.getPrivateKey().toString("hex")}`,
    });
  };

  return (
    <div>
      <h3>Налаштування гаманця</h3>
      <input
        type="password"
        placeholder="Введіть пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={createWallet}>Створити гаманець</button>
      <h3>Або імпортуйте мнемонічну фразу</h3>
      <input
        type="text"
        placeholder="Введіть мнемонічну фразу"
        value={mnemonic}
        onChange={(e) => setMnemonic(e.target.value)}
      />
      <button onClick={importWallet}>Імпортувати</button>
    </div>
  );
};

export default WalletSetup;
