"use client"
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from "next/link";
import Header from "@/app/components/header";
import NotSignedIn from "@/app/components/notSignedIn"
import {fetchBookingByBookingId, fetchAssetByBookingId, fetchServicesByAsset, updateBookingDetails} from '@/app/BikePage/api/bikeDetailsDBHandler';
import { fetchEmployeeByEmail } from '@/app/api/employee';
import { getUser } from '@/app/authServerComponents/getUser';
import {fetchServiceDetailsByServiceId} from '@/app/serviceBox/components/serviceDBHandler'

export default function BikeDetails() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [bikeDetails, setBikeDetails] = useState([]);
    const [bikeServices, setBikeServices] = useState([]);
    const [serviceId, setServiceId] = useState({});
    const [bookingId, setBookingId] = useState('');
    const [bookingDetails, setBookingDetails] = useState({});
    const [serviceDetails, setServiceDetails] = useState({});
    const [assetNr, setAssetNr] = useState('');
    const [employee, setEmployee] = useState();
    const [employeeId, setEmployeeId] = useState();
    const [dataLoaded, setDataLoaded] = useState(false);

    /**
     * Fetches employee data for the current user and updates the state.
     * Displays an error message if fetching fails.
     * Ensures data load state is indicated as complete.
     **/
    async function fetchEmployee() {
        try {
            const user = await getUser();
            const employee = await fetchEmployeeByEmail(user.email);
            setEmployee(employee);
            setEmployeeId(employee[0].employee_id)
        } catch (error) {
            toast.error('Failed to fetch employee data:', error.message);
        } finally {
            setDataLoaded(true);
        }
    }

    /**
     * Initializes component by fecthing employee details and reading URL query parameters.
     * Calls fetchEmployee to load employee data - who is logged in.
     * Reads query parameters from URL and sets the values in the state to update the page.
     **/
    useEffect(() => {
        fetchEmployee();
        const queryParams = new URLSearchParams(window.location.search);
        const serviceId = queryParams.get('serviceId') || 1;
        const bookingId = queryParams.get('booking_id') || 1;
        const assetNr = queryParams.get('asset_nr') || 1;
        setBookingId(bookingId);
        setServiceId(serviceId);
        setAssetNr(assetNr)
        updateBikePage(bookingId, serviceId, assetNr)
    }, [router.query]);

    /**
     * Parses URL query parameters and extracts serviceId on mount.
     * Used to navigate to the different services listed on the bike page.
     **/
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const serviceId = queryParams.get('serviceId');
    }, []);

    /**
     * Fetches and updates the page data using a specific assetNr.
     * Updates state with fetched data and displays an error message if any fetch fails.
     **/
    function updateBikePage(bookingId, serviceId, assetNr) {
        Promise.all([
            fetchServicesByAsset(assetNr),
            fetchBookingByBookingId(bookingId),
            fetchServiceDetailsByServiceId(serviceId),
            fetchAssetByBookingId(bookingId)
        ])
            .then(([allServicesToAsset, bookingData, serviceData]) => {
                setBikeServices(allServicesToAsset);
                setBookingDetails(bookingData);
                setServiceDetails(serviceData);
            })
            .catch((error) => {
                toast.error('Error updating bike page:', error);
            });
    }

    /**
     * Calculates total work service cost of all services attached to an asset.
     * @param {Array}  bikeServices - which holds all services to the asset_nr provided from service page.
     * @returns {Number} - sum of all the work service costs from services connected to the asset_nr.
     **/
    const calculateWorkServiceCost = (bikeServices) => {
        if (!Array.isArray(bikeServices)) {
            return 0;
        }
        return bikeServices.reduce((total, item) => {
            if (item.service && Array.isArray(item.service) && item.service.length > 0) {
                const serviceCosts = item.service.reduce((serviceTotal, detail) => {
                    return serviceTotal + (Number(detail.service_cost) || 0);
                }, 0);
                return total + serviceCosts;
            }
            return total;
        }, 0);
    };

    /**
     * Calculates total spare part costs of all services attached to an asset.
     * @param {Array} bikeServices  - which holds all services to the asset_nr provided from service page.
     * @returns {Number} - sum of all the spare part costs from services connected to the asset_nr.
     **/
    const calculateTotalSparePartCost = (bikeServices) => {
        if (!Array.isArray(bikeServices)) {
            return 0;
        }
        return bikeServices.reduce((total, item) => {
            if (item.service && Array.isArray(item.service) && item.service.length > 0) {
                const sparePartCosts = item.service.reduce((sparePartTotal, detail) => {
                    return sparePartTotal + (detail.service_sparePartCost || 0);
                }, 0);
                return total + sparePartCosts;
            }
            return total;
        }, 0);
    };

    /**
     * Calculates total service time used to a specific asset.
     * @param {Array} bikeServices - which holds all services to the asset_nr provided from service page.
     * @returns {Number} a sum of all the different service lengths from services connected to the asset_nr.
     **/
    const calculateTotalServiceTime = (bikeServices) => {
        if (!Array.isArray(bikeServices)) {
            return 0;
        }
        return bikeServices.reduce((total, item) => {
            if (item.service && Array.isArray(item.service) && item.service.length > 0) {
                const serviceTimes = item.service.reduce((serviceTimeTotal, detail) => {
                    return serviceTimeTotal + (parseInt(detail.service_length) || 0);
                }, 0);
                return total + serviceTimes;
            }
            return total;
        }, 0);
    };

    /**
     * Calculates the number of services attached to the asset_nr.
     * @param {Array} bikeServices - An array of booking objects
     * @returns {Number} total count of all services attached to the asset_nr
     **/
    const countAllServices = (bikeServices) => {
        return bikeServices.reduce((acc, item) => {
            return acc + (item.service ? item.service.length : 0);
        }, 0);
    };

    /**
     * Calculates the average duration of all services attached to the asset_nr.
     * Uses 'countAllServices' to get number of services, returns 0 if array is empty or not an array.
     * @param {Array} bikeServices - An array of booking objects containing service time.
     * @returns {Number} - Average service length per service.
     **/
    const calculateAverageServiceTime = (bikeServices) => {
        let totalServices = countAllServices(bikeServices);
        if (!Array.isArray(bikeServices) || bikeServices.length === 0) {
            return 0;
        }
        const totalServiceTime = calculateTotalServiceTime(bikeServices);
        const averageTime = totalServiceTime / totalServices;
        return parseFloat(averageTime.toFixed(1));
    };

    /**
     * Calculates the average service cost of all services attached to the asset_nr.
     * Uses 'countAllServices' to get number of services, returns 0 if array is empty or not an array.
     * @param {Array} bikeServices - An array of booking objects containing service time.
     * @returns {Number} - Average service cost per service.
     **/
    const calculateAverageServiceCost = (bikeServices) => {
        let totalServices = countAllServices(bikeServices);
        if (!Array.isArray(bikeServices) || bikeServices.length === 0) {
            return 0;
        }
        const totalWorkCost = calculateWorkServiceCost(bikeServices);
        const totalSparePartCost = calculateTotalSparePartCost(bikeServices);
        const averageCost = (totalWorkCost + totalSparePartCost) / totalServices;
        return parseFloat(averageCost.toFixed(1));
    };

    /**
     * Calculate and store the service metrics to be displayed in the UI
     **/
    const totalTimeUsed = calculateTotalServiceTime(bikeServices);
    const totalWorkCost = calculateWorkServiceCost(bikeServices);
    const totalSparePartCost = calculateTotalSparePartCost(bikeServices);
    const averageServiceCost = calculateAverageServiceCost(bikeServices);
    const averageServiceTime = calculateAverageServiceTime(bikeServices);
    const totalServiceCost = totalWorkCost + totalSparePartCost;

    /**
     * Navigates to the employeeMain page
     */
    const handleHomeButtonClick = () => {
        router.push('/employeeMain');
    };

    /**
     * Attempts to save booking details, displays if success or error message based on outcome.
     **/
    const handleSubmitButton = async () => {
        const saveChanges = await updateBookingDetails(bookingDetails, assetNr);
        if (saveChanges) {
            toast.success("Changes saved successfully!", {});
        } else {
            toast.error("Changes not saved.", {});
        }
    }

    /**
     * Handles tab clicks, setting the active tab and navigating to pages.
     * @param {string} tab - name of the tab to activate
     **/
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        if (tab === 'overview') {
            router.push('/serviceBox'
            )
        }
        if (tab === 'item') {

            router.push('/BikePage')
        }
        if (tab === 'main') {
            router.push('employeeMain')
        }
    }

    /**
     * Displays a sign-in component if no employee data is loaded and available.
     **/
    if (dataLoaded) {
        if (!employee || employee.length == 0) {
            return <NotSignedIn/>;
        }
    }

    return (
        <main className="container min-h-screen font-sans text-base">
            <Head>
                <title>Bike page</title>
                <meta charSet="UTF-8"/>
                <link rel="icon" type="image/png" href="/placeholder.jpg?=v2"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            </Head>
            <Header/>
            {dataLoaded ? (
                <div className="m-8 h-auto flex flex-col bg-white rounded-xl overflow-auto w-screen mx-auto h-[70vh]">
                    <div className="flex-grow ">
                        <div
                            className="text-white p-4 flex justify-between items-center bg-brand-base-500 rounded-t-xl ">
                            <h1 className="text-2xl font-bold"><strong>Bike asset
                                #{bookingDetails && bookingDetails.asset_nr ? bookingDetails.asset_nr : 'Loading...'}</strong>
                            </h1>
                            <div className="flex space-x-4 font-bold">
                                <Link href={{pathname: 'serviceBox', query: {serviceId: serviceId}}} passHref>
                                    <div
                                        className="tab hover:bg-brand-base-600 active:bg-brand-base-800 rounded-xl p-1 text-xl">Overview
                                    </div>
                                </Link>
                                <button
                                    className={`tab rounded-xl p-1 text-xl hover:bg-brand-base-600 active:bg-brand-base-800 bg-brand-base-300 ${activeTab === 'item' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('item')}>Asset
                                </button>
                                <button
                                    className={`tab hover:bg-brand-base-600 active:bg-brand-base-800 rounded-xl p-1 text-xl ${activeTab === 'main' ? 'active' : ''}`}
                                    onClick={() => handleTabClick('main')}>Home
                                </button>
                            </div>
                        </div>

                        <div className="bikeHistory bg-white rounded-md w-full border overflow-y-auto"
                             style={{height: '35vh'}}>
                            <div
                                className="grid grid-cols-5 font-bold mb-2 text-center justify-items-start sticky top-0 bg-white z-50 shadow">
                                <div>Case no</div>
                                <div>Title</div>
                                <div>Status</div>
                                <div>Cost</div>
                                <div>Time</div>
                            </div>
                            <div className="overflow-auto">
                                <ul className="historyList">
                                    {bikeServices.length > 0 ? (
                                        bikeServices.map(item => (
                                            item.service && item.service.length > 0 ? (
                                                item.service.map(detail => (
                                                    <Link key={detail.service_id} href={{
                                                        pathname: 'serviceBox',
                                                        query: {serviceId: detail.service_id}
                                                    }} passHref>
                                                        <div
                                                            className="block border hover:bg-gray-100 rounded mb-1 grid grid-cols-5 text-center justify-items-start py-4 pl-1">
                                                            <span className="col-span-1">#{detail.service_id}</span>
                                                            <span
                                                                className="col-span-1 mr-11">{detail.service_name || 'No title'}</span>
                                                            <span className="col-span-1">{detail.service_status}</span>
                                                            <span
                                                                className="col-span-1 pl-2">{detail.service_totalCost || 'N/A'}</span>
                                                            <span
                                                                className="col-span-1 pl-4">{detail.service_length || 'N/A'}</span>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : <li key={`no-service-${item.booking_id}`} className="p-4">No services
                                                found for booking ID: {item.booking_id}</li>
                                        ))
                                    ) : <li>No bike services found.</li>}
                                </ul>
                            </div>
                        </div>


                        <div className="bikeDetails w-full p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="inputRow">
                                <label htmlFor="assetNr">Bike asset number</label>
                                <input type="text" id="assetNr" name="assetNr"
                                       className="border p-2 w-full rounded bg-brand-base-50"
                                       value={bookingDetails.asset_nr || ''} readOnly/>
                            </div>
                            <div className="inputRow">
                                <label htmlFor="workCost">Total work cost</label>
                                <input type="text" id="workCost" name="workCost"
                                       className="border p-2 w-full rounded bg-brand-base-50"
                                       value={totalWorkCost || ''} readOnly/>
                            </div>
                            <div className="inputRow">
                                <label htmlFor="sparePartCost">Total sparepart cost</label>
                                <input type="text" id="sparePartCost" name="sparePartCost"
                                       className="border p-2 w-full rounded bg-brand-base-50"
                                       value={totalSparePartCost || ''} readOnly/>
                            </div>
                            <div className="inputRow">
                                <label htmlFor="costCombined">All costs combined</label>
                                <input type="text" id="costCombined" name="costCombined"
                                       className="border p-2 w-full rounded bg-brand-base-50"
                                       value={totalServiceCost || ''} readOnly/>
                            </div>
                            <div className="inputRow">
                                <label htmlFor="totalTime">Total time</label>
                                <input type="text" id="totalTime" name="totalTime"
                                       className="border p-2 w-full rounded bg-brand-base-50"
                                       value={totalTimeUsed || ''} readOnly/>
                            </div>
                            <div className="inputRow">
                                <label htmlFor="averageTime">Average service time</label>
                                <input type="text" id="averageTime" name="averageTime"
                                       className="border p-2 w-full rounded bg-brand-base-50"
                                       value={averageServiceTime || ''} readOnly/>
                            </div>
                            <div className="inputRow">
                                <label htmlFor="averageCost">Average service cost</label>
                                <input type="text" id="averageCost" name="averageCost"
                                       className="border p-2 w-full rounded bg-brand-base-50"
                                       value={averageServiceCost || ''} readOnly/>
                            </div>
                            <div className="inputRow">
                                <label htmlFor="distanceTravelled">Distance travelled in km</label>
                                <input type="number" id="distanceTravelled" name="distanceTravelled"
                                       className="border p-2 w-full rounded " value={bookingDetails.distance_travelled}
                                       onChange={e => setBookingDetails(prev => ({
                                           ...prev,
                                           distance_travelled: e.target.value
                                       }))}/>
                            </div>
                        </div>

                        <div className="footer flex justify-between items-center p-4 bg-white rounded-b-md mt-8">
                            <button
                                className="homeButton bg-brand-base-500 text-white px-4 py-2 rounded hover:bg-brand-base-600 active:bg-brand-base-800"
                                onClick={handleHomeButtonClick}>Home
                            </button>
                            <button onClick={handleSubmitButton}
                                    className="previousButton bg-brand-base-500 text-white px-4 py-2 rounded hover:bg-brand-base-600 active:bg-brand-base-800">Submit
                                distance
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-1/2 flex justify-center items-center mt-8">
                    <p className="text-center">Loading...</p>
                </div>
            )}
            <ToastContainer/>
        </main>
    );
};