// components/NetworkSwitcher.tsx
import { useState, useEffect } from "react";
import {
  NETWORKS,
  getWalletSession,
  updateWalletSession,
} from "@/utils/walletSession";

export const LOCAL_RPC_KEY = "selectedRpcUrl";

export default function NetworkSwitcher() {
  const [selectedRpc, setSelectedRpc] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_RPC_KEY);
    setSelectedRpc(saved || NETWORKS[0].rpcUrl);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRpc = e.target.value;
    setSelectedRpc(newRpc);
    localStorage.setItem(LOCAL_RPC_KEY, newRpc);

    const session = getWalletSession();
    if (session) {
      updateWalletSession({ ...session, rpcUrl: newRpc });
    }
  };

  return (
    <div className="p-2">
      <label className="block mb-1 text-sm font-medium">
        🌐 Обрати мережу:
      </label>
      <select
        value={selectedRpc}
        onChange={handleChange}
        className="w-full border rounded p-2"
      >
        {NETWORKS.map((net) => (
          <option key={net.rpcUrl} value={net.rpcUrl}>
            {net.name}
          </option>
        ))}
      </select>
    </div>
  );
}
