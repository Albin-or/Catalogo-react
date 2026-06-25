import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eehfrohhtzwrdfceinlk.supabase.co/rest/v1/';
const supabaseAnonKey = 'sb_publishable_bHdXSlw2dXt_c8dTqnljmg_rxXcU7Rm';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
