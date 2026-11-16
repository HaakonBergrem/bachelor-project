import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/app/utils/supabaseBikedetails'

/**
 * Fetches a service by service id from 'service' table.
 * This function attempts to fetch a complete single record of service from the 'service' table.
 * Errors during the fetch process is logged to console.
 * @param {Number} service_id -  Unique id of service to get service details.
 * @returns {Object||null} Returns a promise of a single record of service details if successful, returns null if not successful.
 **/
export async function fetchServiceById(service_id){
    try{
        const {data, error} = await supabase
            .from('service')
            .select('*')
            .eq('service_id', service_id)
        if(error){
            console.error("Error fetching service data by service id.");
            return null;
        }

    }catch (error){
        console.error("Error fetching service data.");
        return null;
    }
}

/**
 * Fetches all service types from 'service' table.
 * The function gets all service types of services.
 * Errors during the fetch process is logged to console.
 * @returns {Promise<Object||null>} - Returns a promise in array of service type strings if successful,returns null if an error occurs during the query or filtering process.
 **/
export async function fetchAllServiceTypes(){
    try{
        const {data, error} = await supabase
            .from('service')
            .select('service_type')

        if(error){
            console.error("Error fetching all service types.");
            return null;
        }
        const notnullData = data.filter(item => item.service_type && item.service_type.trim() !== '');
        return notnullData;
    }catch(error){
        console.error("Error fetching service types.")
    }
}

/**
 * Fetches all service details related to a service id from the 'service' table.
 * This function queries for a single record with given service id and tries to return a object of service.
 * Errors while fetch process is displayed in console.
 * @param {Number} service_id - Unique id of service to get service details.
 * @returns {Promise<Object||null>} - Returns a promise of service details if successful, returns null if not successful.
 **/
export async function fetchServiceDetailsByServiceId(service_id) {
    try {
        const { data, error } = await supabase
            .from('service')
            .select('*')
            .eq('service_id', service_id)
            .single();

        if (error) {
            console.error("Error getting service details by service id.");
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching services types.');
        return null;
    }
}

/**
 * Fetches details about service status related to a service ID from the 'service' table.
 * This function queries for service status for a specific service ID.
 * @param {Number} service_id - Unique id for a service to get service status.
 * @Returns {Promise<Object||null>} - Returns a promise with service status of service if successful, returns null if not successful.
 **/

export async function fetchServiceStatusByServiceId(service_id){
    try{
        const { data, error} = await supabase
            .from('service')
            .select('*')
            .eq('service_id', service_id)
            .single();
        if(error){
            console.error('Error getting service status from service.');
            return null;

        }
        return data;
        } catch(error){
        console.error('Error fetching service status.');
        return null;
    }
}

/**
 * Fetches details about an employee associated with a specific service ID from 'service' table.
 * The function queries for service_id and employee_id and joins on the employee id from the 'employee' table.
 * @param {Number} service_id - Unique id of service to get employee data
 * @returns {Promise<Object||null>} - Returns a single promise with employee data if successful, returns null if not successful.
 **/
export async function fetchEmployeeDetailsByServiceId(service_id){
    try{
        const{ data, error } = await supabase
            .from('service')
            .select('service_id, employee_id, employee_id (first_name, last_name)')
            .eq('service_id', service_id)
            .single();
        if(error){
            console.error("Error getting employee details by service id.");
            return null;
        }
        return data;
    }catch(error){
        console.error("Error fetching employee details.");
        return null;
    }
}

/**
 * Fetches all customer data from the 'employee' table.
 * The function gets all rows of employees in the database.
 * Errors during the fetch process is logged to console.
 * @returns {Promise<Object||null>} - Returns a promise with all employee data if successful, returns null if not successful.
 **/
export async function fetchAllEmployees(){
    try{
        const{data, error} = await supabase
            .from('employee')
            .select('employee_id, first_name, last_name');

        if(error){
            console.error("Error fetching all employees.");
            return null;
        }
        return data;
    }catch(error){
        console.error('Error in fetchAllEmployees function.');
        return [];
    }
}

/**
 * Updates service details in the 'service' table based on the provided service ID.
 * The function accepts objects for service and booking details.
 * This function checks for any errors during the update operation and logs relevant messages.
 * @param {Object} serviceDetails - The details of the service to be updated.
 * @param {Object} bookingDetails - The details of the booking related to the service.
 * @param {number|string} service_id - The unique identifier for the service to update. This should match serviceDetails.service_id for successful update.
 * @returns {Promise<boolean>} Returns a promise that is true if the update was successful,false if there was an error during the update process.
 **/
export async function updateServiceDetails(serviceDetails, bookingDetails, service_id){
    try{
    const {data, error} = await supabase
        .from('service')
        .update({
            employee_id: serviceDetails.employee_id,
            service_status: serviceDetails.service_status,
            service_type: serviceDetails.service_type,
            service_location: serviceDetails.service_location,
            service_length: serviceDetails.service_length,
            service_damage: serviceDetails.service_damage,
            service_cost: serviceDetails.service_cost,
            service_sparePartCost: serviceDetails.service_sparePartCost,
            service_totalCost: serviceDetails.service_totalCost,
            service_name: serviceDetails.service_name,
            service_description: serviceDetails.service_description,
            service_report: serviceDetails.service_report,
        })
        .eq('service_id', serviceDetails.service_id);
    if(error){
        console.error("Error updating service details.");
        return false;
    } else {
        console.log("Service details updated successfully.");
        return true;
    }
    }catch(error){
        console.error("Not able to update the service details.");
        return false;
    }
}

/**
 * Fetches customer details by a service id.
 * This function queries the 'service' table to get a single record of customer details.
 * It joins data from 'booking' table and 'service' table.
 * @param {Number} service_id - Unique id of service to get customer data related to the id
 * @returns {Promise<Object||null>} Returns a promise with customer data if successful, returns null if not successful.
 **/
export async function fetchCustomerDetailsByServiceId(service_id){
    try{
        const {data, error} = await supabase
            .from('service')
            .select('service_id, booking_id,booking: booking_id (booking_id,firstname, lastname,phone,email, service_type_id, asset_nr, tyre_change, comments, created_at, booking_date, booking_time)')
            .eq('service_id',service_id)
            .single();
        if(error){
            console.error("Error getting customer details from service.");
            return null;
        }
        return data;
    }catch(error){
        console.error("Error fetching customer details.");
        return null;
    }
}
