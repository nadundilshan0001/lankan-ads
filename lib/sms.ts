// ============================================================
// Lankan Ads — Notify.lk SMS Gateway Helper
// Sends OTP codes via notify.lk API
// ============================================================

interface SmsSendResult {
  success: boolean;
  error?: string;
}

/**
 * Formats a Sri Lankan phone number into international format
 * required by Notify.lk (e.g. 0771234567 -> 94771234567)
 */
function toNotifyFormat(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Already has country code 94
  if (digits.startsWith("94") && digits.length === 11) return digits;
  // Starts with 0 (local format)
  if (digits.startsWith("0") && digits.length === 10) return "94" + digits.slice(1);
  // Starts with 7 (no leading 0)
  if (digits.startsWith("7") && digits.length === 9) return "94" + digits;
  // Fallback - return as-is
  return digits;
}

/**
 * Sends an SMS message via Notify.lk
 */
export async function sendSms(to: string, message: string): Promise<SmsSendResult> {
  const userId = process.env.NOTIFY_LK_USER_ID;
  const apiKey = process.env.NOTIFY_LK_API_KEY;
  const senderId = process.env.NOTIFY_LK_SENDER_ID || "NotifyDEMO";

  if (!userId || !apiKey) {
    console.error("[SMS] NOTIFY_LK_USER_ID or NOTIFY_LK_API_KEY is not configured.");
    return { success: false, error: "SMS service is not configured." };
  }

  const formattedPhone = toNotifyFormat(to);

  const params = new URLSearchParams({
    user_id: userId,
    api_key: apiKey,
    sender_id: senderId,
    to: formattedPhone,
    message,
  });

  try {
    const response = await fetch(
      `https://app.notify.lk/api/v1/send?${params.toString()}`,
      {
        method: "GET",
        headers: { "Accept": "application/json" },
        // 10 second timeout
        signal: AbortSignal.timeout(10000),
      }
    );

    const text = await response.text();

    // Notify.lk returns plain text "success" or JSON with error
    if (response.ok && (text.toLowerCase().includes("success") || text === "1")) {
      console.log(`[SMS] OTP sent successfully to ${formattedPhone}`);
      return { success: true };
    }

    // Try to parse error JSON
    let errorMsg = `SMS API error (HTTP ${response.status})`;
    try {
      const json = JSON.parse(text);
      errorMsg = json.message || json.error || errorMsg;
    } catch {
      errorMsg = text || errorMsg;
    }

    console.error(`[SMS] Failed to send to ${formattedPhone}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  } catch (err: any) {
    const msg = err?.name === "TimeoutError"
      ? "SMS gateway timed out. Please try again."
      : "Failed to reach SMS gateway.";
    console.error(`[SMS] Network error: ${err?.message}`);
    return { success: false, error: msg };
  }
}

/**
 * Builds and sends an OTP SMS message
 */
export async function sendOtpSms(phoneNumber: string, otpCode: string): Promise<SmsSendResult> {
  const message = `Your Lankan Ads verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code with anyone.`;
  return sendSms(phoneNumber, message);
}
