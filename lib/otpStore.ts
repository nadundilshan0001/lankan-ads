




import { redis } from "./redis";

export interface OtpData {
  otpCode: string;
  expiresAt: Date;
  used: boolean;
  attempts: number; 
}

const REDIS_PREFIX = "otp:";

export const otpStore = {
  
  async get(key: string): Promise<OtpData | null> {
    try {
      const data = await redis.get<OtpData>(`${REDIS_PREFIX}${key}`);
      if (!data) return null;
      
      return {
        ...data,
        expiresAt: new Date(data.expiresAt),
      };
    } catch (err) {
      console.error("[Redis] Error fetching OTP key:", key, err);
      return null;
    }
  },

  
  async set(key: string, data: OtpData): Promise<void> {
    try {
      const expiresTime = new Date(data.expiresAt).getTime();
      const ttlSeconds = Math.max(0, Math.ceil((expiresTime - Date.now()) / 1000));
      
      if (ttlSeconds > 0) {
        await redis.set(`${REDIS_PREFIX}${key}`, data, { ex: ttlSeconds });
      } else {
        await redis.del(`${REDIS_PREFIX}${key}`);
      }
    } catch (err) {
      console.error("[Redis] Error setting OTP key:", key, err);
    }
  },

  
  async delete(key: string): Promise<void> {
    try {
      await redis.del(`${REDIS_PREFIX}${key}`);
    } catch (err) {
      console.error("[Redis] Error deleting OTP key:", key, err);
    }
  }
};
