# Bike-Service System for Technicians
This is a Next.js project intended for technicians managing bike-services received from customers. It uses Tailwind CSS for styling and Supabase for backend services. The app is part of a system also containing a booking-application for customers.

## Overview
A technician can see and edit services registered on him, and others. He can choose availability in the calendar which will determine whether a customer can book a service on that date/time. The applicaion also
has admin-pages for the admin. He can register new technicians, or delete old ones. 

## Project structure
* Configuration Files: Various configuration files for the project.
* Environment File: .env.local for environment variables.
* Package Files: package.json and package-lock.json for managing dependencies.
* Public Directory: Contains static assets like images.
* Source Code: Located in the src directory with subdirectories for application pages, components, and utilities. 

## Setup
1. **Clone the repository:**
    ```bash
    git clone https://github.com/bachelor-project/service-management-by-ntnu.git
    cd service-management-by-ntnu
    ```

2. **Install dependencies:**
    ```bash
    npm install
   ```

    Node.js and npm can be installed [here](https://nodejs.org/en/download/prebuilt-installer)
3. **Setup environment variables:**
    - Create a `.env.local` file in the root directory.
    - Add the following environment variables:
        ```bash
        NEXT_PUBLIC_SUPABASE_URL = YOUR URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY = YOUR ANON KEY
        NEXT_PUBLIC_SUPABASE_SERVICE_KEY = YOUR SECRET KEY
        ```
      
4. **Run the development server:**
    ```bash
    npm run dev
    ```
The app will be available at [http://localhost:3000](http://localhost:3000).


## Scripts

- **Development:**
  ```bash
  npm run dev
  ```

- **Build:**
  ```bash
  npm run build
  ```

- **Start:**
  ```bash
  npm start
  ```
- **Lint:**
  ```bash
  npm run lint
  ```

## Continuous Integration and Deployment

This project uses Vercel for continuous integration and deployment. Vercel automatically deploys the project on every push to the `main` branch.

### Setup Vercel

1. **Create a Vercel Account:**
    - Go to [Vercel](https://vercel.com/) and sign up for an account.

2. **Import GitHub Repository:**
    - Connect your GitHub account and import the bike-service system repository.

3. **Configure Environment Variables:**
    - In the Vercel dashboard, go to the project settings and add the necessary environment variables:
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        - `NEXT_PUBLIC_SUPABASE_SERVICE_KEY`

4. **Deploy:**
    - Vercel will automatically deploy the project on every push to the `main` branch.


