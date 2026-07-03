import { supabaseAdmin } from "@/lib/db/supabase";

function getCategoryEmoji(slug: string): string {
  switch (slug) {
    case "girls-personal": return "👩";
    case "boys-personal": return "👨";
    case "shemale-personal": return "👩‍🎤";
    case "live-cam": return "📹";
    case "spa-wellness": return "💆";
    case "cuckold-couples": return "👩‍❤️‍👨";
    case "gay": return "👨‍❤️‍👨";
    case "marriage-proposals": return "💍";
    default: return "📌";
  }
}

function getCategoryName(slug: string): string {
  switch (slug) {
    case "girls-personal": return "Girls Personal";
    case "boys-personal": return "Boys Personal";
    case "shemale-personal": return "Shemale Personal";
    case "live-cam": return "Live Cam Show";
    case "spa-wellness": return "Spa & Wellness";
    case "cuckold-couples": return "Cuckold Couples";
    case "gay": return "Gay";
    case "marriage-proposals": return "Marriage Proposals";
    default: return slug;
  }
}

export async function sendAdToTelegram(adId: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID || "@lankanadslk";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.lankanads.lk";

  if (!botToken) {
    console.warn("[TELEGRAM] TELEGRAM_BOT_TOKEN is not configured. Skipping notification.");
    return;
  }

  try {
    // 1. Fetch full ad details
    const { data: ad, error } = await supabaseAdmin
      .from("ads")
      .select("*")
      .eq("id", adId)
      .single();

    if (error || !ad) {
      console.error("[TELEGRAM] Failed to fetch ad details for Telegram post:", error);
      return;
    }

    // 2. Double check status and ensure it hasn't been posted yet
    if (ad.status !== "active") {
      console.warn("[TELEGRAM] Ad is not active. Skipping Telegram post.");
      return;
    }

    if (ad.telegram_posted) {
      console.log("[TELEGRAM] Ad has already been posted to Telegram. Skipping.");
      return;
    }

    // 3. Mark as posted in the database first to prevent double posting from concurrent requests
    const { error: updateError } = await supabaseAdmin
      .from("ads")
      .update({ telegram_posted: true })
      .eq("id", adId);

    if (updateError) {
      console.error("[TELEGRAM] Failed to mark ad as posted to Telegram:", updateError);
      return;
    }

    // 4. Build the message text
    const title = ad.title_en || ad.title_si;
    const categoryEmoji = getCategoryEmoji(ad.category);
    const categoryName = getCategoryName(ad.category);
    const location = ad.service_area || ad.district;
    const contact = ad.contact_number ? ad.contact_number.split("|")[0].trim() : "N/A";
    const adUrl = `${appUrl}/ad/${ad.slug}`;

    const text = `🔥 *New Ad Posted on LankanAds!* 🔥\n\n` +
                 `📌 *Category:* ${categoryEmoji} ${categoryName}\n` +
                 `✍️ *Title:* ${title}\n` +
                 `📍 *Location:* ${location}\n` +
                 `📞 *Contact:* ${contact}\n\n` +
                 `🔗 *View Ad Details:* ${adUrl}`;

    // 5. Send via Telegram Bot API
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[TELEGRAM] Telegram API response error:", errText);
      // Reset the flag so we can retry on next activation/webhook trigger
      await supabaseAdmin
        .from("ads")
        .update({ telegram_posted: false })
        .eq("id", adId).catch(() => {});
    } else {
      console.log(`[TELEGRAM] Successfully posted ad ${adId} to Telegram channel.`);
    }
  } catch (err) {
    console.error("[TELEGRAM] Exception posting ad to Telegram:", err);
    // Reset the flag in case of network/fetch errors
    await supabaseAdmin
      .from("ads")
      .update({ telegram_posted: false })
      .eq("id", adId).catch(() => {});
  }
}
