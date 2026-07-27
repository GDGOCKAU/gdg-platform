import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

// Constants & Status Badges 

const statusConfig = {
  "ACCEPTED":            { bg: "#E8F5E9", text: "#2E7D32", dot: "#34A853" },
  "WRONG ANSWER":        { bg: "#FFEBEE", text: "#B71C1C", dot: "#EA4335" },
  "TIME LIMIT EXCEEDED": { bg: "#FFF8E1", text: "#E65100", dot: "#FBBC04" },
  "COMPILATION ERROR":   { bg: "#F3E5F5", text: "#6A1B9A", dot: "#9C27B0" },
  "PENDING":             { bg: "#F1F3F4", text: "#5F6368", dot: "#9AA0A6" },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig["PENDING"];
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap font-['Roboto']" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.dot }} />
      {status}
    </div>
  );
}

function Sparkline({ color, points }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const h = 32;
  const w = 80;
  const pts = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} stroke="none" fill={color} opacity="0.08" />
    </svg>
  );
}

const ALL_SUBMISSIONS = [
  { id: 1, time: "14:52:08", team: "Code_Knights",  problem: "B", problemFull: "Array Manipulation",        lang: "Python 3", status: "ACCEPTED",           avatar: "#4285F4" },
  { id: 2, time: "14:51:33", team: "Null_Pointers", problem: "A", problemFull: "Binary Search Tree",        lang: "C++17",    status: "WRONG ANSWER",       avatar: "#34A853" },
  { id: 3, time: "14:50:55", team: "Byte_Me",       problem: "C", problemFull: "Dynamic Programming Trees", lang: "Java 17",  status: "TIME LIMIT EXCEEDED", avatar: "#FBBC04" },
  { id: 4, time: "14:49:17", team: "Py_Masters",    problem: "B", problemFull: "Array Manipulation",        lang: "Python 3", status: "ACCEPTED",           avatar: "#EA4335" },
  { id: 5, time: "14:48:44", team: "KAU_Hackers",   problem: "A", problemFull: "Binary Search Tree",        lang: "C",        status: "COMPILATION ERROR",  avatar: "#9C27B0" },
  { id: 6, time: "14:47:02", team: "Code_Knights",  problem: "A", problemFull: "Binary Search Tree",        lang: "Python 3", status: "ACCEPTED",           avatar: "#4285F4" },
  { id: 7, time: "14:45:30", team: "Null_Pointers", problem: "A", problemFull: "Binary Search Tree",        lang: "C++17",    status: "PENDING",            avatar: "#34A853" },
];

// Modals 

function AnnouncementModal({ onClose, darkMode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(28,27,31,0.45)", backdropFilter: "blur(3px)" }}>
      <div className={`flex flex-col w-[480px] rounded-[24px] shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-7 pt-7 pb-5 border-b ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: darkMode ? 'rgba(58,124,245,0.15)' : '#E8F0FE' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 8H14M4 12H10" stroke="#3A7CF5" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="2" y="3" width="14" height="12" rx="2" stroke="#3A7CF5" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className={`text-[18px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Broadcast Announcement</h2>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-[#F1F3F4]'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke={darkMode ? "#94A3B8" : "#5F6368"} strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="flex flex-col gap-5 px-7 py-6">
          <div className="flex flex-col gap-1.5">
            <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-slate-300' : 'text-[#3C4043]'}`}>Title</label>
            <input type="text" placeholder="e.g., Update on Problem B" className={`w-full px-4 py-3 text-[14px] rounded-[8px] outline-none border ${darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-[#E0E0E0] text-[#1C1B1F]'}`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-slate-300' : 'text-[#3C4043]'}`}>Message</label>
            <textarea rows={4} placeholder="Write your announcement here..." className={`w-full px-4 py-3 text-[14px] rounded-[8px] outline-none resize-none border ${darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-[#E0E0E0] text-[#1C1B1F]'}`} />
          </div>
        </div>
        <div className={`flex justify-end gap-3 px-7 py-5 border-t ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
          <button onClick={onClose} className={`px-5 py-2.5 rounded-[10px] text-[14px] font-semibold border font-['DM_Sans'] ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}>Cancel</button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-[10px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] font-['DM_Sans']">Publish Now</button>
        </div>
      </div>
    </div>
  );
}

function ViewAllModal({ onClose, darkMode, submissions }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-10" style={{ backgroundColor: "rgba(28,27,31,0.45)", backdropFilter: "blur(3px)" }}>
      <div className={`flex flex-col w-full max-w-4xl h-full max-h-[800px] rounded-[24px] shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between px-7 py-5 border-b flex-shrink-0 ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
          <h2 className={`text-[18px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Full Submission Feed</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-[#F1F3F4]'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke={darkMode ? "#94A3B8" : "#5F6368"} strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className={`grid px-6 py-3 border-b sticky top-0 z-10 ${darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-[#F8F9FA]/90 border-[#E0E0E0]'} backdrop-blur-md`} style={{ gridTemplateColumns: "100px 1fr 1fr 120px 180px", gap: "12px" }}>
            {["Time", "Team Name", "Problem", "Language", "Status"].map((h) => (
              <div key={h} className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] font-['Roboto']">{h}</div>
            ))}
          </div>
          {submissions.map((s, idx) => (
            <div key={s.id || idx} className={`grid px-6 py-3.5 items-center border-b transition-colors ${darkMode ? 'border-slate-800/50 hover:bg-slate-800/50' : 'border-[#F8F9FA] hover:bg-[#FAFAFA]'}`} style={{ gridTemplateColumns: "100px 1fr 1fr 120px 180px", gap: "12px" }}>
              <span className={`tabular-nums text-[13px] font-['JetBrains_Mono'] ${darkMode ? 'text-slate-300' : 'text-[#5F6368]'}`}>{s.time}</span>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-['DM_Sans']" style={{ backgroundColor: s.avatar }}>{s.team.slice(0, 2).toUpperCase()}</div>
                <span className={`text-[14px] font-medium font-['DM_Sans'] ${darkMode ? 'text-slate-200' : 'text-[#1C1B1F]'}`}>{s.team}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold font-['DM_Sans'] ${darkMode ? 'bg-blue-950 text-blue-400' : 'bg-[#E8F0FE] text-[#3A7CF5]'}`}>{s.problem}</span>
                <span className={`text-[13px] truncate font-['Roboto'] ${darkMode ? 'text-slate-300' : 'text-[#3C4043]'}`}>{s.problemFull}</span>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-medium font-['JetBrains_Mono'] ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#F1F3F4] text-[#3C4043]'}`}>{s.lang}</span>
              <StatusBadge status={s.status} />
            </div>
          ))}
          {submissions.length === 0 && (
             <div className="p-8 text-center text-[#5F6368] font-['Roboto']">No submissions match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Overview Component 

export default function AdminOverview() {
  const { darkMode } = useOutletContext() || {};
  
  const [showFilter, setShowFilter] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showAllFeeds, setShowAllFeeds] = useState(false);

  // State for Filters
  const [filterAcceptedOnly, setFilterAcceptedOnly] = useState(false);
  const [filterErrorsWarnings, setFilterErrorsWarnings] = useState(false);

  const isAllSubmissions = !filterAcceptedOnly && !filterErrorsWarnings;

  const handleAllSubmissionsChange = () => {
    setFilterAcceptedOnly(false);
    setFilterErrorsWarnings(false);
  };

  // Filter the Data
  const filteredSubmissions = useMemo(() => {
    return ALL_SUBMISSIONS.filter(sub => {
      if (isAllSubmissions) return true;
      if (filterAcceptedOnly && sub.status === "ACCEPTED") return true;
      const errorStatuses = ["WRONG ANSWER", "TIME LIMIT EXCEEDED", "COMPILATION ERROR"];
      if (filterErrorsWarnings && errorStatuses.includes(sub.status)) return true;
      return false;
    });
  }, [filterAcceptedOnly, filterErrorsWarnings, isAllSubmissions]);

  return (
    <div className="flex flex-col gap-7 relative">
      
      {/* Page Title & Action Bar */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className={`text-[26px] font-bold tracking-[-0.4px] font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
            Live Contest Dashboard
          </h1>
          <p className={`text-[14px] mt-1 font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#5F6368]'}`}>
            Monitor real-time contest activity and team submissions.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium border transition-colors font-['DM_Sans'] ${darkMode ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800' : 'border-[#E0E0E0] bg-white text-[#3C4043] hover:bg-[#F1F3F4]'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M4 7h6M6 10h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Filter
              {(!isAllSubmissions) && (
                <span className="w-2 h-2 rounded-full bg-[#3A7CF5] absolute -top-1 -right-1"></span>
              )}
            </button>
            {showFilter && (
              <div className={`absolute top-11 right-0 w-48 rounded-[10px] shadow-lg border p-2 z-20 font-['Roboto'] text-[13px] ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-[#E0E0E0] text-[#3C4043]'}`}>
                <label className="flex items-center gap-2 p-2 hover:bg-[#F1F3F4] dark:hover:bg-slate-800 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isAllSubmissions}
                    onChange={handleAllSubmissionsChange}
                    className="accent-[#3A7CF5]"
                  /> 
                  All Submissions
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-[#F1F3F4] dark:hover:bg-slate-800 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filterAcceptedOnly}
                    onChange={(e) => setFilterAcceptedOnly(e.target.checked)}
                    className="accent-[#3A7CF5]"
                  /> 
                  Accepted Only
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-[#F1F3F4] dark:hover:bg-slate-800 rounded cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filterErrorsWarnings}
                    onChange={(e) => setFilterErrorsWarnings(e.target.checked)}
                    className="accent-[#3A7CF5]"
                  /> 
                  Errors & Warnings
                </label>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowAnnouncement(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all font-['DM_Sans'] shadow-[0_2px_6px_rgba(58,124,245,0.30)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Add Announcement
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-3 gap-5">
        {[
          {
            label: "Active Teams",
            value: "42",
            sub: "/ 48 registered",
            accent: "#4285F4",
            bg: darkMode ? "rgba(66,133,244,0.15)" : "#E8F0FE",
            change: "+2 in last 10 min",
            changeUp: true,
            sparkPoints: [30, 34, 33, 36, 38, 40, 42],
            icon: (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="8" cy="7" r="4" stroke="#4285F4" strokeWidth="1.6" />
                <circle cx="16" cy="8" r="3" stroke="#4285F4" strokeWidth="1.4" />
                <path d="M1 19c0-3.5 3-5.5 7-5.5s7 2 7 5.5" stroke="#4285F4" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M16 14c2.5 0 5 1.5 5 4" stroke="#4285F4" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: "Total Submissions",
            value: "184",
            sub: "across all problems",
            accent: "#34A853",
            bg: darkMode ? "rgba(52,168,83,0.15)" : "#E8F5E9",
            change: "↑ 12 in last 5 min",
            changeUp: true,
            sparkPoints: [80, 95, 110, 125, 140, 162, 184],
            icon: (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 2h10l5 5v13H4V2Z" stroke="#34A853" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M14 2v5h5" stroke="#34A853" strokeWidth="1.4" strokeLinejoin="round" />
                <path d="M7 10h8M7 13h8M7 16h5" stroke="#34A853" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            ),
          },
          {
            label: "Success Rate",
            value: "34%",
            sub: "submissions accepted",
            accent: "#E65100",
            bg: darkMode ? "rgba(230,81,0,0.15)" : "#FFF8E1",
            change: "62 accepted of 184",
            changeUp: false,
            sparkPoints: [40, 38, 35, 37, 34, 33, 34],
            icon: (
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#FBBC04" strokeWidth="1.6" />
                <path d="M11 6v5l3 3" stroke="#FBBC04" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ),
          },
        ].map(({ label, value, sub, accent, bg, change, changeUp, sparkPoints, icon }) => (
          <div key={label} className={`rounded-[16px] p-6 flex flex-col gap-4 border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E0E0E0]'}`}>
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>{icon}</div>
              <Sparkline color={accent} points={sparkPoints} />
            </div>
            <div>
              <div className="text-[13px] text-[#9AA0A6] mb-1 font-['Roboto']">{label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-bold leading-none font-['DM_Sans']" style={{ color: accent }}>{value}</span>
                <span className="text-[14px] text-[#9AA0A6] font-['Roboto']">{sub}</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  {changeUp ? (
                    <path d="M2 9L6 3L10 9" stroke="#34A853" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M2 3L6 9L10 3" stroke="#9AA0A6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                <span className="text-[12px] font-['Roboto']" style={{ color: changeUp ? "#34A853" : "#9AA0A6" }}>{change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Submission Feed Table */}
      <div className={`rounded-[16px] overflow-hidden flex flex-col border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E0E0E0]'}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <h2 className={`text-[16px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Live Submission Feed</h2>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${darkMode ? 'bg-emerald-950/40' : 'bg-[#E8F5E9]'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-live-pulse" />
              <span className={`text-[11px] font-semibold font-['Roboto'] ${darkMode ? 'text-emerald-400' : 'text-[#2E7D32]'}`}>Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#9AA0A6] font-['Roboto']">
              {filteredSubmissions.length} recent submissions
            </span>
            <button 
              onClick={() => setShowAllFeeds(true)}
              className="text-[13px] font-semibold text-[#3A7CF5] hover:text-[#2563EB] transition-colors font-['DM_Sans']"
            >
              View all →
            </button>
          </div>
        </div>

        {/* Table Header */}
        <div className={`grid px-6 py-3 border-b ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`} style={{ gridTemplateColumns: "100px 1fr 1fr 120px 180px", gap: "12px" }}>
          {["Time", "Team Name", "Problem", "Language", "Status"].map((h) => (
            <div key={h} className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] font-['Roboto']">{h}</div>
          ))}
        </div>

        {/* Filtered Table Rows */}
        {filteredSubmissions.length > 0 ? (
           filteredSubmissions.slice(0, 7).map((s, idx) => (
            <div key={s.id} className={`grid px-6 items-center py-3.5 transition-colors ${darkMode ? 'hover:bg-slate-800/50 border-slate-800/50' : 'hover:bg-[#FAFAFA] border-[#F8F9FA]'} ${idx < Math.min(filteredSubmissions.length, 7) - 1 ? 'border-b' : ''}`} style={{ gridTemplateColumns: "100px 1fr 1fr 120px 180px", gap: "12px" }}>
              <div className="flex items-center gap-1.5">
                {idx === 0 && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#34A853]" />}
                <span className={`tabular-nums text-[13px] font-['JetBrains_Mono'] ${darkMode ? 'text-slate-300' : 'text-[#5F6368]'}`}>{s.time}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 font-['DM_Sans']" style={{ backgroundColor: s.avatar }}>{s.team.slice(0, 2).toUpperCase()}</div>
                <span className={`text-[14px] font-medium font-['DM_Sans'] ${darkMode ? 'text-slate-200' : 'text-[#1C1B1F]'}`}>{s.team}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-[11px] font-bold flex-shrink-0 font-['DM_Sans'] ${darkMode ? 'bg-blue-950 text-blue-400' : 'bg-[#E8F0FE] text-[#3A7CF5]'}`}>{s.problem}</span>
                <span className={`text-[13px] truncate font-['Roboto'] ${darkMode ? 'text-slate-300' : 'text-[#3C4043]'}`}>{s.problemFull}</span>
              </div>
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-[6px] text-[12px] font-medium font-['JetBrains_Mono'] ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-[#F1F3F4] text-[#3C4043]'}`}>{s.lang}</span>
              </div>
              <div><StatusBadge status={s.status} /></div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-[#5F6368] font-['Roboto']">No submissions match the selected filters.</div>
        )}
        
        {/* Card Footer */}
        <div className={`flex items-center justify-between px-6 py-3 border-t ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`}>
          <span className="text-[12px] text-[#9AA0A6] font-['Roboto']">Showing latest {Math.min(filteredSubmissions.length, 7)} of {filteredSubmissions.length} submissions</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-live-pulse" />
            <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#5F6368]'}`}>Auto-refreshing</span>
          </div>
        </div>
      </div>

      {/* Render Modals */}
      {showAnnouncement && <AnnouncementModal onClose={() => setShowAnnouncement(false)} darkMode={darkMode} />}
      {showAllFeeds && <ViewAllModal onClose={() => setShowAllFeeds(false)} darkMode={darkMode} submissions={filteredSubmissions} />}
    </div>
  );
}