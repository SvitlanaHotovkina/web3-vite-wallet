import React, { useState } from "react";
import { HDNodeWallet } from "ethers/wallet";

interface WalletSetupProps {
  onWalletCreated: (wallet: { address: string; privateKey: string }) => void;
}

const WalletSetup: React.FC<WalletSetupProps> = () => {
  const [phrase, setMnemonic] = useState<string | null>(null);
  const [wallet, setWallet] = useState<{
    address: string;
    privateKey: string;
  } | null>(null);

  const [step, setStep] = useState<
    "start" | "showPhrase" | "import" | "showPrivateKey" | "wallet"
  >("start");

  const createWallet = (): void => {
    const newRandom = HDNodeWallet.createRandom();
    if (!newRandom?.mnemonic) return;

    const newPhrase = newRandom.mnemonic.phrase;
    setMnemonic(newPhrase);
    try {
      const wallet = HDNodeWallet.fromPhrase(newPhrase);
      setWallet(wallet);
      setStep("showPhrase");
    } catch (error) {
      console.error("❌ Помилка створення гаманця:", error);
      alert("Не вдалося створити гаманець.");
    }
  };

  const importWallet = (): void => {
    if (!phrase) {
      alert("Невірна мнемонічна фраза!");
      return;
    }
    try {
      const wallet = HDNodeWallet.fromPhrase(phrase);
      setWallet(wallet);
      setStep("showPrivateKey");
    } catch (error) {
      console.error("❌ Помилка відновлення гаманця:", error);
      alert("Не вдалося відновити гаманець.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "auto",
        textAlign: "center",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      {step === "start" && (
        <>
          <button
            onClick={createWallet}
            style={{ margin: "10px", padding: "10px", cursor: "pointer" }}
          >
            🆕 Створити новий гаманець
          </button>
          <button
            onClick={() => setStep("import")}
            style={{ margin: "10px", padding: "10px", cursor: "pointer" }}
          >
            🔄 Відновити з фрази
          </button>
        </>
      )}

      {step === "showPhrase" && wallet && (
        <div>
          <h3>Ваша мнемонічна фраза:</h3>
          <p
            style={{ background: "#eee", padding: "10px", borderRadius: "5px" }}
          >
            <b>{phrase}</b>
          </p>
          <h3>Ваш приватний ключ:</h3>
          <p
            style={{
              background: "#eee",
              padding: "10px",
              borderRadius: "5px",
              wordWrap: "break-word",
            }}
          >
            <b>{wallet.privateKey}</b>
          </p>
          <button
            onClick={() => setStep("wallet")}
            style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}
          >
            ✅ Я зберіг фразу
          </button>
        </div>
      )}

      {step === "import" && (
        <div>
          <h3>🔑 Введіть мнемонічну фразу</h3>
          <textarea
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
            placeholder="Введіть мнемонічну фразу"
            value={phrase || ""}
            onChange={(e) => setMnemonic(e.target.value)}
          />
          <button
            onClick={importWallet}
            style={{ padding: "10px", cursor: "pointer" }}
          >
            🔄 Відновити
          </button>
        </div>
      )}

      {step === "showPrivateKey" && wallet && (
        <div>
          <h3>Ваш приватний ключ:</h3>
          <p
            style={{
              background: "#eee",
              padding: "10px",
              borderRadius: "5px",
              wordWrap: "break-word",
            }}
          >
            <b>{wallet.privateKey}</b>
          </p>
          <button
            onClick={() => setStep("wallet")}
            style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}
          >
            ✅ Я зберіг приватний ключ
          </button>
        </div>
      )}

      {step === "wallet" && wallet && (
        <div>
          <h3>🎉 Ваш гаманець готовий!</h3>
          <p>
            <b>📍 Адреса:</b> {wallet.address}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletSetup;
