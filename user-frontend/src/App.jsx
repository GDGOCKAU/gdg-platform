import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProblemWorkspace from "./ProblemWorkspace";
import LeaderboardView from "./LeaderboardView";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            </ProtectedRoute>
          }
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
