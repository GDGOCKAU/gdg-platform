import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext(null);

// How often the session/competition window is re-checked in the background.
// Catches an admin extending the contest mid-run and a session that expired
// server-side while the tab was open.
const REFRESH_INTERVAL_MS = 60000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async ({ isBackground = false } = {}) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          // The session really is gone server-side (expired/invalid token) —
          // log out immediately even on a background refresh, so a
          // mid-contest expiry doesn't leave the team interacting with a
          // dead session.
          if (!cancelled) {
            setUser(null);
            setCompetition(null);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setUser(data.user);
          setCompetition(data.competition);
        }
      } catch (error) {
        console.error("Check auth error:", error);

        // A network blip during a background refresh shouldn't log an
        // otherwise still-valid session out — only the initial check treats
        // a failure as "not logged in."
        if (!isBackground && !cancelled) {
          setUser(null);
          setCompetition(null);
        }
      } finally {
        if (!isBackground && !cancelled) setLoading(false);
      }
    };

    checkAuth();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkAuth({ isBackground: true });
      }
    }, REFRESH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuth({ isBackground: true });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setCompetition(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, competition, setCompetition, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
