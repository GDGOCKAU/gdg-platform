import { useState } from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./Dashboard";
import LeaderboardView from "./LeaderboardView";
import ProblemWorkspace from "./ProblemWorkspace";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <MainLayout
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        >
          <Route
            path="/"
            element={
              <Dashboard
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />

          <Route
            path="/leaderboard"
            element={
              <LeaderboardView
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />

          <Route
            path="/problems/:problemId"
            element={
              <ProblemWorkspace
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}