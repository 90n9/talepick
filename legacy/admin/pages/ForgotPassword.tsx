
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Mail, Loader2, Key, CheckCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/Toast';

type Step = 'email' | 'otp' | 'success';

export const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        addToast('กรุณากรอกอีเมล', 'warning');
        return;
    }
    setIsLoading(true);
    
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      addToast(`ส่งรหัส OTP ไปยัง ${email} เรียบร้อยแล้ว`, 'success');
    }, 1500);
  };

  const handleVerifyReset = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
        addToast('กรุณากรอกรหัส OTP', 'warning');
        return;
    }
    if (otp.length < 4) {
        addToast('รหัส OTP ไม่ถูกต้อง', 'error');
        return;
    }
    if (!newPassword || !confirmPassword) {
        addToast('กรุณากำหนดรหัสผ่านใหม่', 'warning');
        return;
    }
    if (newPassword !== confirmPassword) {
        addToast('รหัสผ่านใหม่ไม่ตรงกัน', 'error');
        return;
    }
    if (newPassword.length < 6) {
        addToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'warning');
        return;
    }

    setIsLoading(true);
    
    // Simulate API call to verify OTP and reset password
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      addToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
    }, 2000);
  };

  const handleResendOtp = () => {
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          addToast('ส่งรหัส OTP ใหม่เรียบร้อยแล้ว', 'success');
      }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
             <BookOpen className="text-white" size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white text-shadow-sm">
          {step === 'email' && 'ลืมรหัสผ่าน?'}
          {step === 'otp' && 'ยืนยันตัวตน'}
          {step === 'success' && 'สำเร็จ!'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-200">
          {step === 'email' && 'กรอกอีเมลของคุณเพื่อรับรหัส OTP สำหรับยืนยันตัวตน'}
          {step === 'otp' && `กรอกรหัส OTP ที่ส่งไปยัง ${email} และตั้งรหัสผ่านใหม่`}
          {step === 'success' && 'รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="bg-white/95 backdrop-blur-sm py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          
          {/* STEP 1: EMAIL INPUT */}
          {step === 'email' && (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  อีเมล
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border outline-none"
                    placeholder="admin@storyweaver.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      กำลังส่ง...
                    </>
                  ) : (
                    'ส่งรหัส OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP & NEW PASSWORD */}
          {step === 'otp' && (
            <form className="space-y-6" onSubmit={handleVerifyReset}>
               {/* OTP Input */}
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  รหัส OTP (6 หลัก)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border outline-none tracking-widest"
                    placeholder="123456"
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      รหัสผ่านใหม่
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      ยืนยันรหัสผ่านใหม่
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      กำลังตรวจสอบ...
                    </>
                  ) : (
                    'ยืนยันและเปลี่ยนรหัสผ่าน'
                  )}
                </button>
                <div className="flex justify-between items-center text-sm px-1">
                   <button 
                     type="button"
                     onClick={() => setStep('email')}
                     className="text-gray-500 hover:text-gray-700"
                   >
                     เปลี่ยนอีเมล
                   </button>
                   <button 
                     type="button"
                     onClick={handleResendOtp}
                     disabled={isLoading}
                     className="text-indigo-600 hover:text-indigo-500 font-medium disabled:opacity-50"
                   >
                     ส่งรหัสอีกครั้ง
                   </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 animate-scale-in">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">เปลี่ยนรหัสผ่านสำเร็จ</h3>
              <p className="mt-2 text-sm text-gray-500 mb-8">
                คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที
              </p>
              <div>
                 <Link 
                   to="/login"
                   className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                 >
                   กลับไปหน้าเข้าสู่ระบบ
                 </Link>
              </div>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-6 text-center">
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center justify-center transition-colors">
                <ArrowLeft size={16} className="mr-1" /> กลับไปหน้าเข้าสู่ระบบ
                </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
