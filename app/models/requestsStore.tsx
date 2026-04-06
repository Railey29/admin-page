import { ApprovalRequest } from "../models/authModel";

// Shared in-memory store (in real app this would be a DB)
// Using a module-level variable to persist across re-renders in dev
let _requests: ApprovalRequest[] = [
  {
    id: "REQ-001",
    applicantName: "Dela Cruz, Juan Santos",
    position: "Officer I",
    employeeId: "LTO-12345",
    dateSubmitted: "Apr 2, 2026",
    officeCode: "NCR-CO",
    accountType: "New Account",
    modules: [
      "DLS Access and Examination",
      "MV Approving Officer",
      "MV Releasing Officer",
    ],
    level1Status: "pending",
    level2Status: null,
    level3Status: null,
    level4Status: null,
  },
  {
    id: "REQ-002",
    applicantName: "Reyes, Maria Lopez",
    position: "Senior Officer I",
    employeeId: "LTO-67890",
    dateSubmitted: "Apr 1, 2026",
    officeCode: "NCR-MO",
    accountType: "Existing Account",
    modules: ["MV Approving Officer", "MV Releasing Officer"],
    level1Status: "pending",
    level2Status: null,
    level3Status: null,
    level4Status: null,
  },
  {
    id: "REQ-003",
    applicantName: "Lim, Carlos Chan",
    position: "Senior Officer I",
    employeeId: "LTO-77889",
    dateSubmitted: "Mar 26, 2026",
    dateApproved: "Mar 26, 2026",
    officeCode: "R2-CO",
    accountType: "New Account",
    modules: ["MV Approving Officer", "MVIRS - Overview", "DLS Access"],
    level1Status: "approved",
    level2Status: "pending",
    level3Status: null,
    level4Status: null,
  },
];

export function getRequests(): ApprovalRequest[] {
  return _requests;
}

export function updateRequest(
  id: string,
  updates: Partial<ApprovalRequest>,
): void {
  _requests = _requests.map((r) => (r.id === id ? { ...r, ...updates } : r));
}
