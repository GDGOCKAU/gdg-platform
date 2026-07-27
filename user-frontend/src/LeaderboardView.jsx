import { useState } from "react";
import { useNavigate } from "react-router-dom";
import gdgLogoImg from "./assets/gdg-logo.png";

function GDGLogo({ darkMode }) {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={gdgLogoImg} 
        alt="GDG KAU Logo" 
        className="w-9 h-auto flex-shrink-0 object-contain"
      />
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", color: darkMode ? "#E0E0E0" : "#1C1B1F" }} className="text-sm font-semibold leading-tight tracking-tight">
          GDG KAU
        </div>
        <div style={{ fontFamily: "'Roboto', sans-serif", color: darkMode ? "#AAAAAA" : "#5F6368" }} className="text-[11px] leading-tight">
          King Abdulaziz University
        </div>
      </div>
    </div>
  );
}

function GoogleBar() {
  return (
    <div className="flex w-full flex-shrink-0" style={{ height: "4px" }}>
      <div className="flex-1" style={{ backgroundColor: "#4285F4" }} />
      <div className="flex-1" style={{ backgroundColor: "#EA4335" }} />
      <div className="flex-1" style={{ backgroundColor: "#FBBC05" }} />
      <div className="flex-1" style={{ backgroundColor: "#34A853" }} />
    </div>
  );
}

const teams = [
  {
    rank: 1,
    name: "Code_Knights",
    score: 450,
    totalTime: "01:12:05",
    problems: [
      { state: "accepted", time: "+12 min" },
      { state: "accepted", time: "+28 min" },
      { state: "accepted", time: "+55 min" },
      { state: "wrong", attempts: 1 },
      { state: "unattempted" },
    ],
  },
  {
    rank: 2,
    name: "Py_Masters",
    score: 350,
    totalTime: "01:45:22",
    problems: [
      { state: "accepted", time: "+09 min" },
      { state: "accepted", time: "+41 min" },
      { state: "wrong", attempts: 2 },
      { state: "accepted", time: "+78 min" },
      { state: "unattempted" },
    ],
  },
  {
    rank: 3,
    name: "Null_Pointers",
    score: 250,
    totalTime: "02:01:10",
    problems: [
      { state: "accepted", time: "+15 min" },
      { state: "accepted", time: "+67 min" },
      { state: "wrong", attempts: 3 },
      { state: "unattempted" },
      { state: "unattempted" },
    ],
  },
  {
    rank: 4,
    name: "Byte_Me",
    score: 100,
    totalTime: "02:30:44",
    problems: [
      { state: "accepted", time: "+22 min" },
      { state: "wrong", attempts: 1 },
      { state: "unattempted" },
      { state: "unattempted" },
      { state: "unattempted" },
    ],
  },
  {
    rank: 5,
    name: "KAU_Hackers",
    score: 100,
    totalTime: "02:48:03",
    problems: [
      { state: "accepted", time: "+34 min" },
      { state: "unattempted" },
      { state: "unattempted" },
      { state: "unattempted" },
      { state: "unattempted" },
    ],
  },
];

function RankBadge({ rank, darkMode }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: "#332A00", border: "1.5px solid #FFD54F" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2L8.5 5.5H12.5L9.5 7.5L10.5 11.5L7 9.5L3.5 11.5L4.5 7.5L1.5 5.5H5.5L7 2Z" fill="#FBBC04" />
        </svg>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: darkMode ? "#2A2A2A" : "#F5F5F5", border: "1.5px solid #BDBDBD" }}>
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
          <path d="M6 1L7 4H10L7.5 6L8.5 9L6 7L3.5 9L4.5 6L2 4H5L6 1Z" fill="#9E9E9E" />
        </svg>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: darkMode ? "#331811" : "#FBE9E7", border: "1.5px solid #FFAB91" }}>
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
          <path d="M6 1L7 4H10L7.5 6L8.5 9L6 7L3.5 9L4.5 6L2 4H5L6 1Z" fill="#FF7043" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: darkMode ? "#2A2A2A" : "#F1F3F4" }}>
      <span className="text-[13px] font-bold" style={{ color: darkMode ? "#E0E0E0" : "#5F6368", fontFamily: "'DM Sans', sans-serif" }}>{rank}</span>
    </div>
  );
}

function ProblemCell({ result, darkMode }) {
  if (result.state === "accepted") {
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 w-[72px] h-[52px] rounded-[8px]" style={{ backgroundColor: darkMode ? "#1B3320" : "#E8F5E9", border: "1px solid #34A853" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" fill="#34A853" />
          <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color: darkMode ? "#A5D6A7" : "#2E7D32", fontFamily: "'Roboto', sans-serif" }}>{result.time}</span>
      </div>
    );
  }
  if (result.state === "wrong") {
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 w-[72px] h-[52px] rounded-[8px]" style={{ backgroundColor: darkMode ? "#331111" : "#FFEBEE", border: "1px solid #EA4335" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" fill="#EA4335" />
          <path d="M5 5L9 9M9 5L5 9" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color: darkMode ? "#FFCDD2" : "#B71C1C", fontFamily: "'Roboto', sans-serif" }}>−{result.attempts}</span>
      </div>
    );
  }
  return (
    <div className="w-[72px] h-[52px] rounded-[8px]" style={{ backgroundColor: darkMode ? "#222222" : "#F8F9FA", border: `1.5px dashed ${darkMode ? "#444444" : "#E0E0E0"}` }} />
  );
}

export default function LeaderboardView({ darkMode, setDarkMode }) {
  const navigate = useNavigate();

  const bgStyle = darkMode ? "#121212" : "#F8F9FA";
  const navBg = darkMode ? "#1E1E1E" : "#FFFFFF";
  const cardBg = darkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = darkMode ? "#E0E0E0" : "#1C1B1F";
  const subTextColor = darkMode ? "#AAAAAA" : "#5F6368";
  const borderColor = darkMode ? "#333333" : "#E0E0E0";
  const tableHeaderBg = darkMode ? "#252526" : "#F8F9FA";

  const rowStyle = {
    1: { bg: darkMode ? "#2B2815" : "#FFFDE7" },
    2: { bg: darkMode ? "#1E1E1E" : "#FAFAFA" },
    3: { bg: darkMode ? "#281D1A" : "#FFF3EF" },
  };

  return (
    <div className="flex flex-col" style={{ width: "100%", height: "100%", backgroundColor: bgStyle, fontFamily: "'Roboto', sans-serif", overflow: "hidden" }}>
      

      {/* ── Page Content ── */}
      <div className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-7" style={{ scrollbarWidth: "none" }}>

        {/* Page Heading */}
        <div className="flex items-end justify-between flex-shrink-0">
          <div className="flex flex-col gap-2">
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[32px] font-bold tracking-[-0.5px]">
              Live Leaderboard
            </h1>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#34A853", boxShadow: "0 0 0 0 #34A853", animation: "livePulse 1.6s ease-out infinite" }}
              />
              <span className="text-[13px]" style={{ color: subTextColor, fontFamily: "'Roboto', sans-serif" }}>
                Live · Auto-updates every 30 seconds
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-[10px]" style={{ backgroundColor: darkMode ? "#1A2E4B" : "#E8F0FE", border: `1px solid ${darkMode ? "#2B4C7E" : "#C5D9FB"}` }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="6" width="2.5" height="7" rx="1" fill="#4285F4" />
              <rect x="5.5" y="3" width="2.5" height="10" rx="1" fill="#4285F4" />
              <rect x="10" y="1" width="2.5" height="12" rx="1" fill="#4285F4" />
            </svg>
            <span className="text-[13px] font-semibold text-[#3A7CF5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>48 teams competing</span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-5 flex-shrink-0">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="8" cy="7" r="4" stroke="#4285F4" strokeWidth="1.6" />
                  <circle cx="14" cy="9" r="3" stroke="#4285F4" strokeWidth="1.4" />
                  <path d="M1 17c0-3 3-5 7-5s7 2 7 5" stroke="#4285F4" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M14 14c2 0 4 1 4 3" stroke="#4285F4" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              ),
              label: "Total Teams Active",
              value: "48 Teams",
              sub: "All checked in",
              accent: "#4285F4",
              bg: darkMode ? "#1A2E4B" : "#E8F0FE",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="3" stroke="#34A853" strokeWidth="1.6" />
                  <path d="M7 10L9.5 12.5L13 8" stroke="#34A853" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              label: "Most Solved Problem",
              value: "Problem A",
              sub: "42 teams solved",
              accent: "#34A853",
              bg: darkMode ? "#1B3320" : "#E8F5E9",
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3L11.8 7.8L17 8.2L13.2 11.6L14.4 17L10 14.2L5.6 17L6.8 11.6L3 8.2L8.2 7.8L10 3Z" fill="#FBBC04" stroke="#F9A825" strokeWidth="1" />
                </svg>
              ),
              label: "Current Leader",
              value: "Code_Knights",
              sub: "450 pts · 3 solved",
              accent: "#E65100",
              bg: darkMode ? "#332200" : "#FFF8E1",
            },
          ].map(({ icon, label, value, sub, accent, bg }) => (
            <div
              key={label}
              className="rounded-[16px] p-5 flex items-center gap-4"
              style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
            >
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                {icon}
              </div>
              <div>
                <div className="text-[12px] mb-0.5" style={{ color: darkMode ? "#888888" : "#9AA0A6", fontFamily: "'Roboto', sans-serif" }}>{label}</div>
                <div className="text-[18px] font-bold" style={{ fontFamily: "'DM Sans', sans-serif", color: accent }}>{value}</div>
                <div className="text-[12px] mt-0.5" style={{ color: subTextColor, fontFamily: "'Roboto', sans-serif" }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div
          className="rounded-[16px] overflow-hidden flex flex-col min-h-0"
          style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <div className="grid items-center px-6 py-3 border-b" style={{ gridTemplateColumns: "56px 1fr 100px 110px 72px 72px 72px 72px 72px", gap: "12px", backgroundColor: tableHeaderBg, borderColor }}>
            {["Rank", "Team Name", "Score", "Total Time", "A", "B", "C", "D", "E"].map((h, i) => (
              <div
                key={h}
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: darkMode ? "#888888" : "#9AA0A6", fontFamily: "'Roboto', sans-serif", textAlign: i >= 4 ? "center" : i >= 2 ? "right" : "left" }}
              >
                {i >= 4 ? (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mx-auto" style={{ backgroundColor: darkMode ? "#1A2E4B" : "#E8F0FE", color: "#3A7CF5" }}>{h}</span>
                ) : h}
              </div>
            ))}
          </div>

          {/* Scrollable Rows */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {teams.map((team, idx) => {
              const style = rowStyle[team.rank] ?? { bg: cardBg };
              const isMyTeam = team.name === "Code_Knights";
              return (
                <div
                  key={team.rank}
                  className="grid items-center px-6 transition-colors duration-150"
                  style={{
                    gridTemplateColumns: "56px 1fr 100px 110px 72px 72px 72px 72px 72px",
                    gap: "12px",
                    paddingTop: "14px",
                    paddingBottom: "14px",
                    backgroundColor: style.bg,
                    borderBottom: idx < teams.length - 1 ? `1px solid ${borderColor}` : "none",
                    position: "relative",
                  }}
                >
                  {isMyTeam && <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-[2px] bg-[#3A7CF5]" />}
                  <div className="flex justify-center"><RankBadge rank={team.rank} darkMode={darkMode} /></div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ backgroundColor: ["#4285F4", "#EA4335", "#34A853", "#FBBC04", "#9C27B0"][team.rank - 1], fontFamily: "'DM Sans', sans-serif" }}>
                      {team.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold" style={{ color: textColor, fontFamily: "'DM Sans', sans-serif" }}>
                        {team.name}
                        {isMyTeam && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3A7CF5] text-white" style={{ fontFamily: "'Roboto', sans-serif" }}>You</span>}
                      </div>
                      <div className="text-[11px]" style={{ color: darkMode ? "#888888" : "#9AA0A6", fontFamily: "'Roboto', sans-serif" }}>{team.problems.filter(p => p.state === "accepted").length} solved</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-bold" style={{ color: textColor, fontFamily: "'DM Sans', sans-serif" }}>{team.score}</div>
                    <div className="text-[11px]" style={{ color: darkMode ? "#888888" : "#9AA0A6", fontFamily: "'Roboto', sans-serif" }}>pts</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] tabular-nums font-medium" style={{ color: darkMode ? "#CCCCCC" : "#3C4043", fontFamily: "'JetBrains Mono', monospace" }}>{team.totalTime}</div>
                  </div>
                  {team.problems.map((result, pi) => (
                    <div key={pi} className="flex justify-center"><ProblemCell result={result} darkMode={darkMode} /></div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="px-6 py-3 flex items-center justify-between border-t flex-shrink-0" style={{ backgroundColor: tableHeaderBg, borderColor }}>
            <span className="text-[12px]" style={{ color: darkMode ? "#888888" : "#9AA0A6", fontFamily: "'Roboto', sans-serif" }}>Showing top 5 of 48 teams</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
              <span className="text-[12px]" style={{ color: subTextColor, fontFamily: "'Roboto', sans-serif" }}>Last updated: just now</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pb-2 flex-shrink-0">
          {[
            { color: darkMode ? "#1B3320" : "#E8F5E9", border: "#34A853", icon: "✓", label: "Accepted" },
            { color: darkMode ? "#331111" : "#FFEBEE", border: "#EA4335", icon: "✗", label: "Wrong Answer" },
            { color: darkMode ? "#222222" : "#F8F9FA", border: darkMode ? "#444444" : "#E0E0E0", icon: "", label: "Unattempted", dashed: true },
          ].map(({ color, border, icon, label, dashed }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[5px] flex items-center justify-center text-[11px] font-bold" style={{ backgroundColor: color, border: `1.5px ${dashed ? "dashed" : "solid"} ${border}`, color: darkMode ? "#E0E0E0" : "#1C1B1F" }}>{icon}</div>
              <span className="text-[12px]" style={{ color: subTextColor, fontFamily: "'Roboto', sans-serif" }}>{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-[#3A7CF5]" />
            <span className="text-[12px]" style={{ color: subTextColor, fontFamily: "'Roboto', sans-serif" }}>Your team</span>
          </div>
        </div>
      </div>

      <GoogleBar />
    </div>
  );
}