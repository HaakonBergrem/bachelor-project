import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Form from '@/app/booking/[id]/form/page';
import {act} from '@testing-library/react';
import React from "react";

jest.mock('@/app/services/BookingService', () => ({
    postBooking: jest.fn(),
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

describe('Form', () => {
    beforeEach(() => {
        sessionStorage.setItem('bookingDetails', JSON.stringify({
            date: '2024-05-05',
            time: '09:00',
            serviceId: '123',
        }) );
    } );

    test('renders Form component without crashing', async () => {
        await act(async () => {
            render(<Form/>)
        });
    });

    test('renders form fields', async () => {
        await act(async () => {
            render(<Form/>)
        });
        expect(screen.getByPlaceholderText('Ditt fornavn')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ditt etternavn')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('eksempel@mail.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ditt mobilnr')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('SykkelNr')).toBeInTheDocument();

    });

    test('error messages are displayed when form is submitted with empty fields', async () => {
        await act(async () => {
            render(<Form/>)
        });

        const submitButton = screen.getByText('Book nå');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Fornavn er påkrevd')).toBeInTheDocument();
            expect(screen.getByText('Etternavn er påkrevd')).toBeInTheDocument();
            expect(screen.getByText('Epost er påkrevd')).toBeInTheDocument();
            expect(screen.getByText('Mobilnr er påkrevd')).toBeInTheDocument();
            expect(screen.getByText('SykkelNr er påkrevd')).toBeInTheDocument();
            expect(screen.getByText('Dette feltet er påkrevd')).toBeInTheDocument();
            expect(screen.getByText('Kommentar er påkrevd')).toBeInTheDocument();
        });
    });

    test('error messages are displayed when form is submitted with invalid email', async () => {
        await act(async () => {
            render(<Form/>)
        });

        fireEvent.change(screen.getByPlaceholderText('eksempel@mail.com'), { target: { value: 'john@doe' } });
        fireEvent.click(screen.getByText('Book nå'));

        await waitFor(() => {
            expect(screen.getByText('Epost er ikke gyldig')).toBeInTheDocument();
        });
    });

    test('handles input changes', async () => {
        await act(async () => {
            render(<Form />);
        });

        const firstNameInput = screen.getByPlaceholderText('Ditt fornavn');
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        expect(firstNameInput.value).toBe('John');
    });

    test('opens and interacts with confirmation modal', async () => {
        await act(async () => {
            render(<Form />);
        });

        await act (async () => {
            fireEvent.change(screen.getByPlaceholderText('Ditt fornavn'), { target: { value: 'John' } });
            fireEvent.change(screen.getByPlaceholderText('Ditt etternavn'), { target: { value: 'Doe' } });
            fireEvent.change(screen.getByPlaceholderText('eksempel@mail.com'), { target: { value: 'john.doe@example.com' } });
            fireEvent.change(screen.getByPlaceholderText('Ditt mobilnr'), { target: { value: '1234567890' } });
            fireEvent.change(screen.getByPlaceholderText('SykkelNr'), { target: { value: '98765' } });

            fireEvent.click(screen.getByLabelText('Ja'));
            fireEvent.change(screen.getByPlaceholderText('Beskriv hva du trenger hjelp med...'), { target: { value: 'Test' } });
            fireEvent.click(screen.getByLabelText('Yes, I agree to the Terms of Service and the Privacy Policy'));
            fireEvent.click(screen.getByText('Book nå'));
        });


        await waitFor(() => {
            expect(screen.getByText('Bekreft Booking')).toBeInTheDocument();
        });


        await act(async () => {
                fireEvent.click(screen.getByText('Bekreft'));
            }
        );
        expect(screen.queryByText('Bekreft Booking')).not.toBeInTheDocument();
    });

});