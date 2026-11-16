import '@testing-library/jest-dom'
import {render, screen, waitFor} from '@testing-library/react'
import Home from "@/app/page";
import {getServiceTypes} from "@/app/services/BookingService";
import {act} from '@testing-library/react';

// Mocking the API call
jest.mock('@/app/services/BookingService', () => ({
    getServiceTypes: jest.fn(),
}));
describe('Home Component', () => {
    it('renders the Header with logo', async() => {
        getServiceTypes.mockResolvedValue([]);
        await act(async () => { render(<Home />) });
        const logo = screen.getByAltText('logo');
        expect(logo).toBeInTheDocument();
    });

    it('loads and displays service types', async () => {
        // Mock data to return
        const mockServices = [
            { service_type_id: 1, name: 'FIRMA sykkelservice', description: 'Description One', duration_minutes: 60, address: '123 Test St', additional_info: 'Info One' },
            { service_type_id: 2, name: 'Eie sykkelservice', description: 'Description Two', duration_minutes: 60, address: '456 Test Ave', additional_info: 'Info Two' }
        ];

        // Set up the mock to resolve with mock data
        getServiceTypes.mockResolvedValue(mockServices);

        // Render the component
        const { getByText } = render(<Home />);

        // Check if the service names are displayed
        await waitFor(() => {
            expect(getByText(`${mockServices[0].name}`)).toBeInTheDocument();
            expect(getByText(`${mockServices[1].name}`)).toBeInTheDocument();
        });
    });
});