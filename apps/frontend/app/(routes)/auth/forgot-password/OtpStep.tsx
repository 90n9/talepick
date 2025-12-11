import type { FormEvent } from 'react';
import { ChevronRight, Key, RefreshCw } from 'lucide-react';

type OtpStepProps = {
  email: string;
  otp: string;
  timer: number;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  onChange: (value: string) => void;
  onBack: () => void;
  onResend: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function OtpStep({
  email,
  otp,
  timer,
  isLoading,
  message,
  error,
  onChange,
  onBack,
  onResend,
  onSubmit,
}: OtpStepProps) {
  return (
    <form onSubmit={onSubmit} className='space-y-6 animate-slide-up-fade'>
      {(message || error) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message
              ? 'border-blue-500/30 bg-blue-500/10 text-blue-100'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {message || error}
        </div>
      )}
      <div className='text-center mb-4'>
        <p className='text-sm text-gray-400'>รหัส OTP ถูกส่งไปที่</p>
        <p className='text-white font-medium'>{email}</p>
        <button
          type='button'
          onClick={onBack}
          className='text-xs text-primary hover:underline mt-1'
        >
          แก้ไขอีเมล
        </button>
      </div>

      <div className='relative group'>
        <Key
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary'
          size={18}
        />
        <input
          type='text'
          required
          maxLength={6}
          placeholder='กรอกรหัส 6 หลัก (เช่น 123456)'
          value={otp}
          onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ''))}
          className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white tracking-[0.5em] font-mono text-center transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:tracking-normal placeholder:text-gray-600'
        />
      </div>

      <button
        type='submit'
        disabled={isLoading || otp.length !== 6}
        className='w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
      >
        {isLoading ? (
          <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
        ) : (
          <>
            <span>ยืนยันรหัส</span>
            <ChevronRight size={18} />
          </>
        )}
      </button>

      <div className='text-center'>
        <button
          type='button'
          onClick={onResend}
          disabled={timer > 0 || isLoading}
          className={`text-sm flex items-center justify-center gap-2 mx-auto ${
            timer > 0
              ? 'text-gray-600 cursor-not-allowed'
              : 'text-primary hover:text-white cursor-pointer'
          }`}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {timer > 0 ? `ขอรหัสใหม่ได้ใน ${timer} วินาที` : 'ส่งรหัสใหม่'}
        </button>
      </div>
    </form>
  );
}
