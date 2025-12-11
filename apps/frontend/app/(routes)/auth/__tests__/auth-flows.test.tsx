import { fireEvent, screen, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../forgot-password/page';
import LoginPage from '../login/page';
import SignupPage from '../signup/page';
import { renderWithProviders } from '../../../../test/test-utils';
import { routerMock, setSearchParams } from '../../../../test/navigation';

describe('Auth flows', () => {
  it('logs in successfully and redirects', async () => {
    setSearchParams(new URLSearchParams('redirect=/profile'));
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('อีเมล'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('รหัสผ่าน'), {
      target: { value: 'password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/profile'));
    expect(screen.getByText('เข้าสู่ระบบสำเร็จ')).toBeInTheDocument();
  });

  it('shows login error for invalid credentials', async () => {
    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('อีเมล'), {
      target: { value: 'fail@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('รหัสผ่าน'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: 'เข้าสู่ระบบ' }));

    await waitFor(() =>
      expect(screen.getByText('อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeInTheDocument()
    );
  });

  it('handles signup OTP success and error paths', async () => {
    renderWithProviders(<SignupPage />);

    fireEvent.change(screen.getByPlaceholderText('ชื่อผู้ใช้'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText('ที่อยู่อีเมล'), {
      target: { value: 'signup@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('รหัสผ่าน'), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('ยืนยันรหัสผ่าน'), {
      target: { value: 'StrongPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ถัดไป' }));

    await waitFor(() => expect(screen.getByText(/รหัสยืนยันถูกส่งไปที่/)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '111111' } });
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันและเริ่มใช้งาน' }));
    await waitFor(() => expect(screen.getByText('รหัส OTP ไม่ถูกต้อง')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันและเริ่มใช้งาน' }));

    await waitFor(() => expect(routerMock.push).toHaveBeenCalledWith('/stories'));
  });

  it('resets password after verifying OTP', async () => {
    renderWithProviders(<ForgotPasswordPage />);

    fireEvent.change(screen.getByPlaceholderText('ที่อยู่อีเมลของคุณ'), {
      target: { value: 'reset@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'รับรหัส OTP' }));

    await waitFor(() => expect(screen.getByText(/รหัส OTP ถูกส่งไปที่/)).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/กรอกรหัส 6 หลัก/), {
      target: { value: '111111' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันรหัส' }));
    await waitFor(() => expect(screen.getByText('รหัส OTP ไม่ถูกต้อง')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText(/กรอกรหัส 6 หลัก/), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'ยืนยันรหัส' }));

    await waitFor(() => expect(screen.getByPlaceholderText('รหัสผ่านใหม่')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('รหัสผ่านใหม่'), {
      target: { value: 'ResetPass123!' },
    });
    fireEvent.change(screen.getByPlaceholderText('ยืนยันรหัสผ่านใหม่'), {
      target: { value: 'ResetPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

    await waitFor(() => expect(screen.getByText('สำเร็จ!')).toBeInTheDocument());
  });
});
