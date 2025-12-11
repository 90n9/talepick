import type { FormEvent } from 'react';
import { ChevronRight, Edit2, Lock, RefreshCw } from 'lucide-react';

type SignupOtpFormProps = {
  email: string;
  otp: string;
  timer: number;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  onOtpChange: (value: string) => void;
  onBack: () => void;
  onResend: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function SignupOtpForm({
  email,
  otp,
  timer,
  isLoading,
  message,
  error,
  onOtpChange,
  onBack,
  onResend,
  onSubmit,
}: SignupOtpFormProps) {
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

      <div className='text-center mb-4 bg-white/5 p-4 rounded-xl border border-white/5'>
        <p className='text-sm text-gray-400'>รหัสยืนยันถูกส่งไปที่</p>
        <div className='flex items-center justify-center gap-2 mt-1'>
          <p className='text-white font-bold font-mono'>{email}</p>
          <button
            type='button'
            onClick={onBack}
            className='p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-primary transition-colors'
            title='แก้ไขอีเมล'
          >
            <Edit2 size={12} />
          </button>
        </div>
      </div>

      <div className='relative group'>
        <Lock
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary'
          size={18}
        />
        <input
          type='text'
          required
          maxLength={6}
          placeholder='000000'
          value={otp}
          onChange={(event) => onOtpChange(event.target.value.replace(/[^0-9]/g, ''))}
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
            <span>ยืนยันและเริ่มใช้งาน</span>
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
          {timer > 0 ? `ส่งรหัสใหม่ได้ใน ${timer} วินาที` : 'ส่งรหัสยืนยันอีกครั้ง'}
        </button>
      </div>
    </form>
  );
}
