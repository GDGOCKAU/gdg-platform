import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminOverview from './pages/AdminOverview';
import ContestSettings from './pages/ContestSettings';
import TeamManagement from './pages/TeamManagement';
import ProblemCreator from './pages/ProblemCreator';
import Login from './Login';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  // 1. Add our authentication state (defaults to false)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* 2. Pass the unlock key (setIsAuthenticated) to the Login page */}
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* 3. Protect the Admin Layout */}
        <Route 
          path="/admin" 
          element={
            isAuthenticated ? (
              <AdminLayout darkMode={darkMode} setDarkMode={setDarkMode} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="contest" element={<ContestSettings />} />
          <Route path="teams" element={<TeamManagement />} />
          <Route path="problems" element={<ProblemCreator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}