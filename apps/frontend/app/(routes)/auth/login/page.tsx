'use client';

import { Suspense, useState, type FormEvent, useMemo } from 'react';
import { useAuth } from '@lib/auth-context';
import AuthLayout from '@ui/AuthLayout';
import { ArrowRight, Chrome, Lock, Mail, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const { login, loginAsGuest } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redirectPath = searchParams.get('redirect') || '/stories';
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      await login(email, password);
      setMessage('เข้าสู่ระบบสำเร็จ');
      router.push(redirectPath);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      await login('chronos.user@talepick.com', 'oauth-google');
      setMessage('เข้าสู่ระบบด้วย Google สำเร็จ');
      router.push(redirectPath);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    setError(null);
    setMessage('เข้าใช้งานแบบ Guest แล้ว');
    router.push(redirectPath);
  };

  return (
    <AuthLayout
      title='ยินดีต้อนรับกลับมา'
      subtitle='เข้าสู่ระบบเพื่อสานต่อการผจญภัยของคุณ'
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className='space-y-5'>
        {(message || error) && (
          <div
            className={`animate-slide-up-fade rounded-xl border px-4 py-3 text-sm ${
              message
                ? 'border-green-500/30 bg-green-500/10 text-green-200'
                : 'border-red-500/30 bg-red-500/10 text-red-200'
            }`}
            role='status'
            aria-live='polite'
          >
            {message || error}
          </div>
        )}

        <div className='space-y-4'>
          <div className='relative group animate-slide-up-fade delay-100 fill-mode-forwards opacity-0'>
            <Mail
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
              size={18}
            />
            <input
              type='email'
              required
              placeholder='อีเมล'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
            />
          </div>

          <div className='relative group animate-slide-up-fade delay-200 fill-mode-forwards opacity-0'>
            <Lock
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
              size={18}
            />
            <input
              type='password'
              required
              placeholder='รหัสผ่าน'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
            />
          </div>
        </div>

        <div className='flex justify-end animate-slide-up-fade delay-300 fill-mode-forwards opacity-0'>
          <Link
            href='/auth/forgot-password'
            className='text-xs text-primary hover:text-blue-400 transition-colors hover:underline decoration-blue-500/30 underline-offset-4'
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up-fade delay-300 fill-mode-forwards opacity-0 cursor-pointer'
        >
          {isLoading ? (
            <div
              className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'
              aria-label='กำลังเข้าสู่ระบบ'
            />
          ) : (
            <>
              <span>เข้าสู่ระบบ</span>
              <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform' />
            </>
          )}
        </button>

        <div className='relative flex py-2 items-center animate-slide-up-fade delay-500 fill-mode-forwards opacity-0'>
          <div className='flex-grow border-t border-white/10' />
          <span className='flex-shrink-0 mx-4 text-xs text-gray-500 uppercase tracking-widest'>
            หรือ
          </span>
          <div className='flex-grow border-t border-white/10' />
        </div>

        <div className='space-y-3 animate-slide-up-fade delay-500 fill-mode-forwards opacity-0'>
          <button
            type='button'
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className='w-full bg-white/5 hover:bg-white/10 border border-white/10 textwhite font-medium py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 group hover:border-white/30 disabled:opacity-50 cursor-pointer'
          >
            <Chrome size={18} className='text-gray-400 group-hover:text-white transition-colors' />
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>

          <button
            type='button'
            onClick={handleGuest}
            className='w-full bg-transparent hover:bg-white/5 border border-dashed border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white font-medium py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer'
          >
            <UserIcon size={18} />
            <span>เข้าใช้งานแบบ Guest (ทดลองเล่น)</span>
          </button>
        </div>
      </form>

      <div className='mt-8 text-center text-sm text-gray-400 animate-slide-up-fade delay-700 fill-mode-forwards opacity-0'>
        ยังไม่มีบัญชีใช่ไหม?{' '}
        <Link
          href='/auth/signup'
          className='text-primary hover:text-blue-400 font-semibold transition-colors hover:underline decoration-blue-500/30 underline-offset-4'
        >
          สร้างบัญชีใหม่
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className='min-h-screen bg-background' />}>
      <LoginContent />
    </Suspense>
  );
}
