import { fireEvent, render, screen } from '@testing-library/react';
import EditProfileModal from '../EditProfileModal';
import type { User } from '@lib/types';

const user: User = {
  id: 'u1',
  name: 'Alice',
  email: 'a@example.com',
  avatar: '',
  achievements: [],
  playedStories: [],
  endingsUnlocked: 0,
  favorites: [],
  credits: 0,
  maxCredits: 0,
  lastRefillTime: 0,
  ratedStoriesForBonus: [],
};

describe('EditProfileModal', () => {
  it('saves updated name and avatar', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <EditProfileModal isOpen onClose={onClose} onSave={onSave} user={user} />,
    );

    fireEvent.change(screen.getByLabelText('ชื่อที่แสดง'), {
      target: { value: 'Bob' },
    });
    fireEvent.change(screen.getByPlaceholderText('หรือวางลิงก์รูปภาพ'), {
      target: { value: 'https://example.com/a.jpg' },
    });
    fireEvent.click(screen.getByText('บันทึก'));

    expect(onSave).toHaveBeenCalledWith({ name: 'Bob', avatar: 'https://example.com/a.jpg' });
  });
});
