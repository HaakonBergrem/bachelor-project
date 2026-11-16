"use client"
// src/serviceBox/service.js

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {fetchServiceDetailsByServiceId, fetchServiceStatusByServiceId, fetchEmployeeDetailsByServiceId, fetchAllEmployees, fetchAllServiceTypes, updateServiceDetails, fetchCustomerDetailsByServiceId } from '@/app/serviceBox/components/serviceDBHandler'
import Link from 'next/link';
import Head from "next/head";
import Header from "@/app/components/header";
import NotSignedIn from "@/app/components/notSignedIn"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchEmployeeByEmail } from '@/app/api/employee';
import { getUser } from '@/app/authServerComponents/getUser';

const ServicePage = () => {
    const router = useRouter();
    const [service_id, setServiceId] = useState();
    const [serviceDetails, setServiceDetails] = useState({});
    const [filteredServiceDetails, setFilteredServiceDetails] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [employeeDetails, setEmployeeDetails] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [services, setServices] = useState([]);
    const [bookingDetails, setBookingDetails] = useState({});
    const [employee, setEmployee] = useState();
    const [employeeId, setEmployeeId] = useState();
    const [dataLoaded, setDataLoaded] = useState(false);

    async function fetchEmployee() {
        try {
            const user = await getUser();
            const employee = await fetchEmployeeByEmail(user.email);
            setEmployee(employee);
            setEmployeeId(employee[0].employee_id)
        } catch (error) {
            console.error('Failed to fetch employee data:', error.message);
        } finally {
            setDataLoaded(true);
        }
    }


    useEffect(() => {
        fetchEmployee();
        const queryParams = new URLSearchParams(window.location.search);
        const urlServiceId = queryParams.get('serviceId');
        setServiceId(urlServiceId);
        updateServicePage(urlServiceId);
    }, [service_id, router]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const serviceId = queryParams.get('serviceId');
        console.log("Service id hentet i queryparams: ", serviceId);
    }, []);


    useEffect(() => {
        const workCost = parseInt(serviceDetails.service_cost, 10) || 0;
        const sparePartCost = parseInt(serviceDetails.service_sparePartCost, 10) || 0;
        const totalCost = workCost + sparePartCost;
        setServiceDetails(prev => ({
            ...prev,
            service_totalCost: totalCost.toString()
        }));
    }, [serviceDetails.service_cost, serviceDetails.service_sparePartCost, serviceDetails.service_totalCost]);

    function updateServicePage(service_id) {
        Promise.all([
            fetchServiceDetailsByServiceId(service_id),
            fetchServiceStatusByServiceId(service_id),
            fetchEmployeeDetailsByServiceId(service_id),
            fetchAllEmployees(),
            fetchAllServiceTypes(),
            fetchCustomerDetailsByServiceId(service_id)
        ])
            .then(([serviceDetailsResponse,
                       serviceStatusResponse,
                       employeeDetailsResponse,
                       allEmployeesResponse,
                       allServicesResponse,
                       bookingResponseData]) => {
                setServiceDetails(serviceDetailsResponse);
                setSelectedStatus(serviceStatusResponse);
                setEmployeeDetails(employeeDetailsResponse);
                setEmployees(allEmployeesResponse);
                setServices(allServicesResponse);
                setBookingDetails(bookingResponseData.booking);
            })
            .catch((error) => {
                console.error('Error updating service page:', error);
            });
    }

    const handleHomeButtonClick = () => {
        router.push('/employeeMain');
    };
    const handleOverviewButtonClick = () => {
        router.push('/serviceBox');
    };
    const handleSaveChangesButtonClick = async () => {
        const saveChanges = await updateServiceDetails(serviceDetails, bookingDetails, service_id);
        if (saveChanges) {
            console.log("Saved changes:", serviceDetails)
            toast.success("Changes saved successfully!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            toast.error("Not saved")
        }
    }

    if (dataLoaded) {
        if (!employee || employee.length == 0) {
            return <NotSignedIn/>;
        }
    }
    return (
        <main className="container min-h-screen font-sans text-base w-screen">
            <Head>
                <title>Service</title>
                <meta charSet="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <link rel="icon" type="image/png" href="placeholder.jpg"/>
            </Head>
            <Header/>
            {dataLoaded ? (
                <div className="m-8 h-[70vh] flex flex-col bg-white rounded-xl overflow-auto w-screen mx-auto">
                    <div>
                    <div className="text-white p-4 flex justify-between items-center bg-brand-base-500 rounded-t-xl">
                        <h1 className="text-2xl font-bold">
                            <strong>
                                Service #{serviceDetails.service_id} - Bike
                                #{bookingDetails.asset_nr}
                            </strong>
                        </h1>
                        <div className="flex space-x-4 font-bold">
                            <button
                                className="tab rounded-xl p-1 text-xl hover:bg-brand-base-600 active:bg-brand-base-800 bg-brand-base-300"
                                onClick={handleOverviewButtonClick}>Overview
                            </button>
                            <Link
                                href={{
                                    pathname: '/BikePage',
                                    query: {
                                        serviceId: serviceDetails.service_id,
                                        booking_id: serviceDetails.booking_id,
                                        asset_nr: bookingDetails.asset_nr,
                                    }
                                }}>
                                <div
                                    className="tab rounded-xl p-1 text-xl hover:bg-brand-base-600 active:bg-brand-base-800">Asset
                                </div>
                            </Link>
                            <button
                                className="tab rounded-xl p-1 text-xl hover:bg-brand-base-600 active:bg-brand-base-800"
                                onClick={handleHomeButtonClick}>Home
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row flex-grow">
                        <div className="flex-grow p-4">
                            <div className="mb-2">
                                <label htmlFor="inputTitle" className="block mb-1">Title:</label>
                                <input id="inputTitle" className="w-full border p-2 rounded mb-4 text-lg"
                                       type="text" value={serviceDetails.service_name || ''}
                                       onChange={e => setServiceDetails(prev => ({
                                           ...prev,
                                           service_name: e.target.value
                                       }))} maxLength={25}/>
                            </div>
                            <div className="mb-2">
                                <label htmlFor="inputDescription" className="block mb-1">Description</label>
                                <textarea id="inputDescription"
                                          className="w-full border p-2 rounded mb-4 text-md h-36 resize-none"
                                          placeholder="Explain required actions for the product"
                                          value={serviceDetails.service_description || ''}
                                          onChange={e => setServiceDetails(prev => ({
                                              ...prev,
                                              service_description: e.target.value
                                          }))} maxLength={255}/>
                            </div>
                            <div>
                                <label htmlFor="inputWorkreport" className="block mb-1">Work report</label>
                                <textarea id="inputWorkreport"
                                          className="w-full border p-2 rounded text-md h-36 resize-none"
                                          placeholder="Fill in your work report here"
                                          value={serviceDetails.service_report || ''}
                                          onChange={e => setServiceDetails(prev => ({
                                              ...prev,
                                              service_report: e.target.value
                                          }))} maxLength={255}/>
                            </div>
                        </div>
                        <div className="w-full md:w-1/2 p-4 md:pl-10">
                            <div className="w-full h-1/2">
                                <div className="checkbox-container h-full p-4 rounded w-full">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="assignTech" className="block mb-2">Assign employee</label>
                                            <select
                                                id="assignTech"
                                                className="border p-2 rounded mb-2"
                                                style={{width: '100%'}}
                                                value={serviceDetails.employee_id}
                                                onChange={(e) => setServiceDetails({
                                                    ...serviceDetails,
                                                    employee_id: e.target.value
                                                })}>
                                                <option value="">Select employee</option>
                                                {employees.map((tech) => (
                                                    <option key={tech.employee_id} value={tech.employee_id}>
                                                        {tech.first_name} {tech.last_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="statusService" className="block mb-2">Assign status</label>
                                            <select id="statusService" className="border p-2 rounded mb-2"
                                                    style={{width: '100%'}} type="text"
                                                    value={serviceDetails.service_status}
                                                    onChange={(e) => setServiceDetails({
                                                        ...serviceDetails,
                                                        service_status: e.target.value
                                                    })}>
                                                <option value="">Select status</option>
                                                <option value="Not received">1 - Not received</option>
                                                <option value="Received">2 - Received</option>
                                                <option value="Started">3 - Started</option>
                                                <option value="Finished">4 - Finished</option>
                                                <option value="Cancelled">5 - Cancelled</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="serviceType" className="block mb-2">Service type</label>
                                            <select
                                                id="serviceType"
                                                className="border p-2 rounded mb-2"
                                                style={{width: '100%'}}
                                                value={serviceDetails.service_type}
                                                onChange={(e) => setServiceDetails({
                                                    ...serviceDetails, service_type: e.target.value
                                                })}
                                            >
                                                <option value="">Select type</option>
                                                <option value="1">1 - Rent</option>
                                                <option value="2">2 - Own</option>
                                            </select>

                                        </div>
                                        <div>
                                            <label htmlFor="serviceDamages" className="block mb-2">Damages</label>
                                            <input id="serviceDamages" className="border p-2 rounded mb-2" type="text"
                                                   placeholder="Does the bike have any damages?"
                                                   style={{width: '100%'}} value={serviceDetails.service_damage || ''}
                                                   onChange={e => setServiceDetails(prev => ({
                                                       ...prev,
                                                       service_damage: e.target.value
                                                   }))} maxLength={30}/>
                                        </div>
                                        <div>
                                            <label htmlFor="changeTire" className="block mb-2">Change tire? </label>
                                            <select id="changeTire" className="border p-2 rounded mb-2"
                                                    style={{width: '100%'}} value={bookingDetails.tyre_change || ''}
                                                    onChange={e => setServiceDetails(prev => ({
                                                        ...prev,
                                                        tyre_change: e.target.value
                                                    }))}>
                                                <option value="false">No</option>
                                                <option value="true">Yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="repairLocation" className="block mb-2">Repair
                                                location</label>
                                            <input id="repairLocation" className="border p-2 rounded mb-2" type="text"
                                                   style={{width: '100%'}} placeholder="Where is it located?"
                                                   value={serviceDetails.service_location || ''}
                                                   onChange={e => setServiceDetails(prev => ({
                                                       ...prev,
                                                       service_location: e.target.value
                                                   }))} maxLength={30}/>
                                        </div>
                                        <div>
                                            <label htmlFor="serviceLength" className="block mb-2">Service length</label>
                                            <select id="serviceLength" className="border p-2 rounded mb-2"
                                                    style={{width: '100%'}}
                                                    value={serviceDetails.service_length || ''}
                                                    onChange={(e) => {
                                                        const selectedLength = e.target.value;
                                                        let cost = 0;
                                                        if (selectedLength === '-1') {
                                                            cost = serviceDetails.service_cost || '';
                                                        } else if (selectedLength) {
                                                            // Calculate cost as duration * 10 = 600kr/hr
                                                            // Change cost below to other value if lower or higher hourly fee
                                                            cost = (parseInt(selectedLength, 10) * 10).toString();
                                                        }

                                                        setServiceDetails(prev => ({
                                                            ...prev,
                                                            service_length: selectedLength,
                                                            service_cost: cost
                                                        }));
                                                    }}>
                                                <option value="">Select duration</option>
                                                <option value="30">30 minutes</option>
                                                <option value="60">60 minutes</option>
                                                <option value="90">90 minutes</option>
                                                <option value="120">120 minutes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="serviceCost" className="block mb-2">Service work
                                                cost</label>
                                            <input id="serviceCost" type="number" className="border p-2 rounded mb-2"

                                                   style={{width: '100%'}} placeholder="Choose service length"
                                                   value={serviceDetails.service_cost}
                                                   readOnly={serviceDetails.service_length !== '-1'}
                                                   onChange={e => setServiceDetails(prev => ({
                                                       ...prev,
                                                       service_cost: e.target.value
                                                   }))}

                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="serviceSpareParts" className="block mb-2">Service spare part
                                                cost</label>
                                            <input id="serviceSpareParts" type="number"
                                                   className="border p-2 rounded mb-2"
                                                   style={{width: '100%'}} placeholder="0"
                                                   value={serviceDetails.service_sparePartCost}
                                                   onChange={e => setServiceDetails(prev => ({
                                                       ...prev,
                                                       service_sparePartCost: e.target.value
                                                   }))}
                                                   onFocus={e => e.target.value === '0' && (e.target.value = '')}
                                                   onBlur={e => e.target.value === '' && (e.target.value = '0')}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="serviceTotalCost" className="block mb-2">Service total
                                                cost</label>
                                            <input id="serviceTotalCost" type="number"
                                                   className="border p-2 rounded mb-5 bg-brand-base-50"
                                                   style={{width: '100%'}}
                                                   value={serviceDetails.service_totalCost || '0'} readOnly
                                                   onChange={e => setServiceDetails(prev => ({
                                                       ...prev,
                                                       service_totalCost: e.target.value
                                                   }))}

                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="bookingTime" className="block mb-2">Booking time</label>
                                            <input id="bookingTime" type="text"
                                                   className="border p-2 rounded mb-5 bg-brand-base-50"
                                                   style={{width: '100%'}}
                                                   value={bookingDetails.booking_date + " - "  + bookingDetails.booking_time || '0'} readOnly

                                            />
                                        </div>


                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-9">
                                        <div>
                                            <label htmlFor="customerName" className="block mb-2">Customer
                                                name</label>
                                            <input id="customerFirstname" type="text"
                                                   className="border p-2 rounded mb-2 bg-brand-base-50"
                                                   style={{width: '100%'}}
                                                   value={bookingDetails.firstname + " " + bookingDetails.lastname}
                                                   readOnly/>
                                        </div>

                                        <div>
                                            <label htmlFor="customerEmail" className="block mb-2">Customer email</label>
                                            <input id="customerEmail" type="text"
                                                   className="border p-2 rounded mb-2 bg-brand-base-50"
                                                   style={{width: '100%'}}
                                                   value={bookingDetails.email} readOnly/>
                                        </div>
                                        <div>
                                            <label htmlFor="customerPhone" className="block mb-2">Customer phone</label>
                                            <input id="customerPhone" type="text"
                                                   className="border p-2 rounded mb-2 bg-brand-base-50"
                                                   style={{width: '100%'}}
                                                   value={bookingDetails.phone} readOnly/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer flex justify-between items-center p-4 bg-white rounded-b-md">
                        <button onClick={handleHomeButtonClick}
                                className="bg-brand-base-500 text-white px-4 py-2 rounded hover:bg-brand-base-600 active:bg-brand-base-800">
                            Home
                        </button>
                        <button onClick={handleSaveChangesButtonClick}
                                className="ml-2 border p-2 rounded bg-brand-base-500 text-white hover:bg-brand-base-600 active:bg-brand-base-800">
                            Save Changes
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

export default ServicePage;
