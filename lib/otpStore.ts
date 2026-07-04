import { supabaseAdmin } from "@/lib/db/supabase";

export interface OtpData {
  otpCode: string;
  expiresAt: Date;
  used: boolean;
  attempts: number; 
}

export const otpStore = {
  
  async get(key: string): Promise<OtpData | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from("otps")
        .select("*")
        .eq("phone_number", key)
        .maybeSingle();

      if (error || !data) return null;

      return {
        otpCode: data.otp_code,
        expiresAt: new Date(data.expires_at),
        used: data.used,
        attempts: data.attempts,
      };
    } catch (err) {
      console.error("[Supabase OTP] Error fetching OTP key:", key, err);
      return null;
    }
  },

  
  async set(key: string, data: OtpData): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from("otps")
        .upsert({
          phone_number: key,
          otp_code: data.otpCode,
          expires_at: new Date(data.expiresAt).toISOString(),
          used: data.used,
          attempts: data.attempts,
        });

      if (error) {
        console.error("[Supabase OTP] Error setting OTP key:", key, error.message);
      }
    } catch (err) {
      console.error("[Supabase OTP] Error setting OTP key:", key, err);
    }
  },

  
  async delete(key: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from("otps")
        .delete()
        .eq("phone_number", key);
      
      if (error) {
        console.error("[Supabase OTP] Error deleting OTP key:", key, error.message);
      }
    } catch (err) {
      console.error("[Supabase OTP] Error deleting OTP key:", key, err);
    }
  }
};
