import React, { createContext, useContext, useState, useEffect } from "react";

// Создаём контекст
const TestContext = createContext<{
  value: string;
  setValue: (val: string) => void;
  login: (password: string) => boolean;
  logout: () => void;
} | null>(null);

// Провайдер контекста с "паролем"
const TestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [value, setValue] = useState<string>(() => {
    return localStorage.getItem("testValue") || "Hello, React!";
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  useEffect(() => {
    localStorage.setItem("testValue", value);
  }, [value]);

  useEffect(() => {
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
  }, [isAuthenticated]);

  const login = (password: string) => {
    if (password === "1234") {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <TestContext.Provider value={{ value, setValue, login, logout }}>
      {children}
    </TestContext.Provider>
  );
};

// Экран входа
const LoginScreen = ({ onLogin }: { onLogin: (password: string) => void }) => {
  const [password, setPassword] = useState("");

  return (
    <div>
      <h2>🔐 Вход</h2>
      <input
        type="password"
        placeholder="Введите пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => onLogin(password)}>Войти</button>
    </div>
  );
};

// Основной компонент
const TestComponent = () => {
  const context = useContext(TestContext);

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isAuthenticated") === "true"
  );

  if (!context) {
    return <p>❌ Ошибка: TestContext не найден!</p>;
  }

  const { value, setValue, login, logout } = context;

  const handleLogin = (password: string) => {
    if (login(password)) {
      setIsLoggedIn(true);
    } else {
      alert("❌ Неверный пароль!");
    }
  };

  return isLoggedIn ? (
    <div>
      <p>✅ Значение из контекста: {value}</p>
      <button onClick={() => setValue("React + Auth!")}>Обновить</button>
      <button
        onClick={() => {
          logout();
          setIsLoggedIn(false);
        }}
      >
        Выйти
      </button>
    </div>
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

// Основное приложение
export default function TestApp() {
  return (
    <TestProvider>
      <TestComponent />
    </TestProvider>
  );
}
