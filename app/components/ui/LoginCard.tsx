"use client";

interface LoginCardProps {
  username: string;
  password: string;
  error: string;
  isLoading: boolean;
  onUsernameChange: (val: string) => void;
  onPasswordChange: (val: string) => void;
  onLogin: () => void;
}

export function LoginCard({
  username,
  password,
  error,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}: LoginCardProps) {
  return (
    <div className="login-card">
      <h2>Admin Portal</h2>
      <p className="subtitle">
        Sign in with your admin credentials to review pending requests.
      </p>

      <div className="form-group">
        <label>Username</label>
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
        />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onLogin()}
        />
      </div>

      {error && (
        <div className="field-error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}

      <button className="btn-primary" onClick={onLogin} disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign In →"}
      </button>

      <a href="#" className="back-link">
        ← Back to submission form
      </a>
    </div>
  );
}
