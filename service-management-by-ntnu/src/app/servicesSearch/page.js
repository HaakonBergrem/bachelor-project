/* The "Search For Services" page. It allows the employee to search for services based on multiple parameters. */

"use client"

import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '@/app/components/header';
import Link from 'next/link';
import NotSignedIn from "@/app/components/notSignedIn"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchServicesBySearchQuery } from '@/app/api/service';
import { fetchEmployeeByEmail } from '@/app/api/employee';

import { getUser } from '@/app/authServerComponents/getUser';

export default function ServicesSearch() {
  const [query, setQuery] = useState('');

  const [services, setServices] = useState([]);
  const [employee, setEmployee] = useState();

  const [dataLoaded, setDataLoaded] = useState(false);

  async function fetchEmployee() {
    try {
      const user = await getUser();
      const employee = await fetchEmployeeByEmail(user.email);
      setEmployee(employee);
    } catch (error) {
      console.error('Failed to fetch employee data');
    }
    finally{
      setDataLoaded(true);
    }
  }

  useEffect(() => {
    fetchEmployee();
  }, []);

  // Searches for services mathing the query and sorts them from newest to oldest
  const handleSearch = async () => {
    let serviceData;
    try {
        serviceData = await fetchServicesBySearchQuery(query);
    } catch (error) {
        console.error('Failed to fetch services');
    }
    if (serviceData && serviceData.length > 0) {
        serviceData.sort((a, b) => new Date(b.booking.booking_date) - new Date(a.booking.booking_date));
        setServices(serviceData);
    } else {
        toast.error('No services found');
        setServices([]);
    }
  } 

   // Shows NotSignedIn-component if the user is not signed in 
  if (dataLoaded) {
    if(!employee || employee.length == 0) {
        return <NotSignedIn />;
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
 
  return (
    <main className="container min-h-screen max-w-full">
      <Head>
        <title>Search for services</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header />
      {dataLoaded ? (
      <div className="flex flex-col mx-auto mt-8 w-5/12">
      <h2 className="text-lg font-semibold mb-4">Search for services</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Customer-phone, customer-email, bike-assetNr"
          className="mb-4 px-4 py-2 border border-gray-300 rounded-md"
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSearch} className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded">
          Search
        </button>
        <p className="mt-5">Showing <strong>{services.length}</strong> services</p>
        <div className="mt-8">
          {services.map((service) => (
              <div key={service.id} className="bg-gray-100 p-4 mb-4 rounded-md">
                  <p><strong>Name: </strong>{service.service_name}</p>
                  <p><strong>Booking date: </strong>{service.booking.booking_date}</p>
                  <p><strong>Employee: </strong>
                      {service.employee ? `${service.employee.first_name} ${service.employee.last_name}` : ''}
                  </p>
                  <p><strong>Customer phone: </strong>{service.booking.phone}</p>
                  <p><strong>Service cost: </strong>{service.service_cost}</p>
                  <Link
                      href={{
                          pathname: '/serviceBox',
                          query: {
                              serviceId: service.service_id
                          }
                      }}
                  >
                      <button
                          className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded mt-2">
                          Show details
                      </button>
                  </Link>
              </div>
          ))}
        </div>
      </div>
      ) : (
          <div className="w-1/2 flex justify-center items-center mt-8">
          <p className="text-center">Loading...</p>
        </div>
      )}
      <ToastContainer />
    </main>
  );
};