import React, { useState, useRef } from 'react';
import { MOCK_ADMINS, MOCK_STORIES, MOCK_ACHIEVEMENTS, MOCK_USERS } from '../services/mockData';
import { useToast } from '../components/Toast';
import {
  User,
  Mail,
  Lock,
  Save,
  Camera,
  Shield,
  Key,
  Image as ImageIcon,
  Upload,
  X,
  Plus,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  // Simulating logged-in user (SuperAdmin for demo purposes)
  const [user, setUser] = useState(MOCK_ADMINS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    avatar: user.avatar,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Avatar Selection State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'default' | 'stories' | 'achievements' | 'users'>(
    'default'
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToast();

  const handleSaveInfo = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        ...user,
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar,
      });
      setIsLoading(false);
      addToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success');
    }, 800);
  };

  const handleChangePassword = () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      addToast('กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน', 'warning');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      addToast('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsLoading(false);
      addToast('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', 'success');
    }, 1000);
  };

  // Avatar Logic
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, avatar: url });
      addToast('อัปโหลดรูปภาพเรียบร้อยแล้ว', 'success');
    }
  };

  const handleSelectSystemAvatar = (url: string) => {
    setFormData({ ...formData, avatar: url });
    setIsAvatarModalOpen(false);
    addToast('เลือกอวาตาร์เรียบร้อยแล้ว', 'success');
  };

  const getDefaultAvatars = () => [
    'https://ui-avatars.com/api/?name=Admin&background=000&color=fff',
    'https://ui-avatars.com/api/?name=User&background=random',
    'https://ui-avatars.com/api/?name=Guest&background=random',
    'https://picsum.photos/id/64/100/100',
    'https://picsum.photos/id/65/100/100',
    'https://picsum.photos/id/66/100/100',
    'https://picsum.photos/id/68/100/100',
  ];

  const getStoryAvatars = () => {
    const avatars: string[] = [];
    MOCK_STORIES.forEach((s) => {
      s.avatarRewards?.forEach((r) => avatars.push(r.url));
    });
    return avatars;
  };

  const getAchievementAvatars = () => {
    const avatars: string[] = [];
    MOCK_ACHIEVEMENTS.forEach((a) => {
      if (a.rewardAvatars && a.rewardAvatars.length > 0) {
        avatars.push(...a.rewardAvatars);
      }
    });
    return avatars;
  };

  const getUserAvatars = () => {
    const avatars = new Set<string>();
    MOCK_USERS.forEach((u) => {
      if (u.avatar) avatars.add(u.avatar);
    });
    return Array.from(avatars);
  };

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>บัญชีของฉัน</h1>
        <p className='text-sm text-gray-500 mt-1'>จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชี</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Profile Card */}
        <div className='md:col-span-1'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='h-32 bg-gradient-to-r from-indigo-500 to-purple-600'></div>
            <div className='px-6 pb-6 relative'>
              <div className='relative -mt-12 mb-4 inline-block group'>
                <img
                  src={formData.avatar}
                  alt='Profile'
                  className='w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white'
                />
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className='absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 text-gray-500 hover:text-indigo-600 transition-colors'
                  title='เปลี่ยนรูปโปรไฟล์'
                >
                  <Camera size={14} />
                </button>
              </div>

              <h2 className='text-xl font-bold text-gray-900'>{user.username}</h2>
              <p className='text-sm text-gray-500 mb-4'>{user.email}</p>

              <div className='flex items-center space-x-2 mb-4'>
                <span className='px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 flex items-center'>
                  <Shield size={12} className='mr-1' />
                  {user.role}
                </span>
                <span className='px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center'>
                  <span className='w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5'></span>
                  Active
                </span>
              </div>

              <div className='text-xs text-gray-400'>
                ใช้งานล่าสุด: {new Date(user.lastActive).toLocaleString('th-TH')}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Forms */}
        <div className='md:col-span-2 space-y-6'>
          {/* Basic Info Form */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
              <User size={20} className='mr-2 text-indigo-500' />
              ข้อมูลพื้นฐาน
            </h3>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>ชื่อผู้ใช้</label>
                  <input
                    type='text'
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>อีเมล</label>
                  <div className='relative'>
                    <input
                      type='email'
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
                    />
                    <Mail size={16} className='absolute left-3 top-3 text-gray-400' />
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>รูปโปรไฟล์</label>
                  <div className='flex gap-3 items-center'>
                    <div className='w-12 h-12 rounded-full border border-gray-200 overflow-hidden'>
                      <img
                        src={formData.avatar}
                        alt='Current'
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <input
                      type='file'
                      ref={fileInputRef}
                      className='hidden'
                      accept='image/*'
                      onChange={handleFileUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className='px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center'
                    >
                      <Upload size={16} className='mr-2' /> อัปโหลดรูปใหม่
                    </button>
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className='px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-100 flex items-center'
                    >
                      <ImageIcon size={16} className='mr-2' /> เลือกจากระบบ
                    </button>
                  </div>
                </div>
              </div>

              <div className='pt-2 flex justify-end'>
                <button
                  onClick={handleSaveInfo}
                  disabled={isLoading}
                  className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors disabled:opacity-70'
                >
                  <Save size={16} className='mr-2' />
                  {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </div>
            </div>
          </div>

          {/* Password Form */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center'>
              <Lock size={20} className='mr-2 text-indigo-500' />
              เปลี่ยนรหัสผ่าน
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  รหัสผ่านปัจจุบัน
                </label>
                <div className='relative'>
                  <input
                    type='password'
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                  <Key size={16} className='absolute left-3 top-3 text-gray-400' />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type='password'
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type='password'
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
                  />
                </div>
              </div>

              <div className='pt-2 flex justify-end'>
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className='flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-colors disabled:opacity-70'
                >
                  เปลี่ยนรหัสผ่าน
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in'>
            <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
              <h3 className='font-bold text-gray-900 text-lg'>เลือกอวาตาร์จากระบบ</h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className='flex border-b border-gray-200 overflow-x-auto'>
              <button
                onClick={() => setAvatarTab('default')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-4 ${avatarTab === 'default' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                มาตรฐาน
              </button>
              <button
                onClick={() => setAvatarTab('stories')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-4 ${avatarTab === 'stories' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                จากนิยาย
              </button>
              <button
                onClick={() => setAvatarTab('achievements')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-4 ${avatarTab === 'achievements' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                จากความสำเร็จ
              </button>
              <button
                onClick={() => setAvatarTab('users')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-4 ${avatarTab === 'users' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              >
                จากผู้ใช้งาน
              </button>
            </div>

            <div className='p-6 overflow-y-auto'>
              <div className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4'>
                {(avatarTab === 'default'
                  ? getDefaultAvatars()
                  : avatarTab === 'stories'
                    ? getStoryAvatars()
                    : avatarTab === 'achievements'
                      ? getAchievementAvatars()
                      : getUserAvatars()
                ).map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSystemAvatar(url)}
                    className='group relative aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all shadow-sm'
                  >
                    <img src={url} alt='Avatar' className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      <Plus className='text-white' size={24} />
                    </div>
                  </button>
                ))}
              </div>

              {avatarTab === 'stories' && getStoryAvatars().length === 0 && (
                <div className='text-center py-8 text-gray-400'>ยังไม่มีรางวัลอวาตาร์ในนิยาย</div>
              )}
              {avatarTab === 'achievements' && getAchievementAvatars().length === 0 && (
                <div className='text-center py-8 text-gray-400'>
                  ยังไม่มีรางวัลอวาตาร์ในความสำเร็จ
                </div>
              )}
              {avatarTab === 'users' && getUserAvatars().length === 0 && (
                <div className='text-center py-8 text-gray-400'>ยังไม่มีอวาตาร์ของผู้ใช้งาน</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
