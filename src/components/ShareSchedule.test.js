import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ShareSchedule from './ShareSchedule';

describe('ShareSchedule Component', () => {
    it('should share the schedule and display success message', async () => {
        const { getByText } = render(<ShareSchedule userId="12345" />);
        fireEvent.click(getByText(/Share/i));
        expect(await findByText(/Schedule shared successfully/i)).toBeInTheDocument();
    });

    it('should handle share failure', async () => {
        const { getByText } = render(<ShareSchedule userId="invalidId" />);
        fireEvent.click(getByText(/Share/i));
        expect(await findByText(/Failed to share schedule/i)).toBeInTheDocument();
    });
});