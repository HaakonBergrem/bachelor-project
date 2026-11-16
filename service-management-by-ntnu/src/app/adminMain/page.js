/* The "Admin Main" page. Here he can choose to delete or register an employee '*/

"use client"

import Head from 'next/head';
import Link from 'next/link';
import Header from '@/app/components/header';
import NotSignedIn from "@/app/components/notSignedIn"
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useState, useEffect } from 'react';
import { fetchAllEmployees, deleteEmployee } from '@/app/api/employee';
import { fetchAdminByEmail } from '@/app/api/admin';

import { getUser } from '@/app/authServerComponents/getUser';

import supabaseAdmin from '@/app/utils/supabaseAdmin'

export default function AdminMain() {

  const [admin, setAdmin] = useState();
  const [employees, setEmployees] = useState([]);

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

  async function fetchEmployees() {
    try {
      const employeesData = await fetchAllEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  }

  useEffect(() => {
    fetchAdmin();
    fetchEmployees();
  }, []);

  // Function for deleting an employee. Admin has to confirm 2 times for the employee to be deleted.
  const handleDelete = async (employee) => {
    const confirmDelete1 = window.confirm('Are you sure you want to delete this employee?');

    if (confirmDelete1) {
      const confirmDelete2 = window.confirm('Are you completely sure you want to delete this employee?');
      if(confirmDelete2){
        try {
          const res = await supabaseAdmin.auth.admin.listUsers()

          // Goes through all users
          for (const user of res.data.users) {
            // Compare the email with all the user-emails
            if (user.email === employee.mail) {
              // If the email matches, delete the user
              const userId = user.id;
              const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
              
              if (error) {
                console.error('Error deleting user');
                break;
              }
              // After the user is deleted, delete the corresponding employee from the employee-table
              await deleteEmployee(employee.employee_id);
              toast.success('Employee deleted');        
              return; 
            }
          }  
        } catch (error) {
          console.error('Failed to delete employee');
          toast.error('Something went wrong. Employee did not get deleted');
        }
        
      }
        
    }
  };
  
   // Shows NotSignedIn-component if the user is not signed in 
  if (dataLoaded) {
    if(!admin || admin.length == 0) {
      return <NotSignedIn />;
    }
  }

  return (
    <main className="container min-h-screen">
      <Head>
        <title>Admin - Manage Employees</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header />
      
      <div className="flex justify-center mt-8 w-screen font-sans text-base">
      {dataLoaded ? (
        <div className="w-1/2">
          <h2 className="text-lg font-semibold mb-2">Click on employee to delete</h2>
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            {employees.map(employee => (
               <div className="cursor-pointer hover:bg-gray-100 p-2 rounded-md" onClick={() => handleDelete(employee)}>
                {employee.first_name} {employee.last_name} | {employee.mail}</div>
            ))}
          </div>
          <h2 className="text-lg font-semibold mb-2">Or register a new employee</h2>
          <Link href="/registerEmployee">
            <button className="bg-brand-base-500 hover:bg-brand-base-600 active:bg-brand-base-900 text-white font-bold py-2 px-4 rounded">
              Register employee
            </button>
          </Link>
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