import React, { useState, useEffect } from 'react';
import {
  Play,
  Heart,
  Star,
  Clock,
  GitBranch,
  ArrowLeft,
  Share2,
  AlertCircle,
  Check,
  CheckCircle,
  MessageSquare,
  Lock,
  Users,
  Calendar,
  Zap,
  Image as ImageIcon,
  X,
  ZoomIn,
  PlayCircle,
  Flag,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  BadgeCheck,
} from 'lucide-react';
import { Story, Review } from '../types';
import { RatingModal } from '../components/RatingModal';
import { ReportModal } from '../components/ReportModal';
import { StoryCard } from '../components/StoryCard';
import { MOCK_STORIES, MOCK_REVIEWS } from '../constants';
import { useAuth } from '../App';

interface StoryDetailProps {
  story: Story;
  onPlay: () => void;
  onBack: () => void;
  onSelectStory: (story: Story) => void;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

// Mock Data for Detail View (Endings only now)
const getStoryExtras = (id: string) => {
  return {
    endings: [
      { id: 'e1', title: 'การหลบหนีที่สมบูรณ์แบบ', type: 'Good', unlocked: true },
      { id: 'e2', title: 'ถูกจับกุม', type: 'Bad', unlocked: true },
      { id: 'e3', title: 'พันธมิตรใหม่', type: 'Neutral', unlocked: false },
      { id: 'e4', title: 'การเสียสละ', type: 'Heroic', unlocked: false },
      { id: 'e5', title: '?? ความลับ ??', type: 'Secret', unlocked: false },
    ],
  };
};

type MediaItem = {
  type: 'video' | 'image';
  src: string;
  thumbnail: string;
};

export const StoryDetail: React.FC<StoryDetailProps> = ({
  story,
  onPlay,
  onBack,
  onSelectStory,
  isAuthenticated,
  onLoginRequired,
}) => {
  const { addRatingBonus } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Modals
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Report Context
  const [reportTarget, setReportTarget] = useState<'story' | 'review'>('story');
  const [reviewToReport, setReviewToReport] = useState<Review | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('บันทึกรีวิวสำเร็จ!');
  const [isToastError, setIsToastError] = useState(false);

  // Gallery / Media State
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Review State
  const [showAllReviews, setShowAllReviews] = useState(false);

  const extras = getStoryExtras(story.id);

  // Filter related stories (Same genre, excluding current)
  const relatedStories = MOCK_STORIES.filter(
    (s) => s.genre === story.genre && s.id !== story.id
  ).slice(0, 3);

  // Scroll to top when story changes (clicking related story)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [story.id]);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Media Items (Combine Trailer + Gallery)
  useEffect(() => {
    const items: MediaItem[] = [];

    // Add Trailer if exists
    if (story.trailerUrl) {
      items.push({
        type: 'video',
        src: story.trailerUrl,
        thumbnail: story.coverImage, // Use cover as thumbnail for video
      });
    }

    // Add Gallery Images
    if (story.gallery && story.gallery.length > 0) {
      story.gallery.forEach((img) => {
        items.push({
          type: 'image',
          src: img,
          thumbnail: img,
        });
      });
    } else if (!story.trailerUrl) {
      // Fallback if absolutely no media, use cover
      items.push({
        type: 'image',
        src: story.coverImage,
        thumbnail: story.coverImage,
      });
    }

    setMediaItems(items);
    setActiveMediaIndex(0);
  }, [story]);

  const handlePlayClick = () => {
    if (story.comingSoon) return;

    if (isAuthenticated) {
      onPlay();
    } else {
      onLoginRequired();
    }
  };

  const handleReportStoryClick = () => {
    if (isAuthenticated) {
      setReportTarget('story');
      setReviewToReport(null);
      setIsReportModalOpen(true);
    } else {
      onLoginRequired();
    }
  };

  const handleReportReviewClick = (review: Review) => {
    if (isAuthenticated) {
      setReportTarget('review');
      setReviewToReport(review);
      setIsReportModalOpen(true);
    } else {
      onLoginRequired();
    }
  };

  const handleRatingSubmit = (rating: number, comment: string) => {
    // Mock API submission
    console.log(`Submitted review for ${story.title}: ${rating} stars, Comment: ${comment}`);

    // Give Bonus
    const bonusGiven = addRatingBonus(story.id);

    // Close modal
    setIsRatingModalOpen(false);

    // Show Toast
    setToastMessage(bonusGiven ? 'บันทึกรีวิวสำเร็จ! (+5 เครดิต)' : 'บันทึกรีวิวสำเร็จ!');
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

  const handleShare = async () => {
    // Ensure URL is valid for Web Share API
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

    // Try Native Share if supported and is a function
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (err) {
        console.warn('Web Share API failed or cancelled, falling back to clipboard:', err);
      }
    }

    // Fallback to Clipboard
    if (!shared) {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        // Fallback for fallback (alert)
        alert('ไม่สามารถคัดลอกลิงก์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  // Helper to extract YouTube ID
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=0`
      : null;
  };

  // Review Logic
  const reviewsToDisplay = showAllReviews ? MOCK_REVIEWS : MOCK_REVIEWS.slice(0, 10);
  const hasMoreReviews = MOCK_REVIEWS.length > 10;

  return (
    <div className='min-h-screen bg-background text-gray-100 animate-fade-in pb-20'>
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

      {/* Lightbox Modal for Gallery Zoom */}
      {lightboxImage && (
        <div
          className='fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in'
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className='absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt='Gallery Preview'
            className='max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in'
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
          />
        </div>
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className='fixed top-24 right-4 md:right-8 z-50 animate-slide-up-fade'>
          <div
            className={`flex items-center gap-4 backdrop-blur-md border text-white p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.2)] min-w-[300px] ${
              isToastError
                ? 'bg-red-900/90 border-red-500/30 shadow-red-900/20'
                : 'bg-[#1a1d26]/90 border-green-500/30 shadow-green-500/10'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                isToastError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}
            >
              {toastMessage.includes('เครดิต') ? (
                <Zap size={24} fill='currentColor' />
              ) : (
                <CheckCircle size={24} />
              )}
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

      {/* Hero Section */}
      <div className='relative h-[60vh] min-h-[500px] w-full overflow-hidden'>
        <div className='absolute top-24 left-6 z-30'>
          <button
            onClick={onBack}
            className='flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-all hover:scale-105 border border-white/10 shadow-lg'
          >
            <ArrowLeft size={20} />
            <span>ย้อนกลับ</span>
          </button>
        </div>

        {/* Video/Image Background */}
        <div
          className='absolute inset-0 will-change-transform'
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <img
            src={story.coverImage}
            alt={story.title}
            className={`w-full h-full object-cover scale-110 ${story.comingSoon ? 'grayscale-[50%]' : ''}`}
          />

          {/* Gradients */}
          <div className='absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 pointer-events-none' />
          <div className='absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent' />
        </div>

        {/* Hero Content */}
        <div
          className='absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto z-20 will-change-transform'
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            opacity: 1 - Math.min(1, scrollY / 500),
          }}
        >
          <div className='flex flex-wrap gap-3 mb-4 animate-slide-up-fade'>
            <span className='px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium backdrop-blur-sm'>
              {story.genre}
            </span>
            {story.comingSoon ? (
              <span className='px-3 py-1 bg-gray-600/50 text-white border border-gray-500 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1'>
                <Calendar size={14} /> เร็วๆ นี้
              </span>
            ) : (
              story.isNew && (
                <span className='px-3 py-1 bg-secondary/20 text-secondary border border-secondary/30 rounded-full text-sm font-medium backdrop-blur-sm'>
                  มาใหม่
                </span>
              )
            )}
            <span className='px-3 py-1 bg-white/10 text-gray-300 border border-white/10 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1'>
              <Clock size={14} /> {story.duration}
            </span>
          </div>

          <h1 className='text-4xl md:text-6xl font-serif font-bold text-white mb-4 drop-shadow-2xl animate-slide-up-fade delay-100 leading-tight max-w-4xl'>
            {story.title}
          </h1>

          {!story.comingSoon && (
            <div className='flex items-center gap-6 text-gray-300 mb-8 animate-slide-up-fade delay-200'>
              <div className='flex items-center gap-2 text-accent'>
                <Star size={20} fill='currentColor' />
                <span className='text-xl font-bold'>{story.rating}</span>
                <span className='text-sm text-gray-500 font-normal'>/ 5.0</span>
              </div>

              <div className='w-1 h-1 bg-gray-500 rounded-full' />

              <div className='flex items-center gap-2 text-blue-300'>
                <Users size={20} />
                <span className='font-medium'>{story.totalPlayers.toLocaleString()} ผู้เล่น</span>
              </div>

              <div className='w-1 h-1 bg-gray-500 rounded-full' />

              <div className='flex items-center gap-2'>
                <GitBranch size={20} />
                <span>{story.totalEndings} ฉากจบ</span>
              </div>
            </div>
          )}

          <div className='flex flex-wrap gap-4 animate-slide-up-fade delay-300'>
            <button
              onClick={handlePlayClick}
              disabled={!!story.comingSoon}
              className={`px-8 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-3 text-lg ${
                story.comingSoon
                  ? 'bg-gray-600/50 cursor-not-allowed text-gray-300 border border-gray-500/30'
                  : 'bg-primary hover:bg-blue-600 hover:scale-105 text-white'
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
              onClick={() => (isAuthenticated ? setIsFavorite(!isFavorite) : onLoginRequired())}
              className={`px-6 py-4 rounded-full font-semibold border transition-all flex items-center gap-2 backdrop-blur-sm ${
                isFavorite
                  ? 'bg-pink-500/20 border-pink-500 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
              }`}
            >
              <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'เพิ่มแล้ว' : 'รายการโปรด'}
            </button>

            <button
              onClick={handleShare}
              className={`px-6 py-4 rounded-full font-semibold border transition-all flex items-center gap-2 backdrop-blur-sm ${
                isCopied
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
              }`}
            >
              {isCopied ? <Check size={20} /> : <Share2 size={20} />}
              {isCopied ? 'คัดลอกแล้ว' : 'แชร์'}
            </button>

            {!story.comingSoon && (
              <button
                onClick={() => (isAuthenticated ? setIsRatingModalOpen(true) : onLoginRequired())}
                className='px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-full font-semibold border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2 hover:bg-white/20 hover:scale-105'
              >
                <Star size={20} />
                ให้คะแนน
              </button>
            )}

            <button
              onClick={handleReportStoryClick}
              className='px-4 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full font-semibold border border-red-500/20 backdrop-blur-sm transition-all flex items-center gap-2 hover:scale-105'
              title='รายงานปัญหา'
            >
              <Flag size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className='max-w-7xl mx-auto relative z-10 bg-background/50 backdrop-blur-sm rounded-t-3xl -mt-6 overflow-hidden'>
        {/* Top Section Grid (Synopsis vs Endings) */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-12 p-6 md:p-12'>
          {/* Left Column: Details & Media */}
          <div className='lg:col-span-2 space-y-12'>
            {/* Synopsis */}
            <div className='space-y-4'>
              <h2 className='text-2xl font-serif font-bold text-white border-l-4 border-primary pl-4'>
                เรื่องย่อ
              </h2>
              <p className='text-gray-300 leading-relaxed text-lg'>{story.description}</p>
              <div className='flex flex-wrap gap-2 mt-4'>
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className='px-3 py-1 bg-surface rounded text-sm text-gray-400 border border-white/5'
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Steam-like Media Gallery */}
            <div className='space-y-4'>
              <h2 className='text-2xl font-serif font-bold text-white border-l-4 border-secondary pl-4 flex items-center gap-2'>
                ตัวอย่าง & แกลเลอรี
              </h2>

              <div className='flex flex-col gap-2'>
                {/* Main Stage */}
                <div className='aspect-video w-full bg-black rounded-xl overflow-hidden relative border border-white/10 shadow-2xl group'>
                  {mediaItems[activeMediaIndex]?.type === 'video' ? (
                    <iframe
                      width='100%'
                      height='100%'
                      src={
                        getYouTubeEmbedUrl(mediaItems[activeMediaIndex].src) ||
                        mediaItems[activeMediaIndex].src
                      }
                      title='Trailer'
                      frameBorder='0'
                      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      allowFullScreen
                      className='w-full h-full'
                    />
                  ) : (
                    <>
                      <img
                        src={mediaItems[activeMediaIndex]?.src}
                        className='w-full h-full object-contain bg-black/50'
                        alt='Main Preview'
                      />
                      <div className='absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          onClick={() => setLightboxImage(mediaItems[activeMediaIndex].src)}
                          className='pointer-events-auto bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 flex items-center gap-2 transition-transform hover:scale-105'
                        >
                          <ZoomIn size={18} /> ดูขนาดเต็ม
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Strip */}
                <div className='flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x'>
                  {mediaItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative min-w-[120px] h-[68px] cursor-pointer rounded-md overflow-hidden border-2 transition-all snap-start ${
                        activeMediaIndex === idx
                          ? 'border-primary shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-105 z-10'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={item.thumbnail}
                        alt={`Thumb ${idx}`}
                        className='w-full h-full object-cover'
                      />
                      {item.type === 'video' && (
                        <div className='absolute inset-0 flex items-center justify-center bg-black/30'>
                          <PlayCircle size={20} className='text-white drop-shadow-md' />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cast & Crew (Mock) */}
            <div className='grid grid-cols-2 gap-8 pt-8 border-t border-white/5'>
              <div>
                <h3 className='text-gray-500 text-sm uppercase tracking-wider mb-2'>กำกับโดย</h3>
                <p className='text-white font-medium'>Christopher Nolan (AI)</p>
              </div>
              <div>
                <h3 className='text-gray-500 text-sm uppercase tracking-wider mb-2'>เขียนบทโดย</h3>
                <p className='text-white font-medium'>Gemini 1.5 Pro</p>
              </div>
            </div>
          </div>

          {/* Right Column: Progress & Unlockables */}
          <div className='space-y-8'>
            {/* Login Prompt if guest */}
            {!isAuthenticated && (
              <div className='p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30'>
                <div className='flex items-start gap-4'>
                  <AlertCircle className='text-primary shrink-0' size={24} />
                  <div>
                    <h3 className='text-white font-bold mb-1'>เข้าสู่ระบบเพื่อบันทึก</h3>
                    <p className='text-gray-400 text-sm mb-4'>
                      เข้าสู่ระบบเพื่อติดตามความคืบหน้า ปลดล็อกความสำเร็จ และบันทึกฉากจบของคุณ
                    </p>
                    <button
                      onClick={onLoginRequired}
                      className='text-sm font-bold text-primary hover:text-white transition-colors'
                    >
                      เข้าสู่ระบบทันที &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Endings List */}
            <div className='bg-surface/50 rounded-xl p-6 border border-white/5'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-white flex items-center gap-2'>
                  <GitBranch className='text-secondary' size={20} />
                  ฉากจบ
                </h2>
                <span className='text-xs text-gray-500'>
                  {story.comingSoon
                    ? '-'
                    : `${extras.endings.filter((e) => e.unlocked).length}/${extras.endings.length}`}
                </span>
              </div>
              {story.comingSoon ? (
                <div className='text-center py-8 text-gray-500 text-sm'>
                  ข้อมูลฉากจบจะปรากฏเมื่อเกมเปิดให้เล่น
                </div>
              ) : (
                <div className='space-y-3'>
                  {extras.endings.map((ending) => (
                    <div
                      key={ending.id}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        ending.unlocked
                          ? 'bg-white/5 border-white/10'
                          : 'bg-black/20 border-white/5 opacity-50'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        {ending.unlocked ? (
                          <div className='w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_var(--color-secondary)]' />
                        ) : (
                          <Lock size={12} className='text-gray-600' />
                        )}
                        <span
                          className={`text-sm ${ending.unlocked ? 'text-white font-medium' : 'text-gray-500'}`}
                        >
                          {ending.unlocked ? ending.title : '??? ถูกล็อก'}
                        </span>
                      </div>
                      {ending.unlocked && (
                        <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/40 text-gray-400'>
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

        {/* Bottom Section: Community Reviews (Moved out of grid to be at bottom on mobile) */}
        {!story.comingSoon && (
          <div className='px-6 pb-12 md:px-12'>
            <div className='pt-8 border-t border-white/5'>
              <h2 className='text-2xl font-serif font-bold text-white border-l-4 border-accent pl-4 mb-6 flex items-center gap-3'>
                ความคิดเห็นจากชุมชน
                <span className='text-sm font-sans font-normal text-gray-400 bg-white/5 px-2 py-1 rounded-md'>
                  {MOCK_REVIEWS.length} รีวิว
                </span>
              </h2>

              {/* Reviews Content */}
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-12'>
                <div className='lg:col-span-2 space-y-4'>
                  {reviewsToDisplay.map((review) => (
                    <div
                      key={review.id}
                      className='bg-surface/30 border border-white/5 rounded-xl p-6 hover:bg-surface/50 transition-colors group relative'
                    >
                      <div className='flex justify-between items-start mb-3'>
                        <div className='flex items-center gap-3'>
                          <div className='w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-gray-300'>
                            {review.user.charAt(0)}
                          </div>
                          <div>
                            <div className='font-bold text-white text-sm'>{review.user}</div>
                            <div className='text-xs text-gray-500'>{review.date}</div>
                          </div>
                        </div>
                        <div className='flex items-center gap-3'>
                          <div className='flex gap-1 text-accent'>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < review.rating ? 'currentColor' : 'none'}
                                className={i >= review.rating ? 'text-gray-600' : ''}
                              />
                            ))}
                          </div>
                          {/* Report Review Button */}
                          <button
                            onClick={() => handleReportReviewClick(review)}
                            className='p-1.5 rounded-full text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100'
                            title='รายงานความคิดเห็น'
                          >
                            <Flag size={14} />
                          </button>
                        </div>
                      </div>
                      <p className='text-gray-300 text-sm leading-relaxed'>"{review.comment}"</p>

                      {/* Admin Reply */}
                      {review.adminReply && (
                        <div className='mt-4 ml-4 p-4 bg-primary/10 rounded-lg border-l-2 border-primary flex gap-3'>
                          <CornerDownRight className='text-primary/60 shrink-0 mt-1' size={16} />
                          <div>
                            <div className='flex items-center gap-2 mb-1'>
                              <span className='text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1'>
                                <BadgeCheck
                                  size={14}
                                  fill='currentColor'
                                  className='text-primary'
                                />
                                <span className='text-white'>ทีมงาน Chronos</span>
                              </span>
                              <span className='text-[10px] text-gray-500'>
                                • {review.adminReply.date}
                              </span>
                            </div>
                            <p className='text-sm text-gray-300 italic'>
                              "{review.adminReply.text}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* View All Reviews Toggle */}
                  {hasMoreReviews && (
                    <div className='text-center pt-2'>
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className='text-sm text-primary hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto'
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
                    onClick={() =>
                      isAuthenticated ? setIsRatingModalOpen(true) : onLoginRequired()
                    }
                    className='w-full py-3 mt-4 text-sm font-medium text-gray-400 hover:text-white border border-dashed border-gray-700 hover:border-gray-500 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-2'
                  >
                    <MessageSquare size={16} />
                    เขียนรีวิวของคุณเอง
                  </button>
                </div>
                {/* Empty column to match the grid above visually on desktop if needed, or just let review take 2/3 width */}
                <div className='hidden lg:block'></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Stories Section */}
      {relatedStories.length > 0 && (
        <div className='max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12'>
          <h2 className='text-3xl font-serif font-bold text-white mb-8'>เรื่องที่คุณอาจสนใจ</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {relatedStories.map((relatedStory) => (
              <StoryCard
                key={relatedStory.id}
                story={relatedStory}
                onClick={() => onSelectStory(relatedStory)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
