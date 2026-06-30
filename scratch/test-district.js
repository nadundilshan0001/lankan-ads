const { createClient } = require("@supabase/supabase-js");

const url = "https://dazzyycudyveypaiqmgs.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenp5eWN1ZHl2ZXlwYWlxbWdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ5MDIxNSwiZXhwIjoyMDk4MDY2MjE1fQ.KYODqiurvHQuFWQbsahSkjYDddE_630iPP49UzTY-kU";
const supabase = createClient(url, serviceKey);

async function check() {
  const { data, error } = await supabase
    .from("ads")
    .select("district")
    .limit(1);

  if (error) {
    console.error("DB connection error:", error);
  } else {
    console.log("DB select works. Testing insertion with 'All District'...");
    // Let's perform a dry run transaction rollback or test inserting a mock row
    const testAd = {
      user_id: "727a30ed-0915-41c2-8b93-41c9bc4cc73f",
      category: "spa",
      title_en: "District Test Ad",
      description_en: "District validation test listing description content.",
      contact_number: "0771234567|0771234567",
      district: "All District",
      city: "Colombo",
      ad_tier: "standard",
      slug: "test-slug-123",
      status: "pending"
    };

    const { data: insertData, error: insertError } = await supabase
      .from("ads")
      .insert(testAd)
      .select();

    if (insertError) {
      console.log("Insert failed:", insertError.message);
    } else {
      console.log("Insert succeeded! ID:", insertData[0].id);
      // Clean it up immediately
      await supabase.from("ads").delete().eq("id", insertData[0].id);
      console.log("Cleanup finished.");
    }
  }
}

check();
