import { useEffect, useState } from "react";
import { getWalletSession, updateWalletSession } from "@/utils/walletSession";
import { serverLogger } from "@/utils/server-logger";
import { NETWORKS } from "@/constants/networks";

export default function NetworkSwitcher() {
  const [selectedRpc, setSelectedRpc] = useState<string>("");

  // Отримуємо поточний rpcUrl з walletSession
  useEffect(() => {
    const loadRpc = async () => {
      const session = await getWalletSession();
      const rpc = session?.rpcUrl || NETWORKS[0].rpcUrl;
      setSelectedRpc(rpc);
    };
    loadRpc();
  }, []);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRpc = e.target.value;
    setSelectedRpc(newRpc);

    const session = await getWalletSession();
    if (!session) {
      serverLogger.warn("❌ Сесія не знайдена");
      return;
    }

    await updateWalletSession({ ...session, rpcUrl: newRpc });
    serverLogger.debug("✅ rpcUrl оновлено в сесії:", { newRpc });
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
