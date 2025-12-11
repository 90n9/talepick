import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Lock, Camera, Check, AlertCircle, Link, Grid } from 'lucide-react';
import { User as UserType } from '../types';
import { useAuth } from '../App';
import { SYSTEM_AVATARS } from '../constants';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // General Form State
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  // Reset fields when opening
  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name);
      setAvatar(currentUser.avatar);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('');
      setStrength(0);
      setActiveTab('general');
      setShowCustomUrlInput(false);
    }
  }, [isOpen, currentUser]);

  const isAvatarUnlocked = (av: (typeof SYSTEM_AVATARS)[0]) => {
    if (av.type === 'free') return true;
    if (av.type === 'unlock' && av.requiredStoryId) {
      // Check if user has played/completed this story
      return currentUser.playedStories.includes(av.requiredStoryId);
    }
    return false;
  };

  if (!isOpen || !mounted) return null;

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      updateUser({ name, avatar });
      setIsLoading(false);
      setSuccessMessage('บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };

  const modalContent = (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in'>
      <div className='relative w-full max-w-lg bg-[#1a1d26] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]'>
        {/* Header */}
        <div className='p-6 border-b border-white/5 flex justify-between items-center bg-black/20'>
          <h2 className='text-xl font-serif font-bold text-white'>แก้ไขโปรไฟล์</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10'
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-white/5 bg-black/10'>
          <button
            onClick={() => {
              setActiveTab('general');
              setSuccessMessage('');
            }}
            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
              activeTab === 'general' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className='flex items-center justify-center gap-2'>
              <User size={16} /> ข้อมูลทั่วไป
            </div>
            {activeTab === 'general' && (
              <div className='absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_var(--color-primary)]' />
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('security');
              setSuccessMessage('');
            }}
            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${
              activeTab === 'security' ? 'text-secondary' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className='flex items-center justify-center gap-2'>
              <Lock size={16} /> ความปลอดภัย
            </div>
            {activeTab === 'security' && (
              <div className='absolute bottom-0 left-0 w-full h-0.5 bg-secondary shadow-[0_0_8px_var(--color-secondary)]' />
            )}
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto custom-scrollbar'>
          {successMessage && (
            <div className='mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm animate-fade-in'>
              <Check size={16} />
              {successMessage}
            </div>
          )}

          {activeTab === 'general' ? (
            <form onSubmit={handleGeneralSubmit} className='space-y-6'>
              {/* Avatar Preview */}
              <div className='flex justify-center'>
                <div className='w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-lg border-2 border-white/10'>
                  {avatar ? (
                    <img src={avatar} className='w-full h-full object-cover' />
                  ) : (
                    name.charAt(0)
                  )}
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-xs font-bold text-gray-400 uppercase mb-2'>
                    ชื่อที่แสดง (Display Name)
                  </label>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors'
                  />
                </div>

                {/* Avatar Selection Grid */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <label className='block text-xs font-bold text-gray-400 uppercase'>
                      เลือกรูปโปรไฟล์
                    </label>
                    <button
                      type='button'
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className='text-xs text-primary hover:text-white transition-colors flex items-center gap-1'
                    >
                      {showCustomUrlInput ? <Grid size={12} /> : <Link size={12} />}
                      {showCustomUrlInput ? 'เลือกจากระบบ' : 'ใช้ลิงก์รูปภาพ'}
                    </button>
                  </div>

                  {!showCustomUrlInput ? (
                    <div className='grid grid-cols-4 gap-3 bg-black/20 p-3 rounded-xl border border-white/5'>
                      {SYSTEM_AVATARS.map((sysAvatar) => {
                        const unlocked = isAvatarUnlocked(sysAvatar);
                        const isSelected = avatar === sysAvatar.src;

                        return (
                          <button
                            key={sysAvatar.id}
                            type='button'
                            disabled={!unlocked}
                            onClick={() => setAvatar(sysAvatar.src)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              isSelected
                                ? 'border-primary shadow-[0_0_10px_rgba(59,130,246,0.6)] scale-105 z-10'
                                : 'border-transparent opacity-80 hover:opacity-100 hover:border-white/30'
                            } ${!unlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                            title={!unlocked ? (sysAvatar as any).hint : sysAvatar.name}
                          >
                            <img
                              src={sysAvatar.src}
                              alt={sysAvatar.name}
                              className='w-full h-full object-cover'
                            />
                            {!unlocked && (
                              <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                                <Lock size={16} className='text-gray-400' />
                              </div>
                            )}
                            {isSelected && (
                              <div className='absolute top-1 right-1 w-3 h-3 bg-primary rounded-full border border-white shadow-sm'></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <input
                        type='text'
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder='https://example.com/avatar.jpg'
                        className='w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm'
                      />
                      <p className='text-xs text-gray-500 mt-1'>
                        รองรับลิงก์รูปภาพโดยตรง (JPG, PNG)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2'
              >
                {isLoading ? (
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                ) : (
                  'บันทึกการเปลี่ยนแปลง'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className='space-y-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-xs font-bold text-gray-400 uppercase mb-2'>
                    รหัสผ่านปัจจุบัน
                  </label>
                  <input
                    type='password'
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className='w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary transition-colors'
                  />
                </div>
                <div className='h-px bg-white/5 my-4' />
                <div>
                  <label className='block text-xs font-bold text-gray-400 uppercase mb-2'>
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type='password'
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className='w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary transition-colors'
                  />
                  {/* Strength Bar */}
                  {newPassword && (
                    <div className='flex items-center gap-2 px-1 mt-2'>
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
                        {strength < 3 ? 'อ่อน' : strength < 4 ? 'ปานกลาง' : 'แข็งแรง'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <label className='block text-xs font-bold text-gray-400 uppercase mb-2'>
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type='password'
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-black/30 border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${
                      confirmPassword && newPassword !== confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-white/10 focus:border-secondary'
                    }`}
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                      <AlertCircle size={12} /> รหัสผ่านไม่ตรงกัน
                    </p>
                  )}
                </div>
              </div>

              <button
                type='submit'
                disabled={
                  isLoading ||
                  !currentPassword ||
                  !newPassword ||
                  newPassword !== confirmPassword ||
                  strength < 2
                }
                className='w-full py-3 bg-secondary hover:bg-purple-600 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2'
              >
                {isLoading ? (
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                ) : (
                  'เปลี่ยนรหัสผ่าน'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
