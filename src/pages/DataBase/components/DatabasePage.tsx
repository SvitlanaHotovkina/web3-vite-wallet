import { useState, useEffect } from "react";
import {
  fetchSmaSessions,
  fetchTrades,
  SmaCrossoverSession,
  Trade,
} from "../../api";

const DatabasePage = () => {
  const [smaSessions, setSmaSessions] = useState<SmaCrossoverSession[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const smaData = await fetchSmaSessions();
        const tradeData = await fetchTrades();

        setSmaSessions(smaData);
        setTrades(tradeData);
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) return <p className="text-center">⏳ Завантаження...</p>;
  return (
    <div className="w-screen h-screen bg-gray-800 text-white flex justify-center items-start p-6 overflow-hidden">
      {/* Контейнер для скролу */}
      <div className="w-full max-w-7xl h-full overflow-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Таблиця SMA */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              📊 SMA Crossover Sessions
            </h2>
            <div className="max-h-[70vh] overflow-auto border border-gray-700 bg-gray-800">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-700">
                  <tr>
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Initial Balance</th>
                    <th className="p-2 border">USD Balance</th>
                    <th className="p-2 border">Crypto Balance</th>
                    <th className="p-2 border">Start Time</th>
                    <th className="p-2 border">End Time</th>
                  </tr>
                </thead>
                <tbody>
                  {smaSessions.map((session) => (
                    <tr key={session.id} className="text-center">
                      <td className="p-2 border">{session.id}</td>
                      <td className="p-2 border">{session.initialBalance}</td>
                      <td className="p-2 border">{session.usdBalance}</td>
                      <td className="p-2 border">{session.cryptoBalance}</td>
                      <td className="p-2 border">
                        {formatDate(session.startTime)}
                      </td>
                      <td className="p-2 border">
                        {session.endTime ? formatDate(session.endTime) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Таблиця Trades */}
          <div>
            <h2 className="text-2xl font-bold mb-4">📈 Trades</h2>
            <div className="max-h-[70vh] overflow-auto border border-gray-700 bg-gray-800">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-700">
                  <tr>
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Symbol</th>
                    <th className="p-2 border">Side</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Reason</th>
                    <th className="p-2 border">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade.id} className="text-center">
                      <td className="p-2 border">{trade.id}</td>
                      <td className="p-2 border">{trade.symbol}</td>
                      <td className="p-2 border">{trade.side}</td>
                      <td className="p-2 border">{trade.amount}</td>
                      <td className="p-2 border">{trade.price}</td>
                      <td className="p-2 border">{trade.reason}</td>
                      <td className="p-2 border">
                        {formatDate(trade.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;
