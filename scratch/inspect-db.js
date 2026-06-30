const { createClient } = require("@supabase/supabase-js");

const url = "https://dazzyycudyveypaiqmgs.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenp5eWN1ZHl2ZXlwYWlxbWdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ5MDIxNSwiZXhwIjoyMDk4MDY2MjE1fQ.KYODqiurvHQuFWQbsahSkjYDddE_630iPP49UzTY-kU";

const supabase = createClient(url, serviceKey);

async function run() {
  // Let's get one payment record to see the column names and sample values
  const { data: payments, error } = await supabase
    .from("payments")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error fetching payment:", error.message);
  } else {
    console.log("Sample Payment Record:", JSON.stringify(payments, null, 2));
  }
}

run();
