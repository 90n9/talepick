import type { FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Chrome, Lock, Mail, User } from 'lucide-react';
import { getStrengthClass, getStrengthLabel } from '@lib/password-utils';

type SignupRegisterFormProps = {
  formData: { name: string; email: string; password: string; confirmPassword: string };
  strength: number;
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  onChange: (field: keyof SignupRegisterFormProps['formData'], value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleSignup: () => void;
  onGuestSignup: () => void;
};

export default function SignupRegisterForm({
  formData,
  strength,
  isValid,
  isLoading,
  error,
  onChange,
  onSubmit,
  onGoogleSignup,
  onGuestSignup,
}: SignupRegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {error && (
        <div
          className='rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200'
          role='alert'
        >
          {error}
        </div>
      )}

      <div className='relative group animate-slide-up-fade delay-100 fill-mode-forwards opacity-0'>
        <User
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
          size={18}
        />
        <input
          type='text'
          required
          placeholder='ชื่อผู้ใช้'
          value={formData.name}
          onChange={(event) => onChange('name', event.target.value)}
          className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
        />
      </div>

      <div className='relative group animate-slide-up-fade delay-200 fill-mode-forwards opacity-0'>
        <Mail
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
          size={18}
        />
        <input
          type='email'
          required
          placeholder='ที่อยู่อีเมล'
          value={formData.email}
          onChange={(event) => onChange('email', event.target.value)}
          className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
        />
      </div>

      <div className='relative group animate-slide-up-fade delay-300 fill-mode-forwards opacity-0'>
        <Lock
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
          size={18}
        />
        <input
          type='password'
          required
          placeholder='รหัสผ่าน'
          value={formData.password}
          onChange={(event) => onChange('password', event.target.value)}
          className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
        />
        {formData.password && (
          <div className='absolute -bottom-5 left-0 flex w-full items-center gap-2 px-1'>
            <div className='flex-grow h-1 bg-gray-700 rounded-full overflow-hidden'>
              <div
                className={`h-full transition-all duration-500 ${getStrengthClass(strength)}`}
                style={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-bold ${
                strength < 3 ? 'text-red-400' : strength < 4 ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              {getStrengthLabel(strength)}
            </span>
          </div>
        )}
      </div>

      <div className='relative group animate-slide-up-fade delay-300 fill-mode-forwards opacity-0 pt-2'>
        <Lock
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
          size={18}
        />
        <input
          type='password'
          required
          placeholder='ยืนยันรหัสผ่าน'
          value={formData.confirmPassword}
          onChange={(event) => onChange('confirmPassword', event.target.value)}
          className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
        />
      </div>

      <div className='text-xs text-gray-500 text-center animate-slide-up-fade delay-400 fill-mode-forwards opacity-0 px-2 pt-2'>
        การสร้างบัญชีถือว่าคุณยอมรับ{' '}
        <Link
          href='/terms-of-use'
          className='text-primary hover:text-white underline transition-colors'
        >
          ข้อตกลงการใช้งาน
        </Link>{' '}
        และ{' '}
        <Link
          href='/privacy-policy'
          className='text-primary hover:text-white underline transition-colors'
        >
          นโยบายความเป็นส่วนตัว
        </Link>
      </div>

      <button
        type='submit'
        disabled={!isValid || isLoading}
        className='w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up-fade delay-500 fill-mode-forwards opacity-0 cursor-pointer'
      >
        {isLoading ? (
          <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
        ) : (
          <>
            <span>ถัดไป</span>
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
          onClick={onGoogleSignup}
          className='w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 group hover:border-white/30 cursor-pointer'
        >
          <Chrome size={18} className='text-gray-400 group-hover:text-white transition-colors' />
          <span>สมัครด้วย Google</span>
        </button>

        <button
          type='button'
          onClick={onGuestSignup}
          className='w-full bg-transparent hover:bg-white/5 border border-dashed border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white font-medium py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer'
        >
          <User size={18} />
          <span>เข้าใช้งานแบบ Guest (ทดลองเล่น)</span>
        </button>
      </div>
    </form>
  );
}
