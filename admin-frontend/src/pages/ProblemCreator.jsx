import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";

// Config 

// TODO: move baseURL to an environment variable (VITE_API_URL) before deploying to production.
const api = axios.create({
  baseURL: "http://localhost:5000/api/admin",
  withCredentials: true,
});

// Form Sub-components 

function FieldLabel({ children, required, darkMode }) {
  return (
    <label className={`text-[13px] font-medium flex items-center gap-1 font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>
      {children}
      {required && <span style={{ color: "#EA4335" }}>*</span>}
    </label>
  );
}

function TextInput({ placeholder, value, onChange, monospace, darkMode }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 text-[14px] rounded-[8px] outline-none transition-all duration-150 ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F] placeholder-neutral-400'}`}
      style={{
        border: focused ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`,
        fontFamily: monospace ? "'JetBrains Mono', monospace" : "'Roboto', sans-serif",
      }}
    />
  );
}

function SelectInput({ value, onChange, options, darkMode }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full appearance-none px-4 py-3 text-[14px] rounded-[8px] outline-none transition-all duration-150 cursor-pointer ${darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-[#1C1B1F]'}`}
        style={{ 
          border: focused ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`, 
          fontFamily: "'Roboto', sans-serif" 
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 5l4 4 4-4" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Rich text toolbar 

function RichToolbar({ darkMode }) {
  const iconColor = darkMode ? "#A3A3A3" : "#5F6368";
  const tools = [
    { title: "Bold", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 7h4a2 2 0 0 0 0-4H4v4zm0 0h4.5a2.5 2.5 0 0 1 0 5H4V7z" stroke={iconColor} strokeWidth="1.4" strokeLinejoin="round" /></svg> },
    { title: "Italic", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2H6M8 12H5M7.5 2l-3 10" stroke={iconColor} strokeWidth="1.4" strokeLinecap="round" /></svg> },
    { title: "Code", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4.5 4.5L2 7l2.5 2.5M9.5 4.5L12 7l-2.5 2.5M8 3l-2 8" stroke={iconColor} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg> },
    { title: "Math", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 10h6M7 7h5M10 4.5v5" stroke={iconColor} strokeWidth="1.4" strokeLinecap="round" /></svg> },
    { title: "List", icon: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="2.5" cy="4" r="1" fill={iconColor} /><circle cx="2.5" cy="7" r="1" fill={iconColor} /><circle cx="2.5" cy="10" r="1" fill={iconColor} /><path d="M5 4h7M5 7h7M5 10h5" stroke={iconColor} strokeWidth="1.4" strokeLinecap="round" /></svg> },
  ];
  
  return (
    <div className={`flex items-center gap-0.5 px-2 py-1.5 flex-wrap border-b ${darkMode ? 'border-neutral-800 bg-neutral-900' : 'border-[#E0E0E0] bg-[#F8F9FA]'} rounded-t-[8px]`}>
      {tools.map(({ title, icon }) => (
        <button key={title} title={title}
          className={`w-7 h-7 flex items-center justify-center rounded-[5px] transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-[#E8F0FE]'}`}
        >
          {icon}
        </button>
      ))}
      <div className={`w-px h-5 mx-1 ${darkMode ? 'bg-neutral-800' : 'bg-[#E0E0E0]'}`} />
      {["H1", "H2"].map(h => (
        <button key={h}
          className={`px-2 h-7 flex items-center justify-center rounded-[5px] transition-colors text-[11px] font-bold font-['DM_Sans'] ${darkMode ? 'text-neutral-400 hover:bg-neutral-800' : 'text-[#5F6368] hover:bg-[#E8F0FE]'}`}
        >
          {h}
        </button>
      ))}
      <div className={`ml-auto text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Markdown supported</div>
    </div>
  );
}

// Problem letter badge picker 

function ProblemLetterPicker({ value, onChange, takenLetters, darkMode }) {
  return (
    <div className="flex gap-2">
      {["A", "B", "C", "D", "E"].map(l => {
        const isTaken = takenLetters.includes(l);
        return (
          <button
            key={l}
            onClick={() => onChange(l)}
            title={isTaken ? "A problem already exists for this letter — click to edit it" : "New problem"}
            className={`relative w-9 h-9 rounded-[8px] flex items-center justify-center text-[14px] font-bold transition-all duration-150 font-['DM_Sans']`}
            style={{
              border: value === l ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`,
              backgroundColor: value === l ? (darkMode ? "rgba(58,124,245,0.15)" : "#E8F0FE") : "transparent",
              color: value === l ? "#3A7CF5" : (darkMode ? "#A3A3A3" : "#5F6368"),
            }}
          >
            {l}
            {isTaken && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#34A853" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Test case block 

function TestCaseBlock({ tc, index, onChange, onRemove, darkMode }) {
  const [inputFocus, setInputFocus] = useState(false);
  const [outputFocus, setOutputFocus] = useState(false);

  return (
    <div
      className={`flex flex-col rounded-[8px] overflow-hidden transition-all duration-150 ${darkMode ? 'border border-neutral-700' : 'border border-[#E0E0E0]'}`}
      style={{
        borderColor: tc.visible ? "#3A7CF5" : (darkMode ? "#404040" : "#E0E0E0"),
        backgroundColor: tc.visible ? (darkMode ? "rgba(58,124,245,0.05)" : "#FAFCFF") : (darkMode ? "#171717" : "#FAFAFA"),
      }}
    >
      {/* Block header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: tc.visible ? (darkMode ? "rgba(58,124,245,0.2)" : "#DCE9FD") : (darkMode ? "#262626" : "#F1F3F4"),
          backgroundColor: tc.visible ? (darkMode ? "rgba(58,124,245,0.1)" : "#F0F6FF") : (darkMode ? "#262626" : "#F8F9FA"),
        }}
      >
        <div className="flex items-center gap-3">
          {/* Index label */}
          <span className={`text-[12px] font-bold font-['DM_Sans'] ${darkMode ? 'text-neutral-300' : 'text-[#5F6368]'}`}>
            Test Case #{index + 1}
          </span>

          {/* Checkbox + label */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => onChange(tc.id, { visible: !tc.visible })}
              className="w-4 h-4 rounded-[4px] flex items-center justify-center transition-all duration-150 flex-shrink-0"
              style={{
                backgroundColor: tc.visible ? "#3A7CF5" : (darkMode ? "#171717" : "white"),
                border: tc.visible ? "2px solid #3A7CF5" : `2px solid ${darkMode ? "#737373" : "#C4C7CC"}`,
              }}
            >
              {tc.visible && (
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7.5L8 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-[12px] font-medium font-['Roboto']`} style={{ color: tc.visible ? "#3A7CF5" : (darkMode ? "#A3A3A3" : "#9AA0A6") }}>
              Visible to Contestants
            </span>
          </label>

          {/* Hidden label */}
          {!tc.visible && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-['Roboto'] ${darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-[#F1F3F4] text-[#9AA0A6]'}`}>
              (Hidden Test Case)
            </span>
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(tc.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-medium transition-all font-['DM_Sans'] border ${darkMode ? 'border-neutral-700 text-neutral-400 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50' : 'border-[#F1F3F4] text-[#9AA0A6] hover:bg-[#FFEBEE] hover:text-[#B71C1C]'}`}
        >
          <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
            <path d="M2 3.5h9M4.5 3.5V2.5h4v1M5 5v4.5M8 5v4.5M3 3.5l.6 7h5.8l.6-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Remove
        </button>
      </div>

      {/* Block body — side-by-side textareas */}
      <div className="grid grid-cols-2 gap-0">
        <div className={`flex flex-col gap-1.5 p-3 border-r ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            Sample Input
          </div>
          <textarea
            value={tc.input}
            onChange={e => onChange(tc.id, { input: e.target.value })}
            onFocus={() => setInputFocus(true)}
            onBlur={() => setInputFocus(false)}
            rows={5}
            className={`w-full px-3 py-2.5 text-[13px] rounded-[6px] outline-none resize-none transition-all duration-150 ${darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-[#1C1B1F]'}`}
            style={{
              border: inputFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: "1.65",
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5 p-3">
          <div className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            Expected Output
          </div>
          <textarea
            value={tc.output}
            onChange={e => onChange(tc.id, { output: e.target.value })}
            onFocus={() => setOutputFocus(true)}
            onBlur={() => setOutputFocus(false)}
            rows={5}
            className={`w-full px-3 py-2.5 text-[13px] rounded-[6px] outline-none resize-none transition-all duration-150 ${darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-[#1C1B1F]'}`}
            style={{
              border: outputFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: "1.65",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Preview Modal 
function PreviewModal({ onClose, title, difficulty, points, timeLimit, memLimit, statement, testCases, darkMode }) {
  const visibleCases = testCases.filter(tc => tc.visible);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-6" style={{ backgroundColor: "rgba(28,27,31,0.45)", backdropFilter: "blur(3px)" }}>
      <div className={`flex flex-col w-full max-w-3xl h-full max-h-[85vh] rounded-[24px] shadow-2xl overflow-hidden ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'}`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-8 py-5 border-b flex-shrink-0 ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex flex-col">
            <span className={`text-[12px] font-bold tracking-wider uppercase font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#9AA0A6]'}`}>Contestant Preview</span>
            <h2 className={`text-[20px] font-bold font-['DM_Sans'] mt-1 ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
              {title || "Untitled Problem"}
            </h2>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-[#F1F3F4]'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">
          
          {/* Badges / Constraints */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[12px] font-semibold font-['Roboto'] ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-[#F1F3F4] text-[#5F6368]'}`}>
              Difficulty: {difficulty}
            </span>
            <span className={`px-3 py-1 rounded-full text-[12px] font-bold font-['DM_Sans'] ${darkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-[#E8F0FE] text-[#3A7CF5]'}`}>
              {points} pts
            </span>
            {timeLimit && (
              <span className={`px-3 py-1 rounded-full text-[12px] font-medium font-['Roboto'] ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white border border-[#E0E0E0] text-[#5F6368]'}`}>
                Time: {timeLimit}s
              </span>
            )}
            {memLimit && (
              <span className={`px-3 py-1 rounded-full text-[12px] font-medium font-['Roboto'] ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-white border border-[#E0E0E0] text-[#5F6368]'}`}>
                Memory: {memLimit}MB
              </span>
            )}
          </div>

          {/* Statement */}
          <div className="flex flex-col gap-2">
            <h3 className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#3C4043]'}`}>Problem Statement</h3>
            <p className={`text-[14px] leading-relaxed whitespace-pre-wrap font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>
              {statement || "No description provided."}
            </p>
          </div>

          {/* Visible Test Cases */}
          {visibleCases.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#3C4043]'}`}>Sample Test Cases</h3>
              {visibleCases.map((tc, idx) => (
                <div key={tc.id} className={`flex flex-col rounded-[8px] border overflow-hidden ${darkMode ? 'border-neutral-700' : 'border-[#E0E0E0]'}`}>
                  <div className={`px-4 py-2 text-[12px] font-bold border-b font-['DM_Sans'] ${darkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-[#F8F9FA] border-[#E0E0E0] text-[#5F6368]'}`}>
                    Sample #{idx + 1}
                  </div>
                  <div className="grid grid-cols-2">
                    <div className={`p-4 border-r ${darkMode ? 'border-neutral-700 bg-neutral-900' : 'border-[#E0E0E0] bg-white'}`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Input</div>
                      <pre className={`text-[13px] font-['JetBrains_Mono'] ${darkMode ? 'text-neutral-300' : 'text-[#1C1B1F]'}`}>{tc.input || " "}</pre>
                    </div>
                    <div className={`p-4 ${darkMode ? 'bg-neutral-900' : 'bg-white'}`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Output</div>
                      <pre className={`text-[13px] font-['JetBrains_Mono'] ${darkMode ? 'text-neutral-300' : 'text-[#1C1B1F]'}`}>{tc.output || " "}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page 

const BLANK_TEST_CASES = [{ id: 1, visible: true, input: "", output: "" }];

export default function ProblemCreator() {
  const { darkMode } = useOutletContext() || {};

  // Competition selection
  const [competitions, setCompetitions] = useState([]);
  const [competitionId, setCompetitionId] = useState(null);
  // All problems that already exist in the currently selected competition —
  // used to know which letters are taken and to load a problem's data when picked.
  const [competitionProblems, setCompetitionProblems] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [points, setPoints] = useState("250");
  const [timeLimit, setTimeLimit] = useState("");
  const [memLimit, setMemLimit] = useState("");
  const [statement, setStatement] = useState("");
  const [letter, setLetter] = useState("A");
  
  // States for buttons
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Once the problem has been saved once (as draft or published), the backend
  // gives us its problem_id. From then on we PATCH that same row instead of
  // creating duplicate problems every time Save/Publish is pressed again.
  const [currentProblemId, setCurrentProblemId] = useState(null);

  const [testCases, setTestCases] = useState(BLANK_TEST_CASES);
  const nextId = Math.max(0, ...testCases.map(t => t.id)) + 1;

  // 1) Load the list of competitions once, and default to the first one.
  useEffect(() => {
    let ignore = false;

    const loadCompetitions = async () => {
      try {
        const response = await api.get("/competitions");
        if (ignore) return;
        setCompetitions(response.data.competitions);
        if (response.data.competitions.length > 0) {
          setCompetitionId(response.data.competitions[0].competition_id);
        }
      } catch (error) {
        if (!ignore) console.error(error);
      }
    };

    loadCompetitions();
    return () => { ignore = true; };
  }, []);

  // 2) Whenever the selected competition changes, load that competition's
  // problems (just the lightweight list — no test cases yet).
  useEffect(() => {
    if (!competitionId) return;
    let ignore = false;

    const loadProblems = async () => {
      try {
        const response = await api.get("/problems", { params: { competition_id: competitionId } });
        if (!ignore) setCompetitionProblems(response.data.problems);
      } catch (error) {
        if (!ignore) console.error(error);
      }
    };

    loadProblems();
    return () => { ignore = true; };
  }, [competitionId]);

  // 3) Whenever the chosen letter (or the competition's problem list) changes,
  // check if a problem already exists for that letter in this competition.
  // If yes -> fetch its full details (including test cases) and fill the form.
  // If no  -> reset the form to a blank state, ready to create a new one.
  useEffect(() => {
    const match = competitionProblems.find(p => p.problem_code === letter);
    let ignore = false;

    const loadOrReset = async () => {
      if (!match) {
        setCurrentProblemId(null);
        setTitle("");
        setDifficulty("Medium");
        setPoints("250");
        setTimeLimit("");
        setMemLimit("");
        setStatement("");
        setTestCases(BLANK_TEST_CASES);
        return;
      }

      setLoadingExisting(true);
      try {
        const response = await api.get(`/problems/${match.problem_id}`);
        if (ignore) return;

        const problem = response.data.problem;
        const cases = response.data.test_cases;

        setCurrentProblemId(problem.problem_id);
        setTitle(problem.problem_name);
        setDifficulty(problem.difficulty);
        setPoints(String(problem.points_assigned));
        setTimeLimit(String(problem.time_limit / 1000)); // ms -> seconds
        setMemLimit(String(problem.memory_limit_mb));
        setStatement(problem.description);
        setTestCases(
          cases.length > 0
            ? cases.map(tc => ({
                id: tc.test_id,
                visible: !tc.is_hidden,
                input: tc.input_data,
                output: tc.expected_output,
              }))
            : BLANK_TEST_CASES
        );
      } catch (error) {
        if (!ignore) console.error(error);
      } finally {
        if (!ignore) setLoadingExisting(false);
      }
    };

    loadOrReset();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter, competitionProblems]);

  const updateTC = (id, patch) =>
    setTestCases(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));

  const removeTC = (id) =>
    setTestCases(prev => prev.filter(t => t.id !== id));

  const addTC = () =>
    setTestCases(prev => [...prev, { id: nextId, visible: false, input: "", output: "" }]);

  // Builds the request body the backend's adminProblemController expects.
  const buildPayload = (isPublished) => ({
    problem_code: letter,
    problem_name: title.trim(),
    description: statement,
    difficulty,
    points_assigned: points,
    time_limit: timeLimit,       // backend converts seconds -> milliseconds
    memory_limit_mb: memLimit,   // backend defaults to 256 if empty
    is_published: isPublished,
    competition_id: competitionId,
    test_cases: testCases.map(tc => ({
      input_data: tc.input,
      expected_output: tc.output,
      visible: tc.visible,
    })),
  });

  // Shared by both Save Draft and Publish — the only difference is is_published
  // and which local "success" flag/timer gets triggered afterwards.
  const persistProblem = async (isPublished) => {
    if (!title.trim() || !statement.trim()) {
      setSaveError("Problem Title and Problem Statement are required.");
      return false;
    }

    setSaveError("");

    try {
      const payload = buildPayload(isPublished);

      const response = currentProblemId
        ? await api.patch(`/problems/${currentProblemId}`, payload)
        : await api.post("/problems", payload);

      const savedProblem = response.data.problem;
      setCurrentProblemId(savedProblem.problem_id);

      // Refresh the competition's problem list so the letter picker's
      // "taken" dots stay accurate without needing a page reload.
      const listResponse = await api.get("/problems", { params: { competition_id: competitionId } });
      setCompetitionProblems(listResponse.data.problems);

      return true;
    } catch (error) {
      setSaveError(error.response?.data?.message || "Unable to connect to the server.");
      return false;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await persistProblem(false);
    setSaving(false);

    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    const success = await persistProblem(true);
    setPublishing(false);

    if (success) {
      setPublished(true);
      setTimeout(() => setPublished(false), 2500);
    }
  };

  const difficultyColors = {
    Easy:   { bg: "#E8F5E9", text: "#2E7D32", darkBg: "rgba(52,168,83,0.15)", darkText: "#4ADE80" },
    Medium: { bg: "#FFF8E1", text: "#E65100", darkBg: "rgba(251,188,4,0.15)", darkText: "#FBBF24" },
    Hard:   { bg: "#FFEBEE", text: "#B71C1C", darkBg: "rgba(234,67,53,0.15)", darkText: "#F87171" },
  };
  const dc = difficultyColors[difficulty] || difficultyColors["Medium"];

  const takenLetters = competitionProblems.map(p => p.problem_code);

  return (
    <div className="flex flex-col gap-6">

      {/* Title row */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className={`text-[26px] font-bold tracking-[-0.4px] font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
            Contest Problem Creator
          </h1>
          <p className={`text-[14px] mt-1 font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>
            Draft programming tasks, set constraints, and configure Judge0 test cases.
          </p>
        </div>

        {/* Preview badge */}
        <div className="flex items-center gap-2">
          {difficulty && (
            <span
              className="px-3 py-1 rounded-full text-[12px] font-semibold font-['Roboto']"
              style={{ backgroundColor: darkMode ? dc.darkBg : dc.bg, color: darkMode ? dc.darkText : dc.text }}
            >
              {difficulty}
            </span>
          )}
          <span
            className="px-3 py-1 rounded-full text-[12px] font-bold font-['DM_Sans']"
            style={{ backgroundColor: darkMode ? "rgba(58,124,245,0.15)" : "#E8F0FE", color: "#3A7CF5" }}
          >
            {points} pts
          </span>
        </div>
      </div>

      {/* Competition selector */}
      <div className={`rounded-[16px] px-6 py-4 border shadow-sm flex items-center gap-4 ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#E0E0E0]'}`}>
        <span className={`text-[13px] font-bold font-['DM_Sans'] whitespace-nowrap ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>
          Competition:
        </span>
        <div className="w-full max-w-[320px]">
          <SelectInput
            value={competitionId ?? ""}
            onChange={val => setCompetitionId(Number(val))}
            darkMode={darkMode}
            options={competitions.map(c => ({
              label: `${c.competition_name} (${c.status})`,
              value: c.competition_id,
            }))}
          />
        </div>
        {loadingExisting && (
          <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            Loading problem data...
          </span>
        )}
      </div>

      {/* Main form card */}
      <div className={`rounded-[16px] overflow-hidden border shadow-sm ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#E0E0E0]'}`}>

        {/* Card header */}
        <div className={`flex items-center justify-between px-7 py-4 border-b ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: darkMode ? "rgba(58,124,245,0.15)" : "#E8F0FE" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="1" width="12" height="14" rx="2" stroke="#3A7CF5" strokeWidth="1.4" />
                <path d="M5 5h6M5 8h6M5 11h3" stroke="#3A7CF5" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
              {currentProblemId ? "Edit Problem" : "New Problem"}
            </span>
            <span className={`text-[12px] px-2 py-0.5 rounded-full font-['Roboto'] ${darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-[#F1F3F4] text-[#9AA0A6]'}`}>
              {currentProblemId ? `#${currentProblemId} · Draft` : "Draft"}
            </span>
          </div>

          {/* Problem letter picker */}
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#9AA0A6]'}`}>Problem Letter:</span>
            <ProblemLetterPicker value={letter} onChange={setLetter} takenLetters={takenLetters} darkMode={darkMode} />
          </div>
        </div>

        {/* Two-column form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

          {/* ── Left: Problem Details ── */}
          <div className={`flex flex-col gap-5 px-7 py-6 border-b lg:border-b-0 lg:border-r ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#3A7CF5] font-['DM_Sans']">1</div>
              <span className={`text-[13px] font-bold uppercase tracking-wider font-['DM_Sans'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>Problem Details</span>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel required darkMode={darkMode}>Problem Title</FieldLabel>
              <TextInput placeholder="e.g., Reverse a String" value={title} onChange={setTitle} darkMode={darkMode} />
            </div>

            {/* Difficulty + Points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel required darkMode={darkMode}>Difficulty</FieldLabel>
                <SelectInput
                  value={difficulty}
                  onChange={setDifficulty}
                  darkMode={darkMode}
                  options={[
                    { label: "Easy",   value: "Easy" },
                    { label: "Medium", value: "Medium" },
                    { label: "Hard",   value: "Hard" },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel required darkMode={darkMode}>Points</FieldLabel>
                <SelectInput
                  value={points}
                  onChange={setPoints}
                  darkMode={darkMode}
                  options={[
                    { label: "100 pts", value: "100" },
                    { label: "150 pts", value: "150" },
                    { label: "200 pts", value: "200" },
                    { label: "250 pts", value: "250" },
                    { label: "300 pts", value: "300" },
                    { label: "500 pts", value: "500" },
                  ]}
                />
              </div>
            </div>

            {/* Time + Memory */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel darkMode={darkMode}>Time Limit (seconds)</FieldLabel>
                <TextInput placeholder="e.g., 2.0" value={timeLimit} onChange={setTimeLimit} darkMode={darkMode} />
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel darkMode={darkMode}>Memory Limit (MB)</FieldLabel>
                <TextInput placeholder="e.g., 256" value={memLimit} onChange={setMemLimit} darkMode={darkMode} />
              </div>
            </div>

            {/* Problem statement */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel required darkMode={darkMode}>Problem Statement & Guidelines</FieldLabel>
              <div className="rounded-[8px] overflow-hidden transition-all duration-150" style={{ border: `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}` }}>
                <RichToolbar darkMode={darkMode} />
                <textarea
                  value={statement}
                  onChange={e => setStatement(e.target.value)}
                  placeholder={"Write the problem description, input specs, and output formats here...\n\nTip: Use **bold** for important terms, `code` for inline code, and ```code blocks``` for examples."}
                  rows={9}
                  className={`w-full px-4 py-3 text-[14px] outline-none resize-none ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F] placeholder-neutral-400'}`}
                  style={{ fontFamily: "'Roboto', sans-serif", lineHeight: "1.75", border: "none" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Supports Markdown and LaTeX math expressions</span>
                <span className={`text-[11px] tabular-nums font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>{statement.length} chars</span>
              </div>
            </div>
          </div>

          {/* ── Right: Judge0 + Test Cases ── */}
          <div className="flex flex-col gap-5 px-7 py-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#34A853] font-['DM_Sans']">2</div>
              <span className={`text-[13px] font-bold uppercase tracking-wider font-['DM_Sans'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>Test Cases & Evaluation</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-[3px] bg-[#3A7CF5]" />
                <span className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>Visible = shown to contestants</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-[3px] ${darkMode ? 'bg-neutral-700' : 'bg-[#E0E0E0]'}`} />
                <span className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>Hidden = graded by Judge0 only</span>
              </div>
            </div>

            {/* Test case blocks */}
            <div className="flex flex-col gap-3">
              {testCases.map((tc, idx) => (
                <TestCaseBlock
                  key={tc.id}
                  tc={tc}
                  index={idx}
                  onChange={updateTC}
                  onRemove={removeTC}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {/* Add test case button */}
            <button
              onClick={addTC}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-[8px] text-[13px] font-semibold transition-all duration-150 font-['DM_Sans'] ${darkMode ? 'text-neutral-400 hover:bg-neutral-800 hover:text-blue-400 hover:border-blue-500' : 'text-[#5F6368] hover:bg-[#E8F0FE] hover:text-[#3A7CF5] hover:border-[#3A7CF5]'}`}
              style={{
                border: `1.5px dashed ${darkMode ? '#525252' : '#C4C7CC'}`,
                backgroundColor: "transparent",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              Add Test Case
            </button>

            {/* Judge0 note */}
            <div className={`flex items-start gap-3 p-4 rounded-[10px] border border-dashed ${darkMode ? 'bg-neutral-950 border-neutral-700' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7" stroke={darkMode ? "#737373" : "#9AA0A6"} strokeWidth="1.3" />
                <path d="M8 7v4M8 5h.01" stroke={darkMode ? "#737373" : "#9AA0A6"} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <p className={`text-[12px] leading-relaxed font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#9AA0A6]'}`}>
                Hidden test cases are evaluated by Judge0. Visible cases are shown as preview samples on the contest problem page.
              </p>
            </div>
          </div>
        </div>

        {/* Form action bar */}
        <div
          className={`flex items-center justify-between px-7 py-4 border-t ${darkMode ? 'border-neutral-800 bg-neutral-900/50' : 'border-[#F1F3F4] bg-[#FAFAFA]'}`}
        >
          <div className="flex items-center gap-2">
            {saveError && (
              <span className="text-[13px] text-[#EA4335] font-['Roboto']">{saveError}</span>
            )}
            {saved && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#34A853] font-['Roboto']">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#34A853" />
                  <path d="M4 7l2.5 2.5L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Draft saved
              </div>
            )}
            {published && (
              <div className="flex items-center gap-1.5 text-[13px] text-[#3A7CF5] font-['Roboto']">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" fill="#3A7CF5" />
                  <path d="M4 7l2.5 2.5L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Problem published!
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Preview Button */}
            <button
              onClick={() => setShowPreview(true)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-[8px] text-[13px] font-medium transition-colors border font-['DM_Sans'] ${darkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7s2.5-5 6-5 6 5 6 5-2.5 5-6 5S1 7 1 7Z" stroke={darkMode ? "#D4D4D4" : "#5F6368"} strokeWidth="1.3" />
                <circle cx="7" cy="7" r="2" stroke={darkMode ? "#D4D4D4" : "#5F6368"} strokeWidth="1.3" />
              </svg>
              Preview
            </button>

            {/* Save draft */}
            <button
              onClick={handleSave}
              disabled={saving || publishing}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[8px] text-[14px] font-semibold transition-colors border font-['DM_Sans'] disabled:opacity-50 ${darkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' : 'bg-white border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="10" height="12" rx="1.5" stroke={darkMode ? "#D4D4D4" : "#5F6368"} strokeWidth="1.3" />
                <path d="M5 1v4h4V1" stroke={darkMode ? "#D4D4D4" : "#5F6368"} strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M4 8h6M4 10.5h4" stroke={darkMode ? "#D4D4D4" : "#5F6368"} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              {saving ? "Saving..." : "Save Draft"}
            </button>

            {/* Publish */}
            <button
              onClick={handlePublish}
              disabled={saving || publishing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[100px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all active:scale-[0.97] font-['DM_Sans'] shadow-[0_2px_8px_rgba(58,124,245,0.35)] disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4.5L7 9.5 3 12l1.5-4.5L1 5h4.5L7 1Z" fill="white" />
              </svg>
              {publishing ? "Publishing..." : "Publish Problem"}
            </button>
          </div>
        </div>
      </div>

      {/* Render the Preview Modal */}
      {showPreview && (
        <PreviewModal 
          onClose={() => setShowPreview(false)}
          title={title}
          difficulty={difficulty}
          points={points}
          timeLimit={timeLimit}
          memLimit={memLimit}
          statement={statement}
          testCases={testCases}
          darkMode={darkMode}
        />
      )}

    </div>
  );
}
