// src/serviceBox/page.js
import React from 'react';
import ServicePage from './components/service';
import Header from "@/app/components/header";
import Head from "next/head";

export const metadata = {
    title: "Service Management - Edit and Update Your Services",
    description: "Discover our service management portal where you can access detailed information about our services and modify service details."
    ,
};

export default function ServiceBox({ serviceId }) {
    return (
        <>
            <Head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description}/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <link rel="icon" type="image/png" href="/placeholder.jpg"/>
            </Head>
            <ServicePage/>
            <div className="grid-container">
                {serviceId}
            </div>
        </>
    );
}