import { useState } from "react";
import gdgLogoImg from "./assets/gdg-logo.png";
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

const codeLines = [
  { tokens: [{ text: "import", color: "#C586C0" }, { text: " sys", color: "#9CDCFE" }] },
  { tokens: [{ text: "from", color: "#C586C0" }, { text: " collections", color: "#9CDCFE" }, { text: " import", color: "#C586C0" }, { text: " defaultdict", color: "#4EC9B0" }] },
  { tokens: [] },
  { tokens: [{ text: "def", color: "#DCDCAA" }, { text: " solve", color: "#DCDCAA" }, { text: "()", color: "#D4D4D4" }, { text: ":", color: "#D4D4D4" }] },
  { tokens: [{ text: "    input = sys.stdin.readline", color: "#9CDCFE" }] },
  { tokens: [{ text: "    n, q ", color: "#9CDCFE" }, { text: "=", color: "#D4D4D4" }, { text: " map", color: "#DCDCAA" }, { text: "(", color: "#D4D4D4" }, { text: "int", color: "#4EC9B0" }, { text: ", input().split())", color: "#D4D4D4" }] },
  { tokens: [{ text: "    arr ", color: "#9CDCFE" }, { text: "=", color: "#D4D4D4" }, { text: " list", color: "#4EC9B0" }, { text: "(", color: "#D4D4D4" }, { text: "map", color: "#DCDCAA" }, { text: "(", color: "#D4D4D4" }, { text: "int", color: "#4EC9B0" }, { text: ", input().split()))", color: "#D4D4D4" }] },
  { tokens: [] },
  { tokens: [{ text: "    # prefix sum array", color: "#6A9955" }] },
  { tokens: [{ text: "    prefix ", color: "#9CDCFE" }, { text: "= [", color: "#D4D4D4" }, { text: "0", color: "#B5CEA8" }, { text: "] * (n + ", color: "#D4D4D4" }, { text: "1", color: "#B5CEA8" }, { text: ")", color: "#D4D4D4" }] },
  { tokens: [{ text: "    for", color: "#C586C0" }, { text: " i ", color: "#9CDCFE" }, { text: "in", color: "#C586C0" }, { text: " range", color: "#DCDCAA" }, { text: "(n):", color: "#D4D4D4" }] },
  { tokens: [{ text: "        prefix[i+", color: "#D4D4D4" }, { text: "1", color: "#B5CEA8" }, { text: "] = prefix[i] + arr[i]", color: "#D4D4D4" }] },
  { tokens: [] },
  { tokens: [{ text: "    results ", color: "#9CDCFE" }, { text: "= []", color: "#D4D4D4" }] },
  { tokens: [{ text: "    for", color: "#C586C0" }, { text: " _ ", color: "#9CDCFE" }, { text: "in", color: "#C586C0" }, { text: " range", color: "#DCDCAA" }, { text: "(q):", color: "#D4D4D4" }] },
];

function CodeEditor() {
  return (
    <div className="flex-1 overflow-auto" style={{ backgroundColor: "#1E1E1E", scrollbarWidth: "none" }}>
      <table className="w-full border-collapse" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: "13px", lineHeight: "1.7" }}>
        <tbody>
          {codeLines.map((line, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td
                className="text-right px-4 select-none"
                style={{ color: "#858585", width: "48px", minWidth: "48px", verticalAlign: "top", paddingTop: "1px" }}
              >
                {idx + 1}
              </td>
              <td className="pl-4 pr-8" style={{ color: "#D4D4D4" }}>
                {line.tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  line.tokens.map((tok, ti) => (
                    <span key={ti} style={{ color: tok.color }}>{tok.text}</span>
                  ))
                )}
              </td>
            </tr>
          ))}
          <tr style={{ backgroundColor: "#ffffff08" }}>
            <td className="text-right px-4 select-none" style={{ color: "#C6C6C6", width: "48px" }}>16</td>
            <td className="pl-4 pr-8" style={{ color: "#D4D4D4" }}>
              <span style={{ color: "#C586C0" }}>        l</span>
              <span style={{ color: "#9CDCFE" }}>, r </span>
              <span style={{ color: "#D4D4D4" }}>=</span>
              <span style={{ color: "#9CDCFE" }}> map</span>
              <span style={{ color: "#D4D4D4" }}>(</span>
              <span style={{ color: "#4EC9B0" }}>int</span>
              <span style={{ color: "#D4D4D4" }}>, input().split())</span>
              <span
                style={{
                  display: "inline-block",
                  width: "2px",
                  height: "15px",
                  backgroundColor: "#AEAFAD",
                  marginLeft: "1px",
                  verticalAlign: "middle",
                  animation: "blink 1.2s step-end infinite",
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

function SampleBlock({ label, content, darkMode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const bgStyle = darkMode ? "#2A2A2A" : "#F8F9FA";
  const borderStyle = darkMode ? "#3C3C3C" : "#E0E0E0";
  const textColor = darkMode ? "#E0E0E0" : "#1C1B1F";

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: darkMode ? "#AAAAAA" : "#5F6368", fontFamily: "'Roboto', sans-serif" }}>
        {label}
      </div>
      <div className="relative rounded-[8px] p-3 group" style={{ backgroundColor: bgStyle, border: `1px solid ${borderStyle}` }}>
        <pre className="text-[13px] leading-relaxed m-0 whitespace-pre-wrap" style={{ color: textColor, fontFamily: "'JetBrains Mono', monospace" }}>
          {content}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-[6px] p-1.5 hover:bg-white/10"
          style={{ border: "none", backgroundColor: "transparent", cursor: "pointer" }}
          title="Copy"
        >
          {copied ? (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7L5.5 10L11.5 4" stroke="#34A853" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <rect x="4" y="1" width="9" height="9" rx="2" stroke="#9AA0A6" strokeWidth="1.4" />
              <path d="M1 5v7a2 2 0 0 0 2 2h7" stroke="#9AA0A6" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

const LANGUAGES = ["Python 3", "C++17", "Java 17", "C", "Kotlin"];

export default function ProblemWorkspace({ darkMode, setDarkMode }) {
  const [language, setLanguage] = useState("Python 3");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [runState, setRunState] = useState("idle");
  const navigate = useNavigate();

  const handleRun = () => {
    setRunState("running");
    setConsoleOpen(true);
    setTimeout(() => setRunState("done"), 1800);
  };

  const navBg = darkMode ? "#1E1E1E" : "#FFFFFF";
  const leftPanelBg = darkMode ? "#181818" : "#FFFFFF";
  const textColor = darkMode ? "#E0E0E0" : "#1C1B1F";
  const subTextColor = darkMode ? "#AAAAAA" : "#3C4043";
  const borderColor = darkMode ? "#333333" : "#E0E0E0";
  const inlineCodeBg = darkMode ? "#2A2A2A" : "#F1F3F4";

  return (
    <div
      className="flex flex-col transition-colors duration-200"
      style={{ width: "100%", height: "100vh", backgroundColor: darkMode ? "#121212" : "#F8F9FA", fontFamily: "'Roboto', sans-serif", overflow: "hidden" }}
    >
      {/* ── Top Nav Bar ── */}
      <nav
        className="flex-shrink-0 flex items-center px-8"
        style={{ height: "64px", backgroundColor: navBg, borderBottom: `1px solid ${borderColor}`, zIndex: 10 }}
      >
        <GDGLogo darkMode={darkMode} />

        {/* Clean Navigation Buttons with Active Indicator */}
        <div className="flex items-center gap-1 ml-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[14px] font-semibold transition-all duration-150"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#3A7CF5",
              backgroundColor: darkMode ? "#1A2E4B" : "#E8F0FE",
              border: "none",
              cursor: "pointer",
            }}
          >
            Problems
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: "#3A7CF5", color: "white" }}
            >
              Active
            </span>
          </button>

          <button
            onClick={() => navigate("/leaderboard")}
            className="px-4 py-2 rounded-[8px] text-[14px] transition-all duration-150"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: darkMode ? "#AAAAAA" : "#5F6368",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Leaderboard
          </button>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: "#4285F4" }}>
              CK
            </div>
            <span className="text-[14px] font-medium" style={{ color: darkMode ? "#E0E0E0" : "#3C4043" }}>
              Code_Knights
            </span>
          </div>

          <div className="w-px h-5" style={{ backgroundColor: borderColor }} />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ backgroundColor: darkMode ? "#2A1B0E" : "#FFF3E0", border: "1px solid #FFB74D" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#E65100" strokeWidth="1.4" />
              <path d="M7 4V7L9 9" stroke="#E65100" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="text-[14px] font-bold tabular-nums" style={{ color: "#E65100", letterSpacing: "0.5px" }}>
              01:15:42
            </span>
          </div>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors duration-150"
            style={{ 
              border: `1px solid ${borderColor}`, 
              backgroundColor: darkMode ? "#2A2A2A" : "transparent", 
              cursor: "pointer" 
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

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── Left: Problem Description (40%) ── */}
        <div
          className="flex flex-col overflow-y-auto transition-colors duration-200"
          style={{ width: "40%", minWidth: "40%", backgroundColor: leftPanelBg, borderRight: `1px solid ${borderColor}`, scrollbarWidth: "none" }}
        >
          {/* Problem header */}
          <div className="px-8 pt-8 pb-6 flex-shrink-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center font-bold text-[14px]"
                    style={{ backgroundColor: darkMode ? "#1A2E4B" : "#E8F0FE", color: "#3A7CF5" }}
                  >
                    B
                  </span>
                  <h1 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[20px] font-bold tracking-[-0.3px]">
                    Array Manipulation
                  </h1>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: darkMode ? "#332200" : "#FFF8E1", color: "#E65100" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#FBBC04" }} /> Medium
                  </span>
                  <span className="text-[13px] font-bold text-[#3A7CF5]">250 pts</span>
                  <span className="text-[12px]" style={{ color: darkMode ? "#AAAAAA" : "#9AA0A6" }}>Time: 2.0s</span>
                  <span className="text-[12px]" style={{ color: darkMode ? "#AAAAAA" : "#9AA0A6" }}>Memory: 256 MB</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: darkMode ? "#331111" : "#FFEBEE", border: "1px solid #FFCDD2" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" stroke="#EA4335" strokeWidth="1.2" />
                  <path d="M5 3V5.5M5 7H5.01" stroke="#EA4335" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <span className="text-[11px] font-semibold" style={{ color: "#EA4335" }}>Wrong Answer</span>
              </div>
            </div>
          </div>

          {/* Scrollable description content */}
          <div className="flex flex-col gap-7 px-8 py-7">
            {/* Problem Statement */}
            <section>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-3">
                Problem Statement
              </h2>
              <p className="text-[14px] leading-[1.75]" style={{ color: subTextColor }}>
                You are given an array <code className="px-1.5 py-0.5 rounded text-[13px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>A</code> of <code className="px-1.5 py-0.5 rounded text-[13px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>N</code> integers and <code className="px-1.5 py-0.5 rounded text-[13px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>Q</code> queries. For each query, you will receive two integers <code className="px-1.5 py-0.5 rounded text-[13px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>L</code> and <code className="px-1.5 py-0.5 rounded text-[13px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>R</code>, and you must output the sum of elements in the subarray from index <code className="px-1.5 py-0.5 rounded text-[13px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>L</code> to <code className="px-1.5 py-0.5 rounded text-[13px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>R</code> (1-indexed, inclusive).
              </p>
              <p className="text-[14px] leading-[1.75] mt-3" style={{ color: subTextColor }}>
                Your solution must handle up to <strong>10<sup>5</sup></strong> queries efficiently. A naive O(N×Q) approach will exceed the time limit.
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: borderColor }} />

            {/* Input / Output Format */}
            <section className="flex flex-col gap-5">
              <div>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-2">Input Format</h2>
                <ul className="flex flex-col gap-1.5 pl-4" style={{ listStyleType: "disc" }}>
                  {[
                    "First line: two integers N and Q (1 ≤ N, Q ≤ 10⁵)",
                    "Second line: N space-separated integers Aᵢ (−10⁹ ≤ Aᵢ ≤ 10⁹)",
                    "Next Q lines: two integers L and R per query (1 ≤ L ≤ R ≤ N)",
                  ].map((s, i) => (
                    <li key={i} className="text-[13.5px] leading-relaxed" style={{ color: subTextColor }}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-2">Output Format</h2>
                <p className="text-[13.5px] leading-relaxed" style={{ color: subTextColor }}>
                  Print Q lines. For each query, output a single integer — the sum of <code className="px-1 py-0.5 rounded text-[12px]" style={{ backgroundColor: inlineCodeBg, color: "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}>A[L..R]</code>.
                </p>
              </div>
            </section>

            <div style={{ height: "1px", backgroundColor: borderColor }} />

            {/* Sample test cases */}
            <section>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-4">Sample Test Cases</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <div className="text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: darkMode ? "#AAAAAA" : "#9AA0A6" }}>Example 1</div>
                  <div className="flex gap-3">
                    <SampleBlock label="Input" content={"5 3\n1 2 3 4 5\n1 3\n2 5\n1 5"} darkMode={darkMode} />
                    <SampleBlock label="Output" content={"6\n14\n15"} darkMode={darkMode} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: darkMode ? "#AAAAAA" : "#9AA0A6" }}>Example 2</div>
                  <div className="flex gap-3">
                    <SampleBlock label="Input" content={"4 2\n-1 3 -2 5\n1 4\n2 3"} darkMode={darkMode} />
                    <SampleBlock label="Output" content={"5\n1"} darkMode={darkMode} />
                  </div>
                </div>
              </div>
            </section>

            {/* Constraints */}
            <section>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-3">Constraints</h2>
              <div className="flex flex-col gap-2 p-4 rounded-[10px]" style={{ backgroundColor: darkMode ? "#2A2A2A" : "#F8F9FA", border: `1px solid ${borderColor}` }}>
                {["1 ≤ N, Q ≤ 10⁵", "−10⁹ ≤ Aᵢ ≤ 10⁹", "1 ≤ L ≤ R ≤ N", "Time Limit: 2.0 seconds", "Memory Limit: 256 MB"].map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#4285F4" }} />
                    <code className="text-[13px]" style={{ color: subTextColor, fontFamily: "'JetBrains Mono', monospace" }}>{c}</code>
                  </div>
                ))}
              </div>
            </section>

            <div className="pb-4" />
          </div>
        </div>

        {/* ── Right: Code Editor (60%) ── */}
        <div className="flex flex-col" style={{ width: "60%", minWidth: "60%", backgroundColor: "#1E1E1E" }}>
          {/* Editor control bar */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-5"
            style={{ height: "48px", backgroundColor: "#252526", borderBottom: "1px solid #3C3C3C" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-[6px] text-[13px] font-medium outline-none transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "#3C3C3C",
                    color: "#D4D4D4",
                    border: "1px solid #555",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <svg className="absolute right-2 pointer-events-none" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="#858585" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-t-[6px] text-[12px]"
                style={{ backgroundColor: "#1E1E1E", color: "#D4D4D4", fontFamily: "'JetBrains Mono', monospace", borderTop: "1px solid #3A7CF5", borderLeft: "1px solid #3C3C3C", borderRight: "1px solid #3C3C3C" }}
              >
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <path d="M1 1h5l3 3v7H1V1z" stroke="#4EC9B0" strokeWidth="1" />
                  <path d="M6 1v3h3" stroke="#4EC9B0" strokeWidth="1" />
                </svg>
                solution.py
              </div>
            </div>

            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] transition-colors duration-150 hover:bg-white/10"
              style={{ backgroundColor: "transparent", border: "1px solid #3C3C3C", color: "#858585", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7a5 5 0 1 1 1.5 3.5" stroke="#858585" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M2 10.5V7H5.5" stroke="#858585" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reset Code
            </button>
          </div>

          <CodeEditor />

          {/* Console drawer */}
          <div
            className="flex-shrink-0 flex flex-col transition-all duration-200"
            style={{ backgroundColor: "#252526", borderTop: "1px solid #3C3C3C", maxHeight: consoleOpen ? "180px" : "40px" }}
          >
            <button
              onClick={() => setConsoleOpen(!consoleOpen)}
              className="flex items-center justify-between px-5 py-2.5 w-full hover:bg-white/5 transition-colors duration-150"
              style={{ backgroundColor: "transparent", border: "none", cursor: "pointer" }}
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="12" rx="2" stroke="#858585" strokeWidth="1.3" />
                  <path d="M4 5L6.5 7.5L4 10" stroke="#858585" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 10h2" stroke="#858585" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span className="text-[12px] font-semibold" style={{ color: "#858585", fontFamily: "'DM Sans', sans-serif" }}>Test Results</span>
                {runState === "done" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: "#FFEBEE", color: "#EA4335" }}>
                    Wrong Answer
                  </span>
                )}
              </div>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transform: consoleOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
              >
                <path d="M2 4L6 8L10 4" stroke="#858585" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {consoleOpen && (
              <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
                {runState === "idle" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px]" style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>▶</span>
                    <span className="text-[13px]" style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Run your code to see results...</span>
                  </div>
                )}
                {runState === "running" && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#4285F4", borderTopColor: "transparent" }} />
                    <span className="text-[13px]" style={{ color: "#858585", fontFamily: "'JetBrains Mono', monospace" }}>Compiling and running...</span>
                  </div>
                )}
                {runState === "done" && (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-4 text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span style={{ color: "#34A853" }}>✓ Test 1: Passed &nbsp;(6ms)</span>
                      <span style={{ color: "#EA4335" }}>✗ Test 2: Wrong Answer</span>
                    </div>
                    <div className="text-[12px] mt-1" style={{ color: "#858585", fontFamily: "'JetBrains Mono', monospace" }}>
                      Expected: <span style={{ color: "#D4D4D4" }}>14</span> &nbsp;|&nbsp; Got: <span style={{ color: "#EA4335" }}>12</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div
            className="flex-shrink-0 flex items-center justify-end gap-3 px-5"
            style={{ height: "60px", backgroundColor: "#252526", borderTop: "1px solid #3C3C3C" }}
          >
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-5 py-2 rounded-[8px] text-[14px] font-semibold transition-all duration-150 hover:bg-white/10"
              style={{ backgroundColor: "#3C3C3C", color: "#D4D4D4", border: "1px solid #555", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polygon points="3,2 12,7 3,12" fill="#D4D4D4" />
              </svg>
              Run Code
            </button>

            <button
              className="flex items-center gap-2 px-6 py-2 rounded-[100px] text-[14px] font-semibold text-white transition-all duration-150"
              style={{
                backgroundColor: "#3A7CF5",
                border: "none",
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                boxShadow: "0px 2px 8px rgba(58,124,245,0.40)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Submit Solution
            </button>
          </div>
        </div>
      </div>

      <GoogleBar />
    </div>
  );
}