// src/utils/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_SERVER_URL = "http://localhost:3001/log";

const sendToServer = async (
  level: LogLevel,
  message: string,
  meta?: object
) => {
  try {
    await fetch(LOG_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        meta,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error("Log sending failed:", err);
  }
};

export const serverLogger = {
  debug: (msg: string, meta?: object) => {
    console.debug(msg, meta);
    sendToServer("debug", msg, meta);
  },
  info: (msg: string, meta?: object) => {
    console.info(msg, meta);
    sendToServer("info", msg, meta);
  },
  warn: (msg: string, meta?: object) => {
    console.warn(msg, meta);
    sendToServer("warn", msg, meta);
  },
  error: (msg: string, meta?: object) => {
    console.error(msg, meta);
    sendToServer("error", msg, meta);
  },
};
