import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  X as XIcon,
  Key,
  ChevronRight,
  RefreshCw,
  Edit2,
  Chrome,
} from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../App';

interface SignupProps {
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigate, onBack }) => {
  const { login, loginAsGuest } = useAuth();
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const [timer, setTimer] = useState(0);

  // Password Strength Logic
  useEffect(() => {
    const pass = formData.password;
    let score = 0;
    if (!pass) {
      setStrength(0);
      return;
    }
    if (pass.length > 7) score++;
    if (pass.length > 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setStrength(score);
  }, [formData.password]);

  // Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength < 3) return 'อ่อน';
    if (strength < 4) return 'ปานกลาง';
    return 'แข็งแรง';
  };

  const getStrengthColor = () => {
    if (strength < 3) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API Call to Register and Send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      setTimer(60); // Start 60s cooldown
      console.log(`OTP Sent to ${formData.email}`);
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate OTP Verification
    setTimeout(() => {
      // Mock check: length must be 6
      if (otp.length === 6) {
        login(); // Success: Log user in
        setIsLoading(false);
      } else {
        alert('รหัส OTP ไม่ถูกต้อง');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setTimer(60);
      alert(`ส่งรหัส OTP ใหม่ไปยัง ${formData.email} แล้ว`);
    }, 1000);
  };

  return (
    <AuthLayout
      title={step === 'REGISTER' ? 'สร้างบัญชีผู้ใช้' : 'ยืนยันอีเมล'}
      subtitle={
        step === 'REGISTER'
          ? 'เริ่มต้นการเดินทางของคุณวันนี้'
          : `กรอกรหัส 6 หลักที่ส่งไปยังอีเมลของคุณ`
      }
      onClose={onBack}
    >
      {step === 'REGISTER' ? (
        // --- STEP 1: Registration Form ---
        <form onSubmit={handleRegisterSubmit} className='space-y-4'>
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
            />

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className='absolute -bottom-5 left-0 w-full flex items-center gap-2 px-1'>
                <div className='flex-grow h-1 bg-gray-700 rounded-full overflow-hidden'>
                  <div
                    className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    strength < 3
                      ? 'text-red-400'
                      : strength < 4
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }`}
                >
                  {getStrengthLabel()}
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
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600'
            />
          </div>

          <div className='text-xs text-gray-500 text-center animate-slide-up-fade delay-400 fill-mode-forwards opacity-0 px-2 pt-2'>
            การสร้างบัญชีถือว่าคุณยอมรับ{' '}
            <button
              type='button'
              onClick={() => onNavigate('terms')}
              className='text-primary hover:text-white underline transition-colors'
            >
              ข้อตกลงการใช้งาน
            </button>{' '}
            และ{' '}
            <button
              type='button'
              onClick={() => onNavigate('privacy')}
              className='text-primary hover:text-white underline transition-colors'
            >
              นโยบายความเป็นส่วนตัว
            </button>{' '}
            ของเรา
          </div>

          <button
            type='submit'
            disabled={
              isLoading ||
              strength < 2 ||
              !formData.password ||
              formData.password !== formData.confirmPassword
            }
            className='w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up-fade delay-500 fill-mode-forwards opacity-0'
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
            <div className='flex-grow border-t border-white/10'></div>
            <span className='flex-shrink-0 mx-4 text-xs text-gray-500 uppercase tracking-widest'>
              หรือ
            </span>
            <div className='flex-grow border-t border-white/10'></div>
          </div>

          <div className='space-y-3 animate-slide-up-fade delay-500 fill-mode-forwards opacity-0'>
            <button
              type='button'
              onClick={() => login()} // Mock Google Signup
              className='w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 group hover:border-white/30'
            >
              <Chrome
                size={18}
                className='text-gray-400 group-hover:text-white transition-colors'
              />
              <span>สมัครด้วย Google</span>
            </button>

            <button
              type='button'
              onClick={loginAsGuest}
              className='w-full bg-transparent hover:bg-white/5 border border-dashed border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white font-medium py-3 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2'
            >
              <User size={18} />
              <span>เข้าใช้งานแบบ Guest (ทดลองเล่น)</span>
            </button>
          </div>
        </form>
      ) : (
        // --- STEP 2: OTP Verification ---
        <form onSubmit={handleVerifyOtp} className='space-y-6 animate-slide-up-fade'>
          <div className='text-center mb-4 bg-white/5 p-4 rounded-xl border border-white/5'>
            <p className='text-sm text-gray-400'>รหัสยืนยันถูกส่งไปที่</p>
            <div className='flex items-center justify-center gap-2 mt-1'>
              <p className='text-white font-bold font-mono'>{formData.email}</p>
              <button
                type='button'
                onClick={() => {
                  setStep('REGISTER');
                  setOtp('');
                }}
                className='p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-primary transition-colors'
                title='แก้ไขอีเมล'
              >
                <Edit2 size={12} />
              </button>
            </div>
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
              placeholder='000000'
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className='w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white tracking-[0.5em] font-mono text-center transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:tracking-normal placeholder:text-gray-600'
            />
          </div>

          <button
            type='submit'
            disabled={isLoading || otp.length !== 6}
            className='w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
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
              onClick={handleResendOtp}
              disabled={timer > 0 || isLoading}
              className={`text-sm flex items-center justify-center gap-2 mx-auto ${
                timer > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-primary hover:text-white'
              }`}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {timer > 0 ? `ส่งรหัสใหม่ได้ใน ${timer} วินาที` : 'ส่งรหัสยืนยันอีกครั้ง'}
            </button>
          </div>
        </form>
      )}

      {step === 'REGISTER' && (
        <div className='mt-8 text-center text-sm text-gray-400 animate-slide-up-fade delay-700 fill-mode-forwards opacity-0'>
          มีบัญชีอยู่แล้ว?{' '}
          <button
            onClick={() => onNavigate('login')}
            className='text-primary hover:text-blue-400 font-semibold transition-colors hover:underline decoration-blue-500/30 underline-offset-4'
          >
            เข้าสู่ระบบ
          </button>
        </div>
      )}
    </AuthLayout>
  );
};
