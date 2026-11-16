"use client"

import React, {useEffect, useState} from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Header from "@/app/components/Header";
import Head from "next/head";
import { useRouter } from 'next/navigation';
import {supabase} from "@/app/utils/supabaseClient";
import {getUnavailableTimeSlots} from "@/app/services/BookingService";
import {getNrOfEmployees} from "@/app/services/BookingService";
import {useParams} from "next/navigation";


/**
 * Booking page
 * This page allows the user to select a date and time for their booking.
 * It also fetches and displays available and unavailable time slots.
 */
export default function Booking() {
    const navigation = useRouter();
    const { id } = useParams();

    // Function to find the next weekday (Monday-Friday) from a given date. Is used to avoid booking on weekends.
    const findNextWeekday = (startDate) => {
        let date = new Date(startDate);
        while (date.getDay() === 0 || date.getDay() === 6) { // 0 = Sunday, 6 = Saturday
            date.setDate(date.getDate() + 1);
        }
        return date;
    };


    const initialDate = findNextWeekday(new Date());
    const [selectedTime, setSelectedTime] = useState('');

    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [unavailableTimeSlots, setUnavailableTimeSlots] = useState([]);

    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];




    useEffect(() => {
        fetchUnavailableTimeSlots().then(r => console.log("Fetched unavailable time slots"));

    }, [selectedDate]);

    /**
     * Function to fetch unavailable time slots for the selected date
     * This function fetches the unavailable time slots from the server and updates the state.
     */
    const fetchUnavailableTimeSlots = async () => {
        try {
            const { notAvailable, bookedServices } = await getUnavailableTimeSlots(supabase, selectedDate);
            const totalEmployees = await getNrOfEmployees(supabase);

            // Count how many employees are unavailable for each time slot
            const countUnavailable = {};
            notAvailable.forEach(slot => {
                const time = slot.time?.slice(0, 5); // 'HH:MM' format
                countUnavailable[time] = (countUnavailable[time] || 0) + 1;
            });

            // Count bookings for each time slot
            const countBookings = {};
            bookedServices.forEach(booking => {
                const time = booking.booking_time?.slice(0, 5);
                countBookings[time] = (countBookings[time] || 0) + 1;
            });


            const trulyUnavailableTimeSlots = timeSlots.filter(time => {
                // Time is unavailable if all employees are not available or bookings match total employees available
                return countUnavailable[time] === totalEmployees || (countBookings[time] || 0) + (countUnavailable[time] || 0) >= totalEmployees;
            });

            const newUnavailableSlots = [...trulyUnavailableTimeSlots];

            // Check if the selected date is today
            if (selectedDate.toDateString() === new Date().toDateString()) {
                const currentTime = new Date();
                timeSlots.forEach(time => {
                    const [hours, minutes] = time.split(':');
                    const slotTime = new Date(selectedDate);
                    slotTime.setHours(hours, minutes, 0, 0);
                    if (slotTime <= currentTime) {
                        newUnavailableSlots.push(time);
                    }
                });
            }

            setAvailableTimeSlots(timeSlots);
            setUnavailableTimeSlots(newUnavailableSlots);

        } catch (error) {
            console.error("Error fetching unavailable time slots", error);
        }
    };


    /**
     * Function to handle date change
     * This function updates the selected date and resets the selected time.
     * @param {Date} date - The new selected date
     */
    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedTime('')
    };

    /**
     * Function to handle form submission
     * This function handles the form submission event.
     * It updates the session storage with the booking details and navigates to the booking form page.
     * @param {Event} event - The form submission event
     */
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (selectedTime) {
            const formattedDate = selectedDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

            const existingDetails = JSON.parse(sessionStorage.getItem('bookingDetails')) || {};

            const updatedDetails = {
                ...existingDetails,
                date: formattedDate,
                time: selectedTime,
                serviceId: id,
            };

            sessionStorage.setItem('bookingDetails', JSON.stringify(updatedDetails));

            await navigation.push(`/booking/${id}/form`);
        }
        console.log("Booking appointment for", selectedDate, "at", selectedTime);
    };



    /**
     * Function to select a time slot
     * This function updates the selected time slot.
     * @param {string} time - The selected time slot
     */
    const selectTimeSlot = (time) => {
        setSelectedTime(time);
    };

    /**
     * Function to navigate back
     */
    const onBack = () => {
        navigation.back();
    }

    return (
        <>
            <Head>
                <title>Book</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Header />

            <div className="flex items-center justify-center min-h-screen bg-brand-base-50 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-4xl mx-auto bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-4">
                        <button
                            onClick={onBack}
                            className="text-sm px-4 py-2 bg-brand-base-500 text-white rounded hover:bg-brand-base-600 transition duration-150 ease-in-out"
                        >
                            Tilbake
                        </button>
                    </div>
                    <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-1/2 p-4 flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-4 text-brand-base-700">Velg dato</h2>
                            <div className="p-3 rounded-lg flex justify-center items-center" style={{ minWidth: '300px', maxWidth: '500px' }}>
                                <DatePicker
                                    inline
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    minDate={new Date()}
                                    filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
                                    className="react-datepicker-custom"
                                />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-4 flex flex-col items-center">
                            <h2 className="text-2xl font-bold mb-4 text-brand-base-700">Velg et tidspunkt</h2>
                            <div className="p-3 rounded-lg w-full">
                                <div className="grid grid-cols-2 gap-4">
                                    {availableTimeSlots.length > 0 ? availableTimeSlots.map((time, index) => (
                                        <button
                                            key={index}
                                            className={`w-full text-sm px-6 py-3 rounded-lg transition-colors ${
                                                selectedTime === time ? 'bg-brand-base-900 text-white' :
                                                    unavailableTimeSlots.includes(time) ? 'bg-gray-500 text-white cursor-not-allowed' : 'bg-brand-base-300 text-white hover:bg-brand-base-300'}`
                                            }
                                            onClick={() => !unavailableTimeSlots.includes(time) && selectTimeSlot(time)}
                                            disabled={unavailableTimeSlots.includes(time)}
                                        >
                                            {time}
                                        </button>
                                    )) : <p className="text-center w-full">Ingen tidspunkt tilgjengelig denne dagen</p>}
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="mt-6 w-full md:w-auto px-10 py-3 rounded-lg bg-brand-base-500 text-white hover:bg-brand-base-600 font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!selectedTime}
                            >
                                Fortsett
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>



    );
}