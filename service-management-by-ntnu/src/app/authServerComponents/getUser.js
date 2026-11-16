/* Returns the signed in user */

"use server"
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getUser(){
    const cookieStore = cookies();
    const supabase = createServerComponentClient({cookies: () => cookieStore});
    
    const {data: {user}} = await supabase.auth.getUser();
    return user;
}
