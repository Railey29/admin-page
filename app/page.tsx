"use client";
import { useAdminAuth } from "./hooks/useAdminAuth";
import LoginPage from "./components/form/LoginPage";
import Dashboard from "./components/form/Dashboard";

export default function Home() {
  const { admin, loading, login, logout } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return <LoginPage onLogin={login} />;
  }

  return <Dashboard admin={admin} onLogout={logout} />;
}
