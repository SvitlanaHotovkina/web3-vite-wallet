import React, { useState } from "react";
import WalletSetup from "./components/WalletSetup";

interface Wallet {
  address: string;
  privateKey: string;
}

const App: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  console.log("🔹 App.tsx загружен!");
  console.log("🔹 Текущее состояние wallet:", wallet);

  return (
    <div>
      <h1>Web3 Vite Wallet</h1>
      {!wallet ? (
        <WalletSetup onWalletCreated={setWallet} />
      ) : (
        <div>
          <h3>Ваш гаманець</h3>
          <p>
            <b>Адреса:</b> {wallet.address}
          </p>
          <button onClick={() => setWallet(null)}>Вийти</button>
        </div>
      )}
    </div>
  );
};

export default App;
