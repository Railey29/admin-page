"use client";
import { useState, useEffect, useCallback } from "react";

export interface SubmissionRecord {
  id: number;
  tracking_id: string;
  control_no: string | null;
  effective_date: string | null;
  office_code: string | null;
  submitted_at: string | null;
  status: string | null;
  approved_by_l1: boolean | null;
  approved_by_l2: boolean | null;
  approved_by_l3: boolean | null;
  approved_by_l4: boolean | null;
  uaa_user_info: {
    last_name: string | null;
    first_name: string | null;
    middle_name: string | null;
    designation: string | null;
    employee_id: string | null;
    contact_no: string | null;
    email: string | null;
  }[];
  uaa_system_access: {
    account_type: string | null;
    existing_sub: string | null;
    from_office_code: string | null;
    to_office_code: string | null;
    user_type: string | null;
    login_mode: string | null;
  }[];
  uaa_modules: {
    selected_modules: string[];
    others_text: string | null;
  }[];
}

export function useSubmissions(level: number) {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/submissions");
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data);
      } else {
        setError(json.error);
      }
    } catch (e) {
      setError("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const approve = async (id: number) => {
    const res = await fetch("/api/submissions/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, level }),
    });
    const json = await res.json();
    if (json.success) fetchSubmissions();
    return json.success;
  };

  const reject = async (id: number) => {
    const res = await fetch("/api/submissions/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    if (json.success) fetchSubmissions();
    return json.success;
  };

  // Filter based on level
  const pendingForMe = submissions.filter((s) => {
    if (s.status === "Rejected") return false;
    if (level === 1) return !s.approved_by_l1 && s.status !== "Rejected";
    if (level === 2) return s.approved_by_l1 && !s.approved_by_l2;
    if (level === 3) return s.approved_by_l2 && !s.approved_by_l3;
    if (level === 4) return s.approved_by_l3 && !s.approved_by_l4;
    return false;
  });

  const stats = {
    total: submissions.length,
    pending: pendingForMe.length,
    approved: submissions.filter((s) => {
      if (level === 1) return s.approved_by_l1;
      if (level === 2) return s.approved_by_l2;
      if (level === 3) return s.approved_by_l3;
      if (level === 4) return s.approved_by_l4;
      return false;
    }).length,
    rejected: submissions.filter((s) => s.status === "Rejected").length,
  };

  return {
    submissions,
    pendingForMe,
    stats,
    loading,
    error,
    approve,
    reject,
    refresh: fetchSubmissions,
  };
}
