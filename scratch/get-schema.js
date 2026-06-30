const { createClient } = require("@supabase/supabase-js");

const url = "https://dazzyycudyveypaiqmgs.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhenp5eWN1ZHl2ZXlwYWlxbWdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQ5MDIxNSwiZXhwIjoyMDk4MDY2MjE1fQ.KYODqiurvHQuFWQbsahSkjYDddE_630iPP49UzTY-kU";

const supabase = createClient(url, serviceKey);

async function run() {
  // Query all column names of 'payments' table using postgres RPC/SQL (via a trick or by inserting a dummy to get schema back)
  // Let's query information_schema.columns via pg_graphql or similar if enabled, or select a non-existent column to see the full list of available columns in error message!
  const { data, error } = await supabase
    .from("payments")
    .insert({ invalid_column_name_test: "xyz" });

  if (error) {
    console.log("Full Schema Error:", error.message);
  }
}

run();
