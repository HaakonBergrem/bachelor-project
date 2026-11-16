/* Api-calls related to the admin-table in supabase */

import { supabase } from '@/app/utils/supabaseClient';

export async function fetchAllAdmins(){
  const { data, error } = await supabase
    .from('admin')
    .select('*')

  if (error) {
    throw new Error('Failed to fetch admins');
  }
  return data;
}

export async function fetchAdminByEmail(email){
    const {data, error} = await supabase
      .from('admin')
      .select('*')
      .eq('mail', email)
  
      if (error) {
        throw new Error('Failed to fetch admin');
      }
      return data;
}

export async function updateAdminExceptMail(adminId, firstName, lastName) {
  try {
    const { data, error } = await supabase
      .from('admin')
      .update({
        first_name: firstName,
        last_name: lastName
      })
      .eq('admin_id', adminId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error('Failed to update admin');
  }
}

export async function updateAdminMail(oldEmail, newEmail) {
  try {
    const { data, error } = await supabase
      .from('admin')
      .update({
        mail: newEmail
      })
      .eq('mail', oldEmail);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error('Failed to update admin');
  }
}