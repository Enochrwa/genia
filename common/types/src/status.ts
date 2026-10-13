import { z } from "zod";

export const DEPOSIT_STATUSES = ["CREATED", "PENDING", "COMPLETED", "FAILED", "EXPIRED"] as const;
export const WITHDRAWAL_STATUSES = [
  "REQUESTED",
  "RISK_REVIEW",
  "APPROVED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REVERSED",
] as const;

export type DepositStatus = (typeof DEPOSIT_STATUSES)[number];
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

export const DepositStatusSchema = z.enum(DEPOSIT_STATUSES);
export const WithdrawalStatusSchema = z.enum(WITHDRAWAL_STATUSES);

const DEPOSIT_TRANSITIONS: Record<DepositStatus, readonly DepositStatus[]> = {
  CREATED: ["PENDING", "FAILED"],
  PENDING: ["COMPLETED", "FAILED", "EXPIRED"],
  COMPLETED: [],
  FAILED: [],
  EXPIRED: [],
};

const WITHDRAWAL_TRANSITIONS: Record<WithdrawalStatus, readonly WithdrawalStatus[]> = {
  REQUESTED: ["RISK_REVIEW", "APPROVED", "FAILED"],
  RISK_REVIEW: ["APPROVED", "FAILED"],
  APPROVED: ["PROCESSING", "FAILED"],
  PROCESSING: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: ["REVERSED"],
  REVERSED: [],
};

export function canTransitionDeposit(from: DepositStatus, to: DepositStatus): boolean {
  return DEPOSIT_TRANSITIONS[from].includes(to);
}

export function canTransitionWithdrawal(from: WithdrawalStatus, to: WithdrawalStatus): boolean {
  return WITHDRAWAL_TRANSITIONS[from].includes(to);
}
