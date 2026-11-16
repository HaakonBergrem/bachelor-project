/* Creates a supabaseclient with the supabase-url and supabase-service-key. The client is used in the api-files where 
admin-priviliges are necesarry.
Had to change the service key to public to be able to get it*/

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabaseAdmin;





