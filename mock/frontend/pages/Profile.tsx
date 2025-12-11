import React, { useState } from 'react';
import {
  User as UserIcon,
  Settings,
  Heart,
  Trophy,
  GitBranch,
  PlayCircle,
  Edit3,
  LogOut,
  AlertCircle,
  Zap,
  Grid,
  Lock,
  Calendar,
  Clock,
  RotateCcw,
  Play,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../App';
import { EditProfileModal } from '../components/EditProfileModal';
import { SYSTEM_ACHIEVEMENTS, SYSTEM_AVATARS, MOCK_STORIES } from '../constants';
import { Story } from '../types';

interface ProfileProps {
  onNavigate: (page: string) => void;
  onSelectStory: (story: Story) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate, onSelectStory }) => {
  const { user, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'history' | 'avatars'>(
    'achievements'
  );

  // Pagination State for History
  const [historyPage, setHistoryPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  if (!user) return null;

  const isGuest = user.isGuest;

  const totalSystemEndings = MOCK_STORIES.reduce((sum, s) => sum + s.totalEndings, 0);

  // Determine last played story for Resume button
  const lastPlayedStoryId =
    user.playedStories.length > 0 ? user.playedStories[user.playedStories.length - 1] : null;
  const lastPlayedStory = lastPlayedStoryId
    ? MOCK_STORIES.find((s) => s.id === lastPlayedStoryId)
    : null;

  const isAvatarUnlocked = (av: (typeof SYSTEM_AVATARS)[0]) => {
    if (av.type === 'free') return true;
    if (av.type === 'unlock' && av.requiredStoryId) {
      // Check if user has played/completed this story
      return user.playedStories.includes(av.requiredStoryId);
    }
    return false;
  };

  // Resolve played stories from IDs for History Tab
  const historyStories = user.playedStories
    .map((id) => MOCK_STORIES.find((s) => s.id === id))
    .filter(Boolean); // Filter out undefined if ID not found

  // Pagination Logic
  const totalHistoryItems = historyStories.length;
  const totalHistoryPages = Math.ceil(totalHistoryItems / ITEMS_PER_PAGE);
  const paginatedHistory = historyStories.slice(
    (historyPage - 1) * ITEMS_PER_PAGE,
    historyPage * ITEMS_PER_PAGE
  );

  // Mock function to simulate specific play history details (Ending reached)
  // In a real app, this would come from a structured PlayHistory object in the user data
  const getHistoryDetails = (storyId: string) => {
    const historyData: Record<
      string,
      { ending: string; type: 'Good' | 'Bad' | 'Neutral' | 'True' | 'Secret'; date: string }
    > = {
      '1': { ending: 'การหลบหนีที่สมบูรณ์แบบ', type: 'Good', date: '2 ชั่วโมงที่แล้ว' },
      '2': { ending: 'ถูกจับกุม', type: 'Bad', date: 'เมื่อวาน' },
      '3': { ending: 'ราชันย์ผู้โดดเดี่ยว', type: 'Neutral', date: '3 วันที่แล้ว' },
      '5': { ending: 'ความรักข้ามจักรวาล', type: 'True', date: '1 สัปดาห์ที่แล้ว' },
    };
    // Fallback for demo if id not in mock
    return historyData[storyId] || { ending: 'ยังเล่นไม่จบ', type: 'Neutral', date: 'ไม่ระบุ' };
  };

  const getEndingColor = (type: string) => {
    switch (type) {
      case 'Good':
        return 'text-green-400 bg-green-400';
      case 'True':
        return 'text-accent bg-accent';
      case 'Bad':
        return 'text-red-400 bg-red-400';
      case 'Secret':
        return 'text-purple-400 bg-purple-400';
      default:
        return 'text-gray-400 bg-gray-400';
    }
  };

  return (
    <div className='pt-28 px-4 max-w-5xl mx-auto min-h-screen pb-20'>
      {!isGuest && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUser={user}
        />
      )}

      {/* Guest Warning Banner */}
      {isGuest && (
        <div className='mb-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl flex items-center gap-4 animate-fade-in'>
          <div className='p-2 bg-orange-500/20 rounded-full text-orange-500'>
            <AlertCircle size={24} />
          </div>
          <div className='flex-grow'>
            <h3 className='font-bold text-white'>คุณกำลังใช้งานในโหมดผู้เยี่ยมชม</h3>
            <p className='text-sm text-gray-400'>
              ข้อมูลการเล่นและความสำเร็จของคุณจะไม่ถูกบันทึกถาวร กรุณาสมัครสมาชิกเพื่อเก็บข้อมูล
            </p>
          </div>
          <button
            onClick={logout}
            className='px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-gray-200 transition-colors whitespace-nowrap'
          >
            ลงทะเบียนเลย
          </button>
        </div>
      )}

      {/* Main Profile Card */}
      <div className='bg-surface/50 p-8 md:p-12 rounded-3xl border border-white/10 animate-fade-in shadow-2xl relative overflow-hidden backdrop-blur-md mb-8'>
        {/* Background Gradient Decoration */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/3' />

        <div className='relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left'>
          <div className='relative group'>
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] border-4 border-[#1a1d26] overflow-hidden ${isGuest ? 'bg-gray-700' : 'bg-gradient-to-tr from-primary to-secondary'}`}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {!isGuest && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className='absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform'
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>

          <div className='flex-grow'>
            <h2 className='text-4xl font-bold text-white mb-2'>{user.name}</h2>
            <p className='text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-6'>
              <UserIcon size={16} />{' '}
              {isGuest ? 'นักเดินทางพเนจร' : 'นักเดินทางแห่งเรื่องราว • Level 5'}
            </p>
            <div className='flex flex-wrap gap-3 justify-center md:justify-start'>
              {/* Resume Button */}
              {lastPlayedStory && (
                <button
                  onClick={() => onSelectStory(lastPlayedStory)}
                  className='px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-full font-medium transition-all flex items-center gap-2 border border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse-slow'
                >
                  <Play size={18} fill='currentColor' />
                  <span className='truncate max-w-[150px]'>เล่นต่อ: {lastPlayedStory.title}</span>
                </button>
              )}

              {!isGuest && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className='px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-all flex items-center gap-2 border border-white/10'
                >
                  <Settings size={18} /> แก้ไขโปรไฟล์
                </button>
              )}
              <button
                onClick={logout}
                className={`px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 border ${isGuest ? 'bg-primary text-white border-primary hover:bg-blue-600' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'}`}
              >
                <LogOut size={18} /> {isGuest ? 'ออกจากโหมด Guest' : 'ออกจากระบบ'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='flex md:grid md:grid-cols-4 gap-4 mt-12 relative z-10 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar snap-x'>
          <div className='min-w-[140px] md:min-w-0 snap-center p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-primary/30 transition-colors group text-center shrink-0'>
            <div className='flex justify-center mb-3 text-primary group-hover:scale-110 transition-transform'>
              <PlayCircle size={32} />
            </div>
            <div className='text-3xl font-bold text-white mb-1'>{user.playedStories.length}</div>
            <div className='text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap'>
              เรื่องที่เล่น
            </div>
          </div>
          <div className='min-w-[140px] md:min-w-0 snap-center p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors group text-center shrink-0'>
            <div className='flex justify-center mb-3 text-accent group-hover:scale-110 transition-transform'>
              <GitBranch size={32} />
            </div>
            <div className='text-3xl font-bold text-white mb-1 flex items-baseline justify-center gap-1'>
              {user.endingsUnlocked}{' '}
              <span className='text-sm text-gray-400 font-normal'>/ {totalSystemEndings}</span>
            </div>
            <div className='text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap'>
              ฉากจบที่พบ
            </div>
          </div>
          <div className='min-w-[140px] md:min-w-0 snap-center p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-secondary/30 transition-colors group text-center shrink-0'>
            <div className='flex justify-center mb-3 text-secondary group-hover:scale-110 transition-transform'>
              <Trophy size={32} />
            </div>
            <div className='text-3xl font-bold text-white mb-1'>{user.achievements.length}</div>
            <div className='text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap'>
              ความสำเร็จ
            </div>
          </div>
          <div className='min-w-[140px] md:min-w-0 snap-center p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-pink-500/30 transition-colors group text-center shrink-0'>
            <div className='flex justify-center mb-3 text-pink-500 group-hover:scale-110 transition-transform'>
              <Heart size={32} />
            </div>
            <div className='text-3xl font-bold text-white mb-1'>{user.favorites.length}</div>
            <div className='text-xs text-gray-400 uppercase tracking-widest whitespace-nowrap'>
              รายการโปรด
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className='flex justify-center mb-8 border-b border-white/10 relative'>
        <div className='flex gap-8 overflow-x-auto pb-4 px-4 w-full md:w-auto justify-start md:justify-center no-scrollbar'>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === 'achievements' ? 'text-accent' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Trophy size={18} />
            ทำเนียบความสำเร็จ
            {activeTab === 'achievements' && (
              <div className='absolute -bottom-[17px] left-0 w-full h-0.5 bg-accent shadow-[0_0_8px_var(--color-accent)]' />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === 'history' ? 'text-primary' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Clock size={18} />
            ประวัติการเล่น
            {activeTab === 'history' && (
              <div className='absolute -bottom-[17px] left-0 w-full h-0.5 bg-primary shadow-[0_0_8px_var(--color-primary)]' />
            )}
          </button>
          <button
            onClick={() => setActiveTab('avatars')}
            className={`flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === 'avatars' ? 'text-secondary' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Grid size={18} />
            คลังอวาตาร์
            {activeTab === 'avatars' && (
              <div className='absolute -bottom-[17px] left-0 w-full h-0.5 bg-secondary shadow-[0_0_8px_var(--color-secondary)]' />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className='bg-surface/30 p-8 rounded-3xl border border-white/5 animate-fade-in min-h-[400px]'>
        {/* TAB 1: ACHIEVEMENTS */}
        {activeTab === 'achievements' && !isGuest && (
          <div className='animate-slide-up-fade'>
            <div className='flex items-center justify-between mb-8'>
              <h3 className='text-xl font-serif font-bold text-white flex items-center gap-2'>
                <Trophy className='text-accent' size={24} />
                ความสำเร็จของคุณ
              </h3>
              <span className='text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full'>
                {user.achievements.length} / {SYSTEM_ACHIEVEMENTS.length}
              </span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {SYSTEM_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = user.achievements.includes(ach.id);
                // @ts-ignore
                const creditBonus = ach.creditBonus;

                return (
                  <div
                    key={ach.id}
                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all relative overflow-hidden ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-accent/10 to-transparent border-accent/20'
                        : 'bg-black/30 border-white/5 opacity-60 grayscale'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-inner shrink-0 ${
                        isUnlocked ? 'bg-black/30' : 'bg-black/50'
                      }`}
                    >
                      {ach.icon}
                    </div>
                    <div className='flex-grow'>
                      <h4
                        className={`font-bold text-base ${isUnlocked ? 'text-white' : 'text-gray-500'}`}
                      >
                        {ach.title}
                      </h4>
                      <p className='text-xs text-gray-400 mt-1'>{ach.description}</p>

                      {creditBonus && (
                        <div
                          className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isUnlocked ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          <Zap size={10} fill='currentColor' />+{creditBonus} Max Credit
                        </div>
                      )}
                    </div>
                    {isUnlocked && (
                      <div className='absolute top-2 right-2'>
                        <div className='w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] animate-pulse' />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className='animate-slide-up-fade'>
            <div className='flex items-center justify-between mb-8'>
              <h3 className='text-xl font-serif font-bold text-white flex items-center gap-2'>
                <Clock className='text-primary' size={24} />
                ประวัติการเล่นล่าสุด
              </h3>
              <span className='text-sm text-gray-400'>ทั้งหมด {totalHistoryItems} รายการ</span>
            </div>

            {isGuest ? (
              <div className='text-center py-12 text-gray-500'>
                <Lock size={48} className='mx-auto mb-4 opacity-50' />
                <p>ประวัติการเล่นจะถูกบันทึกสำหรับสมาชิกเท่านั้น</p>
              </div>
            ) : paginatedHistory.length > 0 ? (
              <>
                <div className='space-y-4'>
                  {paginatedHistory.map((story, idx) => {
                    const details = getHistoryDetails(story?.id || '');
                    const typeColor = getEndingColor(details.type);

                    return (
                      <div
                        key={`${story?.id}-${idx}`}
                        className='flex flex-col md:flex-row gap-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-5 transition-all hover:scale-[1.01] group'
                      >
                        <div className='w-full md:w-56 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors relative'>
                          <img
                            src={story?.coverImage}
                            alt={story?.title}
                            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
                          />
                          <div className='absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white'>
                            {details.date}
                          </div>
                        </div>

                        <div className='flex-grow flex flex-col justify-between'>
                          <div>
                            <div className='flex justify-between items-start mb-2'>
                              <h4 className='text-xl font-bold text-white group-hover:text-primary transition-colors'>
                                {story?.title}
                              </h4>
                            </div>

                            {/* Ending Result Card */}
                            <div className='bg-black/40 border border-white/5 rounded-lg p-3 flex items-start gap-3 mb-3 relative overflow-hidden'>
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1 ${typeColor.split(' ')[1]}`}
                              />
                              <div className='mt-1 shrink-0'>
                                <CheckCircle size={16} className={typeColor.split(' ')[0]} />
                              </div>
                              <div>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider block mb-0.5 ${typeColor.split(' ')[0]}`}
                                >
                                  {details.type} Ending
                                </span>
                                <span className='text-sm font-medium text-gray-200'>
                                  "{details.ending}"
                                </span>
                              </div>
                            </div>

                            <p className='text-xs text-gray-400 line-clamp-2 mb-2'>
                              {story?.description}
                            </p>
                          </div>

                          <div className='flex items-center justify-between mt-2 pt-3 border-t border-white/5'>
                            <div className='flex gap-2'>
                              <span className='text-[10px] border border-white/10 px-2 py-1 rounded text-gray-400 uppercase'>
                                {story?.genre}
                              </span>
                              <span className='text-[10px] border border-white/10 px-2 py-1 rounded text-gray-400'>
                                {story?.duration}
                              </span>
                            </div>
                            <button
                              onClick={() => onSelectStory(story as Story)}
                              className='px-4 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 rounded-full text-xs font-bold transition-all flex items-center gap-1.5'
                            >
                              <RotateCcw size={14} /> เล่นอีกครั้ง
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalHistoryItems > ITEMS_PER_PAGE && (
                  <div className='flex justify-center items-center gap-2 mt-8'>
                    <button
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className='p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white'
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className='flex gap-2'>
                      {Array.from({ length: totalHistoryPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHistoryPage(i + 1)}
                          className={`w-8 h-8 rounded-lg font-bold text-sm transition-all flex items-center justify-center ${
                            historyPage === i + 1
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                      disabled={historyPage === totalHistoryPages}
                      className='p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white'
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className='text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-xl'>
                <PlayCircle size={48} className='mx-auto mb-4 opacity-50' />
                <p>คุณยังไม่ได้เริ่มเล่นเกมใดๆ</p>
                <button
                  onClick={() => onNavigate('library')}
                  className='mt-4 text-primary hover:text-white underline text-sm'
                >
                  ไปที่คลังนิยาย
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AVATARS */}
        {activeTab === 'avatars' && !isGuest && (
          <div className='animate-slide-up-fade'>
            <div className='flex items-center justify-between mb-8'>
              <h3 className='text-xl font-serif font-bold text-white flex items-center gap-2'>
                <Grid className='text-secondary' size={24} />
                คอลเลกชันอวาตาร์
              </h3>
            </div>

            <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4'>
              {SYSTEM_AVATARS.map((av) => {
                const unlocked = isAvatarUnlocked(av);
                const isEquipped = user.avatar === av.src;

                return (
                  <div key={av.id} className='relative group'>
                    <div
                      className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 relative ${
                        unlocked
                          ? isEquipped
                            ? 'border-primary shadow-[0_0_15px_var(--color-primary)]'
                            : 'border-white/10 hover:border-white/50'
                          : 'border-white/5 opacity-40 grayscale'
                      }`}
                    >
                      <img src={av.src} alt={av.name} className='w-full h-full object-cover' />

                      {/* Lock Overlay */}
                      {!unlocked && (
                        <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                          <Lock size={20} className='text-gray-400' />
                        </div>
                      )}

                      {/* Hover Hint for Locked */}
                      {!unlocked && (
                        <div className='absolute inset-0 bg-black/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center'>
                          <span className='text-[10px] text-gray-300'>
                            {(av as any).hint || 'ล็อกอยู่'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Name Label */}
                    <p
                      className={`text-center text-xs mt-2 font-medium truncate ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      {av.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
