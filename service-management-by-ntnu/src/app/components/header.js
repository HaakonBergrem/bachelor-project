/* The "Header" component. It is used throughout the app. It always shows the FIRMA-logo, but only shows "Sign out" 
and "Edit profile" if the user is signed in*/

"use client"

import { useRouter, usePathname } from 'next/navigation';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { fetchAllAdmins } from '@/app/api/admin';

export default function Header() {
    const router = useRouter();

    const supabase = createClientComponentClient();

    const currentPage = usePathname();

    // Signs the user out
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/")
    };
    const handleUpdateUser = async () => {
        router.push("/updateUser")
    };

    // Sends the user to the correct page based on if he is not signed in, if he is a signed in employee, or if he
    // is a signed in admin
    const handlePushToMain = async () => {
        const res = await supabase.auth.getUser();
        const user = res.data.user;

        // If the user is not signed in
        if(user == null){
            router.push("/");
            return;
        }

        // The /updateUser page can be accessed by both employees and admins, so a check has to be done
        if(currentPage == "/updateUser"){
            const admins = await fetchAllAdmins();

            const matchingAdmin = admins.find(admin => admin.mail === user.email);
            if(matchingAdmin){
                router.push("/adminMain");
            }
            else{
                router.push("/employeeMain");
            }
        }
        else{
            // Navigate to correct page based on what page the user is on (admin-pages or employee-pages)
            if (currentPage == "/registerEmployee" || currentPage == "/editEmployee" || currentPage == "/adminMain") {
                router.push("/adminMain");
            } else {
                router.push("/employeeMain");
            }
        }
    };
    
    return (
        <header className="bg-brand-base-950 shadow w-screen">
            <div className="px-6 py-4 w-screen">
                <div className="flex items-center justify-between">
                    <img
                        src="placeholder.jpg"
                        alt="Header Logo"
                        className="hover:cursor-pointer"
                        onClick={handlePushToMain}
                        style={{height: '60px'}}
                    />
                    {currentPage !== "/" && currentPage !== "/forgotPassword" &&  (
                        <div>
                            <p className="text-sm text-brand-base-100 hover:text-brand-base-200 active:text-brand-base-500 hover:cursor-pointer mr-4 mb-1"
                               onClick={handleUpdateUser}>Edit profile</p>
                            <p className="text-sm text-brand-base-100 hover:text-brand-base-200 active:text-brand-base-500 hover:cursor-pointer"
                               onClick={handleLogout}>Sign out</p>

                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}