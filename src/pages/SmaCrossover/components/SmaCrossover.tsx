import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function SmaCrossover() {
  const [WarnsSetSmaCrossover, setSmaCrossoverWarns] = useState("");
  const [LogsSmaCrossover, setSmaCrossoverLogs] = useState("");
  const [activeTab, setActiveTab] = useState("logs");

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("sma_crossover_warns", (data) => {
      setSmaCrossoverWarns(data);
    });
    socket.on("sma_crossover_logs", (data) => {
      setSmaCrossoverLogs(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-gray-800 text-white flex overflow-hidden">
      {/* Меню логов */}
      <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-start pt-4 bg-transparent">
        <button
          className={`text-lg transition-all ${
            activeTab === "warns"
              ? "text-white font-bold text-xl"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("warns")}
        >
          SMA Crossover Warns
        </button>
        <button
          className={`text-lg transition-all mt-4 ${
            activeTab === "logs"
              ? "text-white font-bold text-xl"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("logs")}
        >
          SMA Crossover Logs
        </button>
      </aside>

      {/* Основной контейнер логов */}
      <main className="flex-grow pl-[15%] pt-6">
        <h2 className="text-2xl font-bold mb-4 text-white bg-transparent">
          {activeTab === "warns" ? "SMA Crossover Warns" : "SMA Crossover Logs"}
        </h2>
        <div className="bg-transparent-900 p-4 rounded-lg h-[95vh] overflow-auto text-sm font-mono text-green-400 break-words">
          <pre>
            {activeTab === "warns"
              ? WarnsSetSmaCrossover || "Waiting for warns..."
              : LogsSmaCrossover || "Waiting for logs..."}
          </pre>
        </div>
      </main>
    </div>
  );
}
