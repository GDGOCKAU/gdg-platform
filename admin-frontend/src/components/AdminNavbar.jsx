import React, { useEffect, useState } from "react";
import { useContest } from "../context/ContestContext";
import { API_BASE_URL } from "../config";

const LAST_SEEN_ANNOUNCEMENT_KEY = "admin_last_seen_announcement_at";

export default function AdminHeader({
  darkMode,
  setDarkMode,
}) {
  const {
    competitions,
    selectedContestId,
    selectedContest,
    setSelectedContestId,
  } = useContest();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showContestMenu, setShowContestMenu] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [lastSeenAnnouncementAt, setLastSeenAnnouncementAt] = useState(() =>
    localStorage.getItem(LAST_SEEN_ANNOUNCEMENT_KEY)
  );

  const [themeLoading, setThemeLoading] = useState(true);
  const [themeUpdating, setThemeUpdating] = useState(false);

  const [admin, setAdmin] = useState(null);
  const [competitionStatus, setCompetitionStatus] = useState("none"); // "none" | "before" | "live"
  const [remainingTime, setRemainingTime] = useState("00:00:00");
  const [dataLoading, setDataLoading] = useState(true);

  // ─── Password Modal States ───
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordState, setPasswordState] = useState({
    loading: false,
    error: "",
    success: false,
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);
  
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch admin"
          );
        }

        setAdmin(data.user);

        if (data.user?.theme) {
          setDarkMode(data.user.theme === "Dark");
        }
      } catch (error) {
        console.error("Fetch admin error:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchAdmin();
  }, [setDarkMode]);

  useEffect(() => {
    if (!selectedContestId) {
      setAnnouncements([]);
      return;
    }

    let ignore = false;

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/overview/announcements?competition_id=${selectedContestId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch announcements");
        }

        if (!ignore) setAnnouncements(data.announcements || []);
      } catch (error) {
        console.error("Fetch announcements error:", error);
      }
    };

    fetchAnnouncements();

    const intervalId = setInterval(fetchAnnouncements, 30000);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, [selectedContestId]);

  const unreadAnnouncementCount = announcements.filter(
    (a) => !lastSeenAnnouncementAt || new Date(a.created_at) > new Date(lastSeenAnnouncementAt)
  ).length;

  const handleToggleNotifs = () => {
    const opening = !showNotifs;
    setShowNotifs(opening);
    setShowProfileMenu(false);
    setShowContestMenu(false);

    if (opening && announcements.length > 0) {
      const latest = announcements[0].created_at;
      localStorage.setItem(LAST_SEEN_ANNOUNCEMENT_KEY, latest);
      setLastSeenAnnouncementAt(latest);
    }
  };

  const getInitials = (name) => {
    if (!name) return "--";

    return name
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  useEffect(() => {
    const fetchAdminTheme = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/settings/theme`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch admin theme");
        }

        const data = await response.json();

        setDarkMode(data.theme === "Dark");
      } catch (error) {
        console.error("Fetch admin theme error:", error);
      } finally {
        setThemeLoading(false);
      }
    };

    fetchAdminTheme();
  }, [setDarkMode]);

  const handleThemeToggle = async () => {
    if (themeLoading || themeUpdating) return;

    const previousDarkMode = darkMode;
    const newDarkMode = !darkMode;
    const newTheme = newDarkMode ? "Dark" : "Light";

    setDarkMode(newDarkMode);
    setThemeUpdating(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/settings/theme`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            theme: newTheme,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update admin theme"
        );
      }
    } catch (error) {
      console.error("Update admin theme error:", error);
      setDarkMode(previousDarkMode);
    } finally {
      setThemeUpdating(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  // ─── Handle Password Submission ───
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordState({ loading: false, error: "", success: false });

    // Basic Validation
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordState({ loading: false, error: "New passwords do not match.", success: false });
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordState({ loading: false, error: "New password must be at least 6 characters.", success: false });
      return;
    }

    setPasswordState({ loading: true, error: "", success: false });

    try {
      // Update this URL to exactly what backend created
      const response = await fetch(`${API_BASE_URL}/api/admin/auth/change-password`, {
        method: "POST", 
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password.");
      }

      // Success state!
      setPasswordState({ loading: false, error: "", success: true });
      
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({ current: "", new: "", confirm: "" });
        setPasswordState({ loading: false, error: "", success: false });
      }, 2000);

    } catch (error) {
      setPasswordState({ loading: false, error: error.message, success: false });
    }
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((value) => value.toString().padStart(2, "0"))
      .join(":");
  };

  useEffect(() => {
    const updateTimer = () => {
      if (!selectedContest) {
        setCompetitionStatus("none");
        setRemainingTime("00:00:00");
        return;
      }

      const now = new Date();
      const startedAt = new Date(selectedContest.started_at);
      const endedAt = new Date(selectedContest.ended_at);

      if (now < startedAt) {
        setCompetitionStatus("before");
        setRemainingTime(
          formatDuration(Math.max(startedAt.getTime() - now.getTime(), 0))
        );
        return;
      }

      if (now <= endedAt) {
        setCompetitionStatus("live");
        setRemainingTime(
          formatDuration(Math.max(endedAt.getTime() - now.getTime(), 0))
        );
        return;
      }

      setCompetitionStatus("none");
      setRemainingTime("00:00:00");
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [selectedContest]);

  return (
    <header
      className={`flex-shrink-0 flex items-center justify-between px-8 h-[64px] border-b transition-colors z-30 ${
        darkMode
          ? "bg-neutral-900 border-neutral-800"
          : "bg-white border-[#E0E0E0]"
      }`}
    >
      {/* Contest picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowContestMenu(!showContestMenu);
            setShowNotifs(false);
            setShowProfileMenu(false);
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-[10px] border transition-colors max-w-[280px] ${
            darkMode
              ? "border-neutral-800 hover:bg-neutral-800"
              : "border-[#E0E0E0] hover:bg-[#F1F3F4]"
          }`}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <rect x="2" y="3" width="12" height="10" rx="2" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.4" />
            <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <span className={`text-[13px] font-semibold truncate font-['DM_Sans'] ${darkMode ? "text-white" : "text-[#1C1B1F]"}`}>
            {selectedContest ? selectedContest.competition_name : "No contest selected"}
          </span>

          {selectedContest && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 font-['Roboto'] ${
                selectedContest.status === "Active"
                  ? darkMode ? "bg-emerald-950/50 text-emerald-400" : "bg-[#E8F5E9] text-[#2E7D32]"
                  : selectedContest.status === "Frozen"
                    ? darkMode ? "bg-blue-950/50 text-blue-400" : "bg-[#E8F0FE] text-[#1967D2]"
                    : darkMode ? "bg-neutral-800 text-neutral-400" : "bg-[#F1F3F4] text-[#5F6368]"
              }`}
            >
              {selectedContest.status}
            </span>
          )}

          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
            <path d="M2 3.5l3 3 3-3" stroke={darkMode ? "#A3A3A3" : "#9AA0A6"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showContestMenu && (
          <div
            className={`absolute top-12 left-0 w-[280px] rounded-[12px] shadow-lg border overflow-hidden flex flex-col font-['Roboto'] z-20 ${
              darkMode ? "bg-neutral-900 border-neutral-700" : "bg-white border-[#E0E0E0]"
            }`}
          >
            <div className={`px-4 py-2.5 border-b text-[11px] font-bold uppercase tracking-wider ${darkMode ? "border-neutral-800 text-neutral-500" : "border-[#F1F3F4] text-[#9AA0A6]"}`}>
              Live & Upcoming Contests
            </div>

            {competitions.length === 0 ? (
              <div className={`px-4 py-4 text-[13px] ${darkMode ? "text-neutral-500" : "text-[#9AA0A6]"}`}>
                No live or upcoming contests.
              </div>
            ) : (
              competitions.map((c) => (
                <button
                  key={c.competition_id}
                  onClick={() => {
                    setSelectedContestId(c.competition_id);
                    setShowContestMenu(false);
                  }}
                  className={`flex items-center justify-between gap-2 px-4 py-3 text-left text-[13px] font-medium transition-colors ${
                    darkMode ? "hover:bg-neutral-800" : "hover:bg-[#F8F9FA]"
                  } ${c.competition_id === selectedContestId ? (darkMode ? "bg-blue-950/30" : "bg-[#E8F0FE]") : ""}`}
                >
                  <span className={`truncate ${darkMode ? "text-neutral-200" : "text-[#1C1B1F]"}`}>{c.competition_name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      c.status === "Active"
                        ? darkMode ? "bg-emerald-950/50 text-emerald-400" : "bg-[#E8F5E9] text-[#2E7D32]"
                        : c.status === "Frozen"
                          ? darkMode ? "bg-blue-950/50 text-blue-400" : "bg-[#E8F0FE] text-[#1967D2]"
                          : darkMode ? "bg-neutral-800 text-neutral-400" : "bg-[#F1F3F4] text-[#5F6368]"
                    }`}
                  >
                    {c.status}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Competition timer */}
        {competitionStatus === "none" ? (
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-[10px] border ${
              darkMode
                ? "bg-neutral-800/60 border-neutral-700"
                : "bg-[#F1F3F4] border-[#E0E0E0]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                darkMode ? "bg-neutral-500" : "bg-[#9AA0A6]"
              }`}
            />

            <span
              className={`text-[12px] font-semibold font-['DM_Sans'] ${
                darkMode ? "text-neutral-400" : "text-[#5F6368]"
              }`}
            >
              No active competition
            </span>
          </div>
        ) : (
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-[10px] border ${
              competitionStatus === "live"
                ? darkMode
                  ? "bg-red-950/40 border-red-800/50"
                  : "bg-[#FFEBEE] border-[#EF9A9A]"
                : darkMode
                  ? "bg-blue-950/30 border-blue-800/40"
                  : "bg-[#E8F0FE] border-[#90CAF9]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                competitionStatus === "live"
                  ? "bg-[#EA4335] animate-live-pulse"
                  : "bg-[#4285F4]"
              }`}
            />

            <span
              className={`text-[12px] font-semibold font-['DM_Sans'] ${
                competitionStatus === "live"
                  ? darkMode
                    ? "text-red-400"
                    : "text-[#B71C1C]"
                  : darkMode
                    ? "text-blue-400"
                    : "text-[#1967D2]"
              }`}
            >
              {competitionStatus === "live" ? "Live:" : "Starts in:"}
            </span>

            <span
              className={`text-[15px] font-bold tabular-nums tracking-[0.5px] font-['DM_Sans'] ${
                competitionStatus === "live"
                  ? darkMode
                    ? "text-red-400"
                    : "text-[#B71C1C]"
                  : darkMode
                    ? "text-blue-400"
                    : "text-[#1967D2]"
              }`}
            >
              {remainingTime}
            </span>
          </div>
        )}

        <div className={`w-px h-5 ${darkMode ? "bg-neutral-800" : "bg-[#E0E0E0]"}`} />

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={handleToggleNotifs}
            className={`relative w-8 h-8 rounded-[8px] flex items-center justify-center border transition-colors ${
              darkMode
                ? "border-neutral-800 hover:bg-neutral-800"
                : "border-[#E0E0E0] hover:bg-[#F1F3F4]"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2h11L12 9V6a4 4 0 0 0-4-4Z" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke={darkMode ? "#A3A3A3" : "#5F6368"} strokeWidth="1.4" />
            </svg>
            {unreadAnnouncementCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-[#EA4335] font-['Roboto']">
                {unreadAnnouncementCount > 9 ? "9+" : unreadAnnouncementCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className={`absolute top-10 right-0 w-[320px] rounded-[16px] shadow-lg border overflow-hidden flex flex-col font-['Roboto'] ${
                darkMode ? "bg-neutral-900 border-neutral-700" : "bg-white border-[#E0E0E0]"
              }`}
            >
              <div className={`px-4 py-3 border-b font-bold text-[14px] ${darkMode ? "border-neutral-800 text-white" : "border-[#F1F3F4] text-[#1C1B1F]"}`}>
                Recent Announcements
              </div>
              <div className="flex flex-col max-h-[320px] overflow-y-auto">
                {announcements.length === 0 ? (
                  <div className={`px-4 py-4 text-[13px] ${darkMode ? "text-neutral-500" : "text-[#9AA0A6]"}`}>
                    No announcements published yet.
                  </div>
                ) : (
                  announcements.slice(0, 5).map((a) => (
                    <div
                      key={a.announcement_id}
                      className={`px-4 py-3 border-b text-[13px] last:border-b-0 ${darkMode ? "border-neutral-800 hover:bg-neutral-800" : "border-[#F1F3F4] hover:bg-[#F8F9FA]"}`}
                    >
                      <strong className={darkMode ? "text-blue-400" : "text-[#3A7CF5]"}>{a.title}</strong>
                      <p className={`mt-0.5 line-clamp-2 ${darkMode ? "text-neutral-300" : "text-[#5F6368]"}`}>
                        {a.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          type="button"
          onClick={handleThemeToggle}
          disabled={themeLoading || themeUpdating}
          aria-label="Toggle theme"
          className={`w-8 h-8 rounded-[8px] flex items-center justify-center border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode
              ? "border-neutral-800 hover:bg-neutral-800"
              : "border-[#E0E0E0] hover:bg-[#F1F3F4]"
          }`}
        >
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.5" stroke="#A3A3A3" strokeWidth="1.4" />
              <path d="M8 1V2.5M8 13.5V15M1 8H2.5M13.5 8H15M3.05 3.05L4.11 4.11M11.89 11.89L12.95 12.95M3.05 12.95L4.11 11.89M11.89 4.11L12.95 3.05" stroke="#A3A3A3" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z" stroke="#5F6368" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Admin profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifs(false);
              setShowContestMenu(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold bg-[#3A7CF5] font-['DM_Sans']">
              {getInitials(admin?.user_name)}
            </div>

            <div className="flex flex-col text-left">
              <span
                className={`text-[13px] font-semibold font-['DM_Sans'] ${
                  darkMode ? "text-white" : "text-[#1C1B1F]"
                }`}
              >
               {dataLoading ? "Loading..." : admin?.user_name}
              </span>

              <span className="text-[10px] text-[#9AA0A6] font-['Roboto']">
                {admin?.role}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div
              className={`absolute top-12 right-0 w-[180px] rounded-[12px] shadow-lg border flex flex-col font-['DM_Sans'] overflow-hidden ${
                darkMode
                  ? "bg-neutral-900 border-neutral-700"
                  : "bg-white border-[#E0E0E0]"
              }`}
            >
              {/* ─── NEW: Change Password Option ─── */}
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(true);
                  setShowProfileMenu(false);
                }}
                className={`w-full text-left px-4 py-3 text-[14px] font-semibold transition-colors border-b ${
                  darkMode
                    ? "border-neutral-800 text-neutral-200 hover:bg-neutral-800"
                    : "border-[#F1F3F4] text-[#1C1B1F] hover:bg-[#F8F9FA]"
                }`}
              >
                Change Password
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className={`w-full text-left px-4 py-3 text-[14px] font-semibold transition-colors ${
                  darkMode
                    ? "text-red-400 hover:bg-red-950/40"
                    : "text-[#EA4335] hover:bg-[#FFEBEE]"
                }`}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── NEW: Password Change Modal ─── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 rounded-[16px] shadow-2xl border font-['Roboto'] ${
              darkMode ? "bg-neutral-900 border-neutral-700" : "bg-white border-[#E0E0E0]"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-[20px] font-bold font-['DM_Sans'] ${darkMode ? "text-white" : "text-[#1C1B1F]"}`}>
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ current: "", new: "", confirm: "" });
                  setPasswordState({ loading: false, error: "", success: false });
                }}
                className={`p-1 rounded-md transition-colors ${
                  darkMode ? "text-neutral-400 hover:bg-neutral-800" : "text-[#5F6368] hover:bg-[#F1F3F4]"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Error / Success Messages */}
            {passwordState.error && (
              <div className="mb-4 p-3 rounded-[8px] bg-[#FFEBEE] border border-[#FFCDD2] flex items-start gap-2.5">
                <span className="text-[13px] text-[#C62828] leading-tight">{passwordState.error}</span>
              </div>
            )}
            {passwordState.success && (
              <div className="mb-4 p-3 rounded-[8px] bg-[#E8F5E9] border border-[#C8E6C9] flex items-start gap-2.5">
                <span className="text-[13px] text-[#2E7D32] leading-tight">Password updated successfully! Closing...</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-[13px] font-medium ${darkMode ? "text-neutral-300" : "text-[#3C4043]"}`}>
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  disabled={passwordState.loading || passwordState.success}
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className={`w-full px-3 py-2.5 text-[14px] rounded-[8px] outline-none border transition-colors disabled:opacity-50 ${
                    darkMode
                      ? "bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                      : "bg-white border-[#E0E0E0] text-[#1C1B1F] focus:border-[#3A7CF5]"
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[13px] font-medium ${darkMode ? "text-neutral-300" : "text-[#3C4043]"}`}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  disabled={passwordState.loading || passwordState.success}
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className={`w-full px-3 py-2.5 text-[14px] rounded-[8px] outline-none border transition-colors disabled:opacity-50 ${
                    darkMode
                      ? "bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                      : "bg-white border-[#E0E0E0] text-[#1C1B1F] focus:border-[#3A7CF5]"
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[13px] font-medium ${darkMode ? "text-neutral-300" : "text-[#3C4043]"}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  disabled={passwordState.loading || passwordState.success}
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className={`w-full px-3 py-2.5 text-[14px] rounded-[8px] outline-none border transition-colors disabled:opacity-50 ${
                    darkMode
                      ? "bg-neutral-800 border-neutral-700 text-white focus:border-blue-500"
                      : "bg-white border-[#E0E0E0] text-[#1C1B1F] focus:border-[#3A7CF5]"
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  disabled={passwordState.loading || passwordState.success}
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ current: "", new: "", confirm: "" });
                    setPasswordState({ loading: false, error: "", success: false });
                  }}
                  className={`px-4 py-2 rounded-[8px] text-[14px] font-semibold transition-colors disabled:opacity-50 ${
                    darkMode ? "text-neutral-300 hover:bg-neutral-800" : "text-[#5F6368] hover:bg-[#F1F3F4]"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordState.loading || passwordState.success}
                  className="px-5 py-2 rounded-[8px] bg-[#3A7CF5] text-white text-[14px] font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                >
                  {passwordState.loading ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75" />
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150" />
                    </div>
                  ) : (
                    "Save Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}