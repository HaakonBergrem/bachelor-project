# Customer Service Booking

## Overview

This is a Next.js project for booking services for FIRMA's customers. It uses Tailwind CSS for styling and Supabase for backend services.
The system is intended for FIRMA's customers who need to book maintenance services for their bikes.

## Project Structure

- **Configuration Files:** Various configuration files for the project.
- **Environment File:** `.env.local` for environment variables.
- **Package Files:** `package.json` and `package-lock.json` for managing dependencies.
- **Public Directory:** Contains static assets like images.
- **Source Code:** Located in the `src` directory with subdirectories for application pages, components, and services.
- **Test Files:** Located in the `__tests__` directory.
- **Coverage Reports:** Located in the `coverage` directory.

## Setup
1. **Clone the repository:**
    ```bash
    git clone https://github.com/bachelor-project/service-booking-by-ntnu.git
    cd customer-service-booking
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

- **Test:**
  ```bash
  npm run test
  ```

- **Lint:**
  ```bash
  npm run lint
  ```

## Testing

The project uses Jest for testing. Test files are located in the `__tests__` directory.

- **Run tests:**
    ```bash
    npm run test
    ```
  
- **Jest Setup:** Configuration and setup for Jest can be found in `jest.config.js` and `jest.setup.js`.

## Continuous Integration and Deployment

This project uses Vercel for continuous integration and deployment. Vercel automatically deploys the project on every push to the `main` branch.

### Setup Vercel

1. **Create a Vercel Account:**
    - Go to [Vercel](https://vercel.com/) and sign up for an account.

2. **Import GitHub Repository:**
    - Connect your GitHub account and import the customer service booking repository.

3. **Configure Environment Variables:**
    - In the Vercel dashboard, go to the project settings and add the necessary environment variables:
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy:**
    - Vercel will automatically deploy the project on every push to the `main` branch.


## Email Confirmation

The `email` branch includes functionality for sending automatic email confirmations to users upon booking, using the [Resend](https://resend.com/) service.

### Setup Email Confirmation

1. **Switch to the `email` branch:**
    ```bash
    git checkout email
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Configure Resend:**
    - Ensure you have an account with [Resend](https://resend.com/) and set up an API key.

4. **Setup environment variables:**
    - Add the following environment variables to your `.env.local` file:
        ```bash
        RESEND_API_KEY=<your-resend-api-key>
        ```
    - The same variable needs to be added to the Vercel environment variables.
        

### Usage

Once the environment variables are configured and the dependencies are installed, the system will automatically send an email confirmation to the user upon a successful booking.


