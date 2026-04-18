export type AdminLevel = 1 | 2 | 3 | 4;

export interface AdminCredential {
  id: number;
  username: string;
  level: AdminLevel;
  displayName: string;
  role: string;
  office?: string;
}
