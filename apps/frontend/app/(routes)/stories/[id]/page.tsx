'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CornerDownRight,
  Flag,
  GitBranch,
  Heart,
  Lock,
  MessageSquare,
  Play,
  PlayCircle,
  Share2,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react';
import StoryCard from '@ui/StoryCard';
import RatingModal from '@ui/modals/RatingModal';
import ReportModal from '@ui/modals/ReportModal';
import { MOCK_REVIEWS, MOCK_STORIES } from '@lib/constants';
import { useAuth } from '@lib/auth-context';
import type { Review } from '@lib/types';

type MediaItem = {
  type: 'video' | 'image';
  src: string;
  thumbnail: string;
};

const getStoryExtras = () => ({
  endings: [
    { id: 'e1', title: 'การหลบหนีที่สมบูรณ์แบบ', type: 'Good', unlocked: true },
    { id: 'e2', title: 'ถูกจับกุม', type: 'Bad', unlocked: true },
    { id: 'e3', title: 'พันธมิตรใหม่', type: 'Neutral', unlocked: false },
    { id: 'e4', title: 'การเสียสละ', type: 'Heroic', unlocked: false },
    { id: 'e5', title: '?? ความลับ ??', type: 'Secret', unlocked: false },
  ],
});

function getYouTubeEmbedUrl(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0`
    : null;
}

export default function StoryDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const { isAuthenticated, user, toggleFavorite, addRatingBonus, markStoryPlayed } = useAuth();

  const storyId = useMemo(() => {
    if (!params?.id) return undefined;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params?.id]);

  const story = useMemo(() => MOCK_STORIES.find((item) => item.id === storyId), [storyId]);

  const [isCopied, setIsCopied] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<'story' | 'review'>('story');
  const [reviewToReport, setReviewToReport] = useState<Review | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('บันทึกรีวิวสำเร็จ!');
  const [isToastError, setIsToastError] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const isFavorite = useMemo(
    () => Boolean(user && storyId && user.favorites.includes(storyId)),
    [storyId, user]
  );

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mediaItems = useMemo(() => {
    if (!story) return [];
    const items: MediaItem[] = [];
    if (story.trailerUrl) {
      items.push({ type: 'video', src: story.trailerUrl, thumbnail: story.coverImage });
    }
    if (story.gallery?.length) {
      story.gallery.forEach((img) => items.push({ type: 'image', src: img, thumbnail: img }));
    } else if (!story.trailerUrl) {
      items.push({ type: 'image', src: story.coverImage, thumbnail: story.coverImage });
    }
    return items;
  }, [story]);

  const activeMedia = mediaItems[activeMediaIndex] ?? mediaItems[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [story?.id]);

  if (!story) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-background text-gray-100'>
        <div className='rounded-2xl border border-white/10 bg-surface/80 px-6 py-5 text-center shadow-2xl'>
          <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400'>
            <X />
          </div>
          <p className='text-lg font-semibold'>ไม่พบนิยายที่คุณต้องการ</p>
          <button
            onClick={() => router.push('/stories')}
            className='mt-4 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600'
          >
            กลับไปหน้าคลังนิยาย
          </button>
        </div>
      </main>
    );
  }

  const extras = getStoryExtras();
  const relatedStories = MOCK_STORIES.filter(
    (item) => item.genre === story.genre && item.id !== story.id
  ).slice(0, 3);
  const reviewsToDisplay = showAllReviews ? MOCK_REVIEWS : MOCK_REVIEWS.slice(0, 10);
  const hasMoreReviews = MOCK_REVIEWS.length > 10;

  const handlePlayClick = () => {
    if (story.comingSoon) return;
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(`/play/${story.id}`);
      router.push(`/auth/login?redirect=${redirect}`);
      return;
    }
    if (storyId) {
      markStoryPlayed(storyId);
    }
    router.push(`/play/${story.id}`);
  };

  const handleReportStoryClick = () => {
    if (!isAuthenticated) {
      setToastMessage('กรุณาเข้าสู่ระบบเพื่อรายงาน');
      setIsToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }
    setReportTarget('story');
    setReviewToReport(null);
    setIsReportModalOpen(true);
  };

  const handleReportReviewClick = (review: Review) => {
    if (!isAuthenticated) {
      setToastMessage('กรุณาเข้าสู่ระบบเพื่อรายงาน');
      setIsToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }
    setReportTarget('review');
    setReviewToReport(review);
    setIsReportModalOpen(true);
  };

  const handleRatingSubmit = (rating: number, comment: string) => {
    if (!isAuthenticated) {
      setToastMessage('กรุณาเข้าสู่ระบบก่อนรีวิว');
      setIsToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    console.log('Rating submitted', { storyId: story.id, rating, comment });
    const bonusApplied = addRatingBonus(story.id);
    setIsRatingModalOpen(false);
    setToastMessage(bonusApplied ? 'บันทึกรีวิวสำเร็จ! รับเครดิตโบนัส' : 'บันทึกรีวิวสำเร็จ!');
    setIsToastError(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleReportSubmit = (reason: string, description: string) => {
    if (reportTarget === 'story') {
      console.log(`Reported story ${story.id}: ${reason} - ${description}`);
    } else {
      console.log(`Reported review ${reviewToReport?.id}: ${reason} - ${description}`);
    }
    setIsReportModalOpen(false);
    setToastMessage('ขอบคุณสำหรับการรายงาน เราจะตรวจสอบโดยเร็วที่สุด');
    setIsToastError(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      setToastMessage('กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด');
      setIsToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }
    toggleFavorite(story.id);
  };

  const handleShare = async () => {
    let shareUrl = window.location.href;
    if (!shareUrl.startsWith('http')) {
      shareUrl = `https://chronos.app/story/${story.id}`;
    }
    const shareData = {
      title: `Chronos - ${story.title}`,
      text: `แนะนำนิยายเรื่อง "${story.title}" บน Chronos: ${story.description} ...มาลองเล่นดูสิ!`,
      url: shareUrl,
    };
    let shared = false;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (error) {
        console.warn('Web Share API failed, falling back to clipboard', error);
      }
    }
    if (!shared) {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
        alert('ไม่สามารถคัดลอกลิงก์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  return (
    <div key={story.id} className='min-h-screen bg-background text-gray-100 animate-fade-in pb-20'>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        storyTitle={story.title}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        title={reportTarget === 'story' ? story.title : reviewToReport?.user || 'ความคิดเห็น'}
        targetType={reportTarget}
        contentPreview={reportTarget === 'review' ? reviewToReport?.comment : undefined}
      />

      {lightboxImage && (
        <div
          className='fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4'
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className='absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20'
            aria-label='Close lightbox'
          >
            <X size={24} />
          </button>
          <div
            className='relative flex max-h-[90vh] w-full max-w-5xl items-center justify-center'
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={lightboxImage}
              alt='Gallery Preview'
              fill
              className='object-contain'
              sizes='90vw'
              priority
            />
          </div>
        </div>
      )}

      {showToast && (
        <div className='fixed right-4 top-24 z-50 animate-[slideUpFade_0.4s_ease-out_forwards] md:right-8'>
          <div
            className={`flex min-w-[300px] items-center gap-4 rounded-xl border p-4 backdrop-blur-md ${
              isToastError
                ? 'border-red-500/30 bg-red-900/90 text-white shadow-red-900/20'
                : 'border-green-500/30 bg-[#1a1d26]/90 text-white shadow-green-500/10'
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isToastError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {toastMessage.includes('เครดิต') ? <Zap size={24} /> : <CheckCircle size={24} />}
            </div>
            <div>
              <h4 className={`font-bold ${isToastError ? 'text-red-400' : 'text-green-400'}`}>
                {toastMessage}
              </h4>
              <p className='text-xs text-gray-400'>
                {isToastError ? 'กรุณาลองใหม่อีกครั้ง' : 'ดำเนินการสำเร็จ'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className='relative h-[60vh] min-h-[520px] w-full overflow-hidden'>
        <div className='absolute left-6 top-24 z-30'>
          <button
            onClick={() => router.push('/stories')}
            className='flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-white shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-black/70 cursor-pointer'
          >
            <ArrowLeft size={20} />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        <div className='absolute inset-0'>
          <div className='absolute inset-0' style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
            <Image
              src={story.coverImage}
              alt={story.title}
              fill
              className={`object-cover ${story.comingSoon ? 'grayscale-[50%]' : ''}`}
              priority
              sizes='100vw'
            />
          </div>
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent' />
          <div className='absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent' />
        </div>

        <div
          className='absolute bottom-0 left-0 z-20 mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8'
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: 1 - Math.min(1, scrollY / 500),
          }}
        >
          <div className='mb-4 flex flex-wrap gap-3'>
            <span className='rounded-full border border-primary/30 bg-primary/20 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm'>
              {story.genre}
            </span>
            {story.comingSoon ? (
              <span className='flex items-center gap-1 rounded-full border border-gray-500 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm'>
                <Calendar size={14} /> เร็วๆ นี้
              </span>
            ) : (
              story.isNew && (
                <span className='rounded-full border border-secondary/30 bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary backdrop-blur-sm'>
                  มาใหม่
                </span>
              )
            )}
            <span className='flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-medium text-gray-300 backdrop-blur-sm'>
              <Clock size={14} /> {story.duration}
            </span>
          </div>

          <h1 className='mb-4 max-w-4xl text-4xl font-serif font-bold leading-tight text-white drop-shadow-2xl md:text-6xl'>
            {story.title}
          </h1>

          {!story.comingSoon && (
            <div className='mb-8 flex flex-wrap items-center gap-6 text-gray-300'>
              <div className='flex items-center gap-2 text-accent'>
                <Star size={20} fill='currentColor' />
                <span className='text-xl font-bold'>{story.rating}</span>
                <span className='text-sm font-normal text-gray-500'>/ 5.0</span>
              </div>
              <div className='h-1 w-1 rounded-full bg-gray-500' />
              <div className='flex items-center gap-2 text-blue-300'>
                <Users size={20} />
                <span className='font-medium'>{story.totalPlayers.toLocaleString()} ผู้เล่น</span>
              </div>
              <div className='h-1 w-1 rounded-full bg-gray-500' />
              <div className='flex items-center gap-2'>
                <GitBranch size={20} />
                <span>{story.totalEndings} ฉากจบ</span>
              </div>
            </div>
          )}

          <div className='flex flex-wrap gap-4'>
            <button
              onClick={handlePlayClick}
              disabled={!!story.comingSoon}
              className={`flex items-center gap-3 rounded-full px-8 py-4 text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition ${
                story.comingSoon
                  ? 'cursor-not-allowed border border-gray-500/30 bg-gray-600/50 text-gray-300'
                  : 'bg-primary text-white hover:scale-105 hover:bg-blue-600'
              }`}
            >
              {story.comingSoon ? (
                <>
                  <Clock size={24} />
                  <span>เปิดให้เล่น {story.launchDate}</span>
                </>
              ) : (
                <>
                  <Play size={24} fill='currentColor' />
                  <span>เริ่มเล่น</span>
                </>
              )}
            </button>

            <button
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-2 rounded-full border px-6 py-4 font-semibold backdrop-blur-sm transition cursor-pointer ${
                isFavorite
                  ? 'border-pink-500 bg-pink-500/20 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'เพิ่มแล้ว' : 'รายการโปรด'}
            </button>

            <button
              onClick={handleShare}
              className={`flex items-center gap-2 rounded-full border px-6 py-4 font-semibold backdrop-blur-sm transition cursor-pointer ${
                isCopied
                  ? 'border-green-500/30 bg-green-500/20 text-green-400'
                  : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              {isCopied ? <Check size={20} /> : <Share2 size={20} />}
              {isCopied ? 'คัดลอกแล้ว' : 'แชร์'}
            </button>

            {!story.comingSoon && (
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className='flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-4 font-semibold text-white transition hover:scale-105 hover:bg-white/20 cursor-pointer'
              >
                <Star size={20} />
                ให้คะแนน
              </button>
            )}

            <button
              onClick={handleReportStoryClick}
              className='flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-4 font-semibold text-red-400 backdrop-blur-sm transition hover:scale-105 hover:bg-red-500/20 cursor-pointer'
              title='รายงานปัญหา'
            >
              <Flag size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className='relative z-10 -mt-6 overflow-hidden rounded-t-3xl bg-background/50 backdrop-blur-sm'>
        <div className='grid grid-cols-1 gap-12 p-6 md:p-12 lg:grid-cols-3'>
          <div className='space-y-12 lg:col-span-2'>
            <div className='space-y-4'>
              <h2 className='border-l-4 border-primary pl-4 text-2xl font-serif font-bold text-white'>
                เรื่องย่อ
              </h2>
              <p className='text-lg leading-relaxed text-gray-300'>{story.description}</p>
              <div className='mt-4 flex flex-wrap gap-2'>
                {story.tags.map((tag) => (
                  <span key={tag} className='rounded bg-surface px-3 py-1 text-sm text-gray-400'>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className='space-y-4'>
              <h2 className='flex items-center gap-2 border-l-4 border-secondary pl-4 text-2xl font-serif font-bold text-white'>
                ตัวอย่าง & แกลเลอรี
              </h2>
              <div className='flex flex-col gap-2'>
                <div className='group relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl'>
                  {activeMedia?.type === 'video' ? (
                    <iframe
                      title='Trailer'
                      src={getYouTubeEmbedUrl(activeMedia.src) || activeMedia.src}
                      className='h-full w-full'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <Image
                        src={activeMedia?.src || story.coverImage}
                        alt='Main Preview'
                        fill
                        className='object-contain'
                        sizes='100vw'
                        priority
                      />
                      <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          onClick={() => setLightboxImage(activeMedia?.src || story.coverImage)}
                          className='pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-black/80'
                        >
                          <ZoomIn size={18} /> ดูขนาดเต็ม
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className='flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]'>
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative h-[68px] min-w-[120px] snap-start overflow-hidden rounded-md border-2 transition cursor-pointer ${
                        activeMediaIndex === idx
                          ? 'z-10 scale-105 border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'border-transparent opacity-70 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <Image
                        src={item.thumbnail}
                        alt={`Thumb ${idx}`}
                        fill
                        className='object-cover'
                        sizes='200px'
                      />
                      {item.type === 'video' && (
                        <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                          <PlayCircle size={20} className='text-white drop-shadow-md' />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-2 gap-8 border-t border-white/5 pt-8'>
                <div>
                  <h3 className='mb-2 text-sm uppercase tracking-wider text-gray-500'>กำกับโดย</h3>
                  <p className='font-medium text-white'>Christopher Nolan (AI)</p>
                </div>
                <div>
                  <h3 className='mb-2 text-sm uppercase tracking-wider text-gray-500'>
                    เขียนบทโดย
                  </h3>
                  <p className='font-medium text-white'>Gemini 1.5 Pro</p>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-8'>
            {!isAuthenticated && (
              <div className='rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6'>
                <div className='flex items-start gap-4'>
                  <AlertCircle className='shrink-0 text-primary' size={24} />
                  <div>
                    <h3 className='mb-1 font-bold text-white'>เข้าสู่ระบบเพื่อบันทึก</h3>
                    <p className='mb-4 text-sm text-gray-400'>
                      เข้าสู่ระบบเพื่อติดตามความคืบหน้า ปลดล็อกความสำเร็จ และบันทึกฉากจบของคุณ
                    </p>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className='text-sm font-bold text-primary transition-colors hover:text-white'
                    >
                      เข้าสู่ระบบทันที →
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className='rounded-xl border border-white/5 bg-surface/50 p-6'>
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='flex items-center gap-2 text-xl font-bold text-white'>
                  <GitBranch className='text-secondary' size={20} />
                  ฉากจบ
                </h2>
                <span className='text-xs text-gray-500'>
                  {story.comingSoon
                    ? '-'
                    : `${extras.endings.filter((ending) => ending.unlocked).length}/${extras.endings.length}`}
                </span>
              </div>
              {story.comingSoon ? (
                <div className='py-8 text-center text-sm text-gray-500'>
                  ข้อมูลฉากจบจะปรากฏเมื่อเกมเปิดให้เล่น
                </div>
              ) : (
                <div className='space-y-3'>
                  {extras.endings.map((ending) => (
                    <div
                      key={ending.id}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        ending.unlocked
                          ? 'border-white/10 bg-white/5'
                          : 'border-white/5 bg-black/20 opacity-60'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        {ending.unlocked ? (
                          <div className='h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]' />
                        ) : (
                          <Lock size={12} className='text-gray-600' />
                        )}
                        <span
                          className={`text-sm ${ending.unlocked ? 'font-medium text-white' : 'text-gray-500'}`}
                        >
                          {ending.unlocked ? ending.title : '??? ถูกล็อก'}
                        </span>
                      </div>
                      {ending.unlocked && (
                        <span className='rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>
                          {ending.type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {!story.comingSoon && (
          <div className='md:px-12 px-6 pb-12'>
            <div className='border-t border-white/5 pt-8'>
              <h2 className='mb-6 flex items-center gap-3 border-l-4 border-accent pl-4 text-2xl font-serif font-bold text-white'>
                ความคิดเห็นจากชุมชน
                <span className='rounded-md bg-white/5 px-2 py-1 text-sm font-sans font-normal text-gray-400'>
                  {MOCK_REVIEWS.length} รีวิว
                </span>
              </h2>
              <div className='grid grid-cols-1 gap-12 lg:grid-cols-3'>
                <div className='space-y-4 lg:col-span-2'>
                  {reviewsToDisplay.map((review) => (
                    <div
                      key={review.id}
                      className='group relative rounded-xl border border-white/5 bg-surface/30 p-6 transition-colors hover:bg-surface/50'
                    >
                      <div className='mb-3 flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-800 text-sm font-bold text-gray-300'>
                            {review.user.charAt(0)}
                          </div>
                          <div>
                            <div className='text-sm font-bold text-white'>{review.user}</div>
                            <div className='text-xs text-gray-500'>{review.date}</div>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <div className='flex gap-1 text-accent'>
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                size={14}
                                fill={idx < review.rating ? 'currentColor' : 'none'}
                                className={idx >= review.rating ? 'text-gray-600' : ''}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => handleReportReviewClick(review)}
                            className='opacity-0 transition-colors hover:text-red-400 hover:bg-red-500/10 group-hover:opacity-100 focus:opacity-100 rounded-full p-1.5 text-gray-600'
                            title='รายงานความคิดเห็น'
                          >
                            <Flag size={14} />
                          </button>
                        </div>
                      </div>
                      <p className='text-sm leading-relaxed text-gray-300'>“{review.comment}”</p>
                      {review.adminReply && (
                        <div className='mt-4 ml-4 flex gap-3 rounded-lg border-l-2 border-primary bg-primary/10 p-4'>
                          <CornerDownRight className='mt-1 shrink-0 text-primary/60' size={16} />
                          <div>
                            <div className='mb-1 flex items-center gap-2'>
                              <span className='flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary'>
                                <BadgeCheck size={14} className='text-primary' />
                                <span className='text-white'>ทีมงาน Chronos</span>
                              </span>
                              <span className='text-[10px] text-gray-500'>
                                • {review.adminReply.date}
                              </span>
                            </div>
                            <p className='text-sm italic text-gray-300'>
                              “{review.adminReply.text}”
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {hasMoreReviews && (
                    <div className='pt-2 text-center'>
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className='mx-auto flex items-center justify-center gap-1 text-sm text-primary transition-colors hover:text-white cursor-pointer'
                      >
                        {showAllReviews ? (
                          <>
                            <span>แสดงน้อยลง</span>
                            <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            <span>ดูรีวิวทั้งหมด ({MOCK_REVIEWS.length})</span>
                            <ChevronDown size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setIsRatingModalOpen(true)}
                    className='mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 py-3 text-sm font-medium text-gray-400 transition hover:border-gray-500 hover:bg-white/5 hover:text-white cursor-pointer'
                  >
                    <MessageSquare size={16} />
                    เขียนรีวิวของคุณเอง
                  </button>
                </div>
                <div className='hidden lg:block' />
              </div>
            </div>
          </div>
        )}
      </div>

      {relatedStories.length > 0 && (
        <div className='mx-auto mt-12 max-w-7xl border-t border-white/5 px-6 py-12'>
          <div className='mb-8 flex items-center gap-2 text-sm font-semibold text-primary'>
            <Sparkles size={16} />
            <span>เรื่องที่คุณอาจสนใจ</span>
          </div>
          <h2 className='mb-6 text-3xl font-serif font-bold text-white'>เรื่องที่คุณอาจสนใจ</h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
            {relatedStories.map((relatedStory) => (
              <StoryCard
                key={relatedStory.id}
                story={relatedStory}
                onClick={() => router.push(`/stories/${relatedStory.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
