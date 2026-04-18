"use client";
import { useState } from "react";
import { useAdminAuth } from "./hooks/useAdminAuth";
import LoginPage from "./components/form/LoginPage";
import RegisterPage from "./components/form/RegisterPage";
import Dashboard from "./components/form/Dashboard";

type View = "login" | "register";

export default function Home() {
  const { admin, loading, login, logout } = useAdminAuth();
  const [view, setView] = useState<View>("login");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    if (view === "register") {
      return (
        <RegisterPage
          onRegister={async (data) => {
            try {
              const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ltoEmployeeNumber: data.ltoEmployeeNumber,
                  firstName: data.firstName,
                  middleName: data.middleName,
                  lastName: data.lastName,
                  office: data.office,
                  designation: data.designation, // ← was missing
                  level: data.level, // ← was missing
                  username: data.username,
                  password: data.password,
                }),
              });

              if (!res.ok) {
                const err = await res.json();
                console.error("Registration failed:", err.error);
                return false;
              }

              const result = await res.json();
              console.log("Registered!", result.message);
              setView("login");
              return true;
            } catch (err) {
              console.error("Network error:", err);
              return false;
            }
          }}
          onBackToLogin={() => setView("login")}
        />
      );
    }

    return <LoginPage onLogin={login} onRegister={() => setView("register")} />;
  }

  return <Dashboard admin={admin} onLogout={logout} />;
}
