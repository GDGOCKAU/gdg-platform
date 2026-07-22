import { useEffect, useState } from "react";
import gdgLogoImg from "./assets/gdg-logo.png";
import ProblemWorkspace from "./ProblemWorkspace"; 
import LeaderboardView from "./LeaderboardView";
import { useNavigate } from "react-router-dom";

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
        <div style={{ fontFamily: "'Roboto', sans-serif", color: darkMode ? "#9AA0A6" : "#5F6368" }} className="text-[11px] leading-tight">
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


const difficultyStyle = {
  Easy:   { bg: "#E8F5E9", text: "#2E7D32", dot: "#34A853" },
  Medium: { bg: "#FFF8E1", text: "#E65100", dot: "#FBBC04" },
  Hard:   { bg: "#FFEBEE", text: "#B71C1C", dot: "#EA4335" },
};

function StatusBadge({ status, onSolve }) {
  if (status === "accepted") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#34A853" /><path d="M3.5 6L5 7.5L8.5 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Accepted
      </div>
    );
  }
  if (status === "wrong") {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "#FFEBEE", color: "#B71C1C" }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#EA4335" /><path d="M4 4L8 8M8 4L4 8" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg>
        Wrong Answer
      </div>
    );
  }
  return (
    <button
      onClick={onSolve}
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150 hover:bg-[#E8F0FE]"
      style={{ border: "1.5px solid #3A7CF5", color: "#3A7CF5", backgroundColor: "transparent", cursor: "pointer" }}
    >
      Solve →
    </button>
  );
}

function ProblemCard({ problem, onSelect, darkMode }) {
  const diff = difficultyStyle[problem.difficulty];
  const cardBg = darkMode ? "#1E1E1E" : "#FFFFFF";
  const borderColor = darkMode ? "#333333" : "#E0E0E0";
  const textColor = darkMode ? "#E0E0E0" : "#1C1B1F";

  return (
    <div
      onClick={onSelect}
      className="flex items-center gap-5 px-6 py-5 rounded-[12px] transition-shadow duration-150 hover:shadow-md"
      style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, cursor: "pointer" }}
    >
      <div 
        className="flex-shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-[16px]" 
        style={{ backgroundColor: darkMode ? "#2A2A2A" : "#F1F3F4", color: textColor }}
      >
        {problem.problem_code}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[15px] font-semibold" style={{ color: textColor }}>
            {problem.problem_code}. {problem.problem_name}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ backgroundColor: diff.bg, color: diff.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: diff.dot }} />{problem.difficulty}
          </span>
        </div>
        <div className="mt-1 text-[13px]" style={{ color: darkMode ? "#AAAAAA" : "#5F6368" }}>{problem.points} points</div>
      </div>
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <StatusBadge status={problem.status} onSolve={onSelect} />
      </div>
    </div>
  );
}

const announcements = [
  { time: "14:22", color: "#4285F4", text: "Clarification added for Problem B — check problem statement." },
  { time: "13:58", color: "#FBBC04", text: "System: 1 hour remaining! Standings are now frozen." },
  { time: "13:30", color: "#34A853", text: "Contest started. Good luck to all 48 teams!" },
  { time: "13:28", color: "#EA4335", text: "Reminder: No internet access permitted during contest." },
];

export default function Dashboard({ darkMode, setDarkMode }) {
  
  const navigate = useNavigate();
  
  const [problems, setProblems] = useState([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(true);
  const [problemsError, setProblemsError] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoadingProblems(true);
        setProblemsError("");

        const response = await fetch(
          "http://localhost:5000/api/problems"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch problems"
          );
        }

        setProblems(data);
      } catch (error) {
        console.error("Fetch problems error:", error);
        setProblemsError(error.message);
      } finally {
        setIsLoadingProblems(false);
      }
    };

    fetchProblems();
  }, []);

  // Dynamic colors
  const bgStyle = darkMode ? "#121212" : "#F8F9FA";
  const navBg = darkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = darkMode ? "#E0E0E0" : "#1C1B1F";
  const borderColor = darkMode ? "#333333" : "#E0E0E0";
  const cardBg = darkMode ? "#1E1E1E" : "#FFFFFF";

  return (
    <div className="flex flex-col" style={{ width: "100%", height: "100vh", backgroundColor: bgStyle, fontFamily: "'Roboto', sans-serif" }}>

      {/* Main Grid Content */}
      <div className="flex-1 grid gap-6 px-8 py-7 overflow-hidden" style={{ gridTemplateColumns: "1fr 300px", minHeight: 0 }}>
        <div className="flex flex-col gap-5 min-h-0 overflow-y-auto pr-2" style={{ scrollbarWidth: "none" }}>
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-bold tracking-[-0.3px]" style={{ color: textColor }}>Contest Problems</h1>
            <p className="text-[14px]" style={{ color: darkMode ? "#AAAAAA" : "#5F6368" }}>Solve the problems below to earn points. Live rankings are updated automatically.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-[#333333] overflow-hidden">
              <div className="h-full rounded-full bg-[#34A853] transition-all duration-500" style={{ width: "40%" }} />
            </div>
            <span className="text-[13px] flex-shrink-0" style={{ color: darkMode ? "#AAAAAA" : "#5F6368" }}>2 of 5 solved</span>
          </div>
          <div className="flex flex-col gap-3 pb-2">
            {isLoadingProblems && (
              <p>Loading problems...</p>
            )}

            {problemsError && (
              <p>{problemsError}</p>
            )}

            {!isLoadingProblems &&
              !problemsError &&
              problems.map((p) => (
                <ProblemCard
                  key={p.problem_id}
                  problem={p}
                  darkMode={darkMode}
                  onSelect={() =>
                    navigate(`/problems/${p.problem_id}`)
                  }
                />
              ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-5 min-h-0 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="rounded-[16px] p-5 flex flex-col gap-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <h3 className="text-[14px] font-bold" style={{ color: textColor }}>Your Stats</h3>
            <div className="flex flex-col gap-0">
              {[
                { label: "Current Rank", value: "#14", color: "#4285F4" },
                { label: "Solved", value: "2 / 5", color: "#34A853" },
                { label: "Total Score", value: "350 pts", color: "#FBBC04" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
                  <span className="text-[13px]" style={{ color: darkMode ? "#AAAAAA" : "#5F6368" }}>{label}</span>
                  <span className="text-[14px] font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[16px] p-5 flex flex-col gap-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
            <h3 className="text-[14px] font-bold" style={{ color: textColor }}>Announcements</h3>
            <div className="flex flex-col">
              {announcements.map((a, i) => (
                <div key={i} className="flex gap-3 relative">
                  {i < announcements.length - 1 && <div className="absolute left-[6px] top-4 bottom-0 w-px" style={{ backgroundColor: borderColor }} />}
                  <div className="flex-shrink-0 w-3 h-3 rounded-full mt-1 relative z-10" style={{ backgroundColor: a.color, outline: `2px solid ${cardBg}` }} />
                  <div className="pb-4 min-w-0">
                    <div className="text-[11px] mb-0.5" style={{ color: darkMode ? "#888888" : "#9AA0A6" }}>{a.time}</div>
                    <div className="text-[12px] leading-snug" style={{ color: darkMode ? "#CCCCCC" : "#3C4043" }}>{a.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <GoogleBar />
    </div>
  );
}