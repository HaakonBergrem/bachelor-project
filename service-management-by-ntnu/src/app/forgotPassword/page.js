/* The "Forgot Your Password?" page. It allows a user to have a link sent to his email (if it exists) to reset his password. 
If he clicks it, he will be sent to /updateUser and get signed in so he can change his password.  */

"use client"

import Head from 'next/head'
import Header from "@/app/components/header";
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchAllEmployees } from '@/app/api/employee';
import { fetchAllAdmins } from '@/app/api/admin';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');

    const [employees, setEmployees] = useState([]);
    const [admins, setAdmins] = useState([]);

    const supabase = createClientComponentClient();

    // Fetches all employees and admins when the page renders
    useEffect(() => {
        Promise.all([
            fetchAllEmployees(),
            fetchAllAdmins()
        ]).then(([employeesData, adminsData]) => {
            setEmployees(employeesData);
            setAdmins(adminsData);
        });
    })

    // Checks if the email exists. If it does, it gets sent a password-reset-link
    const handleCheckEmail = async () => {
        const matchingEmployee = employees.find(employee => employee.mail === email);
        const matchingAdmin = admins.find(admin => admin.mail === email);
        if (!(matchingEmployee == undefined) || !(matchingAdmin == undefined)) {
            let { data, error } = await supabase.auth.resetPasswordForEmail(email)

            if(data){
                toast.success('Mail sent');
            }else{
                toast.error('Something went wrong');
            }
        }else{
            toast.error('No users with this email');
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleCheckEmail();
        }
    };

    return (
        <main className="container min-h-screen font-sans max-w-full">
            <Head>
                <title>Forgot password</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Header />

            <div className="flex flex-col justify-center items-center min-h-screen">
                <h1 className="text-xl font-semibold mb-4">Enter your email to change password</h1>
                <div className="w-full max-w-xs">
                    <div className="mb-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleCheckEmail}
                            className="w-full bg-brand-base-500 text-white font-semibold py-2 rounded-md cursor-pointer hover:bg-brand-base-600"
                        >
                            Send mail with link
                        </button>
                        <ToastContainer />
                    </div>
                </div>
            </div>
        </main>
    );
}