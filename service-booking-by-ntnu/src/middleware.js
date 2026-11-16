import { NextResponse } from 'next/server';

/**
 * Middleware function
 * This function sets various security headers on the response.
 * It receives a request object and returns a response object with the headers set.
 * The headers set by this function include:
 * - X-Frame-Options: to prevent clickjacking
 * - Content-Security-Policy: to prevent XSS attacks
 * - X-Content-Type-Options: to prevent MIME-sniffing
 * - Referrer-Policy: for controlling referrer information
 * - Permissions-Policy: to disable unused browser features
 *
 * @param {Object} request - The request object
 * @returns {Object} - The response object with the headers set
 */
export function middleware(request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const response = NextResponse.next();

    //X-Frame-Options header to prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    //Content-Security-Policy header to prevent XSS attacks
    response.headers.set(
        'Content-Security-Policy',
        `default-src 'self' ${supabaseUrl}; script-src 'self' 'unsafe-inline' 'unsafe-eval' ; style-src 'self' 'unsafe-inline';`
    );

    //X-Content-Type-Options header to prevent MIME-sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    //Referrer-Policy header for controlling referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    //Permissions-Policy header to disable unused browser features
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}
