import React from 'react';
import { NavLink } from 'react-router-dom';
import gdgLogo from '../assets/gdg-logo.png';

const NAV_ITEMS = [
  {
    label: 'Overview',
    path: '/admin/overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    label: 'Contest Settings',
    path: '/admin/contest',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Team Management',
    path: '/admin/teams',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="11" cy="6" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M11 10c2 0 4 1 4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Problem Management',
    path: '/admin/problems',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminSidebar({ darkMode }) {
  return (
    <aside className={`w-[20%] min-w-[240px] flex flex-col flex-shrink-0 h-full border-r transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E0E0E0]'}`}>
      {/* Sidebar header */}
      <div className={`px-5 py-5 flex flex-col gap-1 flex-shrink-0 border-b ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
        <div className="flex items-center gap-3">
          
          <div className="w-9 h-9 flex-shrink-0">
            <img 
              src={gdgLogo} 
              alt="GDG KAU Logo" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className={`font-['DM_Sans'] text-[14px] font-bold truncate ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
                GDG KAU Admin
              </span>
            </div>
            <span className="text-[11px] text-[#9AA0A6] font-['Roboto']">Contest Administrator</span>
          </div>
        </div>
      </div>

      {/* Contest status pill */}
      <div className="px-5 pt-4 flex-shrink-0">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-[10px] border ${darkMode ? 'bg-emerald-950/40 border-emerald-800/50' : 'bg-[#E8F5E9] border-[#A5D6A7]'}`}>
          <span className="w-2 h-2 rounded-full flex-shrink-0 bg-[#34A853] animate-live-pulse" />
          <div className="flex flex-col">
            <span className={`text-[11px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-emerald-400' : 'text-[#2E7D32]'}`}>Contest Live</span>
            <span className={`text-[10px] font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#5F6368]'}`}>GDG KAU × ICPC 2025</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 pt-5 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#C4C7CC] px-2 mb-2 font-['Roboto']">
          Main Menu
        </div>
        {NAV_ITEMS.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-left transition-all duration-150 font-['DM_Sans'] text-[14px] ${
                isActive
                  ? darkMode
                    ? 'bg-blue-950/50 text-blue-400 font-semibold'
                    : 'bg-[#E8F0FE] text-[#3A7CF5] font-semibold'
                  : darkMode
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-[#5F6368] hover:bg-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? (darkMode ? 'text-blue-400' : 'text-[#3A7CF5]') : 'text-[#9AA0A6]'}>
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className={`px-5 py-4 flex-shrink-0 border-t ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-[#3A7CF5] font-['DM_Sans'] flex-shrink-0">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[13px] font-semibold truncate font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Admin User</div>
            <div className="text-[11px] text-[#9AA0A6] truncate font-['Roboto']">admin@gdgkau.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}