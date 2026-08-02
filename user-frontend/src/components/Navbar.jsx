import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import gdgLogoImg from "../assets/gdg-logo.png";
import { API_BASE_URL } from "../config";


function GDGLogo({ darkMode }) {
  return (
    <div className="flex items-center gap-3">
      <img src={gdgLogoImg} alt="GDG KAU Logo" className="w-9 h-auto flex-shrink-0 object-contain" />

      <div>
        <div
          className="text-sm font-semibold leading-tight tracking-tight"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: darkMode ? "#E0E0E0" : "#1C1B1F",
          }}
        >
          GDG KAU
        </div>

        <div
          className="text-[11px] leading-tight"
          style={{
            fontFamily: "'Roboto', sans-serif",
            color: darkMode ? "#9AA0A6" : "#5F6368",
          }}
        >
          King Abdulaziz University
        </div>
      </div>
    </div>
  );
}

const Navbar = ({darkMode, setDarkMode,}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, competition } = useAuth();
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [timerStatus, setTimerStatus] = useState("loading");
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);

  const navBg = darkMode
    ? "#1E1E1E"
    : "#FFFFFF";

  const borderColor = darkMode
    ? "#333333"
    : "#E0E0E0";

  const isProblemsPage = location.pathname === "/dashboard" || location.pathname.startsWith("/problems");

  const isLeaderboardPage = location.pathname === "/leaderboard";

  
  const handleThemeToggle = async () => {
    if (isUpdatingTheme) return;
    
    const previousDarkMode = darkMode;
    const newDarkMode = !darkMode;
    const newTheme = newDarkMode ? "Dark" : "Light";
    
    try {
      setIsUpdatingTheme(true);
      setDarkMode(newDarkMode);
      
      const response = await fetch(`${API_BASE_URL}/api/users/theme`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: newTheme,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update theme");
      }
    } catch (error) {
      console.error("Update theme error:", error);
      
      setDarkMode(previousDarkMode);
    } finally {
      setIsUpdatingTheme(false);
    }
  };

  useEffect(() => {
    if (!competition?.started_at || !competition?.ended_at) {
      setTimeLeft("00:00:00");
      setTimerStatus("loading");
      return;
    }
  
    const updateTimer = () => {
      const now = new Date().getTime();
      const startTime = new Date(competition.started_at).getTime();
      const endTime = new Date(competition.ended_at).getTime();

      let difference;

      if (now < startTime) {
        difference = startTime - now;
        setTimerStatus("before");
      } else if (now < endTime) {
        difference = endTime - now;
        setTimerStatus("running");
      } else {
        setTimeLeft("00:00:00");
        setTimerStatus("finished");
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };

    updateTimer();

    const intervalId = setInterval(updateTimer, 1000);

    return () => clearInterval(intervalId);
  }, [competition]);

  const timerLabel =
    timerStatus === "before"
      ? "Starts in"
      : timerStatus === "running"
        ? "Time Left"
        : timerStatus === "finished"
          ? "Contest Finished"
          : "Loading";

  const timerBackground =
    timerStatus === "before"
      ? darkMode
        ? "#102A43"
        : "#E8F0FE"
      : timerStatus === "running"
        ? darkMode
          ? "#2A1B0E"
          : "#FFF3E0"
        : darkMode
          ? "#2A2A2A"
          : "#F1F3F4";

  const timerBorder =
    timerStatus === "before"
      ? "#4285F4"
      : timerStatus === "running"
        ? "#FFB74D"
        : "#9AA0A6";

  const timerColor =
    timerStatus === "before"
      ? "#1967D2"
      : timerStatus === "running"
        ? "#E65100"
        : "#5F6368";

  return (
    <nav
      className="flex-shrink-0 flex items-center px-8"
      style={{
        height: "64px",
        backgroundColor: navBg,
        borderBottom: `1px solid ${borderColor}`,
        zIndex: 10,
      }}
    >
      <GDGLogo darkMode={darkMode} />

      <div className="flex items-center gap-1 ml-10">
        <button
          onClick={() => navigate("/dashboard")}
          className={`px-4 py-2 rounded-[8px] text-[14px] transition-all duration-150 ${isProblemsPage ? "font-semibold" : ""}`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: isProblemsPage
              ? "#3A7CF5"
              : darkMode
                ? "#AAAAAA"
                : "#5F6368",
            backgroundColor: isProblemsPage
              ? darkMode
                ? "#1A2E4B"
                : "#E8F0FE"
              : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Problems
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          className={`px-4 py-2 rounded-[8px] text-[14px] transition-all duration-150 ${isLeaderboardPage ? "font-semibold" : ""}`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: isLeaderboardPage
              ? "#3A7CF5"
              : darkMode
                ? "#AAAAAA"
                : "#5F6368",
            backgroundColor: isLeaderboardPage
              ? darkMode
                ? "#1A2E4B"
                : "#E8F0FE"
              : "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          Leaderboard
        </button>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
            style={{ backgroundColor: "#4285F4" }}
          >
            {user?.team_name ?.split(/[\s_]+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "TM"}
          </div>

          <span
            className="text-[14px] font-medium"
            style={{
              color: darkMode ? "#E0E0E0" : "#3C4043",
            }}
          >
            {user?.team_name || "Team"}
          </span>
        </div>

        <div
          className="w-px h-5"
          style={{ backgroundColor: borderColor }}
        />

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]"
          style={{
            backgroundColor: timerBackground,
            border: `1px solid ${timerBorder}`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke={timerColor}  strokeWidth="1.4" />
            <path d="M7 4V7L9 9" stroke={timerColor}  strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          
          <div className="flex items-center gap-2">
            <span
              className="text-[12px] font-medium"
              style={{ color: timerColor }}
            >
              {timerLabel}
            </span>

            {timerStatus !== "finished" && timerStatus !== "loading" && (
              <span
                className="text-[14px] font-bold tabular-nums"
                style={{
                  color: timerColor,
                  letterSpacing: "0.5px",
                }}
              >
                {timeLeft}
              </span>
            )}
          </div>


        </div>

        <button
          onClick={handleThemeToggle}
          disabled={isUpdatingTheme}
          className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors duration-150"
          style={{
            border: `1px solid ${borderColor}`,
            backgroundColor: darkMode ? "#2A2A2A" : "transparent",
            cursor: isUpdatingTheme ? "not-allowed" : "pointer",
            opacity: isUpdatingTheme ? 0.6 : 1,
          }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" stroke="#FBBC04" strokeWidth="1.5" />
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="#FBBC04" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z" stroke="#5F6368" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;