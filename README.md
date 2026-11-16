# Bike Rental Management System

A full-stack web application developed as a a part of a bachelor thesis written at the end of a 3 year computer science degree at NTNU Trondheim, which concluded in 2024. 
The system consists of two separate applications for a bike rental company:

- **Customer Booking System** – Allows customers to book bike services
- **Service Technician System** – Enables service technicians to receive, manage, and analyse services

> **Note:** The company name has been anonymized throughout the codebase (replaced with `FIRMA`). Logo images have been replaced with placeholders, and sensitive information has been redacted in the screenshots located in the `/images` folder.

## Tech Stack

- **Frontend & Backend:** Next.js (JavaScript)
- **Database & Auth:** Supabase
- **Styling:** Tailwind

## Project structure 

```text
bachelor-project/
│
├── service-booking-by-ntnu/          # Customer booking system
│   ├── src/
│   │   ├── app/
│   │   │   ├── booking/              # Booking-related pages
│   │   │   ├── components/           # Reusable UI components
│   │   │   ├── services/             # API
│   │   │   └── utils/                # Supabase client
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js                   # Main page
│   ├── public/                       # Images
│   ├── middleware.js                 # Security
│   ├── __tests__/                    # Unit / integration tests
│   └── ...                           # Config files (Next.js, Tailwind, Jest, etc.)
│
├── service-management-by-ntnu/       # Service technician system
│   ├── src/
│   │   └── app/
│   │       ├── adminMain/            # Admin page for employee management
│   │       ├── api/                  # API routes
│   │       ├── authServerComponents/ # Returns the signed in user
│   │       ├── BikePage/             # Bike-related information
│   │       ├── components/           # Shared UI components
│   │       ├── employeeMain/         # Main dashboard for employees
│   │       ├── forgotPassword/       # Password recovery
│   │       ├── registerEmployee/     # Employee registration
│   │       ├── serviceBox/           # Service management
│   │       ├── servicesSearch/       # Search functionality for services
│   │       ├── updateUser/           # User profile updates
│   │       └── utils/                # Supabase utils
│   ├── public/                       # Images
│   └── ...                           # Config files (Next.js, Tailwind, etc.)
│
└── README.md
```

## Running the project
The supabase database used in the project is no longer running. If the system is to be used, a new database has to be created (the db model is in the `/images` folder). 
An .env.local file has to be created and filled with the supabase keys.

