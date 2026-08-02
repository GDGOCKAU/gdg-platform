import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminNavbar from './components/AdminNavbar';
import { ContestProvider } from './context/ContestContext';
import { API_BASE_URL } from './config';

export default function AdminLayout({ darkMode, setDarkMode }) {
  // Fetched once here and handed down to both the sidebar and the navbar so
  // they always agree on who's logged in and never race each other on theme.
  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch admin");
        }

        setAdmin(data.user);

        if (data.user?.theme) {
          setDarkMode(data.user.theme === "Dark");
        }
      } catch (error) {
        console.error("Fetch admin error:", error);
      } finally {
        setAdminLoading(false);
      }
    };

    fetchAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContestProvider>
      <div className={`w-full h-screen flex flex-col font-['Roboto'] overflow-hidden ${darkMode ? 'bg-neutral-950 text-white' : 'bg-[#F8F9FA] text-[#1C1B1F]'}`}>
        <div className="flex flex-1 overflow-hidden min-h-0">
          <AdminSidebar darkMode={darkMode} admin={admin} adminLoading={adminLoading} />
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <AdminNavbar darkMode={darkMode} setDarkMode={setDarkMode} admin={admin} adminLoading={adminLoading} />
            <main className="flex-1 overflow-y-auto px-8 py-7">
              <Outlet context={{ darkMode }} />
            </main>
          </div>
        </div>

        {/* Google Colors Bottom Bar */}
        <div className="flex w-full h-[4px] flex-shrink-0">
          <div className="flex-1 bg-[#4285F4]" />
          <div className="flex-1 bg-[#EA4335]" />
          <div className="flex-1 bg-[#FBBC05]" />
          <div className="flex-1 bg-[#34A853]" />
        </div>
      </div>
    </ContestProvider>
  );
}