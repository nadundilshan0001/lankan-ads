const { createClient } = require("@supabase/supabase-js");

const url = "https://dazzyycudyveypaiqmgs.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenp5eWN1ZHl2ZXlwYWlxbWdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ5MDIxNSwiZXhwIjoyMDk4MDY2MjE1fQ.KYODqiurvHQuFWQbsahSkjYDddE_630iPP49UzTY-kU";

const supabase = createClient(url, serviceKey);

async function run() {
  // Check for any ads stuck in pending status
  const { data: pendingAds, error } = await supabase
    .from("ads")
    .select("id, title_en, status")
    .eq("status", "pending");

  console.log("Pending ads count:", pendingAds?.length ?? 0);
  console.log("Pending ads:", JSON.stringify(pendingAds, null, 2));
  if (error) console.error("Error:", error.message);

  // If any pending ads found, fix them to active
  if (pendingAds && pendingAds.length > 0) {
    const ids = pendingAds.map(a => a.id);
    const { error: updateError, count } = await supabase
      .from("ads")
      .update({ status: "active" })
      .in("id", ids);

    if (updateError) {
      console.error("Failed to fix pending ads:", updateError.message);
    } else {
      console.log(`Fixed ${ids.length} pending ads -> active`);
    }
  } else {
    console.log("No pending ads found - database is clean.");
  }
}

run();
