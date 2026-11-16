/* The Update User" page. Allows a signed in user to update his profile-info. If he changes his email, he will need to verify
the change by clicking the link sent to his current email
The user also lands here and gets signed in if he clicks the update-password-link sendt to his email (if he forgot his password)*/

"use client"

import { useRouter} from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/app/components/header';
import Head from 'next/head'
import NotSignedIn from "@/app/components/notSignedIn"

import { fetchEmployeeByEmail, fetchAllEmployees, updateEmployeeExceptMail } from '@/app/api/employee';
import { fetchAdminByEmail, fetchAllAdmins, updateAdminExceptMail } from '@/app/api/admin';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function UpdateUser() {

  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const [user, setUser] = useState();

  // Used to check whether an employee or admin is signed in
  const [matchingAdmin, setMatchingAdmin] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [dataLoaded, setDataLoaded] = useState(false);

  // To check if the user came to the page through mail-link
  const [checkUserSignedIn, setCheckUserSignedIn] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    // When the update-password-link is clicked the event equals "SIGNED_IN"
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "SIGNED_IN"){
        setCheckUserSignedIn(true);
        handleUserLoggedIn(session.user.email);
      }
    })
    data.subscription.unsubscribe();

    const checkSignedIn = async () => {
      const res = await supabase.auth.getUser();
      const user = res.data.user;

      if(user !== null){
        handleUserLoggedIn(user.email);
      }
    }
    // Will be false if the user came here through the app, not the mail-link
    if(checkUserSignedIn == false){
      checkSignedIn();
    }
  }, []);

  // Fetches the signed in user from either the employee- or admin-table
  async function handleUserLoggedIn(userEmail) {
    try {
      let matchingUser = await fetchEmployeeByEmail(userEmail);

      if(matchingUser.length == 0){
        matchingUser = await fetchAdminByEmail(userEmail);
        if(matchingUser.length !== 0){
          setMatchingAdmin(true);
        }
        // No matching employee, nor admin
        else{
          toast.error('Something went wrong');

          setDataLoaded(true);
          return;
        }
      }
      setUser(matchingUser[0]);
    }catch (error) {
      console.error('Failed to fetch user');
      toast.error('Something went wrong');
    }
    finally{
      setDataLoaded(true);
    }
  }

  // Runs when the user is fetched
  useEffect(() => {
    async function fetchUser() {
      if (user) {
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setEmail(user.mail);
      }
    }

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

    fetchUser();
    fetchEmployees();
    fetchAdmins();
  }, [user]);

  // Updates the user if all checks are passed
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !passwordRepeat) {
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
      // Fetches all employees and admins, except the signed in user
      const employeesExceptCurrent = employees.filter(employee => employee.mail != user.mail);
      const adminsExceptCurrent = admins.filter(admin => admin.mail != user.mail);

      // Checks whether email already exists among employees and then admins
      let emailExists = employeesExceptCurrent.some(employee => employee.mail === email);

      if(!emailExists){
        emailExists = adminsExceptCurrent.some(admin => admin.mail === email)
      }

      if (emailExists) {
        toast.error('The email already exists');
        return;
      }
      await updateUser();
    } catch (error) {
      console.error('Failed to update user');
      toast.error('Something went wront. User did not get updated');
    }
  };

  async function updateUser() {
    // If the user has changed his email
    if(user.mail !== email){
      const { dataEmail, errorEmail } = await supabase.auth.updateUser({
        email: email
      })
      if(!errorEmail){
        toast.success('Verification sent to the new email. Action required to update email');
      }
      else{
        toast.error('An error occured, could not update email')
      }
    }
    // First updates the user-info in either the employee- or admin-table, then the password in the corresponding user-table
    if(matchingAdmin){
      updateAdminExceptMail(user.admin_id, firstName, lastName);
    }
    else{
      updateEmployeeExceptMail(user.employee_id, firstName, lastName);
    }

    const { dataPassword, errorPassword } = await supabase.auth.updateUser({
      password: password
    })

    toast.success('User updated');
  }

  const handleCancel = () => {
    if(matchingAdmin){
      router.push('/adminMain');
    }
    else{
      router.push('/employeeMain');
    }
  };

  // Shows NotSignedIn-component if the user is not signed in 
  if (dataLoaded && user == undefined) {
    return <NotSignedIn />;
  }

  return (
      <main className="container min-h-screen max-w-full">
        <Head>
          <title>Update user</title>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Header />
        <div >
          <div className="container mx-auto mt-8 px-4 max-w-md font-sans text-base">
            <h1 className="text-xl font-semibold mb-4">Edit profile</h1>
            {dataLoaded ? (
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
                        value={firstName}
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
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold" htmlFor="email">
                      Email
                    </label>
                    <p className="text-sm text-gray-400 mb-2"></p>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      New password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Repeat new password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="passwordRepeat"
                        type="password"
                        placeholder="Repeat password"
                        value={passwordRepeat}
                        onChange={(e) => setPasswordRepeat(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <button
                          className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                          type="submit"
                      >
                        Save
                      </button>
                    </div>

                    <button
                        className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline self-start"
                        type="button"
                        onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
            ) : (
                <p>Loading...</p>
            )}

          </div>
        </div>
        <ToastContainer />
      </main>
  );
}