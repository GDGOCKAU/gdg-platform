import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProblemWorkspace from "./ProblemWorkspace";
import LeaderboardView from "./LeaderboardView";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Starting Route: Login Page */}
        <Route path="/" element={<Login />} />

        {/* Competitor Workspace Routes */}
        <Route
          element={<MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />}
        >
          <Route 
            path="/dashboard" 
            element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} 
          />

          <Route
            path="/problems/:problemId"
            element={<ProblemWorkspace darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
          
          <Route 
            path="/leaderboard" 
            element={<LeaderboardView darkMode={darkMode} setDarkMode={setDarkMode} />} 
          />
        </Route>


        {/* Fallback to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
