import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlfbxrguytmndykaxbxv.supabase.co';
const supabaseKey = 'sb_publishable_lAdIkOMKRhc_krsvS3P2Pg_C76XQses';

export const supabase = createClient(supabaseUrl, supabaseKey);