export const ROLES = [
  "USER",
  "SUPPORT",
  "QUESTION_MANAGER",
  "FINANCE",
  "ADMIN",
  "SUPER_ADMIN",
] as const;
export type Role = (typeof ROLES)[number];

export type Permission =
  | "users.read"
  | "users.suspend"
  | "questions.write"
  | "payouts.approve"
  | "tickets.handle"
  | "config.write"
  | "audit.read";

const MATRIX: Record<Role, readonly Permission[]> = {
  USER: [],
  SUPPORT: ["users.read", "tickets.handle"],
  QUESTION_MANAGER: ["questions.write"],
  FINANCE: ["payouts.approve", "audit.read"],
  ADMIN: ["users.read", "users.suspend", "questions.write", "tickets.handle", "audit.read"],
  SUPER_ADMIN: [
    "users.read",
    "users.suspend",
    "questions.write",
    "payouts.approve",
    "tickets.handle",
    "config.write",
    "audit.read",
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

/** Large payouts need dual control: approver must differ from requester and hold the permission. */
export function canApprovePayout(
  approverRole: Role,
  approverId: string,
  requesterId: string,
): boolean {
  return approverId !== requesterId && can(approverRole, "payouts.approve");
}
