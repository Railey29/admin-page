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
  // add more admins here as needed
];
