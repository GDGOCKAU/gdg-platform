import { useState, useEffect } from "react";
import gdgLogoImg from "./assets/gdg-logo.png";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import LoadingScreen from "./components/LoadingScreen";
import { API_BASE_URL } from "./config";
import { useAuth } from "./context/AuthContext";

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

// How often the open problem is re-fetched so an admin edit (a newly
// revealed sample case, a changed time limit, a statement fix) shows up
// without the contestant having to refresh the page themselves.
const PROBLEM_POLL_INTERVAL_MS = 15000;

const LANGUAGE_MAP = {
  "Python 3": "python",
  "C++17": "cpp",
  "Java 17": "java",
  C: "c",
  Kotlin: "kotlin",
};

const SUBMISSION_LANGUAGE_MAP = {
  "Python 3": { id: 71, name: "Python 3" },
  "C++17": { id: 54, name: "C++17" },
  "Java 17": { id: 62, name: "Java 17" },
  C: { id: 50, name: "C" },
  Kotlin: { id: 78, name: "Kotlin" },
};

const DEFAULT_TEMPLATES = {
  "Python 3": `def solve():
  pass


if __name__ == "__main__":
  solve()
`,

  "C++17": `#include <iostream>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  return 0;
  }
  `,

  "Java 17": `import java.util.*;

public class Main {
  public static void main(String[] args) {
    Scanner input = new Scanner(System.in);

  }
}
      `,

  C: `#include <stdio.h>

      int main() {

      return 0;
      }
      `,

  Kotlin: `fun main() {

      }
      `,
};

// Unsent code is kept per-problem in localStorage so a refresh, an accidental
// navigation, or a crash doesn't silently wipe out work in progress.
const getDraftKey = (problemId) => `gdg_problem_draft_${problemId}`;

const loadDraft = (problemId) => {
  try {
    const raw = localStorage.getItem(getDraftKey(problemId));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Load draft error:", error);
    return null;
  }
};

const getContestWindowState = (competition) => {
  if (!competition?.started_at || !competition?.ended_at) return "unknown";

  const now = Date.now();
  const start = new Date(competition.started_at).getTime();
  const end = new Date(competition.ended_at).getTime();

  if (now < start) return "before";
  if (now < end) return "running";
  return "ended";
};

const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

function BlockingScreen({ darkMode, icon, title, message, actionLabel, onAction }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 text-center px-6"
      style={{ width: "100%", height: "100%", backgroundColor: darkMode ? "#121212" : "#F8F9FA", fontFamily: "'Roboto', sans-serif" }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: darkMode ? "#1A2E4B" : "#E8F0FE" }}
      >
        {icon}
      </div>
      <h1 style={{ fontFamily: "'DM Sans', sans-serif", color: darkMode ? "#E0E0E0" : "#1C1B1F" }} className="text-[20px] font-bold">
        {title}
      </h1>
      <p className="text-[14px]" style={{ color: darkMode ? "#AAAAAA" : "#5F6368", maxWidth: "380px" }}>
        {message}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-[10px] text-[14px] font-semibold text-white"
          style={{ backgroundColor: "#3A7CF5", fontFamily: "'DM Sans', sans-serif", border: "none", cursor: "pointer" }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

const HISTORY_STATUS_COLORS = {
  Accepted: "#34A853",
  Queued: "#FBBC04",
  Judging: "#FBBC04",
};

function HistoryStatusColor(status) {
  return HISTORY_STATUS_COLORS[status] || "#EA4335";
}

export default function ProblemWorkspace({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const { problemId } = useParams();
  const { competition, setUser } = useAuth();

  const [problem, setProblem] = useState(null);
  const [problemError, setProblemError] = useState("");

  const [language, setLanguage] = useState(() => {
    const draft = loadDraft(problemId);
    return draft?.language && DEFAULT_TEMPLATES[draft.language] ? draft.language : "Python 3";
  });
  const [sourceCode, setSourceCode] = useState(() => {
    const draft = loadDraft(problemId);
    if (draft?.language && DEFAULT_TEMPLATES[draft.language] && draft.sourceCode) {
      return draft.sourceCode;
    }
    return DEFAULT_TEMPLATES["Python 3"];
  });

  const [consoleOpen, setConsoleOpen] = useState(false);
  const [runState, setRunState] = useState("idle");
  const [consoleMode, setConsoleMode] = useState(null); // 'run' | 'submit'

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [testRunResult, setTestRunResult] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const [contestWindow, setContestWindow] = useState(() => getContestWindowState(competition));
  const [countdownMs, setCountdownMs] = useState(0);

  // Reload the right problem's draft (or a blank template) whenever the
  // problem changes — React Router reuses this component instance across
  // /problems/:problemId navigations, so without this the editor would keep
  // showing the previous problem's code.
  useEffect(() => {
    const draft = loadDraft(problemId);

    if (draft?.language && DEFAULT_TEMPLATES[draft.language] && draft.sourceCode) {
      setLanguage(draft.language);
      setSourceCode(draft.sourceCode);
    } else {
      setLanguage("Python 3");
      setSourceCode(DEFAULT_TEMPLATES["Python 3"]);
    }

    setSubmissionResult(null);
    setTestRunResult(null);
    setConsoleMode(null);
    setRunState("idle");
    setConsoleOpen(false);
  }, [problemId]);

  // Persist whatever is currently in the editor so a refresh or an
  // accidental navigation away doesn't lose unsent work.
  useEffect(() => {
    try {
      localStorage.setItem(getDraftKey(problemId), JSON.stringify({ language, sourceCode }));
    } catch (error) {
      console.error("Save draft error:", error);
    }
  }, [problemId, language, sourceCode]);

  useEffect(() => {
    let cancelled = false;

    const fetchProblem = async ({ isPoll = false } = {}) => {
      try {
        if (!isPoll) setProblemError("");

        const response = await fetch(
          `${API_BASE_URL}/api/problems/${problemId}`,
          { credentials: "include" }
        );

        if (response.status === 401) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load this problem");
        }

        if (!cancelled) setProblem(data);
      } catch (error) {
        console.error("Fetch problem error:", error);

        // A dropped background poll keeps the last good problem data on
        // screen instead of yanking a mid-edit page into an error state.
        if (!cancelled && !isPoll) setProblemError(error.message);
      }
    };

    setProblem(null);
    fetchProblem();

    // The admin can edit a problem (add a visible sample, change the time
    // limit, tweak the statement...) while a team already has it open, so
    // poll instead of relying on a manual refresh to pick that up.
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      fetchProblem({ isPoll: true });
    };

    const intervalId = setInterval(poll, PROBLEM_POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") poll();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [problemId, setUser]);

  const fetchHistory = async ({ isPoll = false } = {}) => {
    try {
      if (!isPoll) {
        setHistoryLoading(true);
        setHistoryError("");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/submissions?problem_id=${problemId}`,
        { credentials: "include" }
      );

      if (response.status === 401) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load submission history");
      }

      setHistory(data.submissions || []);
      if (isPoll) setHistoryError("");
    } catch (error) {
      console.error("Fetch submission history error:", error);
      if (!isPoll) setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    // Picks up a teammate submitting from another device on the same team
    // account, or a submission that finished judging after this page was
    // already left open.
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      fetchHistory({ isPoll: true });
    };

    const intervalId = setInterval(poll, PROBLEM_POLL_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") poll();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  useEffect(() => {
    const update = () => {
      const state = getContestWindowState(competition);
      setContestWindow(state);

      if (state === "before" && competition?.started_at) {
        setCountdownMs(new Date(competition.started_at).getTime() - Date.now());
      }
    };

    update();
    const intervalId = setInterval(update, 1000);
    return () => clearInterval(intervalId);
  }, [competition]);

  const waitForSubmissionResult = async (submissionId) => {
    const maximumAttempts = 20;
    const pollingDelay = 1000;

    for (let attempt = 1; attempt <= maximumAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, pollingDelay));

      const response = await fetch(
        `${API_BASE_URL}/api/submissions/${submissionId}`,
        {
          credentials: "include",
        }
      );

      if (response.status === 401) {
        setUser(null);
        throw new Error("Your session expired.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to retrieve submission result"
        );
      }

      const status = data.submission.status;

      if (status !== "Queued" && status !== "Judging") {
        return data;
      }
    }

    const timeoutError = new Error(
      "Judging is taking longer than expected. You can check again below."
    );
    timeoutError.isTimeout = true;
    timeoutError.submissionId = submissionId;
    throw timeoutError;
  };

  const handleCheckStatus = async (submissionId) => {
    try {
      setCheckingStatus(true);

      const response = await fetch(
        `${API_BASE_URL}/api/submissions/${submissionId}`,
        { credentials: "include" }
      );

      if (response.status === 401) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to check submission status");
      }

      setSubmissionResult(data);

      if (data.submission.status !== "Queued" && data.submission.status !== "Judging") {
        fetchHistory();
      }
    } catch (error) {
      console.error("Check status error:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async () => {
    const currentCode = sourceCode.trim();
    const defaultCode = DEFAULT_TEMPLATES[language].trim();

    if (!currentCode || currentCode === defaultCode) {
      alert("Please write your solution before submitting.");
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmissionResult(null);
      setConsoleMode("submit");
      setConsoleOpen(true);
      setRunState("running");

      const selectedLanguage = SUBMISSION_LANGUAGE_MAP[language];

      const response = await fetch(
        `${API_BASE_URL}/api/submissions`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            problemId: Number(problemId),
            languageId: selectedLanguage.id,
            languageName: selectedLanguage.name,
            sourceCode,
          }),
        }
      );

      if (response.status === 401) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit solution"
        );
      }

      const finalResult = await waitForSubmissionResult(
        data.submissionId
      );

      setSubmissionResult(finalResult);
      setRunState("done");
      fetchHistory();
    } catch (error) {
      console.error("Submit solution error:", error);

      if (error.isTimeout) {
        setSubmissionResult({
          submission: { status: "Judging", error_message: null },
          testResults: [],
          pendingSubmissionId: error.submissionId,
        });
      } else {
        setSubmissionResult({
          submission: {
            status: "Internal Error",
            error_message: error.message,
          },
          testResults: [],
        });
      }

      setRunState("done");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunSample = async () => {
    const currentCode = sourceCode.trim();

    if (!currentCode) {
      alert("Please write your solution before running.");
      return;
    }

    try {
      setIsRunning(true);
      setTestRunResult(null);
      setConsoleMode("run");
      setConsoleOpen(true);
      setRunState("running");

      const selectedLanguage = SUBMISSION_LANGUAGE_MAP[language];

      const response = await fetch(
        `${API_BASE_URL}/api/judge/test-batch`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sourceCode,
            languageId: selectedLanguage.id,
            testCases: problem.sample_test_cases.map((testCase) => ({
              test_id: testCase.test_id,
              input_data: testCase.input_data,
              expected_output: testCase.expected_output,
            })),
          }),
        }
      );

      if (response.status === 401) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to run code");
      }

      setTestRunResult(data);
      setRunState("done");
    } catch (error) {
      console.error("Run sample error:", error);

      setTestRunResult({ error: error.message, results: [] });
      setRunState("done");
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your code?"
    );

    if (!confirmed) return;

    setSourceCode(DEFAULT_TEMPLATES[language]);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;

    if (
      sourceCode !== DEFAULT_TEMPLATES[language]
    ) {
      const confirmed = window.confirm(
        "Changing the language will replace your current code. Continue?"
      );

      if (!confirmed) {
        return;
      }
    }

    setLanguage(newLanguage);
    setSourceCode(
      DEFAULT_TEMPLATES[newLanguage]
    );
  };

  const navBg = darkMode ? "#1E1E1E" : "#FFFFFF";
  const leftPanelBg = darkMode ? "#181818" : "#FFFFFF";
  const textColor = darkMode ? "#E0E0E0" : "#1C1B1F";
  const subTextColor = darkMode ? "#AAAAAA" : "#3C4043";
  const borderColor = darkMode ? "#333333" : "#E0E0E0";
  const inlineCodeBg = darkMode ? "#2A2A2A" : "#F1F3F4";

  if (problemError) {
    return (
      <BlockingScreen
        darkMode={darkMode}
        icon={
          <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
            <path d="M11 2 1 19h20L11 2Z" stroke="#EA4335" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M11 8.5v4.5M11 15.5h.01" stroke="#EA4335" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        }
        title="Couldn't load this problem"
        message={problemError}
        actionLabel="Back to Dashboard"
        onAction={() => navigate("/dashboard")}
      />
    );
  }

  if (!problem) {
    return <LoadingScreen darkMode={darkMode} />;
  }

  if (contestWindow === "before") {
    return (
      <BlockingScreen
        darkMode={darkMode}
        icon={
          <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="9" stroke="#3A7CF5" strokeWidth="1.6" />
            <path d="M11 6v5l3 3" stroke="#3A7CF5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        }
        title="The contest hasn't started yet"
        message={`Submissions open once the contest begins. Time remaining: ${formatCountdown(countdownMs)}`}
        actionLabel="Back to Dashboard"
        onAction={() => navigate("/dashboard")}
      />
    );
  }

  const isContestEnded = contestWindow === "ended";

  const backendStatusLabel =
    problem.status === "accepted"
      ? "Accepted"
      : problem.status === "wrong"
        ? "Wrong Answer"
        : null;

  const submissionStatus = submissionResult?.submission?.status || backendStatusLabel;
  const isPendingJudgment = submissionStatus === "Queued" || submissionStatus === "Judging";

  const statusColor =
    submissionStatus === "Accepted"
      ? "#34A853"
      : isPendingJudgment
        ? "#FBBC04"
        : submissionStatus
          ? "#EA4335"
          : "#9AA0A6";

  const statusBackground =
    submissionStatus === "Accepted"
      ? darkMode
        ? "#12351F"
        : "#E6F4EA"
      : isPendingJudgment
        ? darkMode
          ? "#332A00"
          : "#FFF8E1"
        : submissionStatus
          ? darkMode
            ? "#331111"
            : "#FFEBEE"
          : darkMode
            ? "#2A2A2A"
            : "#F1F3F4";

  const hasWrittenCode = sourceCode.trim() !== "" && sourceCode.trim() !== DEFAULT_TEMPLATES[language].trim();
  const hasSampleTestCases = problem.sample_test_cases.length > 0;

  return (
    <div
      className="flex flex-col transition-colors duration-200"
      style={{ width: "100%", height: "100%", minHeight: 0, backgroundColor: darkMode ? "#121212" : "#F8F9FA", fontFamily: "'Roboto', sans-serif", overflow: "hidden" }}
    >

      {isContestEnded && (
        <div
          className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold"
          style={{ backgroundColor: darkMode ? "#331111" : "#FFEBEE", color: darkMode ? "#FF8A80" : "#C62828", fontFamily: "'Roboto', sans-serif" }}
        >
          This contest has ended — submissions are closed. You can still review the problem.
        </div>
      )}

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0, height: "100%",}}>

        {/* ── Left: Problem Description (55%) ── */}
        <div
          className="flex flex-col overflow-y-auto transition-colors duration-200"
          style={{ width: "55%", minWidth: "55%", backgroundColor: leftPanelBg, borderRight: `1px solid ${borderColor}`, scrollbarWidth: "none" }}
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
                    {problem.problem_code}
                  </span>
                  <h1 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[20px] font-bold tracking-[-0.3px]">
                    {problem.problem_name}
                  </h1>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: darkMode ? "#332200" : "#FFF8E1", color: "#E65100" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#FBBC04" }} /> {problem.difficulty}
                  </span>
                  <span className="text-[13px] font-bold text-[#3A7CF5]">{problem.points} pts</span>
                  <span className="text-[12px]" style={{ color: darkMode ? "#AAAAAA" : "#9AA0A6" }}>Time: {(problem.time_limit / 1000).toFixed(1)}s</span>
                  <span className="text-[12px]" style={{ color: darkMode ? "#AAAAAA" : "#9AA0A6" }}> Memory: {problem.memory_limit_mb} MB</span>
                </div>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: statusBackground,
                  border: `1px solid ${statusColor}`,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" stroke={statusColor} strokeWidth="1.2" />
                  <path
                    d="M5 3V5.5M5 7H5.01"
                    stroke={statusColor}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>

                <span
                  className="text-[11px] font-semibold"
                  style={{ color: statusColor }}
                >
                  {submissionStatus || "Not Submitted"}
                </span>
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
                 {problem.description}
              </p>
            </section>

            <div style={{ height: "1px", backgroundColor: borderColor }} />

            {/* Input / Output Format */}
            <section className="flex flex-col gap-5">
              <div>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-2">Input Format</h2>
                <p className="text-[13.5px] leading-relaxed whitespace-pre-line" style={{ color: subTextColor }} >
                  {problem.input_format}
                </p>
              </div>
              <div>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-2">Output Format</h2>
                <p className="text-[13.5px] leading-relaxed whitespace-pre-line" style={{ color: subTextColor }} >
                  {problem.output_format}
                </p>
              </div>
            </section>

            <div style={{ height: "1px", backgroundColor: borderColor }} />

            {/* Sample test cases */}
            <section>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-4">Sample Test Cases</h2>


              {problem.sample_test_cases.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {problem.sample_test_cases.map((testCase, index) => (
                    <div key={testCase.test_id}>
                      <div className="text-[11px] font-semibold mb-2 uppercase tracking-wider" style={{ color: darkMode ? "#AAAAAA" : "#9AA0A6" }} >
                        Example {index + 1}
                      </div>

                      <div className="flex gap-3">
                        <SampleBlock label="Input" content={testCase.input_data} darkMode={darkMode} />
                        <SampleBlock label="Output" content={testCase.expected_output} darkMode={darkMode} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px]" style={{ color: subTextColor }} >
                  No sample test cases available.
                </p>
              )}
            </section>

            {/* Constraints */}
            <section>
              <h2 style={{fontFamily: "'DM Sans', sans-serif", color: textColor, }} className="text-[14px] font-bold mb-3" >
                Constraints
              </h2>

              <div className="flex flex-col gap-2 p-4 rounded-[10px]" style={{ backgroundColor: darkMode ? "#2A2A2A" : "#F8F9FA", border: `1px solid ${borderColor}`,}} >
                {problem.constraints ?.split("\n").filter((constraint) => constraint.trim() !== "").map((constraint, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#4285F4" }}/>

                      <code className="text-[13px]" style={{ color: subTextColor, fontFamily: "'JetBrains Mono', monospace",}} >
                        {constraint}
                      </code>
                    </div>
                  ))}

                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#4285F4" }}/>

                  <code className="text-[13px]" style={{ color: subTextColor, fontFamily: "'JetBrains Mono', monospace",}}>
                    Time Limit: {problem.time_limit / 1000} seconds
                  </code>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#4285F4" }}/>

                  <code className="text-[13px]" style={{ color: subTextColor, fontFamily: "'JetBrains Mono', monospace",}}>
                    Memory Limit: {problem.memory_limit_mb} MB
                  </code>
                </div>
              </div>
            </section>

            <div style={{ height: "1px", backgroundColor: borderColor }} />

            {/* My Submissions */}
            <section>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }} className="text-[14px] font-bold mb-3">
                My Submissions
              </h2>

              {historyLoading && (
                <p className="text-[13px]" style={{ color: subTextColor }}>Loading...</p>
              )}

              {!historyLoading && historyError && (
                <p className="text-[13px]" style={{ color: "#EA4335" }}>{historyError}</p>
              )}

              {!historyLoading && !historyError && history.length === 0 && (
                <p className="text-[13px]" style={{ color: subTextColor }}>No attempts yet — your submissions will show up here.</p>
              )}

              {!historyLoading && !historyError && history.length > 0 && (
                <div className="flex flex-col gap-2">
                  {history.map((item) => (
                    <div
                      key={item.submission_id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[8px]"
                      style={{ backgroundColor: darkMode ? "#2A2A2A" : "#F8F9FA", border: `1px solid ${borderColor}` }}
                    >
                      <span className="text-[12px] font-semibold" style={{ color: HistoryStatusColor(item.status) }}>
                        {item.status}
                      </span>
                      <span className="text-[12px]" style={{ color: subTextColor }}>
                        {item.language_name}
                      </span>
                      <span className="text-[12px]" style={{ color: subTextColor }}>
                        {item.passed_testcases}/{item.total_testcases}
                      </span>
                      <span className="text-[11px]" style={{ color: darkMode ? "#888888" : "#9AA0A6" }}>
                        {new Date(item.submitted_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="pb-4" />
          </div>
        </div>

        {/* ── Right: Code Editor (45%) ── */}
        <div className="flex flex-col" style={{ width: "45%", minWidth: "45%", height: "100%", minHeight: 0, backgroundColor: "#1E1E1E" }}>
          {/* Editor control bar */}
          <div
            className="flex-shrink-0 flex items-center justify-between px-5"
            style={{ height: "48px", backgroundColor: "#252526", borderBottom: "1px solid #3C3C3C" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <select
                  value={language}
                  onChange={handleLanguageChange}
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

            </div>

            <button
              onClick={handleResetCode}
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

          <div className="flex-1 overflow-hidden" style={{minHeight: 0,}}>
            <Editor
              height="100%"
              theme="vs-dark"
              language={LANGUAGE_MAP[language]}
              value={sourceCode}
              onChange={(value) =>
                setSourceCode(value || "")
              }
              options={{
                fontSize: 14,
                minimap: {
                  enabled: false,
                },
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console drawer */}
          <div
            className="flex-shrink-0 flex flex-col transition-all duration-200"
            style={{ backgroundColor: "#252526", borderTop: "1px solid #3C3C3C", maxHeight: consoleOpen ? "220px" : "40px" }}
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
                    <span className="text-[13px]" style={{ color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Run your code against the sample cases, or submit it to be judged...</span>
                  </div>
                )}
                {runState === "running" && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#4285F4", borderTopColor: "transparent" }} />
                    <span className="text-[13px]" style={{ color: "#858585", fontFamily: "'JetBrains Mono', monospace" }}>
                      {consoleMode === "run" ? "Running against sample cases..." : "Compiling and running..."}
                    </span>
                  </div>
                )}

                {runState === "done" && consoleMode === "run" && testRunResult && (
                  <div className="flex flex-col gap-3 mt-1">
                    {testRunResult.error ? (
                      <div className="text-[12px]" style={{ color: "#EA4335", fontFamily: "'JetBrains Mono', monospace", whiteSpace: "pre-wrap" }}>
                        {testRunResult.error}
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-[13px] font-bold"
                          style={{ color: testRunResult.status === "Accepted" ? "#34A853" : "#EA4335", fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          Sample: {testRunResult.passedTestCases}/{testRunResult.totalTestCases} passed
                        </div>
                        {testRunResult.results.map((result) => (
                          <div key={result.testId} className="flex items-center gap-4 text-[12px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            <span style={{ color: result.platformStatus === "Accepted" ? "#34A853" : "#EA4335" }}>
                              {result.platformStatus === "Accepted" ? "✓" : "✗"} Sample {result.testId}: {result.platformStatus}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {runState === "done" && consoleMode === "submit" && submissionResult && (
                  <div className="flex flex-col gap-3 mt-1">
                    <div
                      className="text-[13px] font-bold"
                      style={{
                        color:
                          submissionResult.submission.status === "Accepted"
                            ? "#34A853"
                            : isPendingJudgment
                              ? "#FBBC04"
                              : "#EA4335",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {submissionResult.submission.status}
                    </div>

                    {isPendingJudgment ? (
                      <div className="flex items-center gap-3">
                        <span className="text-[12px]" style={{ color: "#858585", fontFamily: "'JetBrains Mono', monospace" }}>
                          Still judging — this can take a bit longer under load.
                        </span>
                        <button
                          onClick={() => handleCheckStatus(submissionResult.pendingSubmissionId)}
                          disabled={checkingStatus}
                          className="px-3 py-1 rounded-[6px] text-[12px] font-semibold text-white"
                          style={{ backgroundColor: "#3A7CF5", border: "none", cursor: checkingStatus ? "not-allowed" : "pointer", opacity: checkingStatus ? 0.6 : 1 }}
                        >
                          {checkingStatus ? "Checking..." : "Check Again"}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-[12px]"
                          style={{
                            color: "#858585",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          Passed: {submissionResult.submission.passed_testcases} /{" "}
                          {submissionResult.submission.total_testcases}
                        </div>

                        {submissionResult.testResults.map((testResult) => (
                          <div
                            key={testResult.test_id}
                            className="flex items-center gap-4 text-[12px]"
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            <span
                              style={{
                                color:
                                  testResult.status === "Accepted"
                                    ? "#34A853"
                                    : "#EA4335",
                              }}
                            >
                              {testResult.status === "Accepted" ? "✓" : "✗"} Test{" "}
                              {testResult.test_id}: {testResult.status}
                            </span>

                            {testResult.execution_time_ms != null && (
                              <span style={{ color: "#858585" }}>
                                {Number(testResult.execution_time_ms).toFixed(1)} ms
                              </span>
                            )}
                          </div>
                        ))}

                        {submissionResult.submission.error_message && (
                          <div
                            className="text-[12px]"
                            style={{
                              color: "#EA4335",
                              fontFamily: "'JetBrains Mono', monospace",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {submissionResult.submission.error_message}
                          </div>
                        )}
                      </>
                    )}
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
              className="flex items-center gap-2 px-5 py-2 rounded-[100px] text-[14px] font-semibold transition-all duration-150"
              style={{
                backgroundColor: "transparent",
                border: "1.5px solid #3C3C3C",
                color: isRunning || isSubmitting || !hasWrittenCode || !hasSampleTestCases ? "#5A5A5A" : "#D4D4D4",
                fontFamily: "'DM Sans', sans-serif",
                cursor: isRunning || isSubmitting || !hasWrittenCode || !hasSampleTestCases ? "not-allowed" : "pointer",
                opacity: isRunning || isSubmitting || !hasWrittenCode || !hasSampleTestCases ? 0.6 : 1,
              }}
              onClick={handleRunSample}
              disabled={isRunning || isSubmitting || !hasWrittenCode || !hasSampleTestCases}
              title={!hasSampleTestCases ? "No sample test cases to run against" : undefined}
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M4 2.5v9l8-4.5-8-4.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              {isRunning ? "Running..." : "Run"}
            </button>

            <button
              className="flex items-center gap-2 px-6 py-2 rounded-[100px] text-[14px] font-semibold text-white transition-all duration-150"
              style={{
                backgroundColor:
                  isSubmitting || !hasWrittenCode || isContestEnded
                    ? "#6D8FCB"
                    : "#3A7CF5",
                border: "none",
                fontFamily: "'DM Sans', sans-serif",
                cursor:
                  isSubmitting || !hasWrittenCode || isContestEnded
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  isSubmitting || !hasWrittenCode || isContestEnded
                    ? 0.6
                    : 1,
                boxShadow:
                  isSubmitting || !hasWrittenCode || isContestEnded
                    ? "none"
                    : "0px 2px 8px rgba(58,124,245,0.40)",
              }}
              onClick={handleSubmit}
              disabled={isSubmitting || !hasWrittenCode || isContestEnded}
              title={isContestEnded ? "The contest has ended — submissions are closed" : undefined}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {isContestEnded ? "Contest Ended" : isSubmitting ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        </div>
      </div>

      <GoogleBar />
    </div>
  );
}
