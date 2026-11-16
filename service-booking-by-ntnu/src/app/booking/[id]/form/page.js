"use client"

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/app/components/Header";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import { postBooking } from "@/app/services/BookingService";
import { useParams } from "next/navigation";
import {Modal} from "@/app/components/Modal";


/**
 * Form page
 * This page is responsible for handling the booking form submission.
 * It allows the user to input their details and submit a booking.
 */
export default function Form() {
    const navigation = useRouter();
    const { id } = useParams(); // service type id


    const [formValues, setFormValues] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bikeNr: '',
        tyreChange: '',
        notes: '',
        terms: false,
        date: '',
        time: '',
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Fetch stored booking details when component mounts
    useEffect(() => {
        const storedDetails = JSON.parse(sessionStorage.getItem('bookingDetails')) || {};
        setFormValues(prev => ({ ...prev, ...storedDetails }));
    }, []);


    /**
     * Function to handle form field changes
     * This function updates the form field values and stores them in the session storage.
     * @param {Event} e - The form field change event
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        const updatedValues = {
            ...formValues,
            [name]: newValue
        };

        setFormValues(updatedValues);
        
        sessionStorage.setItem('bookingDetails', JSON.stringify(updatedValues));

        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    }

    /**
     * Function to validate the form
     * This function validates the form fields and returns a boolean indicating whether the form is valid.
     * @returns {boolean} - Whether the form is valid
     */
    const validateForm = () => {
        let errors = {};
        if (!formValues.firstName.trim()) errors.firstName = "Fornavn er påkrevd";
        if (!formValues.lastName.trim()) errors.lastName = "Etternavn er påkrevd";
        if (!formValues.email.trim()) {
            errors.email = "Epost er påkrevd";
        } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formValues.email.trim())) {
            errors.email = "Epost er ikke gyldig";
        }
        if (!formValues.phone.trim()) errors.phone = "Mobilnr er påkrevd";
        if (!formValues.bikeNr.trim()) errors.bikeNr = "SykkelNr er påkrevd";
        if (!formValues.tyreChange) errors.tyreChange = "Dette feltet er påkrevd";
        if (!formValues.terms) errors.terms = "Du må godta vilkårene";
        if (!formValues.notes.trim()) errors.notes = "Kommentar er påkrevd";
        if (!formValues.date) errors.date = "Dato er påkrevd";
        if (!formValues.time) errors.time = "Tid er påkrevd";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /**
     * Function to handle form submission
     * This function handles the form submission event.
     * It validates the form and opens the confirmation modal if the form is valid.
     * @param {Event} event - The form submission event
     */
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        //setIsSubmitting(true);
        setModalOpen(true);
    };

    /**
     * Function to confirm booking
     * This function confirms the booking and submits the form.
     * It closes the modal and redirects to the home page.
     */
    const confirmBooking = async () => {
        setIsSubmitting(true);
        setModalOpen(false);

        const booking = {
            ...formValues,
            id: id
        };

        try {
            await postBooking(supabase, booking);
            sessionStorage.removeItem('bookingDetails');
            setShowConfirmation(true);
            setTimeout(() => {
                navigation.push('/'); // Redirect to home after 5 seconds
            }, 5000);
        } catch (error) {
            console.error("Error submitting form:", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };


    // Function to navigate back
    const onBack = () => navigation.back();

    // Helper function for dynamic input class names
    const getInputClassName = (fieldName) =>
        `shadow appearance-none border ${formErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`;


    return (
        <>
            <Head>
                <title>Form</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Header />

            <div className="flex items-center justify-center min-h-screen bg-brand-base-50 p-4">
                <div className="container max-w-md mx-auto">
                    {showConfirmation ? (
                        <div className="p-4 text-center">
                            <h3 className="text-lg font-semibold text-brand-base-950">Booking Bekreftet!</h3>
                            <p>Redirigerer hjem...</p>
                        </div>
                    ) : (
                    <form onSubmit={handleFormSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <button
                                onClick={onBack}
                                type="button"
                                className="text-sm px-4 py-2 bg-brand-base-500 text-white rounded hover:bg-brand-base-600 transition duration-150 ease-in-out"
                            >
                                Tilbake
                            </button>
                        </div>
                        <div className="px-6 py-4">
                            <h2 className="text-2xl font-semibold mb-6 text-center text-brand-base-800">Din info</h2>
                            <div className="space-y-6">
                                {[
                                    { label: "Fornavn*", id: "firstName", type: "text", placeholder: "Ditt fornavn", error: formErrors.firstName },
                                    { label: "Etternavn*", id: "lastName", type: "text", placeholder: "Ditt etternavn", error: formErrors.lastName },
                                    { label: "Epost*", id: "email", type: "email", placeholder: "eksempel@mail.com", error: formErrors.email },
                                    { label: "Mobil*", id: "phone", type: "tel", placeholder: "Ditt mobilnr", error: formErrors.phone },
                                    { label: "SykkelNr*", id: "bikeNr", type: "text", placeholder: "SykkelNr", error: formErrors.bikeNr },
                                ].map((field) => (
                                    <div key={field.id} className="mb-4">
                                        <label className="block text-brand-base-700 text-sm font-bold mb-2" htmlFor={field.id}>
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            id={field.id}
                                            name={field.id}
                                            placeholder={field.placeholder}
                                            value={formValues[field.id]}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border border-brand-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-base-500 focus:border-transparent ${getInputClassName(field.id)}`}
                                        />
                                        {field.error && <p className="text-red-500 text-xs italic">{field.error}</p>}
                                    </div>
                                ))}
                                <div className="mb-4">
                                    <label className="block text-brand-base-700 text-sm font-bold mb-2" htmlFor="tyreChange">
                                        Ønsker du skifte til/fra piggdekk*
                                    </label>
                                    <div className="flex items-center">
                                        <label className="inline-flex items-center mr-4">
                                            <input
                                                type="radio"
                                                className="form-radio"
                                                name="tyreChange"
                                                value="yes"
                                                onChange={handleChange}
                                                checked={formValues.tyreChange === 'yes'}
                                            />
                                            <span className="ml-2">Ja</span>
                                        </label>
                                        <label className="inline-flex items-center">
                                            <input
                                                type="radio"
                                                className="form-radio"
                                                name="tyreChange"
                                                value="no"
                                                onChange={handleChange}
                                                checked={formValues.tyreChange === 'no'}
                                            />
                                            <span className="ml-2">Nei</span>
                                        </label>
                                    </div>
                                    {formErrors.tyreChange && <p className="text-red-500 text-xs italic">{formErrors.tyreChange}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-brand-base-700 text-sm font-bold mb-2" htmlFor="notes">
                                        Kommentar*
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        placeholder="Beskriv hva du trenger hjelp med..."
                                        rows="4"
                                        value={formValues.notes}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border border-brand-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-base-500 focus:border-transparent ${getInputClassName('notes')}`}
                                    ></textarea>
                                    {formErrors.notes && <p className="text-red-500 text-xs italic">{formErrors.notes}</p>}
                                </div>
                                <div className="mb-4">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        name="terms"
                                        className="mr-2 leading-tight"
                                        checked={formValues.terms}
                                        onChange={handleChange}
                                    />
                                    <label className="text-sm text-brand-base-700" htmlFor="terms">
                                        Yes, I agree to the <a href="/terms" className="text-brand-base-500 underline">Terms of Service</a> and the <a href="/privacy" className="text-brand-base-500 underline">Privacy Policy</a>
                                    </label>
                                    {formErrors.terms && <p className="text-red-500 text-xs italic">{formErrors.terms}</p>}
                                </div>
                                <div className="flex items-center justify-center py-6">
                                    <button
                                        className="w-full bg-brand-base-500 hover:bg-brand-base-600 text-white font-bold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:shadow-outline"
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Booker...' : 'Book nå'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    )}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
                        onConfirm={confirmBooking}
                    >
                        <h2 className="text-lg font-semibold">Bekreft Booking</h2>
                        <p>Bekreft dine detaljer:</p>
                        <ul>
                            <li>Navn: {formValues.firstName} {formValues.lastName}</li>
                            <li>Epost: {formValues.email}</li>
                            <li>Mobil: {formValues.phone}</li>
                            <li>SykkelNr: {formValues.bikeNr}</li>
                            <li>Bytte av dekk: {formValues.tyreChange === 'yes' ? 'Ja' : 'Nei'}</li>
                            <li>Kommentar: {formValues.notes}</li>
                            <li>Dato: {formValues.date}</li>
                            <li>Tid: {formValues.time}</li>
                        </ul>
                    </Modal>
                </div>
            </div>
        </>


    );

}