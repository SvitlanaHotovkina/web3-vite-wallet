import { createWallet } from "@/utils/wallet-create";
import { restoreWallet } from "@/utils/wallet-restore";

export default function OnBoarding({ onCreated }: { onCreated: () => void }) {
  const handleCreate = async () => {
    const wallet = await createWallet();
    if (!wallet?.privateKey) throw new Error("Wallet was not created");

    onCreated();
  };

  const handleRestore = async () => {
    const phrase = prompt("Введите мнемоническую фразу:");
    if (!phrase) return;
    try {
      const wallet = await restoreWallet(phrase);

      if (!wallet?.privateKey) throw new Error("Wallet was not restored");

      onCreated();
    } catch (err) {
      console.log(err);

      alert("❌ Неверная мнемофраза!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">🆕 Добро пожаловать!</h2>
      <p>Создайте новый кошелек или восстановите из фразы.</p>
      <button
        onClick={handleCreate}
        className="w-full py-2 bg-green-600 text-white rounded"
      >
        Создать новый
      </button>
      <button
        onClick={handleRestore}
        className="w-full py-2 bg-yellow-500 text-white rounded"
      >
        Восстановить кошелек
      </button>
    </div>
  );
}
