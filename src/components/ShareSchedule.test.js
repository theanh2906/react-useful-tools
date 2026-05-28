describe('ShareSchedule Component', () => {
    it('should generate and display a public URL when share button is clicked', () => {
        const { getByText } = render(<ShareSchedule schedule={{ id: '1', title: 'Test Schedule', date: '2023-10-01' }} />);
        fireEvent.click(getByText('Generate Shareable Link'));
        expect(getByText(/Your public URL:/)).toBeInTheDocument();
    });
});