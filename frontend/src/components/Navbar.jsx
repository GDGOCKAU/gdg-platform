import { useLocation, useNavigate } from "react-router-dom";
import gdgLogoImg from "../assets/gdg-logo.png";

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

const Navbar = ({
  darkMode,
  setDarkMode,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navBg = darkMode
    ? "#1E1E1E"
    : "#FFFFFF";

  const borderColor = darkMode
    ? "#333333"
    : "#E0E0E0";

  const isProblemsPage =
    location.pathname === "/" ||
    location.pathname.startsWith("/problems");

  const isLeaderboardPage =
    location.pathname === "/leaderboard";

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
          onClick={() => navigate("/")}
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
            CK
          </div>

          <span
            className="text-[14px] font-medium"
            style={{
              color: darkMode ? "#E0E0E0" : "#3C4043",
            }}
          >
            Code_Knights
          </span>
        </div>

        <div
          className="w-px h-5"
          style={{ backgroundColor: borderColor }}
        />

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]"
          style={{
            backgroundColor: darkMode ? "#2A1B0E" : "#FFF3E0",
            border: "1px solid #FFB74D",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#E65100" strokeWidth="1.4" />
            <path d="M7 4V7L9 9" stroke="#E65100" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <span
            className="text-[14px] font-bold tabular-nums"
            style={{
              color: "#E65100",
              letterSpacing: "0.5px",
            }}
          >
            02:45:12
          </span>
        </div>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors duration-150"
          style={{
            border: `1px solid ${borderColor}`,
            backgroundColor: darkMode
              ? "#2A2A2A"
              : "transparent",
            cursor: "pointer",
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