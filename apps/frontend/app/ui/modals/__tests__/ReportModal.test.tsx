import { fireEvent, render, screen } from '@testing-library/react';
import ReportModal from '../ReportModal';

describe('ReportModal', () => {
  it('submits with selected reason and description', () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <ReportModal
        isOpen
        onClose={onClose}
        onSubmit={onSubmit}
        title="Test Story"
        targetType="story"
      />,
    );

    fireEvent.click(screen.getByLabelText(/เนื้อหาไม่เหมาะสม/));
    fireEvent.change(screen.getByPlaceholderText(/โปรดอธิบาย/), {
      target: { value: 'Not good' },
    });
    fireEvent.click(screen.getByText('ส่งรายงาน'));

    expect(onSubmit).toHaveBeenCalledWith('inappropriate', 'Not good');
  });
});
