/* The "Register Employee" page. Allows admin to register an employee if the new email does not match any existing email in the 
database */

"use client"

import { useRouter} from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/app/components/header';
import Head from 'next/head'
import NotSignedIn from "@/app/components/notSignedIn"

import { fetchAllEmployees, addEmployee } from '@/app/api/employee';
import { fetchAllAdmins, fetchAdminByEmail } from '@/app/api/admin';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { getUser } from '@/app/authServerComponents/getUser';

export default function RegisterEmployee() {
  const router = useRouter();

  const supabase = createClientComponentClient();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const [employees, setEmployees] = useState('');
  const [admins, setAdmins] = useState('');
  const [admin, setAdmin] = useState();

  const [dataLoaded, setDataLoaded] = useState(false);

  async function fetchAdmin() {
    try {
      const user = await getUser();
      const admin = await fetchAdminByEmail(user.email);
      setAdmin(admin);
    } catch (error) {
      console.error('Failed to fetch admin data');
    }
    finally{
      setDataLoaded(true);
    }
  }

  useEffect(() => {
    fetchAdmin();
    async function fetchEmployees() {
      try {
        const employeeData = await fetchAllEmployees();
        if (employeeData) {
          setEmployees(employeeData);
        }
      } catch (error) {
        console.error('Failed to fetch employees');
      }
    }

    async function fetchAdmins() {
      try {
        const adminData = await fetchAllAdmins();
        if (adminData) {
          setAdmins(adminData);
        }
      } catch (error) {
        console.error('Failed to fetch admins');
      }
    }

    fetchEmployees();
    fetchAdmins();
  }, []);

  // Registers a new employee if all the checks are passes 
  // Bug: The signed up user will become the new user, so the admin gets signed out
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password|| !passwordRepeat) {
      toast.error('All fields must be filled out');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if(password != passwordRepeat){
      toast.error('Passwords must be the same');
      return;
    }
    try {
      // Checks if email exists among employees, then among admins
      let emailExists = employees.some(employee => employee.mail == email);

      if(!emailExists){
        emailExists = admins.some(admin => admin.mail === email)
      }

      if (emailExists) {
        toast.error('The email already exists');
        return;
      }

      await addEmployee(firstName, lastName, email);
      await supabase.auth.signUp({
        email,
        password
      });
      toast.success('Employee registered');
      router.push('/adminMain')
    } catch (error) {
      console.error('Failed to update employee');
      toast.error('Something went wrong. Employee did not get registered');
    }
  };

  const handleCancel = () => {
    router.push('/adminMain');
  };

  // Shows NotSignedIn-component if the user is not signed in 
  if (dataLoaded) {
    if(!admin || admin.length == 0) {
      return <NotSignedIn />;
    }
  }

  return (
      <main className="container min-h-screen max-w-full">
        <Head>
          <title>Admin - Register Employee</title>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Header />

        <div className="flex justify-center mt-8 font-sans text-base">
          {dataLoaded ? (
              <div className="container mx-auto px-4 max-w-md">
                <h1 className="text-xl font-semibold mb-4">Register Employee</h1>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                      First name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                      Last name
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Repeat password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="passwordRepeat"
                        type="password"
                        placeholder="Repeat password"
                        onChange={(e) => setPasswordRepeat(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                        className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                    >
                      Register
                    </button>
                    <button
                        className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="button"
                        onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>

              </div>
          ) : (
              <div className="w-1/2">
                <p className="">Loading...</p>
              </div>
          )}
        </div>

        <ToastContainer />
      </main>
  );
}