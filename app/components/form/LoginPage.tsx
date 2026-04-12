"use client";
import { useState } from "react";

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onRegister?: () => void;
}

export default function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const success = onLogin(username, password);
    if (!success) {
      setError("Invalid username or password.");
    }
    setIsLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 700,
            color: "#1e3a8a",
            letterSpacing: "0.05em",
          }}
        >
          LTO MID 2026
        </h1>
        <p style={{ color: "#9ca3af", marginTop: "4px", fontSize: "0.875rem" }}>
          User Access Authorization System
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "460px",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "6px",
          }}
        >
          Admin Portal
        </h2>
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.875rem",
            marginBottom: "28px",
          }}
        >
          Sign in with your admin credentials to review pending requests.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "0.875rem",
                color: "#374151",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "12px 16px",
                fontSize: "0.875rem",
                color: "#374151",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.875rem",
                marginBottom: "16px",
                backgroundColor: "#fef2f2",
                borderRadius: "8px",
                padding: "10px 14px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              backgroundColor: isLoading ? "#1e40af99" : "#1e3a8a",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: "14px",
              borderRadius: "8px",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#1e40af";
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = "#1e3a8a";
            }}
          >
            {isLoading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        {/* Register link */}
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "0.75rem",
            marginTop: "20px",
          }}
        >
          Don&apos;t have an account?{" "}
          <button
            onClick={onRegister}
            style={{
              background: "none",
              border: "none",
              color: "#1e3a8a",
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
