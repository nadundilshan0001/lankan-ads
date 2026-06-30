const { createClient } = require("@supabase/supabase-js");

const url = "https://dazzyycudyveypaiqmgs.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenp5eWN1ZHl2ZXlwYWlxbWdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ5MDIxNSwiZXhwIjoyMDk4MDY2MjE1fQ.KYODqiurvHQuFWQbsahSkjYDddE_630iPP49UzTY-kU";

const supabase = createClient(url, serviceKey);

async function run() {
  // Let's run a RPC SQL call or look at the error when trying to fetch payhere_payment_id column specifically
  const { data, error } = await supabase
    .from("payments")
    .select("payhere_payment_id")
    .limit(1);

  if (error) {
    console.log("Error querying payhere_payment_id:", error.message);
  } else {
    console.log("Column exists! First row:", data);
  }
}

run();
