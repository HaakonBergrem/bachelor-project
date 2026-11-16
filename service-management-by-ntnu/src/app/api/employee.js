/* Api-calls related to the employee-table in supabase */

import { supabase } from '@/app/utils/supabaseClient';

export async function fetchAllEmployees(){
  const { data, error } = await supabase
    .from('employee')
    .select('*')

  if (error) {
    throw new Error('Failed to fetch employees');
  }
  return data;
}

export async function fetchEmployeeById(employeeId){
  const {data, error} = await supabase
    .from('employee')
    .select('*')
    .eq('employee_id', employeeId)

    if (error) {
      throw new Error('Failed to fetch employee');
    }
    return data;
}

export async function fetchEmployeeByEmail(email){
  const {data, error} = await supabase
    .from('employee')
    .select('*')
    .eq('mail', email)

    if (error) {
      throw new Error('Failed to fetch employee');
    }
    return data;
}


export async function updateEmployeeExceptMail(employeeId, firstName, lastName) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .update({
        first_name: firstName,
        last_name: lastName
      })
      .eq('employee_id', employeeId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error('Failed to update employee');
  }
}

export async function updateEmployeeMail(oldEmail, newEmail) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .update({
        mail: newEmail
      })
      .eq('mail', oldEmail);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error('Failed to update employee');
  }
}


export async function addEmployee(firstName, lastName, email) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          mail: email
        }
      ]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error('Failed to add employee');
  }
}

export async function deleteEmployee(employeeId) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .delete()
      .eq('employee_id', employeeId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw new Error('Failed to delete employee');
  }
}

