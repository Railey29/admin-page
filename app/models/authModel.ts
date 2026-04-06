export type AdminLevel = 1 | 2 | 3 | 4;

export interface AdminCredential {
  username: string;
  password: string;
  level: AdminLevel;
  displayName: string;
  role: string;
}

export const ADMIN_CREDENTIALS: AdminCredential[] = [
  {
    username: "admin1",
    password: "123",
    level: 1,
    displayName: "Chief of Office",
    role: "Level 1 Approver",
  },
  {
    username: "admin2",
    password: "123",
    level: 2,
    displayName: "Division Chief",
    role: "Level 2 Approver",
  },
  {
    username: "admin3",
    password: "123",
    level: 3,
    displayName: "Regional Director",
    role: "Level 3 Approver",
  },
  {
    username: "admin4",
    password: "123",
    level: 4,
    displayName: "System Administrator",
    role: "Level 4 — Implementor",
  },
];

export interface ApprovalRequest {
  id: string;
  applicantName: string;
  position: string;
  employeeId: string;
  dateSubmitted: string;
  dateApproved?: string;
  officeCode: string;
  accountType:
    | "New Account"
    | "Existing Account"
    | "Existing Account — Add Role";
  modules?: string[];
  // approval chain: null = not yet acted, true = approved, false = rejected
  level1Status: "pending" | "approved" | "rejected" | null;
  level2Status: "pending" | "approved" | "rejected" | null;
  level3Status: "pending" | "approved" | "rejected" | null;
  level4Status: "pending" | "approved" | "rejected" | null;
}
