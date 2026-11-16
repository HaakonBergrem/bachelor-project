/* The "Sign In" page. Email and password will be checked if they match stored users in supabase. If the user successfully 
signs in, he will be sent to either the employee main page if he is an employee, or the admin main page if he is an admin.

updateEmail() is in this file because the user gets sent here if he has clicked an update-email-link in a mail sent to him.
If so, the url will contain the new email and the function will run. 

If the user has forgot his password, he can click the "Forgot you password"-button and get an update-password-mail */ 

"use client"

import Head from 'next/head'
import Header from "@/app/components/header";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchAllEmployees, updateEmployeeMail } from '@/app/api/employee';
import { fetchAllAdmins, updateAdminMail, fetchAdminByEmail } from '@/app/api/admin';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);

  const router = useRouter();

  const supabase = createClientComponentClient();

  // Runs when the page renders. Fetches all employees and admins
  useEffect(() => {
    Promise.all([
      fetchAllEmployees(),
      fetchAllAdmins()
    ]).then(([employeesData, adminsData]) => {
      setEmployees(employeesData);
      setAdmins(adminsData);
    });

    // Function used when user is sent here after clicking update-email-link in mail
    const updateEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const emailsString = urlParams.get('emails');
  
      if (emailsString) {
        const emailsArray = emailsString.split('oldMail:')[1].split('newEmail:');
  
        const oldEmail = emailsArray[0];
        const newEmail = emailsArray[1];
       
        let matchingUser = await fetchAdminByEmail(oldEmail);
  
        // If the user corresponding to the email is an employee (because fetchAdminByEmail returns an empty array), 
        // use the api-call for employees. If not, use the one for admins
        if(matchingUser.length == 0){
          updateEmployeeMail(oldEmail, newEmail);
        }
        else{
          updateAdminMail(oldEmail, newEmail);
        }
        // Bug: 2 toasts appear
        toast.success('Email updated');
      
      }
    }
    updateEmail();
  }, []);

  const handleLogin = async () => {
    // Email and passord matches one of the employees/admins in supabase
    const matchingEmployee = employees.find(employee => employee.mail === email);
    const matchingAdmin = admins.find(admin => admin.mail === email);
    
    if (!(matchingEmployee == undefined) || !(matchingAdmin == undefined)) {
      const res = await supabase.auth.signInWithPassword({
        email,
        password
      });
      setUser(res.data.user);

      if(!res.error){
        toast.success('Signing in...');
        setEmail('');
        setPassword('');
        if(!(matchingAdmin == undefined)){
          router.push("/adminMain")
        }
        else{
          router.push("/employeeMain")
        }
      }
      else {
        toast.error('Wrong password');
      }      
    } else {
      toast.error('Wrong email or password');
    }
  };

  const forgotPassword = () => {
    router.push("/forgotPassword")
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <main className="container min-h-screen font-sans">
      <Head>
        <title>Sign in</title>
        <meta charSet="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </Head>
      <Header/>

      <div className="flex justify-center items-center min-h-screen w-screen">
        
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:border-blue-500"
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-brand-base-500 text-white font-semibold py-2 rounded-md cursor-pointer hover:bg-brand-base-600 active:bg-brand-base-900"
          >
            Sign in
          </button>
          <button
            onClick={forgotPassword}
            className="w-full bg-brand-base-300 text-white font-semibold py-2 rounded-md cursor-pointer hover:bg-brand-base-600 active:bg-brand-base-900 mt-2"
          >
            Forgot your password?
          </button>
          <ToastContainer />
        </div>
      </div>
    </div>
  </main>
);
}