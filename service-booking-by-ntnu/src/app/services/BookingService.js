/**
 * Function to get all the servicetypes from the database
 * @param client - Supabase client
 * @returns {Promise<*>} - Returns the servicetypes from the database
 * @throws {Error} - Throws an error if the request fails
 */
export async function getServiceTypes(client) {
    let { data: service_type, error } = await client
        .from('service_type')
        .select('*');

    if (error) {
        throw error;
    }

    return service_type;
}

/**
 * Function to get the unavailable time slots for a given date
 * @param client - Supabase client
 * @param selectedDate - The selected date
 * @returns {Promise<{bookedServices: *, notAvailable: *}>} - Returns the unavailable time slots and the booked services
 */
export async function getUnavailableTimeSlots(client, selectedDate) {
    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    let { data: notAvailable, error: notAvailableError } = await client
        .from('not_available')
        .select('*')
        .eq('date', formattedDate);

    let { data: bookedServices, error: bookedServicesError } = await client
        .from('booking')
        .select('booking_time')
        .eq('booking_date', formattedDate);

    if (notAvailableError) {
        throw notAvailableError;
    }

    if (bookedServicesError) {
        throw bookedServicesError;
    }

    return {notAvailable, bookedServices};
}

/**
 * Function to get the number of employees
 * @param client - Supabase client
 * @returns {Promise<*>} - Returns the number of employees
 */
export async function getNrOfEmployees(client) {
    let { data: employees, error } = await client
        .from('employee')
        .select('employee_id');

    if (error) {
        throw error;
    }

    return employees.length;
}

/**
 * Function to post a booking to the database
 * @param client - Supabase client
 * @param booking - The booking details
 * @returns {Promise<*>} - Returns the booking details
 */
export async function postBooking(client, booking) {

    const { data, error } = await client
        .from('booking')
        .insert([
            { firstname: booking.firstName, lastname: booking.lastName, email: booking.email, phone: booking.phone,
                booking_date: booking.date, booking_time: booking.time, tyre_change: booking.tyreChange,
                comments: booking.notes, service_type_id: booking.id, asset_nr: booking.bikeNr }
        ])
        .select()

    if (error) {
        throw error;
    }

    return data;
}