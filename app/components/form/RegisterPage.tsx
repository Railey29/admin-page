"use client";
import { useState } from "react";

interface RegisterPageProps {
  onRegister: (data: {
    ltoEmployeeNumber: string;
    firstName: string;
    middleName: string;
    lastName: string;
    office: string;
    designation: string;
    level: number;
    username: string;
    password: string;
  }) => boolean | Promise<boolean>;
  onBackToLogin?: () => void;
}

const DESIGNATION_OPTIONS = [
  {
    label: "Select your designation and level",
    value: "",
    designation: "",
    office: "",
  },
  {
    label: "Chief of Office — Level 1",
    value: "1",
    designation: "Chief of Office",
    office: "Chief of Office",
  },
  {
    label: "Regional Director — Level 2",
    value: "2",
    designation: "Regional Director",
    office: "Regional Director",
  },
  {
    label: "Division Chief — Level 3",
    value: "3",
    designation: "Division Chief",
    office: "Division Chief",
  },
  {
    label: "Implementor / IT Officer — Level 4",
    value: "4",
    designation: "Implementor / IT Officer",
    office: "Implementor / IT Officer",
  },
];

export default function RegisterPage({
  onRegister,
  onBackToLogin,
}: RegisterPageProps) {
  const [form, setForm] = useState({
    ltoEmployeeNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    office: "",
    designation: "",
    level: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === "level") {
      const selected = DESIGNATION_OPTIONS.find((o) => o.value === value);
      setForm((prev) => ({
        ...prev,
        level: value,
        designation: selected?.designation ?? "",
        office: selected?.office ?? "", // ← office is now set from dropdown
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.level) {
      setError("Please select your designation and access level.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const success = await onRegister({
      ltoEmployeeNumber: form.ltoEmployeeNumber,
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      office: form.office, // ← from dropdown
      designation: form.designation, // ← from dropdown
      level: Number(form.level),
      username: form.username,
      password: form.password,
    });

    if (!success) {
      setError("Registration failed. Please try again.");
    }

    setIsLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "0.875rem",
    color: "#374151",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    backgroundColor: "#ffffff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "6px",
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: "18px",
  };

  const textFields: {
    label: string;
    name: keyof typeof form;
    type?: string;
    placeholder: string;
  }[] = [
    {
      label: "LTO Employee Number",
      name: "ltoEmployeeNumber",
      placeholder: "Enter your LTO employee number",
    },
    {
      label: "First Name",
      name: "firstName",
      placeholder: "Enter your first name",
    },
    {
      label: "Middle Name",
      name: "middleName",
      placeholder: "Enter your middle name",
    },
    {
      label: "Last Name",
      name: "lastName",
      placeholder: "Enter your last name",
    },
    {
      label: "Username",
      name: "username",
      placeholder: "Choose a username",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
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
          Create Account
        </h2>
        <p
          style={{
            color: "#6b7280",
            fontSize: "0.875rem",
            marginBottom: "28px",
          }}
        >
          Fill in your details to create your admin account.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Text fields */}
          {textFields.map((field) => (
            <div key={field.name} style={fieldStyle}>
              <label style={labelStyle}>{field.label}</label>
              <input
                type={field.type ?? "text"}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.name !== "middleName"}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          ))}

          {/* Designation / Office dropdown */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Designation / Office</label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              required
              style={{
                ...inputStyle,
                appearance: "none",
                WebkitAppearance: "none",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                paddingRight: "36px",
                cursor: "pointer",
                color: form.level ? "#374151" : "#9ca3af",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            >
              {DESIGNATION_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.value === ""}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            {form.level && (
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "#1d4ed8",
                  marginTop: "6px",
                  marginBottom: 0,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  borderRadius: "6px",
                  padding: "6px 10px",
                }}
              >
                ℹ️ You will be assigned to the{" "}
                {form.level === "4"
                  ? "Level 4 Implementor"
                  : `Level ${form.level}`}{" "}
                dashboard upon login.
              </p>
            )}
          </div>

          {/* Password */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                style={{ ...inputStyle, paddingRight: "48px" }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  userSelect: "none",
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                required
                style={{ ...inputStyle, paddingRight: "48px" }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  userSelect: "none",
                }}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
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
            {isLoading ? "Submitting..." : "Register →"}
          </button>
        </form>

        {/* Back to login */}
        <p
          style={{
            textAlign: "center",
            color: "#9ca3af",
            fontSize: "0.75rem",
            marginTop: "20px",
          }}
        >
          Already have an account?{" "}
          <button
            onClick={onBackToLogin}
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
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
