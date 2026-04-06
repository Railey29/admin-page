import { ADMIN_CREDENTIALS, AdminCredential } from "../models/authModel";

export function validateAdminLogin(
  username: string,
  password: string,
): AdminCredential | null {
  const found = ADMIN_CREDENTIALS.find(
    (cred) => cred.username === username && cred.password === password,
  );
  return found || null;
}

export function getAdminByUsername(username: string): AdminCredential | null {
  return ADMIN_CREDENTIALS.find((c) => c.username === username) || null;
}
