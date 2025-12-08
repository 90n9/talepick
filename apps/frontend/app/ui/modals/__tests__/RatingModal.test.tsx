import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RatingModal from '../RatingModal';

describe('RatingModal', () => {
  it('submits rating and comment', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <RatingModal
        isOpen
        onClose={onClose}
        onSubmit={onSubmit}
        storyTitle="Test Story"
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: '' })[4]); // 5th star
    fireEvent.change(screen.getByPlaceholderText(/บอกเล่าความประทับใจ/), {
      target: { value: 'Great!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ส่งรีวิว' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(5, 'Great!'));
  });
});
