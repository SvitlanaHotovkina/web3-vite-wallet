export interface SmaCrossoverSession {
  id: number;
  initialBalance: number;
  usdBalance: number;
  cryptoBalance: number;
  startTime: number; // Timestamp у мілісекундах
  endTime: number | null;
  createdAt: number; // Timestamp у мілісекундах
  updatedAt: number; // Timestamp у мілісекундах
}

export interface Trade {
  id: number;
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  reason: string;
  createdAt: number; // Timestamp у мілісекундах
}

const API_URL = "http://localhost:3000";

// Отримання всіх SMA сесій
export const fetchSmaSessions = async (): Promise<SmaCrossoverSession[]> => {
  const response = await fetch(`${API_URL}/sma`);
  if (!response.ok) throw new Error("Не вдалося завантажити SMA сесії");
  return response.json();
};

// Отримання всіх трейдів
export const fetchTrades = async (): Promise<Trade[]> => {
  const response = await fetch(`${API_URL}/trade`);
  if (!response.ok) throw new Error("Не вдалося завантажити Trades");
  return response.json();
};
