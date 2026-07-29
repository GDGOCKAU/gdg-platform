import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

const MainLayout = ({
  darkMode,
  setDarkMode,
  navBg,
  borderColor,
}) => {
  const { user } = useAuth();
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    if (!user) return;

    setDarkMode(user.theme === "Dark");
    setThemeReady(true);
  }, [user, setDarkMode]);

  if (!themeReady) {
    return <LoadingScreen darkMode={darkMode} />;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        navBg={navBg}
        borderColor={borderColor}
      />

      <main
        className="flex-1"
        style={{
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Outlet context={{ darkMode, setDarkMode }} />
      </main>
    </div>
  );
};

export default MainLayout;