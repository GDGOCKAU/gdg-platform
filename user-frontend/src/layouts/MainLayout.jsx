import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout = ({
  darkMode,
  setDarkMode,
  navBg,
  borderColor,
}) => {
  return (
    <div className="min-h-screen flex flex-col" style={{height: "100vh", overflow: "hidden",}}>
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        navBg={navBg}
        borderColor={borderColor}
      />

      <main className="flex-1" style={{minHeight: 0, overflow: "hidden",}}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;