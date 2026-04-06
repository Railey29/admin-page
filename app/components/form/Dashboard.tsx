"use client";
import { AdminCredential } from "../../models/authModel";
import Level1to3Dashboard from "./Level1to3Dashboard";
import Level4Dashboard from "./Level4Dashboard";

interface DashboardProps {
  admin: AdminCredential;
  onLogout: () => void;
}

export default function Dashboard({ admin, onLogout }: DashboardProps) {
  if (admin.level === 4) {
    return <Level4Dashboard admin={admin} onLogout={onLogout} />;
  }
  return <Level1to3Dashboard admin={admin} onLogout={onLogout} />;
}
