import React, { useEffect, useState } from "react";
import { useContest } from "../context/ContestContext";
import { API_BASE_URL } from "../config";

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
  const [showProfileMenu, setShowProfileMenu] =
    useState(false);
  const [showContestMenu, setShowContestMenu] = useState(false);

  const [themeLoading, setThemeLoading] = useState(true);
  const [themeUpdating, setThemeUpdating] =
    useState(false);

  const [admin, setAdmin] = useState(null);
  const [competitionStatus, setCompetitionStatus] = useState("none"); // "none" | "before" | "live"
  const [remainingTime, setRemainingTime] = useState("00:00:00");
  const [dataLoading, setDataLoading] = useState(true);

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

  const getInitials = (name) => {
    if (!name) {
      return "--";
    }

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
    if (themeLoading || themeUpdating) {
      return;
    }

    const previousDarkMode = darkMode;
    const newDarkMode = !darkMode;
    const newTheme = newDarkMode ? "Dark" : "Light";

    // نغيّر الواجهة مباشرة
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

      // إذا فشل الحفظ نرجع للثيم السابق
      setDarkMode(previousDarkMode);
    } finally {
      setThemeUpdating(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/";
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
      {/* Contest picker — every admin page uses this to know which contest it's editing */}
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

        <div
          className={`w-px h-5 ${
            darkMode
              ? "bg-neutral-800"
              : "bg-[#E0E0E0]"
          }`}
        />

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowProfileMenu(false);
              setShowContestMenu(false);
            }}
            className={`relative w-8 h-8 rounded-[8px] flex items-center justify-center border transition-colors ${
              darkMode
                ? "border-neutral-800 hover:bg-neutral-800"
                : "border-[#E0E0E0] hover:bg-[#F1F3F4]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M8 2a4 4 0 0 0-4 4v3l-1.5 2h11L12 9V6a4 4 0 0 0-4-4Z"
                stroke={
                  darkMode ? "#A3A3A3" : "#5F6368"
                }
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              <path
                d="M6.5 13a1.5 1.5 0 0 0 3 0"
                stroke={
                  darkMode ? "#A3A3A3" : "#5F6368"
                }
                strokeWidth="1.4"
              />
            </svg>

            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white bg-[#EA4335] font-['Roboto']">
              3
            </span>
          </button>

          {showNotifs && (
            <div
              className={`absolute top-10 right-0 w-[320px] rounded-[16px] shadow-lg border overflow-hidden flex flex-col font-['Roboto'] ${
                darkMode
                  ? "bg-neutral-900 border-neutral-700"
                  : "bg-white border-[#E0E0E0]"
              }`}
            >
              <div
                className={`px-4 py-3 border-b font-bold text-[14px] ${
                  darkMode
                    ? "border-neutral-800 text-white"
                    : "border-[#F1F3F4] text-[#1C1B1F]"
                }`}
              >
                Recent Alerts
              </div>

              <div className="flex flex-col">
                <div
                  className={`px-4 py-3 border-b text-[13px] ${
                    darkMode
                      ? "border-neutral-800 hover:bg-neutral-800"
                      : "border-[#F1F3F4] hover:bg-[#F8F9FA]"
                  }`}
                >
                  <strong
                    className={
                      darkMode
                        ? "text-blue-400"
                        : "text-[#3A7CF5]"
                    }
                  >
                    System
                  </strong>

                  <p
                    className={`mt-0.5 ${
                      darkMode
                        ? "text-neutral-300"
                        : "text-[#5F6368]"
                    }`}
                  >
                    Judge0 cluster #2 connected
                    successfully.
                  </p>
                </div>

                <div
                  className={`px-4 py-3 border-b text-[13px] ${
                    darkMode
                      ? "border-neutral-800 hover:bg-neutral-800"
                      : "border-[#F1F3F4] hover:bg-[#F8F9FA]"
                  }`}
                >
                  <strong
                    className={
                      darkMode
                        ? "text-orange-400"
                        : "text-[#E65100]"
                    }
                  >
                    Warning
                  </strong>

                  <p
                    className={`mt-0.5 ${
                      darkMode
                        ? "text-neutral-300"
                        : "text-[#5F6368]"
                    }`}
                  >
                    Team Byte_Me requested clarification
                    on Problem C.
                  </p>
                </div>

                <div
                  className={`px-4 py-3 text-[13px] ${
                    darkMode
                      ? "hover:bg-neutral-800"
                      : "hover:bg-[#F8F9FA]"
                  }`}
                >
                  <strong
                    className={
                      darkMode
                        ? "text-emerald-400"
                        : "text-[#2E7D32]"
                    }
                  >
                    Contest
                  </strong>

                  <p
                    className={`mt-0.5 ${
                      darkMode
                        ? "text-neutral-300"
                        : "text-[#5F6368]"
                    }`}
                  >
                    {competitionStatus === "before"
                      ? `Starts in: ${remainingTime}`
                      : competitionStatus === "live"
                        ? `Time left: ${remainingTime}`
                        : "No active competition"}
                  </p>
                </div>
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
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="8"
                cy="8"
                r="3.5"
                stroke="#A3A3A3"
                strokeWidth="1.4"
              />

              <path
                d="M8 1V2.5M8 13.5V15M1 8H2.5M13.5 8H15M3.05 3.05L4.11 4.11M11.89 11.89L12.95 12.95M3.05 12.95L4.11 11.89M11.89 4.11L12.95 3.05"
                stroke="#A3A3A3"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"
                stroke="#5F6368"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
                  darkMode
                    ? "text-white"
                    : "text-[#1C1B1F]"
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
    </header>
  );
}