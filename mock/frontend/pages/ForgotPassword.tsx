import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle, Key, Lock, RefreshCw, ChevronRight } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
  onBack?: () => void;
}

type Step = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate, onBack }) => {
  const [step, setStep] = useState<Step>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [strength, setStrength] = useState(0);

  // OTP Timer
  const [timer, setTimer] = useState(0);

  // Strength Logic
  useEffect(() => {
    const pass = newPassword;
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
  }, [newPassword]);

  const getStrengthColor = () => {
    if (strength < 3) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Handlers ---

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API: Send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      setTimer(60); // 60s cooldown
      console.log(`OTP sent to ${email}: 123456`); // Mock OTP
    }, 1500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API: Verify OTP
    setTimeout(() => {
        // Mock Validation: Any 6 digit code works for demo
        if (otp.length === 6) {
            setIsLoading(false);
            setStep('NEW_PASSWORD');
        } else {
            alert("รหัส OTP ไม่ถูกต้อง");
            setIsLoading(false);
        }
    }, 1000);
  };

  const handleResendOtp = () => {
      if (timer > 0) return;
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          setTimer(60);
          alert(`ส่งรหัส OTP ใหม่ไปยัง ${email} แล้ว`);
      }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        alert("รหัสผ่านไม่ตรงกัน");
        return;
    }
    setIsLoading(true);
    // Simulate API: Reset Password
    setTimeout(() => {
        setIsLoading(false);
        setStep('SUCCESS');
    }, 1500);
  };

  // --- Render Steps ---

  const renderStepContent = () => {
      switch (step) {
          case 'EMAIL':
              return (
                <form onSubmit={handleSendOtp} className="space-y-6 animate-slide-up-fade">
                    <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 group-focus-within:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" size={18} />
                        <input 
                        type="email" 
                        required
                        placeholder="ที่อยู่อีเมลของคุณ" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:text-gray-600"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                            <span>รับรหัส OTP</span>
                            <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
              );

          case 'OTP':
              return (
                <form onSubmit={handleVerifyOtp} className="space-y-6 animate-slide-up-fade">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-400">รหัส OTP ถูกส่งไปที่</p>
                        <p className="text-white font-medium">{email}</p>
                        <button 
                            type="button" 
                            onClick={() => setStep('EMAIL')} 
                            className="text-xs text-primary hover:underline mt-1"
                        >
                            แก้ไขอีเมล
                        </button>
                    </div>

                    <div className="relative group">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary" size={18} />
                        <input 
                        type="text" 
                        required
                        maxLength={6}
                        placeholder="กรอกรหัส 6 หลัก (เช่น 123456)" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white tracking-[0.5em] font-mono text-center transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] placeholder:tracking-normal placeholder:text-gray-600"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                            <span>ยืนยันรหัส</span>
                            <ChevronRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={timer > 0 || isLoading}
                            className={`text-sm flex items-center justify-center gap-2 mx-auto ${
                                timer > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-primary hover:text-white'
                            }`}
                        >
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            {timer > 0 ? `ขอรหัสใหม่ได้ใน ${timer} วินาที` : 'ส่งรหัสใหม่'}
                        </button>
                    </div>
                </form>
              );
          
          case 'NEW_PASSWORD':
              return (
                <form onSubmit={handleResetPassword} className="space-y-4 animate-slide-up-fade">
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary" size={18} />
                        <input 
                        type="password" 
                        required
                        placeholder="รหัสผ่านใหม่" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        />
                        {/* Strength Bar */}
                        {newPassword && (
                            <div className="absolute -bottom-5 left-0 w-full flex items-center gap-2 px-1">
                                <div className="flex-grow h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${getStrengthColor()}`} 
                                        style={{ width: `${(strength / 5) * 100}%` }} 
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    ความปลอดภัย
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="relative group pt-2">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-300 group-focus-within:text-primary" size={18} />
                        <input 
                        type="password" 
                        required
                        placeholder="ยืนยันรหัสผ่านใหม่" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white transition-all duration-300 focus:outline-none focus:border-primary focus:bg-black/60 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading || !newPassword || newPassword !== confirmPassword || strength < 2}
                        className="w-full bg-primary hover:bg-blue-600 active:scale-95 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                            <span>เปลี่ยนรหัสผ่าน</span>
                            <CheckCircle size={18} />
                            </>
                        )}
                    </button>
                </form>
              );

          case 'SUCCESS':
              return (
                <div className="text-center animate-scale-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-500 mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">สำเร็จ!</h3>
                    <p className="text-gray-400 text-sm mb-8">
                        รหัสผ่านของคุณถูกเปลี่ยนแปลงเรียบร้อยแล้ว <br/>
                        คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
                    </p>
                    <button 
                        onClick={() => onNavigate('login')}
                        className="w-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 text-white font-bold py-3 rounded-lg transition-all"
                    >
                        ไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
              );
      }
  };

  return (
    <AuthLayout 
      title={step === 'SUCCESS' ? 'รีเซ็ตสำเร็จ' : 'กู้คืนรหัสผ่าน'}
      subtitle={
          step === 'EMAIL' ? 'กรอกอีเมลเพื่อรับรหัส OTP' :
          step === 'OTP' ? 'กรอกรหัสยืนยันความปลอดภัย' :
          step === 'NEW_PASSWORD' ? 'ตั้งรหัสผ่านใหม่ของคุณ' :
          'บัญชีของคุณปลอดภัยแล้ว'
      }
      onClose={onBack}
    >
      {renderStepContent()}

      {step === 'EMAIL' && (
        <button 
            type="button"
            onClick={() => onNavigate('login')}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-6 hover:underline decoration-white/20 underline-offset-4 animate-slide-up-fade"
        >
            <ArrowLeft size={16} />
            <span>กลับไปเข้าสู่ระบบ</span>
        </button>
      )}
    </AuthLayout>
  );
};