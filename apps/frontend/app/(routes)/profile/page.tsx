"use client";

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  GitBranch,
  Grid,
  Heart,
  Lock,
  LogOut,
  Play,
  PlayCircle,
  RotateCcw,
  Settings,
  Trophy,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { useAuth } from '@lib/auth-context';
import { MOCK_STORIES, SYSTEM_ACHIEVEMENTS, SYSTEM_AVATARS } from '@lib/constants';
import type { Story } from '@lib/types';
import EditProfileModal from '@ui/modals/EditProfileModal';

const ITEMS_PER_PAGE = 5;

type EndingDetails = {
  ending: string;
  type: 'Good' | 'Bad' | 'Neutral' | 'True' | 'Secret';
  date: string;
};

const ENDING_COLORS: Record<EndingDetails['type'] | 'default', string> = {
  Good: 'text-green-400 bg-green-400',
  True: 'text-accent bg-accent',
  Bad: 'text-red-400 bg-red-400',
  Secret: 'text-purple-400 bg-purple-400',
  Neutral: 'text-gray-400 bg-gray-400',
  default: 'text-gray-400 bg-gray-400',
};

function getHistoryDetails(storyId: string): EndingDetails {
  const historyData: Record<string, EndingDetails> = {
    '1': { ending: 'การหลบหนีที่สมบูรณ์แบบ', type: 'Good', date: '2 ชั่วโมงที่แล้ว' },
    '2': { ending: 'ถูกจับกุม', type: 'Bad', date: 'เมื่อวาน' },
    '3': { ending: 'ราชันย์ผู้โดดเดี่ยว', type: 'Neutral', date: '3 วันที่แล้ว' },
    '5': { ending: 'ความรักข้ามจักรวาล', type: 'True', date: '1 สัปดาห์ที่แล้ว' },
  };

  return historyData[storyId] || { ending: 'ยังเล่นไม่จบ', type: 'Neutral', date: 'ไม่ระบุ' };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'history' | 'avatars'>(user?.isGuest ? 'history' : 'achievements');
  const [historyPage, setHistoryPage] = useState(1);

  const isGuest = user?.isGuest ?? false;

  const totalSystemEndings = useMemo(
    () => MOCK_STORIES.reduce((sum, story) => sum + story.totalEndings, 0),
    [],
  );

  const lastPlayedStory = useMemo(() => {
    if (!user?.playedStories.length) return null;
    const lastId = user.playedStories[user.playedStories.length - 1];
    return MOCK_STORIES.find((story) => story.id === lastId) ?? null;
  }, [user]);

  const historyStories = useMemo(() => {
    if (!user) return [];
    return user.playedStories
      .map((id) => MOCK_STORIES.find((story) => story.id === id))
      .filter(Boolean) as Story[];
  }, [user]);

  const totalHistoryItems = historyStories.length;
  const totalHistoryPages = Math.max(1, Math.ceil(totalHistoryItems / ITEMS_PER_PAGE));
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages);

  const paginatedHistory = useMemo(
    () =>
      historyStories.slice(
        (currentHistoryPage - 1) * ITEMS_PER_PAGE,
        currentHistoryPage * ITEMS_PER_PAGE,
      ),
    [currentHistoryPage, historyStories],
  );

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleGuestUpgrade = () => {
    logout();
    router.push('/auth/signup');
  };

  const handleSaveProfile = (data: { name: string; avatar: string }) => {
    if (!user) return;
    updateUser({ name: data.name || user.name, avatar: data.avatar });
  };

  const handleNavigateLibrary = () => router.push('/stories');
  const handlePlayStory = (storyId: string) => router.push(`/play/${storyId}`);

  const isAvatarUnlocked = (avatarId: string) => {
    const avatar = SYSTEM_AVATARS.find((item) => item.id === avatarId);
    if (!avatar) return false;
    if (avatar.type === 'free') return true;
    if (avatar.type === 'unlock' && avatar.requiredStoryId) {
      return user?.playedStories.includes(avatar.requiredStoryId) ?? false;
    }
    return false;
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-surface/70 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
            <UserIcon />
          </div>
          <h1 className="text-2xl font-bold text-white">เข้าสู่ระบบเพื่อดูโปรไฟล์</h1>
          <p className="mt-2 text-sm text-gray-400">ติดตามความสำเร็จ ประวัติการเล่น และจัดการอวาตาร์ของคุณ</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition hover:bg-blue-600 sm:w-auto"
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-white/30 hover:bg-white/10 sm:w-auto"
            >
              สมัครสมาชิก
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-20 pt-28">
      {!isGuest && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleSaveProfile}
        />
      )}

      {isGuest && (
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4 animate-fade-in">
          <div className="rounded-full bg-orange-500/20 p-2 text-orange-500">
            <AlertCircle size={24} />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-white">คุณกำลังใช้งานในโหมดผู้เยี่ยมชม</h3>
            <p className="text-sm text-gray-400">ข้อมูลการเล่นและความสำเร็จของคุณจะไม่ถูกบันทึกถาวร กรุณาสมัครสมาชิกเพื่อเก็บข้อมูล</p>
          </div>
          <button
            onClick={handleGuestUpgrade}
            className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-gray-200"
          >
            ลงทะเบียนเลย
          </button>
        </div>
      )}

      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-surface/50 p-8 md:p-12 shadow-2xl backdrop-blur-md animate-fade-in">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-secondary/10 blur-[80px]" />

        <div className="relative z-10 flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
          <div className="group relative">
            <div
              className={`relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#1a1d26] text-4xl font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] ${
                isGuest ? 'bg-gray-700' : 'bg-gradient-to-tr from-primary to-secondary'
              }`}
            >
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="128px" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {!isGuest && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-0 right-0 rounded-full bg-white p-2 text-black shadow-lg transition-transform hover:scale-110"
              >
                <Edit3 size={16} />
              </button>
            )}
          </div>

          <div className="flex-grow">
            <h2 className="mb-2 text-4xl font-bold text-white">{user.name}</h2>
            <p className="mb-6 flex items-center justify-center gap-2 text-gray-400 md:justify-start">
              <UserIcon size={16} /> {isGuest ? 'นักเดินทางพเนจร' : 'นักเดินทางแห่งเรื่องราว • Level 5'}
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:justify-start">
              {lastPlayedStory && (
                <button
                  onClick={() => handlePlayStory(lastPlayedStory.id)}
                  className="flex items-center gap-2 rounded-full border border-primary bg-primary px-5 py-2.5 font-medium text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:bg-blue-600 animate-pulse-slow"
                >
                  <Play size={18} fill="currentColor" />
                  <span className="truncate max-w-[150px]">เล่นต่อ: {lastPlayedStory.title}</span>
                </button>
              )}

              {!isGuest && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 font-medium text-white transition-all hover:bg-white/20"
                >
                  <Settings size={18} /> แก้ไขโปรไฟล์
                </button>
              )}

              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 font-medium transition-all ${
                  isGuest
                    ? 'border-primary bg-primary text-white hover:bg-blue-600'
                    : 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <LogOut size={18} /> {isGuest ? 'ออกจากโหมด Guest' : 'ออกจากระบบ'}
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex gap-4 overflow-x-auto pb-4 no-scrollbar md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
          <div className="group min-w-[140px] shrink-0 snap-center rounded-2xl border border-white/5 bg-black/40 p-6 text-center transition-colors hover:border-primary/30 md:min-w-0">
            <div className="mb-3 flex justify-center text-primary transition-transform group-hover:scale-110">
              <PlayCircle size={32} />
            </div>
            <div className="mb-1 text-3xl font-bold text-white">{user.playedStories.length}</div>
            <div className="text-xs uppercase tracking-widest text-gray-400">เรื่องที่เล่น</div>
          </div>
          <div className="group min-w-[140px] shrink-0 snap-center rounded-2xl border border-white/5 bg-black/40 p-6 text-center transition-colors hover:border-accent/30 md:min-w-0">
            <div className="mb-3 flex justify-center text-accent transition-transform group-hover:scale-110">
              <GitBranch size={32} />
            </div>
            <div className="mb-1 flex items-baseline justify-center gap-1 text-3xl font-bold text-white">
              {user.endingsUnlocked}
              <span className="text-sm font-normal text-gray-400">/ {totalSystemEndings}</span>
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-400">ฉากจบที่พบ</div>
          </div>
          <div className="group min-w-[140px] shrink-0 snap-center rounded-2xl border border-white/5 bg-black/40 p-6 text-center transition-colors hover:border-secondary/30 md:min-w-0">
            <div className="mb-3 flex justify-center text-secondary transition-transform group-hover:scale-110">
              <Trophy size={32} />
            </div>
            <div className="mb-1 text-3xl font-bold text-white">{user.achievements.length}</div>
            <div className="text-xs uppercase tracking-widest text-gray-400">ความสำเร็จ</div>
          </div>
          <div className="group min-w-[140px] shrink-0 snap-center rounded-2xl border border-white/5 bg-black/40 p-6 text-center transition-colors hover:border-pink-500/30 md:min-w-0">
            <div className="mb-3 flex justify-center text-pink-500 transition-transform group-hover:scale-110">
              <Heart size={32} />
            </div>
            <div className="mb-1 text-3xl font-bold text-white">{user.favorites.length}</div>
            <div className="text-xs uppercase tracking-widest text-gray-400">รายการโปรด</div>
          </div>
        </div>
      </div>

      <div className="relative mb-8 flex justify-center border-b border-white/10">
        <div className="no-scrollbar flex w-full justify-start gap-8 overflow-x-auto px-4 pb-4 md:w-auto md:justify-center">
          <button
            onClick={() => setActiveTab('achievements')}
            className={`relative flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'achievements' ? 'text-accent' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Trophy size={18} /> ทำเนียบความสำเร็จ
            {activeTab === 'achievements' && <span className="absolute -bottom-[17px] left-0 h-0.5 w-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`relative flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'history' ? 'text-primary' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Clock size={18} /> ประวัติการเล่น
            {activeTab === 'history' && <span className="absolute -bottom-[17px] left-0 h-0.5 w-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />}
          </button>
          <button
            onClick={() => setActiveTab('avatars')}
            className={`relative flex items-center gap-2 pb-2 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'avatars' ? 'text-secondary' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Grid size={18} /> คลังอวาตาร์
            {activeTab === 'avatars' && <span className="absolute -bottom-[17px] left-0 h-0.5 w-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]" />}
          </button>
        </div>
      </div>

      <div className="min-h-[400px] rounded-3xl border border-white/5 bg-surface/30 p-8 animate-fade-in">
        {activeTab === 'achievements' && (
          <div className="animate-slide-up-fade">
            {isGuest ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center text-gray-400">
                <Lock size={32} className="mb-3 text-gray-500" />
                <p className="text-sm">เฉพาะสมาชิกเท่านั้นที่จะปลดล็อกและติดตามความสำเร็จได้</p>
              </div>
            ) : (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-white">
                    <Trophy className="text-accent" size={24} /> ความสำเร็จของคุณ
                  </h3>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-gray-400">
                    {user.achievements.length} / {SYSTEM_ACHIEVEMENTS.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {SYSTEM_ACHIEVEMENTS.map((achievement) => {
                    const isUnlocked = user.achievements.includes(achievement.id);
                    const creditBonus = 'creditBonus' in achievement ? (achievement as { creditBonus?: number }).creditBonus : undefined;

                    return (
                      <div
                        key={achievement.id}
                        className={`relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 transition-all ${
                          isUnlocked
                            ? 'border-accent/20 bg-gradient-to-r from-accent/10 to-transparent'
                            : 'border-white/5 bg-black/30 opacity-60 grayscale'
                        }`}
                      >
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl shadow-inner ${
                            isUnlocked ? 'bg-black/30' : 'bg-black/50'
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-grow">
                          <h4 className={`text-base font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{achievement.title}</h4>
                          <p className="mt-1 text-xs text-gray-400">{achievement.description}</p>
                          {creditBonus ? (
                            <div
                              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isUnlocked ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-500'
                              }`}
                            >
                              <Zap size={10} fill="currentColor" /> +{creditBonus} Max Credit
                            </div>
                          ) : null}
                        </div>
                        {isUnlocked && (
                          <div className="absolute right-2 top-2">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-slide-up-fade">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-white">
                <Clock className="text-primary" size={24} /> ประวัติการเล่นล่าสุด
              </h3>
              <span className="text-sm text-gray-400">ทั้งหมด {totalHistoryItems} รายการ</span>
            </div>

            {isGuest ? (
              <div className="rounded-xl border border-white/10 bg-black/20 py-12 text-center text-gray-500">
                <Lock size={48} className="mx-auto mb-4 opacity-50" />
                <p>ประวัติการเล่นจะถูกบันทึกสำหรับสมาชิกเท่านั้น</p>
              </div>
            ) : paginatedHistory.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedHistory.map((story, index) => {
                    const details = getHistoryDetails(story.id);
                    const [textColor, bgColor] = (ENDING_COLORS[details.type] || ENDING_COLORS.default).split(' ');

                    return (
                      <div
                        key={`${story.id}-${index}`}
                        className="group flex flex-col gap-5 rounded-xl border border-white/5 bg-white/5 p-5 transition-all hover:scale-[1.01] hover:bg-white/10 md:flex-row"
                      >
                        <div className="relative w-full shrink-0 overflow-hidden rounded-lg border border-white/10 md:w-56">
                          <div className="relative block aspect-video">
                            <Image
                              src={story.coverImage}
                              alt={story.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, 224px"
                            />
                          </div>
                          <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                            {details.date}
                          </div>
                        </div>

                        <div className="flex flex-grow flex-col justify-between">
                          <div>
                            <div className="mb-2 flex items-start justify-between">
                              <h4 className="text-xl font-bold text-white transition-colors group-hover:text-primary">{story.title}</h4>
                            </div>

                            <div className="relative mb-3 flex items-start gap-3 rounded-lg border border-white/5 bg-black/40 p-3">
                            <div className={`absolute left-0 top-0 h-full w-1 ${bgColor}`} />
                              <div className="mt-1 shrink-0">
                                <CheckCircle size={16} className={textColor} />
                              </div>
                              <div>
                                <span className={`block text-[10px] font-bold uppercase tracking-wider ${textColor}`}>
                                  {details.type} Ending
                                </span>
                                <span className="text-sm font-medium text-gray-200">
                                  &ldquo;{details.ending}&rdquo;
                                </span>
                              </div>
                            </div>

                            <p className="mb-2 line-clamp-2 text-xs text-gray-400">{story.description}</p>
                          </div>

                          <div className="mt-2 flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="flex gap-2">
                              <span className="rounded px-2 py-1 text-[10px] uppercase text-gray-400">
                                {story.genre}
                              </span>
                              <span className="rounded border border-white/10 px-2 py-1 text-[10px] text-gray-400">
                                {story.duration}
                              </span>
                            </div>
                            <button
                              onClick={() => handlePlayStory(story.id)}
                              className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-white"
                            >
                              <RotateCcw size={14} /> เล่นอีกครั้ง
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalHistoryItems > ITEMS_PER_PAGE && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                      disabled={currentHistoryPage === 1}
                      className="rounded-lg bg-white/5 p-2 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex gap-2">
                      {Array.from({ length: totalHistoryPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setHistoryPage(index + 1)}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-all ${
                            currentHistoryPage === index + 1
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setHistoryPage((page) => Math.min(totalHistoryPages, page + 1))}
                      disabled={currentHistoryPage === totalHistoryPages}
                      className="rounded-lg bg-white/5 p-2 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-gray-500">
                <PlayCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>คุณยังไม่ได้เริ่มเล่นเกมใดๆ</p>
                <button
                  onClick={handleNavigateLibrary}
                  className="mt-4 text-sm text-primary underline decoration-blue-500/30 underline-offset-4 transition-colors hover:text-white"
                >
                  ไปที่คลังนิยาย
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'avatars' && (
          <div className="animate-slide-up-fade">
            {isGuest ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center text-gray-400">
                <Lock size={32} className="mb-3 text-gray-500" />
                <p className="text-sm">เข้าสู่ระบบเพื่อสะสมและเลือกใช้อวาตาร์พิเศษ</p>
              </div>
            ) : (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-serif font-bold text-white">
                    <Grid className="text-secondary" size={24} /> คอลเลกชันอวาตาร์
                  </h3>
                  <span className="text-sm text-gray-400">ปลดล็อก {user.playedStories.length} / {SYSTEM_AVATARS.length}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                  {SYSTEM_AVATARS.map((avatar) => {
                    const unlocked = isAvatarUnlocked(avatar.id);
                    const isEquipped = user.avatar === avatar.src;

                    return (
                      <div key={avatar.id} className="group relative">
                        <div
                          className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                            unlocked
                              ? isEquipped
                                ? 'border-primary shadow-[0_0_15px_var(--color-primary)]'
                                : 'border-white/10 hover:border-white/50'
                              : 'border-white/5 opacity-40 grayscale'
                          }`}
                        >
                          <Image src={avatar.src} alt={avatar.name} fill className="object-cover" sizes="120px" />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                              <Lock size={20} className="text-gray-400" />
                            </div>
                          )}
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/90 p-2 text-center opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="text-[10px] text-gray-300">{avatar.hint || 'ล็อกอยู่'}</span>
                            </div>
                          )}
                        </div>
                        <p className={`mt-2 truncate text-center text-xs font-medium ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                          {avatar.name}
                        </p>
                        {unlocked && !isEquipped && (
                          <button
                            onClick={() => updateUser({ avatar: avatar.src })}
                            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 py-1 text-[11px] font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                          >
                            ใช้อวาตาร์นี้
                          </button>
                        )}
                        {isEquipped && <p className="mt-1 text-center text-[11px] font-semibold text-primary">กำลังใช้งาน</p>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
