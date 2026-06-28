// ============================================================
// Lankan Ads — In-Memory OTP Store for Resets & Verification
// Persists across Next.js hot-reloads in all environments
// ============================================================

export interface OtpData {
  otpCode: string;
  expiresAt: Date;
  used: boolean;
  attempts: number; // brute-force counter
}

const globalForOtp = global as unknown as {
  otpStore: Map<string, OtpData>;
};

// Always persist globally — do NOT gate on NODE_ENV (breaks production OTP)
export const otpStore = globalForOtp.otpStore ?? new Map<string, OtpData>();
globalForOtp.otpStore = otpStore;
