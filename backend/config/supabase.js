// const { createClient } = require("@supabase/supabase-js");

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseKey) {
//     throw new Error(
//         "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env"
//     );
// }

// const supabase = createClient(
//     supabaseUrl,
//     supabaseKey
// );

// module.exports = supabase;
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

// Uses service role key to manage Auth and bypass strict client RLS during registration
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;