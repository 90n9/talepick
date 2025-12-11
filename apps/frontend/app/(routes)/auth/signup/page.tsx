'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@lib/auth-context';
import { getPasswordStrength } from '@lib/password-utils';
import AuthLayout from '@ui/AuthLayout';
import SignupOtpForm from './SignupOtpForm';
import SignupRegisterForm from './SignupRegisterForm';
import SignupSuccess from './SignupSuccess';

type Step = 'REGISTER' | 'OTP' | 'SUCCESS';

export default function SignupPage() {
  const { startSignup, verifySignupOtp, login, loginAsGuest } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('REGISTER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleClose = useMemo(
    () => () => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    },
    [router]
  );

  useEffect(() => {
    if (timer <= 0) return;
    const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(countdown);
  }, [timer]);

  const strength = getPasswordStrength(formData.password);
  const hasPassword = formData.password.length > 0;
  const isRegisterValid =
    Boolean(formData.name.trim()) &&
    Boolean(formData.email.trim()) &&
    hasPassword &&
    formData.password === formData.confirmPassword &&
    strength >= 2;

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isRegisterValid) return;
    setIsLoading(true);
    setMessage(null);
    setError(null);
    try {
      await startSignup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setStep('OTP');
      setTimer(60);
      setMessage(`ส่งรหัสยืนยันไปยัง ${formData.email}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await verifySignupOtp(otp);
      setStep('SUCCESS');
      setMessage('สมัครสมาชิกสำเร็จ! ระบบพาไปยังคลังนิยาย');
      router.push('/stories');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setMessage('ส่งรหัสยืนยันอีกครั้งแล้ว');
    setTimer(60);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await login('chronos.user@talepick.com', 'oauth-google');
      router.push('/stories');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        step === 'REGISTER'
          ? 'สร้างบัญชีผู้ใช้'
          : step === 'OTP'
            ? 'ยืนยันอีเมล'
            : 'พร้อมออกเดินทาง'
      }
      subtitle={
        step === 'REGISTER'
          ? 'เริ่มต้นการเดินทางของคุณวันนี้'
          : step === 'OTP'
            ? 'กรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ'
            : 'ลงชื่อเข้าใช้ได้ทันที'
      }
      onClose={handleClose}
    >
      {step === 'REGISTER' && (
        <>
          <SignupRegisterForm
            formData={formData}
            strength={strength}
            isValid={isRegisterValid}
            isLoading={isLoading}
            error={error}
            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
            onSubmit={handleRegisterSubmit}
            onGoogleSignup={handleGoogleSignup}
            onGuestSignup={loginAsGuest}
          />
          <div className='mt-8 text-center text-sm text-gray-400 animate-slide-up-fade delay-700 fill-mode-forwards opacity-0'>
            มีบัญชีอยู่แล้ว?{' '}
            <Link
              href='/auth/login'
              className='text-primary hover:text-blue-400 font-semibold transition-colors hover:underline decoration-blue-500/30 underline-offset-4'
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </>
      )}

      {step === 'OTP' && (
        <SignupOtpForm
          email={formData.email}
          otp={otp}
          timer={timer}
          isLoading={isLoading}
          message={message}
          error={error}
          onOtpChange={setOtp}
          onBack={() => {
            setStep('REGISTER');
            setOtp('');
            setTimer(0);
          }}
          onResend={handleResendOtp}
          onSubmit={handleVerifyOtp}
        />
      )}

      {step === 'SUCCESS' && <SignupSuccess />}
    </AuthLayout>
  );
}
