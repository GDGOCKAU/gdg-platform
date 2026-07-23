import { useState } from "react";
import { useNavigate } from "react-router-dom";
import gdgLogoImg from "./assets/gdg-logo.png";

function GDGLogo() {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={gdgLogoImg} 
        alt="GDG Logo" 
        className="w-10 h-auto flex-shrink-0 object-contain"
      />
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="text-sm font-semibold text-[#1C1B1F] leading-tight tracking-tight">
          GDG KAU
        </div>
        <div style={{ fontFamily: "'Roboto', sans-serif" }} className="text-xs text-[#5F6368] leading-tight">
          Google Developer Group
        </div>
      </div>
    </div>
  );
}

function AbstractPatternLeft() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full opacity-[0.04] pointer-events-none"
      viewBox="0 0 480 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="260" r="120" fill="#4285F4" />
      <circle cx="360" cy="80" r="160" fill="#EA4335" />
      <circle cx="420" cy="300" r="80" fill="#34A853" />
      <circle cx="160" cy="40" r="60" fill="#FBBC04" />
    </svg>
  );
}

export default function Login() {
  const [teamName, setTeamName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handle Form Submission
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset previous error

    // Example correct credentials (replace with API logic)
    const validTeam = "123456";
    const validCode = "123456";

    if (!teamName.trim() || !accessCode.trim()) {
      setErrorMessage("Please fill in both Team Name and Access Code.");
      return;
    }

    if (teamName === validTeam && accessCode === validCode) {
      // Valid credentials -> Route to Dashboard!
      navigate("/dashboard");
    } else {
      // Invalid credentials -> Display error message
      setErrorMessage("The information entered is not correct. Please check your team name or access code.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#F8F9FA", fontFamily: "'Roboto', sans-serif" }}
    >
      {/* Main content */}
      <main className="flex-1 grid grid-cols-2 gap-0 min-h-0" style={{ minHeight: "calc(100vh - 4px)" }}>

        {/* Left Column — Welcome Section */}
        <div className="flex items-center justify-center p-16 relative overflow-hidden">
          <AbstractPatternLeft />

          <div
            className="relative w-full max-w-[440px] bg-white rounded-[24px] p-10 flex flex-col gap-8"
            style={{
              boxShadow: "0px 1px 2px rgba(0,0,0,0.06), 0px 4px 16px rgba(0,0,0,0.06), 0px 0px 0px 1px rgba(0,0,0,0.04)",
            }}
          >
            {/* Logo area */}
            <div className="flex flex-col gap-3">
              <GDGLogo />
              <div className="h-px bg-[#F1F3F4] mt-1" />
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-4">
              <h1
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                className="text-[42px] font-bold text-[#1C1B1F] leading-[1.15] tracking-[-0.5px]"
              >
                Ready to<br />
                <span className="text-[#3A7CF5]">build?</span>
              </h1>
              <p
                style={{ fontFamily: "'Roboto', sans-serif" }}
                className="text-[16px] text-[#5F6368] leading-relaxed font-normal max-w-[340px]"
              >
                Log in with your team credentials to enter the arena.
              </p>
            </div>

            {/* Contest info chips */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#34A853] flex-shrink-0" />
                <span className="text-sm text-[#3C4043]" style={{ fontFamily: "'Roboto', sans-serif" }}>Contest is live</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#4285F4] flex-shrink-0" />
                <span className="text-sm text-[#3C4043]" style={{ fontFamily: "'Roboto', sans-serif" }}>Teams registered: 48</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#FBBC04] flex-shrink-0" />
                <span className="text-sm text-[#3C4043]" style={{ fontFamily: "'Roboto', sans-serif" }}>Duration: 3 hours</span>
              </div>
            </div>

            {/* Decorative tag */}
            <div className="mt-auto pt-4 border-t border-[#F1F3F4]">
              <span
                className="inline-flex items-center gap-2 text-xs text-[#5F6368] bg-[#F8F9FA] px-3 py-1.5 rounded-full"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z" fill="#FBBC04" />
                </svg>
                Powered by GDG KAU × ICPC
              </span>
            </div>
          </div>
        </div>

        {/* Right Column — Login Form */}
        <div className="flex items-center justify-center p-16 bg-white relative">
          {/* Subtle top-right accent dots */}
          <div className="absolute top-8 right-8 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4285F4]" />
            <div className="w-2 h-2 rounded-full bg-[#EA4335]" />
            <div className="w-2 h-2 rounded-full bg-[#FBBC04]" />
            <div className="w-2 h-2 rounded-full bg-[#34A853]" />
          </div>

          <div className="w-full max-w-[380px] flex flex-col gap-8">
            {/* Form heading */}
            <div className="flex flex-col gap-1.5">
              <h2
                style={{ fontFamily: "'DM Sans', sans-serif" }}
                className="text-[28px] font-bold text-[#1C1B1F] tracking-[-0.3px]"
              >
                Sign in
              </h2>
              <p className="text-sm text-[#5F6368]" style={{ fontFamily: "'Roboto', sans-serif" }}>
                Enter your team details to continue
              </p>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3.5 rounded-[8px] bg-[#FFEBEE] border border-[#FFCDD2] flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="7" stroke="#EA4335" strokeWidth="1.5" />
                  <path d="M8 5V8.5M8 11H8.01" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[13px] text-[#C62828] leading-tight" style={{ fontFamily: "'Roboto', sans-serif" }}>
                  {errorMessage}
                </span>
              </div>
            )}

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleLogin}>
              {/* Team Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="teamName"
                  className="text-[13px] font-medium text-[#3C4043]"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Team Name
                </label>
                <div className="relative">
                  <input
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    onFocus={() => setFocusedField("teamName")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="e.g., Code_Knights"
                    className="w-full px-4 py-3 text-[15px] text-[#1C1B1F] bg-white rounded-[8px] outline-none transition-all duration-150"
                    style={{
                      border: focusedField === "teamName"
                        ? "2px solid #3A7CF5"
                        : "1.5px solid #E0E0E0",
                      fontFamily: "'Roboto', sans-serif",
                    }}
                  />
                  {focusedField === "teamName" && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="#3A7CF5" strokeWidth="1.5" />
                        <path d="M5 8L7 10L11 6" stroke="#3A7CF5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Access Code */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="accessCode"
                  className="text-[13px] font-medium text-[#3C4043]"
                  style={{ fontFamily: "'Roboto', sans-serif" }}
                >
                  Access Code
                </label>
                <input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onFocus={() => setFocusedField("accessCode")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-3 text-[15px] text-[#1C1B1F] bg-white rounded-[8px] outline-none transition-all duration-150 tracking-widest"
                  style={{
                    border: focusedField === "accessCode"
                      ? "2px solid #3A7CF5"
                      : "1.5px solid #E0E0E0",
                    fontFamily: "'Roboto', sans-serif",
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 text-white font-semibold text-[15px] rounded-[100px] mt-2 transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: "#3A7CF5",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0px 2px 6px rgba(58,124,245,0.30), 0px 1px 2px rgba(58,124,245,0.20)",
                  letterSpacing: "0.2px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.boxShadow = "0px 4px 12px rgba(58,124,245,0.40), 0px 2px 4px rgba(58,124,245,0.20)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3A7CF5";
                  e.currentTarget.style.boxShadow = "0px 2px 6px rgba(58,124,245,0.30), 0px 1px 2px rgba(58,124,245,0.20)";
                }}
              >
                Join Contest
              </button>

              {/* Forgot link */}
              <p
                className="text-center text-[13px] text-[#9AA0A6] mt-1"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                Forgot access code?{" "}
                <a
                  href="#"
                  className="text-[#5F6368] underline underline-offset-2 hover:text-[#3A7CF5] transition-colors duration-150"
                  onClick={(e) => e.preventDefault()}
                >
                  Contact your admin
                </a>
              </p>
            </form>

            {/* Divider + secondary info */}
            <div className="pt-4 border-t border-[#F1F3F4]">
              <p
                className="text-center text-[12px] text-[#9AA0A6]"
                style={{ fontFamily: "'Roboto', sans-serif" }}
              >
                By signing in you agree to the contest rules and{" "}
                <a href="#" className="underline hover:text-[#3A7CF5] transition-colors" onClick={(e) => e.preventDefault()}>
                  code of conduct
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer — Google color accent bar */}
      <div className="flex-shrink-0 flex w-full" style={{ height: "4px" }}>
        <div className="flex-1" style={{ backgroundColor: "#4285F4" }} />
        <div className="flex-1" style={{ backgroundColor: "#EA4335" }} />
        <div className="flex-1" style={{ backgroundColor: "#FBBC04" }} />
        <div className="flex-1" style={{ backgroundColor: "#34A853" }} />
      </div>
    </div>
  );
}
