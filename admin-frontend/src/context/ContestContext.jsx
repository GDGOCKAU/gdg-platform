import React, { createContext, useContext, useCallback, useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";
const STORAGE_KEY = "admin_selected_contest_id";

// A competition is only offered in the picker while it can still be worked on —
// once it's Finished/Cancelled there is nothing left to configure for it.
const SELECTABLE_STATUSES = ["Active", "Frozen", "Upcoming"];

const ContestContext = createContext(null);

export function ContestProvider({ children }) {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContestId, setSelectedContestIdState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  const fetchCompetitions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/overview/competitions`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch competitions");
      }

      const selectable = (data.competitions || [])
        .filter((c) => SELECTABLE_STATUSES.includes(c.status))
        .sort((a, b) => new Date(a.started_at) - new Date(b.started_at));

      setCompetitions(selectable);
    } catch (error) {
      console.error("Fetch competitions error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetitions();
    const intervalId = setInterval(fetchCompetitions, 30000);
    return () => clearInterval(intervalId);
  }, [fetchCompetitions]);

  // If the stored/selected contest is no longer among the selectable ones
  // (finished, cancelled, or never existed), fall back to the soonest one.
  useEffect(() => {
    if (competitions.length === 0) return;

    const stillValid = competitions.some((c) => c.competition_id === selectedContestId);
    if (!stillValid) {
      setSelectedContestIdState(competitions[0].competition_id);
    }
  }, [competitions, selectedContestId]);

  const setSelectedContestId = (id) => {
    setSelectedContestIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, String(id));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const selectedContest = competitions.find((c) => c.competition_id === selectedContestId) || null;

  return (
    <ContestContext.Provider
      value={{
        competitions,
        loading,
        selectedContestId,
        selectedContest,
        setSelectedContestId,
        refreshCompetitions: fetchCompetitions,
      }}
    >
      {children}
    </ContestContext.Provider>
  );
}

export function useContest() {
  const ctx = useContext(ContestContext);
  if (!ctx) {
    throw new Error("useContest must be used within a ContestProvider");
  }
  return ctx;
}
