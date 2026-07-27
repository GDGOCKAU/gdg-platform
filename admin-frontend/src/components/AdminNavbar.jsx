import React, { useState } from 'react';

export default function AdminHeader({ darkMode, setDarkMode }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    // A quick and reliable way to clear the local React auth state
    window.location.href = '/';
  };

  return (
    <header className={`flex-shrink-0 flex items-center justify-between px-8 h-[64px] border-b transition-colors z-30 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E0E0E0]'}`}>
      <div className="flex items-center gap-2">
        <span className="text-[13px] text-[#9AA0A6] font-['Roboto']">Admin</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M4 5l3 3 3-3" stroke="#C4C7CC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Overview</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Live timer */}
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-[10px] border ${darkMode ? 'bg-red-950/40 border-red-800/50' : 'bg-[#FFEBEE] border-[#EF9A9A]'}`}>
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#EA4335] animate-live-pulse" />
          <span className={`text-[12px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-red-400' : 'text-[#B71C1C]'}`}>Live:</span>
          <span className={`text-[15px] font-bold tabular-nums tracking-[0.5px] font-['DM_Sans'] ${darkMode ? 'text-red-400' : 'text-[#B71C1C]'}`}>
            02:45:12
          </span>
        </div>

        <div className={`w-px h-5 ${darkMode ? 'bg-slate-800' : 'bg-[#E0E0E0]'}`} />

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifs(!showNotifs); setShowProfileMenu(false); }}
            className={`relative w-8 h-8 rounded-[8px] flex items-center justify-center border transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-[#E0E0E0] hover:bg-[#F1F3F4]'}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2h11L12 9V6a4 4 0 0 0-4-4Z" stroke={darkMode ? '#94A3B8' : '#5F6368'} strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke={darkMode ? '#94A3B8' : '#5F6368'} strokeWidth="1.4" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-[#EA4335] font-['Roboto']">
              3
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifs && (
            <div className={`absolute top-10 right-0 w-[320px] rounded-[16px] shadow-lg border overflow-hidden flex flex-col font-['Roboto'] ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#E0E0E0]'}`}>
              <div className={`px-4 py-3 border-b font-bold text-[14px] ${darkMode ? 'border-slate-800 text-white' : 'border-[#F1F3F4] text-[#1C1B1F]'}`}>
                Recent Alerts
              </div>
              <div className="flex flex-col">
                <div className={`px-4 py-3 border-b text-[13px] ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-[#F1F3F4] hover:bg-[#F8F9FA]'}`}>
                  <strong className={darkMode ? 'text-blue-400' : 'text-[#3A7CF5]'}>System</strong>
                  <p className={`mt-0.5 ${darkMode ? 'text-slate-300' : 'text-[#5F6368]'}`}>Judge0 cluster #2 connected successfully.</p>
                </div>
                <div className={`px-4 py-3 border-b text-[13px] ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-[#F1F3F4] hover:bg-[#F8F9FA]'}`}>
                  <strong className={darkMode ? 'text-orange-400' : 'text-[#E65100]'}>Warning</strong>
                  <p className={`mt-0.5 ${darkMode ? 'text-slate-300' : 'text-[#5F6368]'}`}>Team Byte_Me requested clarification on Problem C.</p>
                </div>
                <div className={`px-4 py-3 text-[13px] ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-[#F8F9FA]'}`}>
                  <strong className={darkMode ? 'text-emerald-400' : 'text-[#2E7D32]'}>Contest</strong>
                  <p className={`mt-0.5 ${darkMode ? 'text-slate-300' : 'text-[#5F6368]'}`}>Live scoreboard updated.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`w-8 h-8 rounded-[8px] flex items-center justify-center border transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-[#E0E0E0] hover:bg-[#F1F3F4]'}`}
        >
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.5" stroke="#94A3B8" strokeWidth="1.4" />
              <path d="M8 1V2.5M8 13.5V15M1 8H2.5M13.5 8H15M3.05 3.05L4.11 4.11M11.89 11.89L12.95 12.95M3.05 12.95L4.11 11.89M11.89 4.11L12.95 3.05" stroke="#94A3B8" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z" stroke="#5F6368" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Admin Avatar & Dropdown */}
        <div className="relative">
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifs(false); }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold bg-[#3A7CF5] font-['DM_Sans']">
              AD
            </div>
            <div className="flex flex-col">
              <span className={`text-[13px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Admin</span>
              <span className="text-[10px] text-[#9AA0A6] font-['Roboto']">Superuser</span>
            </div>
          </div>

          {/* Profile Logout Menu */}
          {showProfileMenu && (
            <div className={`absolute top-12 right-0 w-[180px] rounded-[12px] shadow-lg border flex flex-col font-['DM_Sans'] overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#E0E0E0]'}`}>
              <button 
                onClick={handleLogout}
                className={`w-full text-left px-4 py-3 text-[14px] font-semibold transition-colors ${darkMode ? 'text-red-400 hover:bg-red-950/40' : 'text-[#EA4335] hover:bg-[#FFEBEE]'}`}
              >
                Log out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}