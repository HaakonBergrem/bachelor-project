"use client"

import Head from 'next/head'
import Link from 'next/link'
import Header from "@/app/components/Header";
import {supabase} from "@/app/utils/supabaseClient";
import {useEffect, useState} from "react";
import React from "react";
import {getServiceTypes} from "@/app/services/BookingService";

/**
 * Home page
 * Responsible for displaying the services available for booking
 */
export default function Home() {
    const [ services, setServices ] = useState([]);

    /**
     * Fetch service types when component mounts
     * This effect runs once when the component mounts.
     * It fetches the service types from the server and updates the state.
     */
    useEffect(() => {
        getServiceTypes(supabase).then((data) => {
            setServices(data);
        });

    }, []);


    return (
        <>
            <Head>
                <title>FIRMA Services</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <Header />

            <div className="min-h-screen bg-brand-base-50 flex flex-col justify-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Services Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {services?.map((service) => (
                            <div key={service.service_type_id} className="block bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg p-6">
                                <Link href={`/booking/${service.service_type_id}`}>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-3 text-brand-base-700">{service.name}</h2>
                                        <p className="text-brand-base-600 mb-3">{service.description}</p>
                                        <p className="text-brand-base-600 mb-5">{service.duration_minutes} min</p>
                                        <address className="not-italic mb-5 text-brand-base-600">
                                            {service.address.split('\n').map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {line}<br />
                                                </React.Fragment>
                                            ))}
                                        </address>
                                        <p className="text-brand-base-600 text-sm mb-3">{service.additional_info}</p>
                                        <span className="inline-block bg-brand-base-500 text-white px-4 py-2 rounded hover:bg-brand-base-600 transition-colors duration-200 cursor-pointer">Velg</span>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>

    );
}
