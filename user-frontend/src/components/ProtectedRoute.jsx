import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

export default function ProtectedRoute({ children }) {
  const { user, loading, darkMode } = useAuth();

  if (loading) {
    return <LoadingScreen darkMode={darkMode} />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}