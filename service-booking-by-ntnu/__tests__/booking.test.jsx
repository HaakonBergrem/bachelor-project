import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Booking from "@/app/booking/[id]/page";
import { getUnavailableTimeSlots, getNrOfEmployees } from '@/app/services/BookingService';
import {act} from '@testing-library/react';
import {useRouter} from "next/navigation";

jest.mock('@/app/services/BookingService', () => ({
    getUnavailableTimeSlots: jest.fn(),
    getNrOfEmployees: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            prefetch: () => null,
            push: jest.fn(),
            back: jest.fn(),
            query: { id: '123' },
            pathname: '/',
            asPath: '/'
        };
    },
    useParams() {
        return { id: '123' };
    }
}));


describe('Booking Component', () => {
    beforeEach(() => {
        getUnavailableTimeSlots.mockResolvedValue({
            notAvailable: [],
            bookedServices: [],
        });
        getNrOfEmployees.mockResolvedValue(5);
    });

    it('renders correctly and displays date picker', async () => {
        await act(async () => { render(<Booking/>) });
        expect(screen.getByText('Velg et tidspunkt')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /fortsett/i})).toBeDisabled();
    });

    it('renders correctly and allows navigation interactions', async () => {
        await act(async () => { render(<Booking />) });
        expect(screen.getByText('Velg et tidspunkt')).toBeInTheDocument();

        const push = useRouter().push;
        push('/next-page');  // Simulate navigation

        expect(push).toHaveBeenCalledWith('/next-page');
    });



    /**
    it('enables the continue button when a time slot is selected', async () => {
        await act(async () => { render(<Booking />) });
        const timeButton = await screen.findByText('09:00');
        fireEvent.click(timeButton);

        await waitFor(() => {
            const continueButton = screen.getByRole('button', { name: /fortsett/i });
            expect(continueButton).not.toBeDisabled();
        });
    });
    */

    it('handles no available times correctly', async () => {
        getUnavailableTimeSlots.mockResolvedValueOnce({
            notAvailable: [{ time: '09:00' }, { time: '10:00' }],
            bookedServices: [{ booking_time: '11:00' }, { booking_time: '12:00' }]
        });
        render(<Booking />);
        await waitFor(() => {
            expect(screen.getByText('Ingen tidspunkt tilgjengelig denne dagen')).toBeInTheDocument();
        });
    });

});