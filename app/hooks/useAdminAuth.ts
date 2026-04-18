"use client";
import { useState, useEffect } from "react";
import { AdminCredential } from "../models/authModel";

const SESSION_KEY = "lto_admin_session";

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminCredential | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) setAdmin(JSON.parse(stored));
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Login failed:", err.error);
        return false;
      }

      const cred: AdminCredential = await res.json();
      setAdmin(cred);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(cred));
      return true;
    } catch (err) {
      console.error("Network error during login:", err);
      return false;
    }
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return { admin, loading, login, logout };
}
