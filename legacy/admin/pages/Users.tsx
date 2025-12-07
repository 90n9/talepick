
import React, { useState, useEffect } from 'react';
import { User, UserType, UserStatus, LoginProvider } from '../types';
import { MOCK_USERS, MOCK_ACHIEVEMENTS } from '../services/mockData';
import { 
  Search, Filter, Shield, Ban, CheckCircle, 
  Mail, Chrome, User as UserIcon, X, Zap, Trophy, BookOpen, Star, RefreshCw,
  Camera, Trash2, Key, Save, Lock, Loader2, Plus, Calendar, Image as ImageIcon, ArrowLeft
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useLocation } from 'react-router-dom';
import { Pagination } from '../components/Pagination';

type FilterType = 'all' | 'guest' | 'registered' | 'low_credit' | 'high_achiever' | 'no_rating' | 'completed_story';
type TabType = 'overview' | 'progress' | 'history' | 'ratings' | 'achievements';

// Mock Default Avatars
const DEFAULT_AVATARS = [
    'https://ui-avatars.com/api/?name=User&background=random',
    'https://ui-avatars.com/api/?name=Guest&background=random',
    'https://picsum.photos/id/64/100/100',
    'https://picsum.photos/id/65/100/100',
    'https://picsum.photos/id/66/100/100',
    'https://picsum.photos/id/68/100/100',
];

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [creditAdjustment, setCreditAdjustment] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { addToast } = useToast();
  const location = useLocation();

  // Loading States
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Edit Profile State
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    avatar: '',
    newPassword: ''
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Grant Achievement Modal State
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [selectedAchievementIdToGrant, setSelectedAchievementIdToGrant] = useState<string>('');

  // Remove Achievement Modal State
  const [removeAchievementModal, setRemoveAchievementModal] = useState<{
    isOpen: boolean;
    userId: string;
    achievementId: string;
    achievementTitle: string;
  }>({ isOpen: false, userId: '', achievementId: '', achievementTitle: '' });
  
  // Avatar Selection Modal
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Handle URL Query Param selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('userId');
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) setSelectedUser(user);
    }
  }, [location.search, users]);

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  // Update edit form when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        username: selectedUser.username,
        email: selectedUser.email || '',
        avatar: selectedUser.avatar,
        newPassword: ''
      });
      setIsEditingPassword(false);
      setIsGrantModalOpen(false);
      setSelectedAchievementIdToGrant('');
    }
  }, [selectedUser]);

  // Filter Logic
  const filteredUsers = users.filter(u => {
    // Search match
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    // Filter type match
    switch (activeFilter) {
      case 'guest': return u.type === UserType.GUEST;
      case 'registered': return u.type === UserType.REGISTERED;
      case 'low_credit': return u.credits < 10;
      case 'high_achiever': return u.achievementsUnlocked >= 5;
      case 'no_rating': return u.ratingsCount === 0;
      case 'completed_story': return u.storyProgress.some(s => s.status === 'จบแล้ว');
      default: return true;
    }
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const handleStatusChange = (userId: string, status: UserStatus) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status } : u);
    setUsers(updatedUsers);
    if (selectedUser?.id === userId) setSelectedUser(updatedUsers.find(u => u.id === userId) || null);
    
    addToast(
      status === UserStatus.BANNED 
        ? 'ระงับการใช้งานผู้ใช้เรียบร้อยแล้ว' 
        : 'ยกเลิกการระงับผู้ใช้เรียบร้อยแล้ว', 
      status === UserStatus.BANNED ? 'warning' : 'success'
    );
  };

  const handleAdjustCredits = (userId: string, amount: number) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, credits: Math.max(0, u.credits + amount) };
      }
      return u;
    });
    setUsers(updatedUsers);
    if (selectedUser?.id === userId) setSelectedUser(updatedUsers.find(u => u.id === userId) || null);
    setCreditAdjustment(0);
    addToast(`ปรับปรุงเครดิตเรียบร้อยแล้ว (${amount > 0 ? '+' : ''}${amount})`, 'success');
  };

  const handleMaxCreditChange = (userId: string, newMax: number) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, maxCredits: newMax } : u);
    setUsers(updatedUsers);
    if (selectedUser?.id === userId) setSelectedUser(updatedUsers.find(u => u.id === userId) || null);
  };

  const toggleDonator = (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isDonator: !u.isDonator } : u);
    setUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === userId);
    if (selectedUser?.id === userId) setSelectedUser(updatedUser || null);
    
    if (updatedUser?.isDonator) {
        addToast('ตั้งค่าสถานะผู้สนับสนุนเรียบร้อยแล้ว', 'success');
    } else {
        addToast('ยกเลิกสถานะผู้สนับสนุนแล้ว', 'info');
    }
  };

  const resetStoryProgress = (userId: string, storyId: string) => {
    if(!confirm("ยืนยันการรีเซ็ตความคืบหน้า?")) return;
    const updatedUsers = users.map(u => {
      if(u.id === userId) {
        return {
          ...u,
          storyProgress: u.storyProgress.filter(s => s.storyId !== storyId)
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    if (selectedUser?.id === userId) setSelectedUser(updatedUsers.find(u => u.id === userId) || null);
    addToast('รีเซ็ตความคืบหน้านิยายเรียบร้อยแล้ว', 'success');
  };

  // Achievement Actions
  const handleRemoveAchievementClick = (userId: string, achievementId: string, title: string) => {
    setRemoveAchievementModal({
      isOpen: true,
      userId,
      achievementId,
      achievementTitle: title
    });
  };

  const confirmRemoveAchievement = () => {
    const { userId, achievementId } = removeAchievementModal;
    if (!userId || !achievementId) return;

    const updatedUsers = users.map(u => {
      if(u.id === userId) {
        return {
          ...u,
          achievements: u.achievements.filter(a => a.id !== achievementId),
          achievementsUnlocked: Math.max(0, u.achievementsUnlocked - 1)
        };
      }
      return u;
    });
    setUsers(updatedUsers);
    if (selectedUser?.id === userId) setSelectedUser(updatedUsers.find(u => u.id === userId) || null);
    addToast('ลบความสำเร็จเรียบร้อยแล้ว', 'success');
    setRemoveAchievementModal({ isOpen: false, userId: '', achievementId: '', achievementTitle: '' });
  };

  const handleGrantAchievement = () => {
    if (!selectedUser || !selectedAchievementIdToGrant) return;
    
    const achievementToAdd = MOCK_ACHIEVEMENTS.find(a => a.id === selectedAchievementIdToGrant);
    if (!achievementToAdd) return;

    const updatedUsers = users.map(u => {
      if(u.id === selectedUser.id) {
        // Check if already has it
        if (u.achievements.some(a => a.id === achievementToAdd.id)) return u;

        return {
          ...u,
          achievements: [
            ...u.achievements, 
            { 
              id: achievementToAdd.id, 
              title: achievementToAdd.title, 
              unlockedAt: new Date().toISOString() 
            }
          ],
          achievementsUnlocked: u.achievementsUnlocked + 1
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    if (selectedUser.id === selectedUser.id) setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);
    
    addToast(`มอบความสำเร็จ "${achievementToAdd.title}" เรียบร้อยแล้ว`, 'success');
    setIsGrantModalOpen(false);
    setSelectedAchievementIdToGrant('');
  };

  // Profile Management Actions
  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedUsers = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          username: editForm.username,
          email: editForm.email || null,
          avatar: editForm.avatar
        };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    setSelectedUser(updatedUsers.find(u => u.id === selectedUser.id) || null);
    setIsSaving(false);
    
    if (isEditingPassword && editForm.newPassword) {
      addToast(`เปลี่ยนรหัสผ่านและบันทึกข้อมูลเรียบร้อยแล้ว`, 'success');
      setEditForm(prev => ({ ...prev, newPassword: '' }));
      setIsEditingPassword(false);
    } else {
      addToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว', 'success');
    }
  };

  const handleSelectAvatar = (url: string) => {
    setEditForm({ ...editForm, avatar: url });
    setIsAvatarModalOpen(false);
  };

  const handleRemoveAvatar = () => {
    setEditForm(prev => ({ ...prev, avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(editForm.username) }));
  };

  const handleResetPasswordEmail = async () => {
    if (!editForm.email) {
      addToast('ผู้ใช้นี้ไม่มีอีเมลในระบบ', 'error');
      return;
    }
    setIsSendingEmail(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSendingEmail(false);
    addToast(`ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${editForm.email} เรียบร้อยแล้ว`, 'success');
  };

  const getProviderIcon = (provider: LoginProvider) => {
    switch(provider) {
      case 'google': return <Chrome size={14} className="text-red-500" />;
      case 'email': return <Mail size={14} className="text-blue-500" />;
      default: return <UserIcon size={14} className="text-gray-500" />;
    }
  };

  const getAvailableAchievements = () => {
    if (!selectedUser) return [];
    const userAchIds = selectedUser.achievements.map(a => a.id);
    return MOCK_ACHIEVEMENTS.filter(a => !userAchIds.includes(a.id));
  };

  if (selectedUser) {
    return (
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Detail Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedUser(null)} 
              className="mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <img src={selectedUser.avatar} className="w-16 h-16 rounded-full shadow-sm border-2 border-white object-cover" alt="Profile" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedUser.username}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${selectedUser.type === UserType.GUEST ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-800'}`}>
                  {selectedUser.type}
                </span>
                {selectedUser.isDonator && <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">ผู้สนับสนุน</span>}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
             <button 
                onClick={() => setSelectedUser(null)}
                className="hidden md:flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
             >
               ปิด
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          {(['overview', 'progress', 'achievements', 'ratings', 'history'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none md:w-32 py-4 px-2 text-sm font-medium border-b-2 transition-colors text-center ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'overview' && 'จัดการ'}
              {tab === 'progress' && 'นิยาย'}
              {tab === 'achievements' && 'ความสำเร็จ'}
              {tab === 'history' && 'ประวัติ'}
              {tab === 'ratings' && 'รีวิว'}
            </button>
          ))}
        </div>

        {/* Detail Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="max-w-5xl mx-auto">
            {/* OVERVIEW TAB - MANAGEMENT */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold">เครดิตปัจจุบัน</p>
                      <div className="flex items-baseline mt-1">
                        <span className="text-2xl font-bold text-indigo-600">{selectedUser.credits}</span>
                        <span className="ml-2 text-xs text-gray-400">/ {selectedUser.maxCredits} Max</span>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs text-gray-500 uppercase font-semibold">เข้าใช้งานล่าสุด</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">{new Date(selectedUser.lastActive).toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>

                  {/* Profile Management */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center border-b border-gray-100 pb-3">
                      <Shield size={16} className="mr-2 text-indigo-500"/> ข้อมูลส่วนตัว & ความปลอดภัย
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Avatar */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">รูปโปรไฟล์ (URL)</label>
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={editForm.avatar}
                                onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                              <button
                                onClick={() => setIsAvatarModalOpen(true)}
                                className="px-3 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 flex items-center"
                                title="เลือกรูป"
                              >
                                <ImageIcon size={18} />
                              </button>
                              <button 
                                onClick={handleRemoveAvatar}
                                className="px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                                title="ลบรูปภาพ"
                              >
                                <Trash2 size={18} />
                              </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Name */}
                          <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">ชื่อที่แสดง</label>
                              <input 
                                type="text" 
                                value={editForm.username}
                                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                          </div>

                          {/* Email */}
                          <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">อีเมล</label>
                              <input 
                                type="email" 
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                placeholder="ไม่มีอีเมล"
                              />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="pt-2 border-t border-gray-100">
                          <label className="block text-xs font-medium text-gray-700 mb-2">รหัสผ่าน</label>
                          {!isEditingPassword ? (
                            <div className="flex gap-3">
                              <button 
                                onClick={handleResetPasswordEmail}
                                disabled={isSendingEmail}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
                              >
                                {isSendingEmail ? <Loader2 size={14} className="animate-spin mr-2" /> : <Mail size={14} className="mr-2" />}
                                ส่งลิงก์รีเซ็ต
                              </button>
                              <button 
                                onClick={() => setIsEditingPassword(true)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center"
                              >
                                <Key size={14} className="mr-2" /> ตั้งรหัสใหม่
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2 items-center">
                              <div className="relative flex-1">
                                <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                  type="text"
                                  placeholder="รหัสผ่านใหม่..."
                                  value={editForm.newPassword}
                                  onChange={(e) => setEditForm({...editForm, newPassword: e.target.value})}
                                  className="w-full pl-9 pr-3 py-2 border border-indigo-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none bg-indigo-50"
                                />
                              </div>
                              <button onClick={() => setIsEditingPassword(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">ยกเลิก</button>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="w-full mt-2 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                          {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                        </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Admin Actions */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase flex items-center">
                      <Zap size={16} className="mr-2 text-indigo-500"/> จัดการด่วน
                    </h3>
                    
                    {/* Credit Management */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">ปรับจำนวนเครดิต</label>
                      <div className="flex space-x-3">
                          <input 
                            type="number" 
                            value={creditAdjustment}
                            onChange={(e) => setCreditAdjustment(parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <button 
                            onClick={() => handleAdjustCredits(selectedUser.id, creditAdjustment)}
                            className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                          >
                            ปรับปรุง
                          </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">สถานะผู้สนับสนุน (VIP)</span>
                          <button 
                            onClick={() => toggleDonator(selectedUser.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${selectedUser.isDonator ? 'bg-green-500' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${selectedUser.isDonator ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">ปรับเพดานเครดิตสูงสุด</span>
                          <div className="flex items-center space-x-3">
                            <button onClick={() => handleMaxCreditChange(selectedUser.id, selectedUser.maxCredits - 10)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center">-</button>
                            <span className="text-sm font-medium w-10 text-center">{selectedUser.maxCredits}</span>
                            <button onClick={() => handleMaxCreditChange(selectedUser.id, selectedUser.maxCredits + 10)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center">+</button>
                          </div>
                        </div>
                    </div>
                    
                    {/* Danger Zone */}
                    <div className="border-t border-red-100 pt-6 mt-2">
                      <h4 className="text-xs font-bold text-red-600 uppercase mb-3">โซนอันตราย</h4>
                      {selectedUser.status === UserStatus.ACTIVE ? (
                          <button 
                            onClick={() => handleStatusChange(selectedUser.id, UserStatus.BANNED)}
                            className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                          >
                            <Ban size={16} className="mr-2"/> ระงับการใช้งาน (Ban)
                          </button>
                      ) : (
                          <button 
                            onClick={() => handleStatusChange(selectedUser.id, UserStatus.ACTIVE)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                          >
                            <CheckCircle size={16} className="mr-2"/> ยกเลิกการระงับ (Unban)
                          </button>
                      )}
                      
                      {selectedUser.type === UserType.GUEST && (
                        <button className="w-full mt-3 flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
                          <RefreshCw size={16} className="mr-2"/> แปลงเป็นบัญชีสมาชิก
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROGRESS TAB */}
            {activeTab === 'progress' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUser.storyProgress.length > 0 ? (
                    selectedUser.storyProgress.map((prog) => (
                      <div key={prog.storyId} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{prog.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${prog.status === 'จบแล้ว' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {prog.status}
                            </span>
                          </div>
                          <button 
                            onClick={() => resetStoryProgress(selectedUser.id, prog.storyId)}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                          >
                            รีเซ็ต
                          </button>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${prog.progress}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 text-right">{prog.progress}% • ล่าสุด {new Date(prog.lastPlayed).toLocaleDateString('th-TH')}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 text-gray-500">
                      <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
                      <p>ยังไม่มีประวัติการเล่น</p>
                    </div>
                  )}
              </div>
            )}

            {/* ACHIEVEMENTS TAB */}
            {activeTab === 'achievements' && (
              <div className="space-y-6">
                  <div className="flex justify-between items-center mb-2 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900">ความสำเร็จที่ปลดล็อค ({selectedUser.achievements.length})</h3>
                    <button 
                      onClick={() => setIsGrantModalOpen(true)}
                      className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                      <Plus size={16} className="mr-1.5"/> มอบรางวัล
                    </button>
                  </div>
                  
                  {selectedUser.achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedUser.achievements.map((ach) => (
                        <div key={ach.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                              <Trophy size={20} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{ach.title}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                <Calendar size={12} className="mr-1" />
                                {new Date(ach.unlockedAt).toLocaleDateString('th-TH')}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveAchievementClick(selectedUser.id, ach.id, ach.title)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="ลบความสำเร็จนี้"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                    ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
                      <Trophy size={48} className="mx-auto mb-3 opacity-20" />
                      <p>ยังไม่มีความสำเร็จ</p>
                    </div>
                  )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-6">บันทึกกิจกรรม</h3>
                  <div className="relative pl-6 border-l-2 border-gray-200 space-y-8">
                    {selectedUser.activityLogs.map((log) => (
                      <div key={log.id} className="relative">
                          <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gray-300 border-4 border-white"></div>
                          <p className="text-xs text-gray-400 mb-1 font-mono">{new Date(log.timestamp).toLocaleString('th-TH')}</p>
                          <p className="text-sm font-bold text-gray-900">{log.action}</p>
                          <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      </div>
                    ))}
                  </div>
              </div>
            )}
            
            {/* RATINGS TAB */}
            {activeTab === 'ratings' && (
              <div className="space-y-4">
                  {selectedUser.ratings.length > 0 ? (
                    selectedUser.ratings.map((rate, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 text-base">{rate.title}</h4>
                          <span className="text-xs text-gray-400">{new Date(rate.createdAt).toLocaleDateString('th-TH')}</span>
                        </div>
                        <div className="flex items-center my-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < rate.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        {rate.comment && (
                          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border border-gray-100">
                            "{rate.comment}"
                          </div>
                        )}
                        <div className="mt-4 flex justify-end space-x-3">
                          <button className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 hover:bg-gray-100 rounded">ซ่อนรีวิว</button>
                          <button className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded">ลบรีวิว</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
                      <Star size={48} className="mx-auto mb-3 opacity-20" />
                      <p>ยังไม่มีการรีวิว</p>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
        
        {/* Modals reused from original code */}
        {isGrantModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6 text-center">
                   <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
                      <Trophy className="h-6 w-6 text-indigo-600" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">มอบความสำเร็จพิเศษ</h3>
                   <div className="text-left mb-6">
                      <label className="block text-xs font-medium text-gray-700 mb-1">เลือกความสำเร็จ</label>
                      <select 
                        value={selectedAchievementIdToGrant}
                        onChange={(e) => setSelectedAchievementIdToGrant(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="">-- กรุณาเลือก --</option>
                        {getAvailableAchievements().map(ach => (
                          <option key={ach.id} value={ach.id}>
                            {ach.title} ({ach.rewardCredits} เครดิต)
                          </option>
                        ))}
                      </select>
                   </div>
                   <div className="flex space-x-3">
                       <button onClick={() => setIsGrantModalOpen(false)} className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">ยกเลิก</button>
                       <button onClick={handleGrantAchievement} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">ยืนยัน</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900 text-lg">เลือกรูปโปรไฟล์</h3>
                    <button onClick={() => setIsAvatarModalOpen(false)}><X size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {DEFAULT_AVATARS.map((url, idx) => (
                         <button key={idx} onClick={() => handleSelectAvatar(url)} className="flex flex-col items-center group">
                            <img src={url} alt="Default" className="w-16 h-16 rounded-full border-2 hover:border-indigo-500" />
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาด้วย อีเมล, ชื่อผู้ใช้ หรือ ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select 
              value={activeFilter} 
              onChange={(e) => setActiveFilter(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">ผู้ใช้ทั้งหมด</option>
              <option value="registered">สมาชิกลงทะเบียน</option>
              <option value="guest">ผู้เยี่ยมชม (Guest)</option>
              <option value="low_credit">เครดิตต่ำ (&lt;10)</option>
              <option value="high_achiever">ระดับเซียน (Ach &gt;5)</option>
              <option value="completed_story">เล่นจบอย่างน้อย 1 เรื่อง</option>
              <option value="no_rating">ไม่เคยให้คะแนน</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ใช้</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">เครดิต / สูงสุด</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ความสำเร็จ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">เล่น / รีวิว</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.length > 0 ? paginatedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="cursor-pointer hover:bg-indigo-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <img className="h-10 w-10 rounded-full border border-gray-200" src={user.avatar} alt="" />
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
                            {getProviderIcon(user.provider)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900 flex items-center">
                            {user.username}
                            {user.isDonator && <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] rounded-full">VIP</span>}
                          </div>
                          <div className="text-xs text-gray-500">{user.email || 'Guest User'}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5 font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-semibold text-gray-900">{user.credits}</div>
                      <div className="text-xs text-gray-500">จาก {user.maxCredits}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Trophy size={12} className="mr-1" />
                        {user.achievementsUnlocked}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center hidden sm:table-cell">
                      <div className="text-xs text-gray-600 space-x-2">
                        <span title="นิยายที่เล่น"><BookOpen size={14} className="inline mr-1"/>{user.storiesPlayed}</span>
                        <span className="text-gray-300">|</span>
                        <span title="รีวิวที่เขียน"><Star size={14} className="inline mr-1"/>{user.ratingsCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === UserStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      ไม่พบข้อมูลผู้ใช้ตามเงื่อนไข
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
      </div>
    </div>
  );
};
