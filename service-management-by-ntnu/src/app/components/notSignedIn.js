/* The "NotSignedIn" Component. It is used when the user is not signed in */

import Link from 'next/link'
import Head from 'next/head';
import Header from '@/app/components/header';

export default function NotSignedIn() {
    return (
        <main className="container min-h-screen">
            <Head>
                <title>Not signed in</title>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <Header />
            <div className="text-center mt-20">
                <Link href="/">
                    <p className="mb-8">You are not signed in. Click here to sign in</p>
                </Link>
            </div>
        
        </main>
    );
}
