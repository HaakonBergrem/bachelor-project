import React from 'react';
import BikeDetails from "./components/bikedetails";
import Head from "next/head";
import Header from "@/app/components/header";

export const metadata = {
    title: "Bike page - Details and asset performance stats",
    description: "Explore details and performance stats about our featured bike assets",
};

export default function Bike({ children }) {
    return (
        <>
            <Head>
                <title>{metadata.title}</title>
                <meta name="description" content={metadata.description}/>
                <meta name="viewport" content="width=device-width,
                 initial-scale=1.0"/>
                <link rel="icon" type="image/png" href="/placeholder.jpg=v2"/>
            </Head>
            <BikeDetails/>
            <div className="grid-container">
                {children}
            </div>
        </>
    );
}