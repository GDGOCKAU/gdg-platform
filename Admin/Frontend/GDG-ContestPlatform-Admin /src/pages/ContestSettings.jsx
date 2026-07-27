import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";

// Form Helpers 

function FormField({ label, children, darkMode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-slate-300' : 'text-[#3C4043]'}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text", darkMode }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 text-[14px] rounded-[8px] outline-none transition-all duration-150 ${darkMode ? 'bg-slate-950 text-white placeholder-slate-600' : 'bg-white text-[#1C1B1F] placeholder-slate-400'}`}
      style={{
        border: focused ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#334155' : '#E0E0E0'}`,
        fontFamily: "'Roboto', sans-serif"
      }}
    />
  );
}

function Select({ value, onChange, options, darkMode }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full appearance-none px-4 py-2.5 text-[14px] rounded-[8px] outline-none transition-all duration-150 cursor-pointer ${darkMode ? 'bg-slate-950 text-white' : 'bg-white text-[#1C1B1F]'}`}
        style={{
          border: focused ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#334155' : '#E0E0E0'}`,
          fontFamily: "'Roboto', sans-serif"
        }}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 5l4 4 4-4" stroke={darkMode ? "#94A3B8" : "#9AA0A6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Archive Detail Pane 

const DETAIL_TEAMS = [
  { rank: 1, name: "Code_Knights",  score: 450, submissions: 18, avatar: "#4285F4" },
  { rank: 2, name: "Null_Pointers", score: 310, submissions: 14, avatar: "#34A853" },
  { rank: 3, name: "Py_Masters",    score: 280, submissions: 11, avatar: "#EA4335" },
  { rank: 4, name: "Byte_Me",       score: 150, submissions:  7, avatar: "#FBBC04" },
  { rank: 5, name: "KAU_Hackers",   score: 120, submissions: 12, avatar: "#9C27B0" },
  { rank: 6, name: "Data_Miners",   score: 90,  submissions:  5, avatar: "#FF7043" },
  { rank: 7, name: "Syntax_Errors", score: 85,  submissions:  9, avatar: "#78909C" },
  { rank: 8, name: "Logic_Bombs",   score: 40,  submissions:  3, avatar: "#8D6E63" },
];

function DetailPane({ contestName, onClose, darkMode }) {
  const [tab, setTab] = useState("leaderboard");

  return (
    <div
      className={`rounded-[16px] overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700 shadow-xl' : 'bg-white border-[#C5D9FB]'}`}
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(58,124,245,0.10)",
        animation: "slideUp 0.22s ease-out"
      }}
    >
      {/* Detail header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-[#F8FBFF] border-[#F1F3F4]'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${darkMode ? 'bg-blue-950/50' : 'bg-[#E8F0FE]'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" fill="#3A7CF5" />
            </svg>
          </div>
          <div>
            <div className={`text-[14px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>{contestName}</div>
            <div className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#9AA0A6]'}`}>Archived · June 12, 2026 · 45 teams</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-[#F1F3F4]'}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke={darkMode ? "#94A3B8" : "#9AA0A6"} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-0 px-6 pt-0 border-b ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-[#F1F3F4] bg-white'}`}>
        {[
          { id: "leaderboard", label: "Final Leaderboard" },
          { id: "scores",      label: "Team Scores" },
          { id: "codes",       label: "Submitted Codes" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-5 py-3 text-[13px] font-semibold transition-all duration-150 relative font-['DM_Sans']"
            style={{ color: tab === id ? "#3A7CF5" : (darkMode ? "#64748B" : "#9AA0A6") }}
          >
            {label}
            {tab === id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#3A7CF5]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={`px-6 py-4 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
        {(tab === "leaderboard" || tab === "scores") && (() => {
          
          // Logic: If on leaderboard, show top 4. Otherwise show all.
          const displayTeams = tab === "leaderboard" ? DETAIL_TEAMS.slice(0, 4) : DETAIL_TEAMS;

          return (
            <div className="flex flex-col gap-0">
              {/* Mini table header */}
              <div
                className={`grid px-4 py-2 border rounded-t-[8px] ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-[#F8F9FA] border-[#F1F3F4]'}`}
                style={{ gridTemplateColumns: "40px 1fr 100px 140px 160px", gap: "12px" }}
              >
                {["#", "Team Name", "Score", "Submissions", ""].map((h, i) => (
                  <div key={i} className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-slate-500' : 'text-[#9AA0A6]'}`}>{h}</div>
                ))}
              </div>
              
              {/* Table Rows Wrapper - CSS logic for scrolling the Team Scores tab */}
              <div className={tab === "scores" ? "max-h-[240px] overflow-y-auto" : ""}>
                {displayTeams.map((t, idx) => (
                  <div
                    key={t.name}
                    className={`grid px-4 py-3 items-center transition-colors border-x ${darkMode ? 'hover:bg-slate-800/50 border-slate-800' : 'hover:bg-[#FAFBFF] border-[#F1F3F4]'}`}
                    style={{
                      gridTemplateColumns: "40px 1fr 100px 140px 160px",
                      gap: "12px",
                      borderBottom: `1px solid ${darkMode ? '#1E293B' : (idx < displayTeams.length - 1 ? '#F8F9FA' : '#F1F3F4')}`,
                      borderRadius: idx === displayTeams.length - 1 ? "0 0 8px 8px" : undefined
                    }}
                  >
                    <div className="text-[13px] font-bold font-['DM_Sans']" style={{ color: ["#FBBC04", "#9E9E9E", "#FF7043", "#5F6368"][idx] || "#9AA0A6" }}>#{t.rank}</div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-['DM_Sans']" style={{ backgroundColor: t.avatar }}>
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className={`text-[13px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-slate-200' : 'text-[#1C1B1F]'}`}>{t.name}</span>
                    </div>
                    <div className="text-[13px] font-bold text-[#3A7CF5] font-['DM_Sans']">{t.score} pts</div>
                    <div className={`text-[13px] font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#5F6368]'}`}>{t.submissions} submissions</div>
                    <div>
                      <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px] font-semibold transition-all border font-['DM_Sans'] ${darkMode ? 'border-blue-900 text-blue-400 hover:bg-blue-950' : 'border-[#C5D9FB] text-[#3A7CF5] hover:bg-[#E8F0FE]'}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 10v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Download .zip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {tab === "codes" && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-[#F1F3F4]'}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M5 7L2 11L5 15M17 7L20 11L17 15M13 4L9 18" stroke={darkMode ? "#94A3B8" : "#9AA0A6"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={`text-[13px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-slate-400' : 'text-[#5F6368]'}`}>Submission archives are bundled per-team</div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-colors font-['DM_Sans'] shadow-[0_2px_6px_rgba(58,124,245,0.30)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v7M4 6l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 10v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Download All Submissions (.zip)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page 

const ARCHIVE_ROWS = [
  { id: 1, name: "KAU Hackathon V1",  date: "June 12, 2026",  teams: 45, winner: "Code_Knights",  winnerPts: 450, winnerColor: "#4285F4" },
  { id: 2, name: "Algorithm Arena",   date: "May 04, 2026",   teams: 32, winner: "Py_Masters",    winnerPts: 380, winnerColor: "#EA4335" },
];

export default function ContestSettings() {
  const { darkMode } = useOutletContext() || {};

  const [contestName, setContestName]   = useState("");
  const [teamCount, setTeamCount]       = useState("");
  const [difficulty, setDifficulty]     = useState("Intermediate");
  const [startDate, setStartDate]       = useState("");
  const [duration, setDuration]         = useState("");
  const [description, setDescription]   = useState("");
  
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveSearchFocus, setArchiveSearchFocus] = useState(false);
  const [expandedRow, setExpandedRow]   = useState(1);
  const [launched, setLaunched]         = useState(false);

  const filteredArchive = ARCHIVE_ROWS.filter(r =>
    r.name.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    r.winner.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-7">

      {/* Page title */}
      <div>
        <h1 className={`text-[26px] font-bold tracking-[-0.4px] font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
          Contest Configuration
        </h1>
        <p className={`text-[14px] mt-1 font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#5F6368]'}`}>
          Create the active contest or review historical data from past events.
        </p>
      </div>

      {/* ── 1. Create New Contest card ── */}
      <div className={`rounded-[16px] overflow-hidden border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E0E0E0]'}`}>
        
        {/* Card header */}
        <div className={`flex items-start justify-between px-7 py-5 border-b ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-blue-950/50' : 'bg-[#E8F0FE]'}`}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#3A7CF5" strokeWidth="1.6" />
                <path d="M9 6v3l2 2" stroke="#3A7CF5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Initialize Active Contest</div>
              <div className={`text-[12px] mt-0.5 font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#9AA0A6]'}`}>Configure and launch a new contest session</div>
            </div>
          </div>

          {/* Warning note */}
          <div className={`flex items-start gap-2 px-4 py-2.5 rounded-[10px] max-w-[340px] border ${darkMode ? 'bg-orange-950/20 border-orange-900/50' : 'bg-[#FFF8E1] border-[#FFE082]'}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
              <path d="M7 1L13 12H1L7 1Z" stroke={darkMode ? "#F97316" : "#E65100"} strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M7 5.5V8M7 9.5h.01" stroke={darkMode ? "#F97316" : "#E65100"} strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <p className={`text-[11px] leading-snug font-['Roboto'] ${darkMode ? 'text-orange-300' : 'text-[#E65100]'}`}>
              <strong>Note:</strong> Activating a new contest will automatically archive the currently active one.
            </p>
          </div>
        </div>

        {/* Form grid */}
        <div className="px-7 py-6 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <FormField label="Contest Name" darkMode={darkMode}>
                <Input placeholder="e.g., GDG KAU SpeedRun 2026" value={contestName} onChange={setContestName} darkMode={darkMode} />
              </FormField>
            </div>
            <FormField label="Expected Number of Teams" darkMode={darkMode}>
              <Input placeholder="e.g., 50" value={teamCount} onChange={setTeamCount} darkMode={darkMode} />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <FormField label="Overall Difficulty Level" darkMode={darkMode}>
              <Select value={difficulty} onChange={setDifficulty} options={["Beginner", "Intermediate", "Advanced"]} darkMode={darkMode} />
            </FormField>
            <FormField label="Start Date & Time" darkMode={darkMode}>
              <Input placeholder="e.g., 2026-07-20 09:00" value={startDate} onChange={setStartDate} type="text" darkMode={darkMode} />
            </FormField>
            <FormField label="Duration" darkMode={darkMode}>
              <Input placeholder="e.g., 3 hours" value={duration} onChange={setDuration} darkMode={darkMode} />
            </FormField>
          </div>

          <FormField label="Contest Description / Info" darkMode={darkMode}>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter rules, guidelines, and context for the participants..."
              rows={4}
              className={`w-full px-4 py-3 text-[14px] rounded-[8px] outline-none resize-none transition-all duration-150 ${darkMode ? 'bg-slate-950 text-white placeholder-slate-600' : 'bg-white text-[#1C1B1F] placeholder-slate-400'}`}
              style={{ border: `1.5px solid ${darkMode ? '#334155' : '#E0E0E0'}`, fontFamily: "'Roboto', sans-serif", lineHeight: "1.7" }}
              onFocus={e => (e.currentTarget.style.border = "2px solid #3A7CF5")}
              onBlur={e  => (e.currentTarget.style.border = `1.5px solid ${darkMode ? '#334155' : '#E0E0E0'}`)}
            />
          </FormField>
        </div>

        {/* Card footer */}
        <div className={`flex items-center justify-between px-7 py-4 border-t ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-[#FAFAFA] border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-2 h-6">
            {launched && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#34A853] font-['Roboto']">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#34A853" />
                  <path d="M4 7l2.5 2.5L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Contest launched successfully!
              </div>
            )}
          </div>
          <button
            onClick={() => { setLaunched(true); setTimeout(() => setLaunched(false), 3000); }}
            className="flex items-center gap-2 px-7 py-2.5 rounded-[100px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all active:scale-[0.97] font-['DM_Sans'] shadow-[0_2px_10px_rgba(58,124,245,0.35)]"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M8 2c0 0 4 2 4 7v1l1.5 1.5H11s-1 1.5-3 1.5-3-1.5-3-1.5H2.5L4 9V8c0-5 4-6 4-6Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="8" cy="13.5" r="1" fill="white" />
            </svg>
            Launch Contest
          </button>
        </div>
      </div>

      {/* ── 2. Archive card ── */}
      <div className={`rounded-[16px] overflow-hidden border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#E0E0E0]'}`}>

        {/* Card header */}
        <div className={`flex items-center justify-between px-7 py-4 border-b ${darkMode ? 'border-slate-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-[#F1F3F4]'}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="4" width="14" height="10" rx="2" stroke={darkMode ? "#94A3B8" : "#5F6368"} strokeWidth="1.4" />
                <path d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" stroke={darkMode ? "#94A3B8" : "#5F6368"} strokeWidth="1.4" />
                <path d="M5 8h6M5 11h4" stroke={darkMode ? "#94A3B8" : "#5F6368"} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Past Contests Archive</div>
              <div className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-slate-400' : 'text-[#9AA0A6]'}`}>{ARCHIVE_ROWS.length} archived contests</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke={archiveSearchFocus ? "#3A7CF5" : (darkMode ? "#64748B" : "#9AA0A6")} strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke={archiveSearchFocus ? "#3A7CF5" : (darkMode ? "#64748B" : "#9AA0A6")} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text" value={archiveSearch}
              onChange={e => setArchiveSearch(e.target.value)}
              onFocus={() => setArchiveSearchFocus(true)}
              onBlur={() => setArchiveSearchFocus(false)}
              placeholder="Search archives..."
              className={`pl-9 pr-4 py-2 text-[13px] rounded-[8px] outline-none transition-all font-['Roboto'] w-[210px] ${darkMode ? 'bg-slate-950 text-white placeholder-slate-500' : 'bg-[#F8F9FA] text-[#1C1B1F] placeholder-slate-400'}`}
              style={{ border: archiveSearchFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#334155' : '#E0E0E0'}` }}
            />
          </div>
        </div>

        {/* Table headers */}
        <div className={`grid px-7 py-3 border-b ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`} style={{ gridTemplateColumns: "1fr 140px 120px 1fr 130px", gap: "16px" }}>
          {["Contest Name", "Date Hosted", "Total Teams", "Winner", "Actions"].map((h) => (
            <div key={h} className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] font-['Roboto']">{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filteredArchive.map((row, idx) => (
          <div key={row.id}>
            <div
              className={`grid px-7 items-center transition-colors cursor-pointer ${darkMode ? 'hover:bg-slate-800/50 border-slate-800' : 'hover:bg-[#FAFBFF] border-[#F1F3F4]'}`}
              style={{ gridTemplateColumns: "1fr 140px 120px 1fr 130px", gap: "16px", paddingTop: "18px", paddingBottom: "18px", borderBottomWidth: "1px" }}
              onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
            >
              {/* Contest name */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-slate-800' : 'bg-[#F1F3F4]'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5L7 1Z" fill="#FBBC04" />
                  </svg>
                </div>
                <div>
                  <div className={`text-[14px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-slate-200' : 'text-[#1C1B1F]'}`}>{row.name}</div>
                  <div className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-slate-500' : 'text-[#9AA0A6]'}`}>Archived</div>
                </div>
              </div>

              {/* Date */}
              <div className={`text-[13px] font-['Roboto'] ${darkMode ? 'text-slate-300' : 'text-[#3C4043]'}`}>{row.date}</div>

              {/* Teams */}
              <div className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="5.5" cy="4" r="2.5" stroke={darkMode ? "#64748B" : "#9AA0A6"} strokeWidth="1.3" />
                  <circle cx="9.5" cy="5" r="2" stroke={darkMode ? "#64748B" : "#9AA0A6"} strokeWidth="1.2" />
                  <path d="M1 12c0-2 2-3.5 4.5-3.5S10 10 10 12" stroke={darkMode ? "#64748B" : "#9AA0A6"} strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span className={`text-[13px] font-['Roboto'] ${darkMode ? 'text-slate-300' : 'text-[#3C4043]'}`}>{row.teams} teams</span>
              </div>

              {/* Winner */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 font-['DM_Sans']" style={{ backgroundColor: row.winnerColor }}>
                  {row.winner.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className={`text-[13px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-slate-200' : 'text-[#1C1B1F]'}`}>{row.winner}</span>
                  <span className={`text-[12px] ml-2 font-['Roboto'] ${darkMode ? 'text-slate-500' : 'text-[#9AA0A6]'}`}>({row.winnerPts} pts)</span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-3">
                <button
                  onClick={e => { e.stopPropagation(); setExpandedRow(expandedRow === row.id ? null : row.id); }}
                  className="text-[13px] font-semibold transition-colors text-[#3A7CF5] hover:text-[#2563EB] font-['DM_Sans']"
                >
                  {expandedRow === row.id ? "Collapse ↑" : "View Details →"}
                </button>
              </div>
            </div>

            {/* Expanded detail pane */}
            {expandedRow === row.id && (
              <div className={`px-7 pb-5 border-b ${darkMode ? 'bg-slate-950/30 border-slate-800' : 'bg-[#F8FBFF] border-[#E0E0E0]'}`}>
                <div className="pt-4">
                  <DetailPane
                    contestName={row.name}
                    onClose={() => setExpandedRow(null)}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredArchive.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <span className={`text-[14px] font-['Roboto'] ${darkMode ? 'text-slate-500' : 'text-[#9AA0A6]'}`}>No contests match "{archiveSearch}"</span>
          </div>
        )}

        {/* Card footer */}
        <div className={`flex items-center justify-between px-7 py-3 border-t ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`}>
          <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-slate-500' : 'text-[#9AA0A6]'}`}>
            {ARCHIVE_ROWS.length} archived contests total
          </span>
          <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-slate-500' : 'text-[#9AA0A6]'}`}>
            Click any row to expand contest details
          </span>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}