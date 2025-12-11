import { useEffect } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import ProfilePage from '../page';
import { useAuth } from '@lib/auth-context';
import { renderWithProviders } from '@/test/test-utils';
import { routerMock } from '@/test/navigation';

function LoggedInProfile() {
  const { login, user } = useAuth();

  useEffect(() => {
    void login('player@example.com', 'password123');
  }, [login]);

  if (!user) return null;
  return <ProfilePage />;
}

function GuestProfile() {
  const { loginAsGuest, user } = useAuth();

  useEffect(() => {
    loginAsGuest();
  }, [loginAsGuest]);

  if (!user) return null;
  return <ProfilePage />;
}

describe('ProfilePage', () => {
  it('lets a signed-in user edit profile details', async () => {
    renderWithProviders(<LoggedInProfile />);

    await waitFor(() => expect(screen.getByText('player')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('แก้ไขโปรไฟล์')[0]);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'แก้ไขโปรไฟล์' })).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('ชื่อที่แสดง'), { target: { value: 'นักเดินทาง' } });
    fireEvent.change(screen.getByPlaceholderText('หรือวางลิงก์รูปภาพ'), {
      target: { value: 'https://picsum.photos/seed/profile-test/200/200' },
    });

    fireEvent.click(screen.getByText('บันทึก'));

    await waitFor(() => expect(screen.getAllByText('นักเดินทาง')[0]).toBeInTheDocument());
  });

  it('shows guest restrictions and upgrade prompt', async () => {
    renderWithProviders(<GuestProfile />);

    await waitFor(() => expect(screen.getByText('ผู้เยี่ยมชม (Guest)')).toBeInTheDocument());
    expect(screen.getByText('คุณกำลังใช้งานในโหมดผู้เยี่ยมชม')).toBeInTheDocument();

    fireEvent.click(screen.getByText('ประวัติการเล่น'));
    await waitFor(() =>
      expect(screen.getByText('ประวัติการเล่นจะถูกบันทึกสำหรับสมาชิกเท่านั้น')).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByText('ลงทะเบียนเลย'));
    expect(routerMock.push).toHaveBeenCalledWith('/auth/signup');
  });
});
