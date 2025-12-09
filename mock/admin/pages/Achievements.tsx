
import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Gift, Plus, Edit, Trash2, Zap, Heart, Star, Compass, Flag, Shield, Lock, Unlock, X, Save, TrendingUp, TrendingDown, UserPlus, Search, Image as ImageIcon, Upload } from 'lucide-react';
import { MOCK_ACHIEVEMENTS, MOCK_USERS, MOCK_STORIES } from '../services/mockData';
import { Achievement, AchievementType, AchievementTriggerType } from '../types';
import { useToast } from '../components/Toast';
import { Pagination } from '../components/Pagination';

// Icon Map for dynamic rendering
const ICON_MAP: Record<string, React.ReactNode> = {
  trophy: <Trophy size={24} />,
  gift: <Gift size={24} />,
  zap: <Zap size={24} />,
  heart: <Heart size={24} />,
  star: <Star size={24} />,
  compass: <Compass size={24} />,
  flag: <Flag size={24} />,
  shield: <Shield size={24} />
};

export const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
  const [filter, setFilter] = useState<'ALL' | AchievementType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Partial<Achievement> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Grid layout 3x3
  
  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  // Grant to User Modal State
  const [grantUserModal, setGrantUserModal] = useState<{ isOpen: boolean; achievement: Achievement | null }>({ isOpen: false, achievement: null });
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // System Avatar Selector State
  const [isSystemAvatarModalOpen, setIsSystemAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToast();

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filteredAchievements = achievements.filter(a => filter === 'ALL' || a.type === filter);

  const paginatedAchievements = filteredAchievements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Actions ---

  const handleCreate = () => {
    setEditingAchievement({
      title: '',
      description: '',
      type: AchievementType.AUTO,
      icon: 'trophy',
      isActive: true,
      triggerType: AchievementTriggerType.PLAY_COUNT,
      threshold: 1,
      rewardCredits: 0,
      rewardMaxCredits: 0,
      usersUnlocked: 0,
      unlockTrend: 0,
      rewardAvatars: []
    });
    setIsModalOpen(true);
  };

  const handleEdit = (achievement: Achievement) => {
    // Ensure rewardAvatars is initialized
    setEditingAchievement({ 
        ...achievement,
        rewardAvatars: achievement.rewardAvatars || []
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, id });
  };

  const executeDelete = () => {
    if (deleteModal.id) {
        setAchievements(achievements.filter(a => a.id !== deleteModal.id));
        addToast('ลบความสำเร็จเรียบร้อยแล้ว', 'success');
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const handleToggleActive = (id: string) => {
    setAchievements(achievements.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    addToast('เปลี่ยนสถานะเรียบร้อยแล้ว', 'info');
  };

  const handleSave = () => {
    if (!editingAchievement?.title || !editingAchievement?.description) {
      addToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    if (editingAchievement.id) {
      // Update
      setAchievements(achievements.map(a => a.id === editingAchievement.id ? { ...a, ...editingAchievement } as Achievement : a));
      addToast('บันทึกความสำเร็จเรียบร้อยแล้ว', 'success');
    } else {
      // Create
      const newAchievement: Achievement = {
        ...editingAchievement,
        id: `a${Date.now()}`,
        usersUnlocked: 0,
        unlockTrend: 0
      } as Achievement;
      setAchievements([...achievements, newAchievement]);
      addToast('สร้างความสำเร็จใหม่เรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
    setEditingAchievement(null);
  };

  // Grant to specific user
  const handleOpenGrantUserModal = (achievement: Achievement) => {
    setGrantUserModal({ isOpen: true, achievement });
    setUserSearchTerm('');
  };

  const handleGrantToUser = (userId: string) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    const achievement = grantUserModal.achievement;
    
    if (user && achievement) {
        addToast(`มอบความสำเร็จ "${achievement.title}" ให้กับ ${user.username} เรียบร้อยแล้ว`, 'success');
        setGrantUserModal({ isOpen: false, achievement: null });
    }
  };

  // Avatar Handling
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingAchievement) {
      const url = URL.createObjectURL(file);
      const currentAvatars = editingAchievement.rewardAvatars || [];
      setEditingAchievement({ ...editingAchievement, rewardAvatars: [...currentAvatars, url] });
      // Reset input
      e.target.value = '';
    }
  };

  const handleSelectSystemAvatar = (url: string) => {
    if (editingAchievement) {
        const currentAvatars = editingAchievement.rewardAvatars || [];
        setEditingAchievement({ ...editingAchievement, rewardAvatars: [...currentAvatars, url] });
        setIsSystemAvatarModalOpen(false);
    }
  };

  const handleRemoveAvatar = (index: number) => {
      if (editingAchievement && editingAchievement.rewardAvatars) {
          const newAvatars = [...editingAchievement.rewardAvatars];
          newAvatars.splice(index, 1);
          setEditingAchievement({ ...editingAchievement, rewardAvatars: newAvatars });
      }
  };

  // Get all system avatars for selection
  const getSystemAvatars = () => {
    const avatars = new Set<string>();
    // Default placeholders
    avatars.add('https://ui-avatars.com/api/?name=User&background=random');
    avatars.add('https://ui-avatars.com/api/?name=Winner&background=gold&color=fff');
    // From Stories
    MOCK_STORIES.forEach(s => {
        s.avatarRewards?.forEach(r => avatars.add(r.url));
    });
    return Array.from(avatars);
  };

  return (
    <div className="space-y-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">จัดการความสำเร็จ (Achievements)</h1>
           <p className="text-sm text-gray-500 mt-1">สร้างภารกิจและรางวัลเพื่อกระตุ้นให้ผู้ใช้งานมีส่วนร่วม</p>
        </div>
        <button onClick={handleCreate} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors">
            <Plus size={18} className="mr-2" />
            สร้างความสำเร็จ
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2 shrink-0">
         <button 
           onClick={() => setFilter('ALL')}
           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
         >
           ทั้งหมด
         </button>
         <button 
           onClick={() => setFilter(AchievementType.AUTO)}
           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === AchievementType.AUTO ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-100'}`}
         >
           ระบบอัตโนมัติ
         </button>
         <button 
           onClick={() => setFilter(AchievementType.MANUAL)}
           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === AchievementType.MANUAL ? 'bg-purple-100 text-purple-800' : 'text-gray-600 hover:bg-gray-100'}`}
         >
           กำหนดเอง (Admin)
         </button>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedAchievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden group transition-all hover:shadow-md ${!achievement.isActive ? 'opacity-75 grayscale-[50%]' : ''}`}
          >
            {/* Background Icon Opacity */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform scale-150">
              {ICON_MAP[achievement.icon] || <Trophy size={64} />}
            </div>
            
            {/* Actions (z-index adjusted to 30) */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-auto">
                <button 
                  onClick={() => handleOpenGrantUserModal(achievement)}
                  className="p-2 bg-gray-100 hover:bg-green-50 text-gray-500 hover:text-green-600 rounded-lg shadow-sm"
                  title="มอบให้ผู้ใช้"
                >
                  <UserPlus size={16} />
                </button>
                <button 
                  onClick={() => handleEdit(achievement)} 
                  className="p-2 bg-gray-100 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-lg shadow-sm"
                  title="แก้ไข"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleToggleActive(achievement.id)} 
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 rounded-lg shadow-sm" 
                  title={achievement.isActive ? "ปิดการใช้งาน" : "เปิดการใช้งาน"}
                >
                  {achievement.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button 
                  onClick={() => handleDeleteClick(achievement.id)} 
                  className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg shadow-sm"
                  title="ลบ"
                >
                  <Trash2 size={16} />
                </button>
            </div>

            {/* Clickable Area for Mobile/Touch UX improvement can be added here if needed, but actions are specific buttons */}
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 
                ${achievement.type === AchievementType.AUTO ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}
              `}>
                {ICON_MAP[achievement.icon] || <Trophy size={24} />}
              </div>

              <div className="mb-1 flex items-center space-x-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wide 
                  ${achievement.type === AchievementType.AUTO ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'}
                `}>
                    {achievement.type}
                </span>
                {!achievement.isActive && <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-200 text-gray-600">ปิดใช้งาน</span>}
              </div>

              <h3 className="font-bold text-gray-900 text-lg truncate" title={achievement.title}>{achievement.title}</h3>
              <p className="text-sm text-gray-500 mt-1 h-10 line-clamp-2">{achievement.description}</p>
              
              {/* Rewards Section */}
              <div className="mt-4 flex flex-wrap gap-2 text-sm items-center">
                  {achievement.rewardCredits > 0 && (
                    <span className="flex items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded border border-green-100">
                        <Gift size={14} className="mr-1" /> +{achievement.rewardCredits} เครดิต
                    </span>
                  )}
                  {achievement.rewardMaxCredits > 0 && (
                    <span className="flex items-center text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        <Zap size={14} className="mr-1" /> +{achievement.rewardMaxCredits} Max
                    </span>
                  )}
                  {achievement.rewardAvatars && achievement.rewardAvatars.length > 0 && (
                     <div className="flex -space-x-2">
                        {achievement.rewardAvatars.slice(0, 3).map((url, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden" title="ได้รับอวาตาร์">
                                <img src={url} alt="Reward" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        {achievement.rewardAvatars.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                +{achievement.rewardAvatars.length - 3}
                            </div>
                        )}
                     </div>
                  )}
                  {achievement.rewardCredits === 0 && achievement.rewardMaxCredits === 0 && (!achievement.rewardAvatars || achievement.rewardAvatars.length === 0) && (
                      <span className="flex items-center text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        <Trophy size={14} className="mr-1" /> ตราประทับ
                    </span>
                  )}
              </div>

              {/* Analytics Footer */}
              <div className="mt-6 flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase">ปลดล็อคแล้ว</span>
                    <span className="text-sm font-semibold text-gray-700">{achievement.usersUnlocked.toLocaleString()} คน</span>
                  </div>
                  {achievement.unlockTrend !== 0 && (
                    <div className={`flex items-center text-xs font-medium ${achievement.unlockTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {achievement.unlockTrend > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        {Math.abs(achievement.unlockTrend)}%
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination Bar */}
      {filteredAchievements.length > 0 && (
        <div className="bg-white">
           <Pagination 
             currentPage={currentPage}
             totalItems={filteredAchievements.length}
             itemsPerPage={itemsPerPage}
             onPageChange={setCurrentPage}
           />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
              <div className="p-6 text-center">
                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <Trash2 className="h-6 w-6 text-red-600" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ</h3>
                 <p className="text-sm text-gray-500">
                    คุณแน่ใจหรือไม่ที่จะลบความสำเร็จนี้? 
                    <br/>ผู้ใช้ที่ปลดล็อคไปแล้วจะยังคงมีประวัติอยู่
                 </p>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex space-x-3">
                 <button 
                    onClick={() => setDeleteModal({ isOpen: false, id: null })}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-colors"
                 >
                    ยกเลิก
                 </button>
                 <button 
                    onClick={executeDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors"
                 >
                    ลบความสำเร็จ
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Grant To User Modal */}
      {grantUserModal.isOpen && grantUserModal.achievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-bold text-gray-900 text-lg">
                    มอบความสำเร็จให้ผู้ใช้
                 </h3>
                 <button onClick={() => setGrantUserModal({isOpen: false, achievement: null})} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6">
                 <div className="flex items-center space-x-3 mb-6 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                     <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                        {ICON_MAP[grantUserModal.achievement.icon] || <Trophy size={20}/>}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900">{grantUserModal.achievement.title}</p>
                        <p className="text-xs text-gray-500">{grantUserModal.achievement.description}</p>
                     </div>
                 </div>

                 <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหาผู้ใช้ (ID หรือ ชื่อ)</label>
                 <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                       type="text" 
                       value={userSearchTerm} 
                       onChange={(e) => setUserSearchTerm(e.target.value)}
                       className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                       placeholder="พิมพ์ชื่อผู้ใช้..."
                    />
                 </div>
                 
                 <div className="border rounded-lg max-h-48 overflow-y-auto mb-4">
                    {MOCK_USERS.filter(u => 
                       userSearchTerm && (u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.id.includes(userSearchTerm))
                    ).map(user => (
                       <div key={user.id} className="flex justify-between items-center p-3 hover:bg-gray-50 border-b last:border-0 border-gray-100">
                          <div className="flex items-center space-x-2">
                             <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                             <div>
                                <p className="text-sm font-medium">{user.username}</p>
                                <p className="text-xs text-gray-400">{user.id}</p>
                             </div>
                          </div>
                          <button 
                             onClick={() => handleGrantToUser(user.id)}
                             className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                             เลือก
                          </button>
                       </div>
                    ))}
                    {userSearchTerm && MOCK_USERS.filter(u => u.username.toLowerCase().includes(userSearchTerm.toLowerCase())).length === 0 && (
                       <p className="text-center text-xs text-gray-500 py-3">ไม่พบผู้ใช้ที่ค้นหา</p>
                    )}
                    {!userSearchTerm && (
                        <p className="text-center text-xs text-gray-400 py-3">พิมพ์เพื่อค้นหาผู้ใช้</p>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isModalOpen && editingAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-bold text-gray-900 text-lg">
                    {editingAchievement.id ? 'แก้ไขความสำเร็จ' : 'สร้างความสำเร็จใหม่'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto">
                 {/* Basic Info */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อความสำเร็จ</label>
                    <input 
                       type="text" 
                       value={editingAchievement.title} 
                       onChange={(e) => setEditingAchievement({...editingAchievement, title: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบาย</label>
                    <textarea 
                       value={editingAchievement.description} 
                       onChange={(e) => setEditingAchievement({...editingAchievement, description: e.target.value})}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                    />
                 </div>

                 {/* Icon Selection */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เลือกไอคอน</label>
                    <div className="flex gap-2">
                       {Object.keys(ICON_MAP).map(iconKey => (
                          <button
                            key={iconKey}
                            onClick={() => setEditingAchievement({...editingAchievement, icon: iconKey})}
                            className={`p-2 rounded-lg border transition-all ${editingAchievement.icon === iconKey ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'}`}
                          >
                             {ICON_MAP[iconKey]}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="border-t border-gray-100 pt-4"></div>

                 {/* Configuration Type */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทความสำเร็จ</label>
                    <div className="flex space-x-4">
                       <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                             type="radio" 
                             name="achType"
                             checked={editingAchievement.type === AchievementType.AUTO}
                             onChange={() => setEditingAchievement({...editingAchievement, type: AchievementType.AUTO})}
                             className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm">อัตโนมัติ (ตามเงื่อนไข)</span>
                       </label>
                       <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                             type="radio" 
                             name="achType"
                             checked={editingAchievement.type === AchievementType.MANUAL}
                             onChange={() => setEditingAchievement({...editingAchievement, type: AchievementType.MANUAL})}
                             className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm">กำหนดเอง (แจกโดย Admin)</span>
                       </label>
                    </div>
                 </div>

                 {/* Conditional Inputs */}
                 {editingAchievement.type === AchievementType.AUTO ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                       <h4 className="text-xs font-bold text-gray-500 uppercase">เงื่อนไขการปลดล็อค</h4>
                       <div className="grid grid-cols-2 gap-3">
                          <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">เหตุการณ์ (Trigger)</label>
                             <select 
                                value={editingAchievement.triggerType}
                                onChange={(e) => setEditingAchievement({...editingAchievement, triggerType: e.target.value as AchievementTriggerType})}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white outline-none focus:border-indigo-500"
                             >
                                <option value={AchievementTriggerType.PLAY_COUNT}>จำนวนการเล่น</option>
                                <option value={AchievementTriggerType.ENDING_COUNT}>สะสมฉากจบ</option>
                                <option value={AchievementTriggerType.RATING_COUNT}>จำนวนการรีวิว</option>
                                <option value={AchievementTriggerType.STORY_COMPLETE}>เล่นจบ 100%</option>
                             </select>
                          </div>
                          <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">จำนวนเป้าหมาย</label>
                             <input 
                                type="number" 
                                value={editingAchievement.threshold}
                                onChange={(e) => setEditingAchievement({...editingAchievement, threshold: parseInt(e.target.value)})}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-indigo-500"
                             />
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800 flex items-start">
                       <Zap size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                       <p>ความสำเร็จนี้จะถูกมอบโดยผู้ดูแลระบบผ่านหน้ารายละเอียดผู้ใช้ หรือผ่านกิจกรรมพิเศษ</p>
                    </div>
                 )}

                 {/* Rewards */}
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mt-2">รางวัลที่จะได้รับ</h4>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">เครดิตโบนัส (ครั้งเดียว)</label>
                          <div className="relative">
                             <input 
                                type="number" 
                                value={editingAchievement.rewardCredits}
                                onChange={(e) => setEditingAchievement({...editingAchievement, rewardCredits: parseInt(e.target.value)})}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-green-500"
                             />
                             <Gift size={14} className="absolute left-3 top-3 text-green-500" />
                          </div>
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">เพิ่ม Max Credit</label>
                          <div className="relative">
                             <input 
                                type="number" 
                                value={editingAchievement.rewardMaxCredits}
                                onChange={(e) => setEditingAchievement({...editingAchievement, rewardMaxCredits: parseInt(e.target.value)})}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                             />
                             <Zap size={14} className="absolute left-3 top-3 text-blue-500" />
                          </div>
                       </div>
                    </div>
                    
                    {/* Avatar Rewards (Multiple) */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mt-2">
                        <label className="block text-xs font-bold text-purple-800 mb-2">รางวัลอวาตาร์ (Avatar Rewards)</label>
                        
                        {/* List of existing avatars */}
                        {editingAchievement.rewardAvatars && editingAchievement.rewardAvatars.length > 0 ? (
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {editingAchievement.rewardAvatars.map((url, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={url} alt="Reward" className="w-12 h-12 rounded-full border border-purple-200 object-cover bg-white" />
                                        <button 
                                            onClick={() => handleRemoveAvatar(idx)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-purple-400 italic mb-2">ยังไม่มีรางวัลอวาตาร์</p>
                        )}

                        <div className="flex gap-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-xs px-3 py-1 bg-white border border-purple-200 rounded hover:bg-purple-50 text-purple-700 flex items-center"
                            >
                                <Upload size={12} className="mr-1" /> อัปโหลดเพิ่ม
                            </button>
                            <button 
                                onClick={() => setIsSystemAvatarModalOpen(true)}
                                className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
                            >
                                <ImageIcon size={12} className="mr-1" /> เลือกเพิ่มจากระบบ
                            </button>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                        <p className="text-[10px] text-purple-600 mt-2">* ผู้เล่นจะได้รับอวาตาร์ทั้งหมดนี้เมื่อปลดล็อคความสำเร็จ</p>
                    </div>
                 </div>

                 {/* Status */}
                 <div className="flex items-center space-x-2 pt-2">
                    <input 
                        type="checkbox" 
                        id="isActive"
                        checked={editingAchievement.isActive} 
                        onChange={(e) => setEditingAchievement({...editingAchievement, isActive: e.target.checked})}
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">เปิดใช้งานทันที</label>
                 </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50">
                 <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg"
                 >
                    ยกเลิก
                 </button>
                 <button 
                    onClick={handleSave}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm"
                 >
                    <Save size={16} className="mr-2" /> บันทึก
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* System Avatar Selector Modal */}
      {isSystemAvatarModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-900 text-lg">เลือกอวาตาร์จากระบบ</h3>
                      <button onClick={() => setIsSystemAvatarModalOpen(false)}><X size={20} /></button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                          {getSystemAvatars().map((url, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => handleSelectSystemAvatar(url)} 
                                className="group relative aspect-square rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-500"
                              >
                                  <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Plus className="text-white" size={20} />
                                  </div>
                              </button>
                          ))}
                      </div>
                      {getSystemAvatars().length === 0 && (
                          <p className="text-center text-gray-500 py-8">ไม่พบอวาตาร์ในระบบ</p>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
