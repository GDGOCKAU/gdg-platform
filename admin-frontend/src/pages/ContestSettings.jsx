import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { useContest } from "../context/ContestContext";
import { API_BASE_URL } from "../config";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  withCredentials: true,
});

const AVATAR_COLORS = ["#4285F4", "#EA4335", "#34A853", "#FBBC04", "#9C27B0", "#FF7043", "#78909C"];
const colorForId = (id) => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

// datetime-local inputs want "YYYY-MM-DDTHH:mm" in local wall-clock time.
const toDateTimeLocal = (iso) => {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const minutesBetween = (start, end) => Math.round((new Date(end) - new Date(start)) / 60000);

// Downloads a zip response, respecting the filename the server suggested.
const triggerDownload = async (path, fallbackName) => {
  const response = await api.get(path, { responseType: "blob" });
  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match ? match[1] : fallbackName;

  const blobUrl = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

// axios requests a Blob body even on error responses, so the JSON message
// the server sent has to be read back out of it.
const readBlobError = async (error, fallback) => {
  try {
    const text = await error.response.data.text();
    return JSON.parse(text).message || fallback;
  } catch {
    return error.response?.data?.message || fallback;
  }
};

// Form Helpers

function FormField({ label, children, darkMode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-[13px] font-medium font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>
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
      className={`w-full px-4 py-2.5 text-[14px] rounded-[8px] outline-none transition-all duration-150 ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F] placeholder-neutral-400'}`}
      style={{
        border: focused ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`,
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
        className={`w-full appearance-none px-4 py-2.5 text-[14px] rounded-[8px] outline-none transition-all duration-150 cursor-pointer ${darkMode ? 'bg-neutral-950 text-white' : 'bg-white text-[#1C1B1F]'}`}
        style={{
          border: focused ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`,
          fontFamily: "'Roboto', sans-serif"
        }}
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3 5l4 4 4-4" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// End Contest confirmation modal

function EndContestModal({ contestName, onConfirm, onCancel, ending, darkMode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(28,27,31,0.40)", backdropFilter: "blur(2px)" }}>
      <div className={`rounded-[20px] p-8 flex flex-col gap-6 shadow-2xl ${darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'}`} style={{ width: "420px" }}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: darkMode ? 'rgba(234,67,53,0.15)' : '#FFEBEE' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M7 4h6M3 7h16M5 7l1 11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-11" stroke="#EA4335" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className={`text-[18px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>End this contest?</h3>
          <p className={`text-[14px] leading-relaxed font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>
            <strong className={darkMode ? 'text-white' : 'text-[#1C1B1F]'}>{contestName}</strong> will be marked as Finished and moved into the archive below. This cannot be undone from here.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={ending}
            className={`flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors border font-['DM_Sans'] disabled:opacity-60 ${darkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={ending}
            className="flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold text-white transition-all bg-[#EA4335] hover:bg-[#C62828] font-['DM_Sans'] shadow-[0_2px_6px_rgba(234,67,53,0.30)] disabled:opacity-60"
          >
            {ending ? "Ending..." : "Yes, End Contest"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Archive Detail Pane

function DetailPane({ competition, onClose, darkMode }) {
  const [tab, setTab] = useState("leaderboard");
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingTeamId, setDownloadingTeamId] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    api.get(`/contests/${competition.competition_id}/leaderboard`)
      .then((response) => { if (!ignore) setLeaderboard(response.data.leaderboard); })
      .catch((err) => { if (!ignore) setError(err.response?.data?.message || "Failed to load leaderboard."); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [competition.competition_id]);

  const handleDownloadTeam = async (team) => {
    setDownloadingTeamId(team.team_id);
    setDownloadError("");
    try {
      await triggerDownload(
        `/contests/${competition.competition_id}/teams/${team.team_id}/submissions.zip`,
        `${team.team_name}.zip`
      );
    } catch (err) {
      setDownloadError(await readBlobError(err, "Unable to download this team's submissions."));
    } finally {
      setDownloadingTeamId(null);
    }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    setDownloadError("");
    try {
      await triggerDownload(
        `/contests/${competition.competition_id}/submissions.zip`,
        `${competition.competition_name}_submissions.zip`
      );
    } catch (err) {
      setDownloadError(await readBlobError(err, "Unable to download the submission archive."));
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div
      className={`rounded-[16px] overflow-hidden ${darkMode ? 'bg-neutral-900 border-neutral-700 shadow-xl' : 'bg-white border-[#C5D9FB]'}`}
      style={{
        borderWidth: "1px",
        borderStyle: "solid",
        boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(58,124,245,0.10)",
        animation: "slideUp 0.22s ease-out"
      }}
    >
      {/* Detail header */}
      <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-[#F8FBFF] border-[#F1F3F4]'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${darkMode ? 'bg-blue-950/50' : 'bg-[#E8F0FE]'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L9.5 6H14L10.5 8.5L12 13L8 10.5L4 13L5.5 8.5L2 6H6.5L8 2Z" fill="#3A7CF5" />
            </svg>
          </div>
          <div>
            <div className={`text-[14px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>{competition.competition_name}</div>
            <div className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#9AA0A6]'}`}>
              Archived · {formatDate(competition.ended_at)} · {competition.team_count} teams
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-[#F1F3F4]'}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-0 px-6 pt-0 border-b ${darkMode ? 'border-neutral-800 bg-neutral-900' : 'border-[#F1F3F4] bg-white'}`}>
        {[
          { id: "leaderboard", label: "Final Leaderboard" },
          { id: "scores",      label: "Team Scores" },
          { id: "codes",       label: "Submitted Codes" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-5 py-3 text-[13px] font-semibold transition-all duration-150 relative font-['DM_Sans']"
            style={{ color: tab === id ? "#3A7CF5" : (darkMode ? "#737373" : "#9AA0A6") }}
          >
            {label}
            {tab === id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-[#3A7CF5]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={`px-6 py-4 ${darkMode ? 'bg-neutral-900' : 'bg-white'}`}>
        {downloadError && (
          <div className={`mb-4 px-4 py-2.5 rounded-[8px] border text-[13px] font-['Roboto'] ${darkMode ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]'}`}>
            {downloadError}
          </div>
        )}

        {loading && (
          <div className={`py-8 text-center text-[13px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Loading leaderboard...</div>
        )}

        {!loading && error && (
          <div className={`py-8 text-center text-[13px] font-['Roboto'] ${darkMode ? 'text-red-400' : 'text-[#C62828]'}`}>{error}</div>
        )}

        {!loading && !error && (tab === "leaderboard" || tab === "scores") && (() => {
          const teams = leaderboard || [];
          const displayTeams = tab === "leaderboard" ? teams.slice(0, 4) : teams;

          if (displayTeams.length === 0) {
            return (
              <div className={`py-8 text-center text-[13px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
                No teams scored in this contest.
              </div>
            );
          }

          return (
            <div className="flex flex-col gap-0">
              <div
                className={`grid px-4 py-2 border rounded-t-[8px] ${darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-[#F8F9FA] border-[#F1F3F4]'}`}
                style={{ gridTemplateColumns: "40px 1fr 100px 140px 160px", gap: "12px" }}
              >
                {["#", "Team Name", "Score", "Submissions", ""].map((h, i) => (
                  <div key={i} className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>{h}</div>
                ))}
              </div>

              <div className={tab === "scores" ? "max-h-[240px] overflow-y-auto" : ""}>
                {displayTeams.map((t, idx) => (
                  <div
                    key={t.team_id}
                    className={`grid px-4 py-3 items-center transition-colors border-x ${darkMode ? 'hover:bg-neutral-800/50 border-neutral-800' : 'hover:bg-[#FAFBFF] border-[#F1F3F4]'}`}
                    style={{
                      gridTemplateColumns: "40px 1fr 100px 140px 160px",
                      gap: "12px",
                      borderBottom: `1px solid ${darkMode ? '#262626' : (idx < displayTeams.length - 1 ? '#F8F9FA' : '#F1F3F4')}`,
                      borderRadius: idx === displayTeams.length - 1 ? "0 0 8px 8px" : undefined
                    }}
                  >
                    <div className="text-[13px] font-bold font-['DM_Sans']" style={{ color: ["#FBBC04", "#9E9E9E", "#FF7043", "#5F6368"][idx] || "#9AA0A6" }}>#{t.rank}</div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-['DM_Sans']" style={{ backgroundColor: colorForId(t.team_id) }}>
                        {t.team_name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className={`text-[13px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#1C1B1F]'}`}>{t.team_name}</span>
                    </div>
                    <div className="text-[13px] font-bold text-[#3A7CF5] font-['DM_Sans']">{t.points} pts</div>
                    <div className={`text-[13px] font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>{t.solved_questions} solved</div>
                    <div>
                      <button
                        onClick={() => handleDownloadTeam(t)}
                        disabled={downloadingTeamId === t.team_id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px] font-semibold transition-all border font-['DM_Sans'] disabled:opacity-60 ${darkMode ? 'border-blue-900 text-blue-400 hover:bg-blue-950' : 'border-[#C5D9FB] text-[#3A7CF5] hover:bg-[#E8F0FE]'}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M7 2v7M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M2 10v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        {downloadingTeamId === t.team_id ? "Zipping..." : "Download .zip"}
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
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-neutral-800' : 'bg-[#F1F3F4]'}`}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M5 7L2 11L5 15M17 7L20 11L17 15M13 4L9 18" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={`text-[13px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>Each team's best submission per problem, bundled per-team</div>
            <button
              onClick={handleDownloadAll}
              disabled={downloadingAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[13px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-colors font-['DM_Sans'] shadow-[0_2px_6px_rgba(58,124,245,0.30)] disabled:opacity-60"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v7M4 6l3 3 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 10v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {downloadingAll ? "Zipping..." : "Download All Submissions (.zip)"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page

export default function ContestSettings() {
  const { darkMode } = useOutletContext() || {};
  const { selectedContestId, refreshCompetitions } = useContest();

  // The currently active/upcoming contest (full row, fetched separately since
  // the navbar's context only carries the fields the picker needs).
  const [activeDetails, setActiveDetails] = useState(null);
  const [loadingActive, setLoadingActive] = useState(false);
  const [editing, setEditing] = useState(false);

  const [contestName, setContestName]   = useState("");
  const [teamCount, setTeamCount]       = useState("");
  const [difficulty, setDifficulty]     = useState("Medium");
  const [startDate, setStartDate]       = useState("");
  const [duration, setDuration]         = useState("");
  const [description, setDescription]   = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [launched, setLaunched] = useState(false);

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [ending, setEnding] = useState(false);

  const [archiveRows, setArchiveRows] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [archiveError, setArchiveError] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveSearchFocus, setArchiveSearchFocus] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const resetForm = () => {
    setContestName("");
    setTeamCount("");
    setDifficulty("Medium");
    setStartDate("");
    setDuration("");
    setDescription("");
  };

  // Load the full row for whichever contest is selected in the navbar.
  useEffect(() => {
    if (!selectedContestId) {
      setActiveDetails(null);
      return;
    }

    let ignore = false;
    setLoadingActive(true);

    api.get(`/contests/${selectedContestId}`)
      .then((response) => { if (!ignore) setActiveDetails(response.data.competition); })
      .catch((error) => { if (!ignore) console.error(error); })
      .finally(() => { if (!ignore) setLoadingActive(false); });

    return () => { ignore = true; };
  }, [selectedContestId]);

  // Whenever the active contest changes (including disappearing), drop out
  // of edit mode and blank the form so stale data isn't shown.
  useEffect(() => {
    setEditing(false);
    setSaveError("");
    if (!activeDetails) {
      resetForm();
    }
  }, [activeDetails]);

  // Archive of finished contests.
  useEffect(() => {
    let ignore = false;
    setArchiveLoading(true);
    setArchiveError("");

    api.get("/contests/history")
      .then((response) => { if (!ignore) setArchiveRows(response.data.competitions || []); })
      .catch((error) => { if (!ignore) setArchiveError(error.response?.data?.message || "Failed to load contest history."); })
      .finally(() => { if (!ignore) setArchiveLoading(false); });

    return () => { ignore = true; };
  }, [historyRefreshKey]);

  const filteredArchive = archiveRows.filter(r =>
    r.competition_name.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    (r.winner?.team_name || "").toLowerCase().includes(archiveSearch.toLowerCase())
  );

  const enterEditMode = () => {
    if (activeDetails) {
      setContestName(activeDetails.competition_name);
      setTeamCount(String(activeDetails.max_teams));
      setDifficulty(activeDetails.difficulty);
      setStartDate(toDateTimeLocal(activeDetails.started_at));
      setDuration(String(minutesBetween(activeDetails.started_at, activeDetails.ended_at)));
      setDescription(activeDetails.description || "");
    }
    setSaveError("");
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setSaveError("");
  };

  const handleSubmit = async () => {
    setSaveError("");

    const maxTeams = Number(teamCount);
    const durationMinutes = Number(duration);

    if (!contestName.trim() || !startDate || !maxTeams || !durationMinutes) {
      setSaveError("Please fill in all required fields.");
      return;
    }

    setSaving(true);

    const payload = {
      competition_name: contestName.trim(),
      description: description.trim(),
      difficulty,
      max_teams: maxTeams,
      started_at: startDate,
      duration_minutes: durationMinutes,
    };

    try {
      const response = activeDetails
        ? await api.patch(`/contests/${activeDetails.competition_id}`, payload)
        : await api.post("/contests", payload);

      setActiveDetails(response.data.competition);
      setEditing(false);
      setLaunched(true);
      setTimeout(() => setLaunched(false), 3000);
      refreshCompetitions();
    } catch (error) {
      setSaveError(error.response?.data?.message || "Unable to save this competition.");
    } finally {
      setSaving(false);
    }
  };

  const handleEndContest = async () => {
    if (!activeDetails) return;

    setEnding(true);
    try {
      await api.patch(`/contests/${activeDetails.competition_id}`, { status: "Finished" });
      setShowEndConfirm(false);
      setActiveDetails(null);
      refreshCompetitions();
      setHistoryRefreshKey((k) => k + 1);
    } catch (error) {
      setSaveError(error.response?.data?.message || "Unable to end this competition.");
      setShowEndConfirm(false);
    } finally {
      setEnding(false);
    }
  };

  const showForm = !activeDetails || editing;

  const statusBadgeStyle = (status) => {
    if (status === "Active") return darkMode ? "bg-emerald-950/50 text-emerald-400" : "bg-[#E8F5E9] text-[#2E7D32]";
    if (status === "Frozen") return darkMode ? "bg-blue-950/50 text-blue-400" : "bg-[#E8F0FE] text-[#1967D2]";
    return darkMode ? "bg-neutral-800 text-neutral-400" : "bg-[#F1F3F4] text-[#5F6368]";
  };

  return (
    <div className="flex flex-col gap-7">

      {/* Page title */}
      <div>
        <h1 className={`text-[26px] font-bold tracking-[-0.4px] font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
          Contest Configuration
        </h1>
        <p className={`text-[14px] mt-1 font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#5F6368]'}`}>
          Create the active contest or review historical data from past events.
        </p>
      </div>

      {/* ── 1. Active Contest card ── */}
      <div className={`rounded-[16px] overflow-hidden border shadow-sm ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#E0E0E0]'}`}>

        {/* Card header */}
        <div className={`flex items-start justify-between px-7 py-5 border-b ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-blue-950/50' : 'bg-[#E8F0FE]'}`}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#3A7CF5" strokeWidth="1.6" />
                <path d="M9 6v3l2 2" stroke="#3A7CF5" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>
                {!activeDetails ? "Initialize Active Contest" : editing ? "Edit Contest" : "Current Active Contest"}
              </div>
              <div className={`text-[12px] mt-0.5 font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#9AA0A6]'}`}>
                {!activeDetails
                  ? "Configure and launch a new contest session"
                  : editing
                    ? "Update the contest currently selected in the navbar"
                    : "This is the contest currently selected in the navbar dropdown"}
              </div>
            </div>
          </div>

          {!activeDetails && (
            <div className={`flex items-start gap-2 px-4 py-2.5 rounded-[10px] max-w-[340px] border ${darkMode ? 'bg-orange-950/20 border-orange-900/50' : 'bg-[#FFF8E1] border-[#FFE082]'}`}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
                <path d="M7 1L13 12H1L7 1Z" stroke={darkMode ? "#F97316" : "#E65100"} strokeWidth="1.3" strokeLinejoin="round" />
                <path d="M7 5.5V8M7 9.5h.01" stroke={darkMode ? "#F97316" : "#E65100"} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <p className={`text-[11px] leading-snug font-['Roboto'] ${darkMode ? 'text-orange-300' : 'text-[#E65100]'}`}>
                <strong>Note:</strong> Only one contest can be live or upcoming at a time.
              </p>
            </div>
          )}

          {activeDetails && !editing && (
            <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold font-['Roboto'] ${statusBadgeStyle(activeDetails.status)}`}>
              {activeDetails.status}
            </span>
          )}
        </div>

        {loadingActive ? (
          <div className={`px-7 py-10 text-center text-[13px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            Loading contest details...
          </div>
        ) : showForm ? (
          <>
            {/* Form grid */}
            <div className="px-7 py-6 flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2">
                  <FormField label="Contest Name" darkMode={darkMode}>
                    <Input placeholder="e.g., GDG KAU SpeedRun 2026" value={contestName} onChange={setContestName} darkMode={darkMode} />
                  </FormField>
                </div>
                <FormField label="Maximum Number of Teams" darkMode={darkMode}>
                  <Input placeholder="e.g., 50" type="number" value={teamCount} onChange={setTeamCount} darkMode={darkMode} />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <FormField label="Overall Difficulty Level" darkMode={darkMode}>
                  <Select value={difficulty} onChange={setDifficulty} options={["Easy", "Medium", "Hard", "Mixed"]} darkMode={darkMode} />
                </FormField>
                <FormField label="Start Date & Time" darkMode={darkMode}>
                  <Input placeholder="" value={startDate} onChange={setStartDate} type="datetime-local" darkMode={darkMode} />
                </FormField>
                <FormField label="Duration (minutes)" darkMode={darkMode}>
                  <Input placeholder="e.g., 180" type="number" value={duration} onChange={setDuration} darkMode={darkMode} />
                </FormField>
              </div>

              <FormField label="Contest Description / Info" darkMode={darkMode}>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Enter rules, guidelines, and context for the participants..."
                  rows={4}
                  className={`w-full px-4 py-3 text-[14px] rounded-[8px] outline-none resize-none transition-all duration-150 ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-600' : 'bg-white text-[#1C1B1F] placeholder-neutral-400'}`}
                  style={{ border: `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`, fontFamily: "'Roboto', sans-serif", lineHeight: "1.7" }}
                  onFocus={e => (e.currentTarget.style.border = "2px solid #3A7CF5")}
                  onBlur={e  => (e.currentTarget.style.border = `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}`)}
                />
              </FormField>
            </div>

            {/* Card footer */}
            <div className={`flex items-center justify-between px-7 py-4 border-t ${darkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-[#FAFAFA] border-[#F1F3F4]'}`}>
              <div className="flex items-center gap-2 h-6">
                {saveError && (
                  <span className="text-[13px] text-[#EA4335] font-['Roboto']">{saveError}</span>
                )}
                {launched && !saveError && (
                  <div className="flex items-center gap-1.5 text-[13px] text-[#34A853] font-['Roboto']">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6" fill="#34A853" />
                      <path d="M4 7l2.5 2.5L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {activeDetails ? "Contest updated successfully!" : "Contest launched successfully!"}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {editing && (
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className={`px-5 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors border font-['DM_Sans'] disabled:opacity-60 ${darkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#E0E0E0] text-[#5F6368] hover:bg-[#F1F3F4]'}`}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-[100px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all active:scale-[0.97] font-['DM_Sans'] shadow-[0_2px_10px_rgba(58,124,245,0.35)] disabled:opacity-60"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2c0 0 4 2 4 7v1l1.5 1.5H11s-1 1.5-3 1.5-3-1.5-3-1.5H2.5L4 9V8c0-5 4-6 4-6Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                    <circle cx="8" cy="13.5" r="1" fill="white" />
                  </svg>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Launch Contest"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Read-only summary of the active contest */}
            <div className="px-7 py-6 flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 flex flex-col gap-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Contest Name</span>
                  <span className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>{activeDetails.competition_name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Max Teams</span>
                  <span className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>{activeDetails.max_teams}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Difficulty</span>
                  <span className={`text-[14px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#3C4043]'}`}>{activeDetails.difficulty}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Starts</span>
                  <span className={`text-[14px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#3C4043]'}`}>{formatDateTime(activeDetails.started_at)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Ends</span>
                  <span className={`text-[14px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#3C4043]'}`}>{formatDateTime(activeDetails.ended_at)}</span>
                </div>
              </div>

              {activeDetails.description && (
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Description</span>
                  <p className={`text-[14px] leading-relaxed whitespace-pre-wrap font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>{activeDetails.description}</p>
                </div>
              )}
            </div>

            <div className={`flex items-center justify-between px-7 py-4 border-t ${darkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-[#FAFAFA] border-[#F1F3F4]'}`}>
              <div className="flex items-center gap-2 h-6">
                {saveError && (
                  <span className="text-[13px] text-[#EA4335] font-['Roboto']">{saveError}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEndConfirm(true)}
                  className={`px-5 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors border font-['DM_Sans'] ${darkMode ? 'border-red-900/50 text-red-400 hover:bg-red-950/40' : 'border-[#FFCDD2] text-[#EA4335] hover:bg-[#FFEBEE]'}`}
                >
                  End Contest
                </button>
                <button
                  onClick={enterEditMode}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[100px] text-[14px] font-semibold text-white bg-[#3A7CF5] hover:bg-[#2563EB] transition-all active:scale-[0.97] font-['DM_Sans'] shadow-[0_2px_10px_rgba(58,124,245,0.35)]"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── 2. Archive card ── */}
      <div className={`rounded-[16px] overflow-hidden border shadow-sm ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-[#E0E0E0]'}`}>

        {/* Card header */}
        <div className={`flex items-center justify-between px-7 py-4 border-b ${darkMode ? 'border-neutral-800' : 'border-[#F1F3F4]'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${darkMode ? 'bg-neutral-800' : 'bg-[#F1F3F4]'}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="4" width="14" height="10" rx="2" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.4" />
                <path d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.4" />
                <path d="M5 8h6M5 11h4" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className={`text-[15px] font-bold font-['DM_Sans'] ${darkMode ? 'text-white' : 'text-[#1C1B1F]'}`}>Past Contests Archive</div>
              <div className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-400' : 'text-[#9AA0A6]'}`}>{archiveRows.length} archived contests</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke={archiveSearchFocus ? "#3A7CF5" : (darkMode ? "#737373" : "#9AA0A6")} strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke={archiveSearchFocus ? "#3A7CF5" : (darkMode ? "#737373" : "#9AA0A6")} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text" value={archiveSearch}
              onChange={e => setArchiveSearch(e.target.value)}
              onFocus={() => setArchiveSearchFocus(true)}
              onBlur={() => setArchiveSearchFocus(false)}
              placeholder="Search archives..."
              className={`pl-9 pr-4 py-2 text-[13px] rounded-[8px] outline-none transition-all font-['Roboto'] w-[210px] ${darkMode ? 'bg-neutral-950 text-white placeholder-neutral-500' : 'bg-[#F8F9FA] text-[#1C1B1F] placeholder-neutral-400'}`}
              style={{ border: archiveSearchFocus ? "2px solid #3A7CF5" : `1.5px solid ${darkMode ? '#404040' : '#E0E0E0'}` }}
            />
          </div>
        </div>

        {/* Table headers */}
        <div className={`grid px-7 py-3 border-b ${darkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`} style={{ gridTemplateColumns: "1fr 140px 120px 1fr 130px", gap: "16px" }}>
          {["Contest Name", "Date Hosted", "Total Teams", "Winner", "Actions"].map((h) => (
            <div key={h} className="text-[11px] font-bold uppercase tracking-wider text-[#9AA0A6] font-['Roboto']">{h}</div>
          ))}
        </div>

        {archiveLoading && (
          <div className={`flex flex-col items-center justify-center py-14 gap-2`}>
            <span className={`text-[14px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Loading archive...</span>
          </div>
        )}

        {!archiveLoading && archiveError && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <span className="text-[14px] font-['Roboto'] text-[#C62828]">{archiveError}</span>
          </div>
        )}

        {/* Rows */}
        {!archiveLoading && !archiveError && filteredArchive.map((row) => (
          <div key={row.competition_id}>
            <div
              className={`grid px-7 items-center transition-colors cursor-pointer ${darkMode ? 'hover:bg-neutral-800/50 border-neutral-800' : 'hover:bg-[#FAFBFF] border-[#F1F3F4]'}`}
              style={{ gridTemplateColumns: "1fr 140px 120px 1fr 130px", gap: "16px", paddingTop: "18px", paddingBottom: "18px", borderBottomWidth: "1px" }}
              onClick={() => setExpandedRow(expandedRow === row.competition_id ? null : row.competition_id)}
            >
              {/* Contest name */}
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-neutral-800' : 'bg-[#F1F3F4]'}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5L7 1Z" fill="#FBBC04" />
                  </svg>
                </div>
                <div>
                  <div className={`text-[14px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#1C1B1F]'}`}>{row.competition_name}</div>
                  <div className={`text-[11px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>Archived</div>
                </div>
              </div>

              {/* Date */}
              <div className={`text-[13px] font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>{formatDate(row.ended_at)}</div>

              {/* Teams */}
              <div className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <circle cx="5.5" cy="4" r="2.5" stroke={darkMode ? "#737373" : "#9AA0A6"} strokeWidth="1.3" />
                  <circle cx="9.5" cy="5" r="2" stroke={darkMode ? "#737373" : "#9AA0A6"} strokeWidth="1.2" />
                  <path d="M1 12c0-2 2-3.5 4.5-3.5S10 10 10 12" stroke={darkMode ? "#737373" : "#9AA0A6"} strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span className={`text-[13px] font-['Roboto'] ${darkMode ? 'text-neutral-300' : 'text-[#3C4043]'}`}>{row.team_count} teams</span>
              </div>

              {/* Winner */}
              {row.winner ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 font-['DM_Sans']" style={{ backgroundColor: colorForId(row.winner.team_id) }}>
                    {row.winner.team_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className={`text-[13px] font-semibold font-['DM_Sans'] ${darkMode ? 'text-neutral-200' : 'text-[#1C1B1F]'}`}>{row.winner.team_name}</span>
                    <span className={`text-[12px] ml-2 font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>({row.winner.points} pts)</span>
                  </div>
                </div>
              ) : (
                <span className={`text-[13px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>No submissions</span>
              )}

              {/* Action */}
              <div className="flex items-center gap-3">
                <button
                  onClick={e => { e.stopPropagation(); setExpandedRow(expandedRow === row.competition_id ? null : row.competition_id); }}
                  className="text-[13px] font-semibold transition-colors text-[#3A7CF5] hover:text-[#2563EB] font-['DM_Sans']"
                >
                  {expandedRow === row.competition_id ? "Collapse ↑" : "View Details →"}
                </button>
              </div>
            </div>

            {/* Expanded detail pane */}
            {expandedRow === row.competition_id && (
              <div className={`px-7 pb-5 border-b ${darkMode ? 'bg-neutral-950/30 border-neutral-800' : 'bg-[#F8FBFF] border-[#E0E0E0]'}`}>
                <div className="pt-4">
                  <DetailPane
                    competition={row}
                    onClose={() => setExpandedRow(null)}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {!archiveLoading && !archiveError && filteredArchive.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 gap-2">
            <span className={`text-[14px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
              {archiveRows.length === 0 ? "No contests have finished yet." : `No contests match "${archiveSearch}"`}
            </span>
          </div>
        )}

        {/* Card footer */}
        <div className={`flex items-center justify-between px-7 py-3 border-t ${darkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-[#F8F9FA] border-[#E0E0E0]'}`}>
          <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            {archiveRows.length} archived contests total
          </span>
          <span className={`text-[12px] font-['Roboto'] ${darkMode ? 'text-neutral-500' : 'text-[#9AA0A6]'}`}>
            Click any row to expand contest details
          </span>
        </div>
      </div>

      {showEndConfirm && activeDetails && (
        <EndContestModal
          contestName={activeDetails.competition_name}
          onConfirm={handleEndContest}
          onCancel={() => setShowEndConfirm(false)}
          ending={ending}
          darkMode={darkMode}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
