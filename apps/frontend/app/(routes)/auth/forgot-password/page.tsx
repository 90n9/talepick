'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@lib/auth-context';
import { getPasswordStrength } from '@lib/password-utils';
import AuthLayout from '@ui/AuthLayout';
import EmailStep from './EmailStep';
import NewPasswordStep from './NewPasswordStep';
import OtpStep from './OtpStep';
import ResetSuccess from './ResetSuccess';

type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const { requestPasswordReset, verifyResetOtp, updatePassword } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

  const strength = getPasswordStrength(newPassword);
  const isPasswordValid = Boolean(newPassword) && newPassword === confirmPassword && strength >= 2;

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await requestPasswordReset(email);
      setStep('OTP');
      setTimer(60);
      setMessage('ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว');
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
      await verifyResetOtp(otp);
      setStep('NEW_PASSWORD');
      setMessage('ยืนยันรหัสสำเร็จ กรุณาตั้งรหัสผ่านใหม่');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isPasswordValid) {
      setError('รหัสผ่านไม่ตรงกันหรือสั้นเกินไป');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updatePassword(newPassword);
      setStep('SUCCESS');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(60);
    setMessage('ส่งรหัสใหม่อีกครั้งแล้ว');
  };

  return (
    <AuthLayout
      title={step === 'SUCCESS' ? 'รีเซ็ตสำเร็จ' : 'กู้คืนรหัสผ่าน'}
      subtitle={
        step === 'EMAIL'
          ? 'กรอกอีเมลเพื่อรับรหัส OTP'
          : step === 'OTP'
            ? 'กรอกรหัสยืนยันความปลอดภัย'
            : step === 'NEW_PASSWORD'
              ? 'ตั้งรหัสผ่านใหม่ของคุณ'
              : 'บัญชีของคุณปลอดภัยแล้ว'
      }
      onClose={handleClose}
    >
      {step === 'EMAIL' && (
        <EmailStep
          email={email}
          isLoading={isLoading}
          error={error}
          onChange={setEmail}
          onSubmit={handleSendOtp}
        />
      )}

      {step === 'OTP' && (
        <OtpStep
          email={email}
          otp={otp}
          timer={timer}
          isLoading={isLoading}
          message={message}
          error={error}
          onChange={setOtp}
          onBack={() => {
            setStep('EMAIL');
            setOtp('');
            setTimer(0);
          }}
          onResend={handleResend}
          onSubmit={handleVerifyOtp}
        />
      )}

      {step === 'NEW_PASSWORD' && (
        <NewPasswordStep
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          strength={strength}
          isValid={isPasswordValid}
          isLoading={isLoading}
          message={message}
          error={error}
          onPasswordChange={setNewPassword}
          onConfirmChange={setConfirmPassword}
          onSubmit={handleResetPassword}
        />
      )}

      {step === 'SUCCESS' && <ResetSuccess />}

      {step === 'EMAIL' && (
        <Link
          href='/auth/login'
          className='mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors hover:underline decoration-white/20 underline-offset-4 animate-slide-up-fade'
        >
          <ArrowLeft size={16} />
          <span>กลับไปเข้าสู่ระบบ</span>
        </Link>
      )}
    </AuthLayout>
  );
}
