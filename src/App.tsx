import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SmaCrossover from "./pages/SmaCrossover/components/SmaCrossover";
import DatabasePage from "./pages/DataBase/components/DatabasePage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* Головна сторінка */}
          <Route path="/" element={<SmaCrossover />} />
          {/* Сторінка з базою даних */}
          <Route path="/db" element={<DatabasePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
