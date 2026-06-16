export type ReactivationPhase =
  | "NOT_EXPIRED"
  | "NO_EXPIRED_CYCLE"
  | "REACTIVATION_VIA_ADMIN"
  | "NO_SLOT_AVAILABLE"
  | "SELF_REACTIVATION"
  | "PROBATION_PERIOD"
  | "COOLDOWN_PERIOD"
  | "PENDING_REQUEST";

export interface ReactivationCheckResponse {
  eligible: boolean;
  agentStatus: string;
  expiredAt?: string | Date;
  daysExpired?: number;
  remainingDays?: number;
  phase?: ReactivationPhase;
  message: string;
}