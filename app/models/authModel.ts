export type AdminLevel = 1 | 2 | 3 | 4;

export interface AdminCredential {
  id: number;
  username: string;
  password: string;
  level: AdminLevel;
  displayName: string;
  role: string;
  office?: string;
}

export const ADMIN_CREDENTIALS: AdminCredential[] = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    level: 1,
    displayName: "Administrator",
    role: "Admin",
  },
];

export type ApprovalStatus = "pending" | "approved" | "rejected" | null;

export interface ApprovalRequest {
  id: string;
  applicantName: string;
  position: string;
  employeeId: string;
  dateSubmitted: string;
  dateApproved?: string;
  officeCode: string;
  accountType: string;
  modules: string[];
  level1Status: ApprovalStatus;
  level2Status: ApprovalStatus;
  level3Status: ApprovalStatus;
  level4Status: ApprovalStatus;
}
