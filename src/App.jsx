import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import ProblemWorkspace from "./ProblemWorkspace";
import LeaderboardView from "./LeaderboardView";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Competitor Portal Routes */}
        <Route 
          path="/" 
          element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} 
        />
        <Route 
          path="/problem" 
          element={<ProblemWorkspace darkMode={darkMode} setDarkMode={setDarkMode} />} 
        />
        <Route 
          path="/leaderboard" 
          element={<LeaderboardView darkMode={darkMode} setDarkMode={setDarkMode} />} 
        />

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}