/* Api-calls related to the service-table in supabase. The table has foreign keys, which means the methods have to add the 
connected table(s) together before returning the data */

import { supabase } from '@/app/utils/supabaseClient';

export async function fetchAllServices(){
  try {
    const { data: services, error: serviceError } = await supabase
    .from('service')
    .select('*');

    if (serviceError) {
      throw new Error('Failed to fetch services');
    }

    // Fetch alle bookings connected to the services
    const bookingIds = services.map(service => service.booking_id);
    const { data: bookings, error: bookingError } = await supabase
      .from('booking')
      .select('*')
      .in('booking_id', bookingIds);

    if (bookingError) {
      throw new Error('Failed to fetch bookings');
    }

    // Add booking-data to the service-elements
    const servicesWithBookings = services.map(service => {
      const booking = bookings.find(booking => booking.booking_id === service.booking_id);
      return { ...service, booking };
    });
    return servicesWithBookings;
    
  } catch (error) {
    throw new Error('Failed to fetch services and bookings');
  }
}

// Fetches all services registered on an employee
export async function fetchServicesByEmployeeId(employeeId) {
  try {
    const { data: services, error: serviceError } = await supabase
    .from('service')
    .select('*')
    .eq('employee_id', employeeId);

    if (serviceError) {
      throw new Error('Failed to fetch services');
    }

    // Fetch alle bookings connected to the services
    const bookingIds = services.map(service => service.booking_id);
    const { data: bookings, error: bookingError } = await supabase
      .from('booking')
      .select('*')
      .in('booking_id', bookingIds);

    if (bookingError) {
      throw new Error('Failed to fetch bookings');
    }

    // Add booking-data to the service-elements
    const servicesWithBookings = services.map(service => {
      const booking = bookings.find(booking => booking.booking_id === service.booking_id);
      return { ...service, booking };
    });
    return servicesWithBookings;
    
  } catch (error) {
    throw new Error('Failed to fetch services and bookings');
  }
}

// Fetches all services registered on an employee within a given month
export async function fetchServicesByMonthAndEmployeeId(startOfMonth, endOfMonth, employeeId) {
  try {
    const { data: services, error: serviceError } = await supabase
      .from('service')
      .select('*')
      .eq('employee_id', employeeId);

    if (serviceError) {
      throw new Error('Failed to fetch services');
    }

    // Fetch alle bookings connected to the services
    const bookingIds = services.map(service => service.booking_id);
    const { data: bookings, error: bookingError } = await supabase
      .from('booking')
      .select('*')
      .gte('booking_date', startOfMonth)
      .lte('booking_date', endOfMonth)
      .in('booking_id', bookingIds);

    if (bookingError) {
      throw new Error('Failed to fetch bookings');
    }

    // Add booking-data to the service-elements
    const servicesWithBookings = services.map(service => {
      const booking = bookings.find(booking => booking.booking_id === service.booking_id);
      return { ...service, booking };
    });
    return servicesWithBookings;
    
  } catch (error) {
    throw new Error('Failed to fetch services and bookings');
  }
}

// Fetches all services connected to a search-query (customer-email, customer-phone, or asset-nr). 
// For this method, both booking- and employee-data has to be added to the service
export async function fetchServicesBySearchQuery(query) {
  try {
    // Search for bookings based on customer-info or asset-nr
    const { data: bookings, error: bookingsError } = await supabase
      .from('booking')
      .select('*')
      .or(`email.ilike.*${query}*,phone.ilike.*${query}*,asset_nr.ilike.*${query}*`);

    if (bookingsError) {
      throw new Error('Failed to fetch bookings');
    }

    // Fetch alle booking-ids
    const bookingIds = bookings.map(booking => booking.booking_id);

    // Fetch services based on booking-ids
    const { data: services, error: servicesError } = await supabase
      .from('service')
      .select('*')
      .in('booking_id', bookingIds);

    if (servicesError) {
      throw new Error('Failed to fetch services');
    }

    // Add booking-data to services
    const servicesWithBookings = services.map(service => {
      const booking = bookings.find(booking => booking.booking_id === service.booking_id);
      return { ...service, booking };
    });

    // Fetch employees based on service-ids
    const employeeIds = servicesWithBookings.map(service => service.employee_id).filter(id => id !== null);
    const { data: employees, error: employeeError } = await supabase
      .from('employee')
      .select('*')
      .in('employee_id', employeeIds);

    if (employeeError) {
      throw new Error('Failed to fetch employees');
    }

     // Add employee-data to services
     const servicesWithBookingsAndEmployees = servicesWithBookings.map(service => {
      const employee = employees.find(employee => employee.employee_id === service.employee_id);
      return { ...service, employee };
    });
    return servicesWithBookingsAndEmployees;

  } catch (error) {
    throw new Error('Failed to fetch services and bookings and employees');
  }
}

// Creates services for all bookings not yet connected to a service
export async function createServicesForAllBookingsWithoutServices() {
  try {
    const { data: bookings, error: bookingsError } = await supabase
        .from('booking')
        .select('booking_id, comments, service_type_id');
    if (bookingsError) {
      console.error("Error fetching all bookings");
      return;
    }
    const { data: services, error: servicesError } = await supabase
        .from('service')
        .select('booking_id');

    if (servicesError) {
      console.error("Error fetching all services");
      return;
    }

    const bookingIdsWithServices = new Set(services.map(service => service.booking_id));
    const bookingsWithoutServices = bookings.filter(booking => !bookingIdsWithServices.has(booking.booking_id));

    if (bookingsWithoutServices.length === 0) {
      return;
    }

    for (const bookingDetails of bookingsWithoutServices) {
      const words = bookingDetails.comments ? bookingDetails.comments.split(' ') : ['Default', 'Service', 'Description'];
      const service_name = words.slice(0, 3).join(' ');
      const newService = {
        booking_id: bookingDetails.booking_id,
        service_description: bookingDetails.comments,
        service_name: service_name,
        service_status: "Not received",
        service_type: bookingDetails.service_type_id
      };

      const { error: insertError } = await supabase
          .from('service')
          .insert([newService]);

      if (insertError) {
        console.error("Error inserting new service for booking");
        continue;
      }
    }
  } catch (error) {
    console.error("Error creating services from bookings");
  }
}