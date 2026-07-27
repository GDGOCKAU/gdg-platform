import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

export default function AdminLayout({ darkMode, setDarkMode }) {
  return (
    <div className={`w-full h-screen flex flex-col font-['Roboto'] overflow-hidden ${darkMode ? 'bg-slate-950 text-white' : 'bg-[#F8F9FA] text-[#1C1B1F]'}`}>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <AdminSidebar darkMode={darkMode} />
        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          <AdminHeader darkMode={darkMode} setDarkMode={setDarkMode} />
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
  );
}