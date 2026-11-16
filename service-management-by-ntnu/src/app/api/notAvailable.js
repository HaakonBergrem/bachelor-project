/* Api-calls related to the not_available-table in supabase */

import { supabase } from '@/app/utils/supabaseClient';

// Fetches all not available-rows for a given month and employee
// Returns only date and time
export async function fetchNotAvailableByMonthAndEmployeeId(startOfMonth, endOfMonth, employeeId){
  const { data, error } = await supabase
      .from('not_available')
      .select('*') 
      .eq('employee_id', employeeId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth);
      
    if (error) {
      throw new Error('Failed to fetch not available');
    }
    const filteredData = data.map(entry => ({ date: entry.date, time: entry.time }));
  
    return filteredData;
}

// Updates not_available by not-available-list, month and employee
export async function updateNotAvailableByListAndMonthAndEmployeeId(notAvailableList, startOfMonth, endOfMonth, employeeId) {
  // Adds employee-id in every element in not-available-list
  const updatedNotAvailableList = notAvailableList.map(item => ({
    ...item,
    employee_id: employeeId
  }));
 
  // Tests inserting before deleting, so that the data won't get deleted if it's not possible to insert
  let { data: dataTest, error: errorTest } = await supabase
  .from('not_available')
  .insert(updatedNotAvailableList);

  if (errorTest) {
    throw new Error('Failed to update not available');
  }

  // Deletes all not-available-elements in the given month, for the given employee. Then inserts the updated list
  await supabase
    .from('not_available')
    .delete()
    .eq('employee_id', employeeId) 
    .gte('date', startOfMonth)
    .lte('date', endOfMonth);

  const { data, error }  = await supabase
  .from('not_available')
  .insert(updatedNotAvailableList);

  if (error) {
    throw new Error('Failed to update not available');
  }
  return data;
}