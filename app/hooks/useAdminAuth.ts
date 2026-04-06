"use client";
import { useState, useEffect } from "react";
import { AdminCredential } from "../models/authModel";
import { validateAdminLogin } from "../controllers/authController";

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

  const login = (username: string, password: string): boolean => {
    const cred = validateAdminLogin(username, password);
    if (cred) {
      setAdmin(cred);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(cred));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return { admin, loading, login, logout };
}
