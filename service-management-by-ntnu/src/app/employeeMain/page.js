/* The "Employee Main" page. It shows the signed in employee the active services registered on him, all active services, and
the 3 most recently booked, finished services. The employee can use the calendar to update his availability to customers,
and also see the dates and times he has bookings*/

"use client"

import Head from 'next/head'
import Link from 'next/link'
import Header from "@/app/components/header";
import Calendar from "@/app/components/calendar"
import NotSignedIn from "@/app/components/notSignedIn"

import {useEffect, useState} from 'react';

import { fetchServicesByEmployeeId ,createServicesForAllBookingsWithoutServices} from '@/app/api/service';
import { fetchAllServices } from '@/app/api/service';
import { fetchEmployeeByEmail } from '@/app/api/employee';

import { getUser } from '@/app/authServerComponents/getUser';

export default function EmployeeMain() {
  const [employee, setEmployee] = useState();
  const [employeeId, setEmployeeId] = useState();

  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [finishedServices, setFinishedServices] = useState([]);

  const [dataLoaded, setDataLoaded] = useState(false);

  async function fetchEmployee() {
    try {
      const user = await getUser();
      const employee = await fetchEmployeeByEmail(user.email);
      setEmployee(employee);
      setEmployeeId(employee[0].employee_id)
    } catch (error) {
      console.error('Failed to fetch employee data');
    }
    finally{
      setDataLoaded(true);
    }
  }

  function updateServices(){
    if (employeeId !== undefined) {
      Promise.all([
        fetchServicesByEmployeeId(employeeId),
        fetchAllServices(),
        createServicesForAllBookingsWithoutServices()
      ]).then(([filteredServicesData, servicesData]) => {
        // Finds the 3 newest services that are finished or cancelled
        const finishedServicesData = filteredServicesData
            .filter(service => service.service_status === "Finished" || service.service_status === "Cancelled")
            .sort((a, b) => new Date(b.booking.booking_date) - new Date(a.booking.booking_date))
            .slice(0, 3);
        setFinishedServices(finishedServicesData);

        // Filter out the services that are finished and cancelled
        const filteredServices = filteredServicesData.filter(service => service.service_status !== "Finished" && service.service_status !== "Cancelled");
        const services = servicesData.filter(service => service.service_status !== "Finished" && service.service_status !== "Cancelled");

        // Sort the services after booking date
        filteredServices.sort((a, b) => new Date(a.booking.booking_date) - new Date(b.booking.booking_date));
        services.sort((a, b) => new Date(a.booking.booking_date) - new Date(b.booking.booking_date));

        setFilteredServices(filteredServices);
        setServices(services);
      });
    }
  }

  useEffect(() => {
    fetchEmployee();
  }, []);

  // Updates services when employeeId is set
  useEffect(() => {
    updateServices();
  }, [employeeId]);

  // Removes seconds from booking-time
  function formatTime(booking_time){
    const bookingTimeParts = booking_time.split(':');
    const formattedBookingTime = `${bookingTimeParts[0]}:${bookingTimeParts[1]}`;

    return formattedBookingTime
  }

  // Shows NotSignedIn-component if the user is not signed in
  if (dataLoaded) {
    if(!employee || employee.length == 0) {
      return <NotSignedIn />;
    }
  }

  // Gives color to service based on status
  function getServiceStatusColor(status) {
    switch (status) {
      case "Not received":
        return "bg-gray-500";
      case "Received":
        return "bg-blue-500";
      case "Started":
        return "bg-orange-500";
      case "Finished":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "";
    }
  }

  return (
      <main className="container min-h-screen ">
        <Head>
          <title>Employee - Main Page</title>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Header />
        {dataLoaded ? (
            <div className="flex flex-col md:flex-row gap-8 mx-auto p-8 w-screen font-sans text-base">

              <div className="flex-1 bg-white rounded-lg shadow-md p-4 w-2/3 top-0 relative">

                <div className="absolute top-1 w-full p-5">

                  <h2 style={{fontSize: '1.6rem'}} className="font-semibold mb-2">Active services (choose one to see
                    details)</h2>
                  <div className="flex flex-wrap justify-start items-center">
                    <div className="flex items-center mr-4 mb-2">
                      <div className="w-4 h-4 rounded-full mr-2 bg-gray-500"></div>
                      <p className="text-base">Not received</p>
                    </div>
                    <div className="flex items-center mr-4 mb-2">
                      <div className="w-4 h-4 rounded-full mr-2 bg-blue-500"></div>
                      <p className="text-base">Received</p>
                    </div>
                    <div className="flex items-center mr-4 mb-2">
                      <div className="w-4 h-4 rounded-full mr-2 bg-orange-500"></div>
                      <p className="text-base">Started</p>
                    </div>
                    <div className="flex items-center mr-4 mb-2">
                      <div className="w-4 h-4 rounded-full mr-2 bg-green-500"></div>
                      <p className="text-base">Finished</p>
                    </div>
                    <div className="flex items-center mr-4 mb-2">
                      <div className="w-4 h-4 rounded-full mr-2 bg-red-500"></div>
                      <p className="text-base">Cancelled</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <h2 style={{fontSize: '1.6rem'}} className="font-semibold">Your active services</h2>
                    <div className="bg-brand-base-500 hover:bg-brand-base-600 cursor-pointer px-4 py-2 mr-2">
                      <Link href="/servicesSearch">
                        <p className="text-sm font-semibold text-white whitespace-nowrap text-center">
                          Search for services
                        </p>
                      </Link>
                    </div>
                  </div>

                  <div className="main-container w-full mx-auto p-4 bg-white rounded-md">
                    <div className="sticky top-0 bg-white z-10 grid grid-cols-12 text-center font-bold py-2 w-full">
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">Service</div>
                      <div className="col-span-2">AssetNr</div>
                      <div className="col-span-3 mr-8">Name</div>
                      <div className="col-span-2 mr-5">Booking</div>
                      <div className="col-span-2 mr-5">Status Text</div>
                    </div>
                    <ul className="service-list overflow-auto"
                        style={{maxHeight: '10rem'}}>
                      {filteredServices.length > 0 ? (
                          filteredServices.map(service => (
                              <Link key={service.service_id} href={{
                                pathname: '/serviceBox',
                                query: {serviceId: service.service_id}
                              }} passHref>
                                <li className="flex items-center border hover:bg-gray-100 rounded mb-1 grid grid-cols-12 text-center py-2 w-full">
                                  <div className="col-span-1 flex justify-center items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full ${getServiceStatusColor(service.service_status)}`}></div>
                                  </div>
                                  <span className="col-span-2">{service.service_id}</span>
                                  <span className="col-span-2">{service.booking.asset_nr}</span>
                                  <span className="col-span-3">{service.service_name || 'No title'}</span>
                                  <span
                                      className="col-span-2 ml-10">{service.booking.booking_date} {formatTime(service.booking.booking_time)}</span>
                                  <span className="col-span-2 ml-10">{service.service_status}</span>
                                </li>
                              </Link>
                          ))
                      ) : (
                          <li className="text-center w-full">No services found.</li>
                      )}
                    </ul>
                  </div>

                  <div className="main-container w-full mx-auto p-4 bg-white rounded-md">
                    <h2 style={{fontSize: '1.6rem'}} className="font-semibold ">All active services</h2>
                    <div
                        className="sticky top-0 bg-white z-10 grid grid-cols-12 text-center font-bold   w-full">
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">Service</div>
                      <div className="col-span-2">AssetNr</div>
                      <div className="col-span-3 mr-8">Name</div>
                      <div className="col-span-2 mr-5">Booking</div>
                      <div className="col-span-2 mr-4">Status Text</div>
                    </div>
                    <ul className="service-list overflow-auto max-h-96 w-full mt-2"
                        style={{maxHeight: '16rem'}}>
                      {services.length > 0 ? (
                          services.map(service => (
                              <Link key={service.service_id} href={{
                                pathname: '/serviceBox',
                                query: {serviceId: service.service_id}
                              }} passHref>
                                <li className="flex items-center border hover:bg-gray-100 rounded mb-1 grid grid-cols-12 text-center py-2 w-full">
                                  <div className="col-span-1 flex justify-center items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full ${getServiceStatusColor(service.service_status)}`}></div>
                                  </div>
                                  <span className="col-span-2">{service.service_id}</span>
                                  <span className="col-span-2">{service.booking.asset_nr}</span>
                                  <span className="col-span-3">{service.service_name || 'No title'}</span>
                                  <span
                                      className="col-span-2 ml-12">{service.booking.booking_date} {formatTime(service.booking.booking_time)}</span>
                                  <span className="col-span-2 ml-10">{service.service_status}</span>
                                </li>
                              </Link>
                          ))
                      ) : (
                          <li className="text-center w-full">No services found.</li>
                      )}
                    </ul>
                  </div>

                  <div className="main-container w-full mx-auto p-4 bg-white rounded-md">
                    <h2 style={{fontSize: '1.6rem'}} className="font-semibold mb-4">Your 3 most recently booked,
                      finished services</h2>
                    <div
                        className="sticky top-0 bg-white z-10 grid grid-cols-12 text-center font-bold py-2 border-b w-full">
                      <div className="col-span-1">Status</div>
                      <div className="col-span-2">Service</div>
                      <div className="col-span-2">AssetNr</div>
                      <div className="col-span-3">Name</div>
                      <div className="col-span-2">Booking</div>
                      <div className="col-span-2">Status Text</div>
                    </div>
                    <ul className="service-list overflow-auto max-h-96 w-full"
                        style={{maxHeight: '10rem'}}>
                      {finishedServices.length > 0 ? (
                          finishedServices.map(service => (
                              <Link key={service.service_id} href={{
                                pathname: '/serviceBox',
                                query: {serviceId: service.service_id}
                              }} passHref>
                                <li className="flex items-center border hover:bg-gray-100 rounded mb-1 grid grid-cols-12 text-center py-2 w-full">
                                  <div className="col-span-1 flex justify-center items-center">
                                    <div
                                        className={`w-4 h-4 rounded-full ${getServiceStatusColor(service.service_status)}`}></div>
                                  </div>
                                  <span className="col-span-2">{service.service_id}</span>
                                  <span className="col-span-2">{service.booking.asset_nr}</span>
                                  <span className="col-span-3">{service.service_name || 'No title'}</span>
                                  <span
                                      className="col-span-2">{service.booking.booking_date} {formatTime(service.booking.booking_time)}</span>
                                  <span className="col-span-2">{service.service_status}</span>
                                </li>
                              </Link>
                          ))
                      ) : (
                          <li className="text-center w-full">No finished services found.</li>
                      )}
                    </ul>
                  </div>

                </div>

              </div>

              <div className="bg-white rounded-lg shadow-md p-4 md:ml-auto md:w-40%">
                <h2 style={{fontSize: '1.3rem'}} className="font-semibold mb-4">Choose availability for customers</h2>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-black opacity-20 rounded-full mr-2"></div>
                  <p className="text-sm">Not available</p>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 bg-black rounded-full mr-2"></div>
                  <p className="text-sm">Available</p>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-4 h-4 border border-blue-600 border-4 mr-2 rounded-md"></div>
                  <p className="text-sm">Booking</p>
                </div>

                <Calendar/>
              </div>

            </div>
        ) : (
            <div className="w-1/2 flex justify-center items-center mt-8">
              <p className="text-center">Loading...</p>
            </div>
        )}
      </main>
  );
}