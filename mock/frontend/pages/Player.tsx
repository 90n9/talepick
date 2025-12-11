import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  RotateCcw,
  Share2,
  GitBranch,
  Trophy,
  Check,
  Star,
  CheckCircle,
  Loader,
  Zap,
  AlertTriangle,
  User as UserIcon,
  History,
  X,
  TrendingUp,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Story, StoryNode, GameState } from '../types';
import { RatingModal } from '../components/RatingModal';
import { StoryCard } from '../components/StoryCard';
import {
  MOCK_STORIES,
  REFILL_INTERVAL_MS,
  SYSTEM_AVATARS,
  SYSTEM_ACHIEVEMENTS,
} from '../constants';
import { useAuth } from '../App';

interface PlayerProps {
  story: Story;
  onExit: () => void;
  onComplete: (endingId: string) => void;
  onSelectStory: (story: Story) => void;
}

// Mock Story DAG (Directed Acyclic Graph)
const MOCK_NODES: Record<string, StoryNode> = {
  start: {
    id: 'start',
    bgMusic: 'https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg',
    segments: [
      {
        text: 'คุณตื่นขึ้นมาในห้องที่หนาวเหน็บ อากาศอบอวลไปด้วยกลิ่นโอโซนและสนิม',
        duration: 4000,
        image: 'https://picsum.photos/seed/cyberpunk_room/1920/1080',
      },
      {
        text: 'เสียงเครื่องจักรทำงานหนักดังมาจากที่ไกลๆ ไฟฉุกเฉินสีแดงกระพริบเป็นจังหวะเหมือนชีพจรที่กำลังจะหยุดเต้น',
        duration: 4000,
        image: 'https://picsum.photos/seed/red_light_alarm/1920/1080',
      },
    ],
    choices: [
      { id: 'c1', text: 'ค้นหาในห้อง', nextNodeId: 'search' },
      { id: 'c2', text: 'ลองเปิดประตู', nextNodeId: 'door' },
    ],
  },
  search: {
    id: 'search',
    bgMusic: 'https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg', // Same music
    segments: [
      {
        text: 'คุณพบคีย์การ์ดใต้ฟูกที่นอน มันเรืองแสงสีฟ้าจางๆ',
        image: 'https://picsum.photos/seed/keycard_bed/1920/1080',
      },
    ],
    choices: [{ id: 'c3', text: 'เก็บคีย์การ์ด', nextNodeId: 'corridor_key' }],
  },
  door: {
    id: 'door',
    bgMusic: 'https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg', // Change music (Suspense)
    segments: [
      {
        text: 'ประตูล็อคแน่นหนา สัญญาณเตือนภัยเริ่มดังขึ้น',
        image: 'https://picsum.photos/seed/locked_door/1920/1080',
      },
    ],
    choices: [
      { id: 'c4', text: 'พยายามพังประตู', nextNodeId: 'game_over_captured' },
      { id: 'c5', text: 'ซ่อนใต้เตียง', nextNodeId: 'search' },
    ],
  },
  corridor_key: {
    id: 'corridor_key',
    bgMusic: 'https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg',
    segments: [
      {
        text: 'คีย์การ์ดเปิดประตูออกได้ ทางเดินยาวทอดตัวอยู่เบื้องหน้า',
        image: 'https://picsum.photos/seed/sci_fi_corridor/1920/1080',
      },
      {
        text: 'ทันใดนั้น หุ่นยนต์รักษาความปลอดภัยเลี้ยวหัวมุมมาเจอคุณพอดี',
        image: 'https://picsum.photos/seed/robot_security/1920/1080',
      },
    ],
    choices: [
      { id: 'c6', text: 'ย่องผ่านไป', nextNodeId: 'escape' },
      { id: 'c7', text: 'โจมตีหุ่นยนต์', nextNodeId: 'fight' },
    ],
  },
  fight: {
    id: 'fight',
    bgMusic: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg', // Action music
    segments: [
      {
        text: 'คุณพยายามพุ่งเข้าไปโจมตี แต่ไร้อาวุธ...',
        image: 'https://picsum.photos/seed/fighting_pov/1920/1080',
      },
      {
        text: 'หุ่นยนต์ยิงกระสุนช็อตไฟฟ้าใส่คุณ คุณล้มลงและสติค่อยๆ ดับวูบ',
        image: 'https://picsum.photos/seed/electric_shock/1920/1080',
      },
    ],
    choices: [{ id: 'end1', text: 'เริ่มใหม่', nextNodeId: 'start' }],
  },
  game_over_captured: {
    id: 'game_over_captured',
    bgMusic: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
    segments: [
      {
        text: 'หน่วยรักษาความปลอดภัยบุกเข้ามาในห้อง คุณถูกจับกุม',
        image: 'https://picsum.photos/seed/captured_prison/1920/1080',
      },
    ],
    choices: [{ id: 'end2', text: 'ลองอีกครั้ง', nextNodeId: 'start' }],
  },
  escape: {
    id: 'escape',
    bgMusic: 'https://actions.google.com/sounds/v1/water/stream_flowing.ogg', // Win music
    segments: [
      {
        text: 'คุณอาศัยจังหวะเงามืดหลบเลี่ยงเซ็นเซอร์',
        image: 'https://picsum.photos/seed/shadows_hide/1920/1080',
      },
      {
        text: 'แสงสว่างที่ปลายอุโมงค์... คุณหนีรอดออกมาจากศูนย์วิจัยได้สำเร็จ',
        image: 'https://picsum.photos/seed/bright_exit/1920/1080',
      },
    ],
    choices: [], // Empty choices means END
  },
};

interface HistoryItem {
  type: 'narrative' | 'choice';
  text: string;
  nodeId?: string;
}

export const Player: React.FC<PlayerProps> = ({ story, onExit, onComplete, onSelectStory }) => {
  const { user, deductCredit, addRatingBonus } = useAuth();

  // Navigation & State
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [isLoadingNode, setIsLoadingNode] = useState(false);
  const [isSegmentTransitioning, setIsSegmentTransitioning] = useState(false);

  // Selection Animation State
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // History State
  const [historyLog, setHistoryLog] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Progress & Visuals
  const [progress, setProgress] = useState(0);
  const [sceneVisible, setSceneVisible] = useState(false); // For initial fade-in effect on node load
  const [endScenePhase, setEndScenePhase] = useState<'initial' | 'content'>('initial'); // For end game animation

  // Audio State
  const [muted, setMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);

  // Sharing & Rating & Credits
  const [isCopied, setIsCopied] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [endScreenScrollY, setEndScreenScrollY] = useState(0);
  const [showCreditAlert, setShowCreditAlert] = useState(false);
  const [nextRefill, setNextRefill] = useState<string>('');

  const currentNode = MOCK_NODES[currentNodeId];
  const currentSegment = currentNode.segments[currentSegmentIndex];

  const relatedStories = MOCK_STORIES.filter((s) => s.id !== story.id).slice(0, 3);

  // Unlocked Rewards Calculation
  const unlockedAvatars = SYSTEM_AVATARS.filter(
    (avatar) => avatar.type === 'unlock' && avatar.requiredStoryId === story.id
  );

  // Simulate achievements unlocked for this run (In a real app, this comes from backend response)
  const unlockedAchievements = SYSTEM_ACHIEVEMENTS.filter(
    (a) => a.id === 'first_step' || a.id === 'completionist' // Demo: Show these 2 as potential unlocks
  );

  // --- Audio Initialization ---
  useEffect(() => {
    // BGM
    bgmRef.current = new Audio();
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.4;
    bgmRef.current.onerror = () => {
      console.warn('Audio failed to load:', bgmRef.current?.src);
    };

    // SFX (Click Sound)
    sfxRef.current = new Audio('https://actions.google.com/sounds/v1/ui/click_on.ogg');
    sfxRef.current.volume = 0.6;

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.src = '';
      }
    };
  }, []);

  // --- Music Logic ---
  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;

    if (muted) {
      audio.pause();
    } else {
      // Play only if we are playing or in choice mode
      if (gameState === GameState.PLAYING || gameState === GameState.CHOICE) {
        const desiredSrc = currentNode.bgMusic || '';
        const currentSrc = audio.src;

        if (desiredSrc && currentSrc !== desiredSrc) {
          audio.src = desiredSrc;
          audio.play().catch((e) => console.log('Audio autoplay prevented', e));
        } else if (desiredSrc && audio.paused) {
          audio.play().catch((e) => console.log('Audio autoplay prevented', e));
        } else if (!desiredSrc) {
          audio.pause();
        }
      } else if (gameState === GameState.ENDED) {
        audio.pause();
      }
    }
  }, [currentNodeId, muted, gameState, currentNode.bgMusic]);

  // --- Asset Preloading ---
  const preloadAssets = async (node: StoryNode) => {
    const promises: Promise<void>[] = [];
    node.segments.forEach((segment) => {
      const src = segment.image || story.coverImage;
      if (src) {
        promises.push(
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          })
        );
      }
    });
    // Add a small delay to ensure smooth transition
    const minDelay = new Promise((resolve) => setTimeout(resolve, 800));
    await Promise.all([...promises, minDelay]);
  };

  // --- Fade-in Effect on Node Start ---
  useEffect(() => {
    if (gameState === GameState.PLAYING && !isLoadingNode) {
      setSceneVisible(false); // Start black
      const timer = setTimeout(() => {
        setSceneVisible(true); // Fade in
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentNodeId, gameState, isLoadingNode]);

  // --- Playback Timer ---
  useEffect(() => {
    if (gameState === GameState.PLAYING && !isLoadingNode && !isSegmentTransitioning) {
      setProgress(0);
      const segmentDuration = currentSegment.duration || 5000;
      const interval = 50;
      const step = 100 / (segmentDuration / interval);

      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            handleSegmentComplete();
            return 100;
          }
          return prev + step;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [currentNodeId, currentSegmentIndex, gameState, isLoadingNode, isSegmentTransitioning]);

  // --- End Game Animation Sequence ---
  useEffect(() => {
    if (gameState === GameState.ENDED) {
      // Phase 1: Show full colorful image (default state 'initial')
      setEndScenePhase('initial');

      // Phase 2: Fade to dark overlay and content after delay
      const timer = setTimeout(() => {
        setEndScenePhase('content');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // --- Countdown Logic ---
  useEffect(() => {
    if (!user || user.credits >= user.maxCredits) {
      setNextRefill('');
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLast = user.lastRefillTime ? now - user.lastRefillTime : 0;
      const timeRemaining = Math.max(0, REFILL_INTERVAL_MS - timeSinceLast);

      if (timeRemaining > 0) {
        const m = Math.floor(timeRemaining / 60000);
        const s = Math.floor((timeRemaining % 60000) / 1000);
        setNextRefill(`${m}:${s.toString().padStart(2, '0')}`);
      } else {
        setNextRefill(''); // ready to refill
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.credits, user?.lastRefillTime, user?.maxCredits]);

  // --- Scroll to Bottom History ---
  useEffect(() => {
    if (isHistoryOpen) {
      setTimeout(() => {
        historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isHistoryOpen, historyLog, currentNodeId]);

  // --- Logic ---

  // Check for auto-end
  useEffect(() => {
    if (gameState === GameState.CHOICE && currentNode.choices.length === 0) {
      setGameState(GameState.ENDED);
      onComplete(currentNodeId);
    }
  }, [gameState, currentNode, currentNodeId, onComplete]);

  const handleSegmentComplete = () => {
    // Fade out
    setIsSegmentTransitioning(true);

    // Wait for fade out animation
    setTimeout(() => {
      if (currentSegmentIndex < currentNode.segments.length - 1) {
        setCurrentSegmentIndex((prev) => prev + 1);
        // Fade in
        setTimeout(() => setIsSegmentTransitioning(false), 50);
      } else {
        setGameState(GameState.CHOICE);
        // Even in choice, we stop transitioning so the last image stays
        setIsSegmentTransitioning(false);
      }
    }, 500);
  };

  const handleChoice = async (nextNodeId: string, choiceId: string) => {
    // Play SFX (Click Sound)
    if (!muted && sfxRef.current) {
      sfxRef.current.currentTime = 0;
      sfxRef.current.play().catch((e) => console.warn('SFX play failed', e));
    }

    // 0. Visual Selection Feedback
    setSelectedChoiceId(choiceId);

    // Wait for animation to play (Selection highlight)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Start Transition: Fade to black using the Loading Overlay
    setIsLoadingNode(true);

    // Wait for fade to complete (duration-700)
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Attempt to deduct credit
    const success = deductCredit();
    if (!success) {
      setShowCreditAlert(true);
      setIsLoadingNode(false); // Revert black screen
      setSelectedChoiceId(null);
      setTimeout(() => setShowCreditAlert(false), 4000);
      return;
    }

    // 1. Record History
    const nodeText = currentNode.segments.map((s) => s.text).join(' ');
    const choiceText = currentNode.choices.find((c) => c.nextNodeId === nextNodeId)?.text || '';

    setHistoryLog((prev) => [
      ...prev,
      { type: 'narrative', text: nodeText, nodeId: currentNodeId },
      { type: 'choice', text: choiceText },
    ]);

    // Update State while screen is black
    setGameState(GameState.PLAYING);
    setSceneVisible(false);
    setSelectedChoiceId(null); // Reset selection

    const nextNode = MOCK_NODES[nextNodeId];
    if (nextNode) {
      await preloadAssets(nextNode);
    }

    // Check if this is a "Restart" choice (looping back to start)
    if (nextNodeId === 'start') {
      setHistoryLog([]); // Clear history on restart
    }

    setCurrentNodeId(nextNodeId);
    setCurrentSegmentIndex(0);

    // Fade out black screen (Reveal new scene)
    setIsLoadingNode(false);
  };

  const handleReplay = () => {
    // This is "Replay Scene" or "Play Again" depending on context
    // If it's replay scene, we just reset the current node state
    setGameState(GameState.PLAYING);
    setCurrentSegmentIndex(0);
    setProgress(0);

    // If we are coming from ENDED state, we should probably reset to start?
    // Based on previous logic, End Game "Play Again" button called this.
    // If we want a full restart from End Game:
    if (gameState === GameState.ENDED) {
      setCurrentNodeId('start');
      setHistoryLog([]);
    }
  };

  const handleSkip = () => {
    if (gameState === GameState.PLAYING && !isLoadingNode && !isSegmentTransitioning) {
      handleSegmentComplete();
    }
  };

  const handleShare = async () => {
    let shareUrl = window.location.href;
    if (!shareUrl.startsWith('http')) {
      shareUrl = `https://chronos.app/story/${story.id}`;
    }
    const lastSegmentText = currentNode.segments[currentNode.segments.length - 1].text;
    const shareData = {
      title: `Chronos - ${story.title}`,
      text: `ฉันได้ค้นพบฉากจบของเรื่อง "${story.title}" บน Chronos: "${lastSegmentText.substring(0, 50)}..." คุณจะเลือกเส้นทางไหน?`,
      url: shareUrl,
    };

    let shared = false;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (err) {
        console.warn('Web Share API failed or cancelled', err);
      }
    }
    if (!shared) {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('ไม่สามารถคัดลอกลิงก์ได้ กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  const handleRatingSubmit = (rating: number, comment: string) => {
    setIsRatingModalOpen(false);
    // Submit bonus logic
    const bonusGiven = addRatingBonus(story.id);

    if (bonusGiven) {
      // Custom toast for credit bonus logic is handled in render
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleEndScreenScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setEndScreenScrollY(e.currentTarget.scrollTop);
  };

  const showContent = endScenePhase === 'content';

  return (
    <div className='fixed inset-0 bg-black z-[100] flex flex-col font-sans text-white'>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        storyTitle={story.title}
      />

      {/* Success Toast */}
      {showToast && (
        <div className='fixed top-24 right-4 md:right-8 z-[110] animate-slide-up-fade'>
          <div className='flex items-center gap-4 bg-[#1a1d26]/90 backdrop-blur-md border border-green-500/30 text-white p-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.2)] min-w-[300px]'>
            <div className='w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0'>
              <Zap size={24} fill='currentColor' />
            </div>
            <div>
              <h4 className='font-bold text-green-400'>บันทึกรีวิวสำเร็จ!</h4>
              <p className='text-xs text-gray-400'>คุณได้รับ +5 เครดิต (ถ้ายังไม่เคยได้รับ)</p>
            </div>
          </div>
        </div>
      )}

      {/* Credit Alert Toast */}
      {showCreditAlert && (
        <div className='fixed top-24 left-1/2 -translate-x-1/2 z-[110] animate-slide-up-fade'>
          <div className='flex items-center gap-4 bg-red-900/90 backdrop-blur-md border border-red-500/50 text-white p-4 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.4)] min-w-[300px]'>
            <div className='w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0'>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className='font-bold text-red-400'>เครดิตไม่เพียงพอ!</h4>
              <p className='text-xs text-gray-400'>กรุณารอรีฟิล หรือเขียนรีวิวเพื่อรับโบนัส</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className='absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none'>
        <button
          onClick={onExit}
          className='pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-105 border border-white/10'
        >
          <ArrowLeft size={24} />
        </button>

        <div className='flex gap-4 pointer-events-auto'>
          {/* Credit Badge (HUD) */}
          <div className='flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-md'>
            <Zap
              size={18}
              className={`${user && user.credits > 0 ? 'text-accent' : 'text-red-500'} ${user && user.credits < user?.maxCredits ? 'animate-pulse' : ''}`}
              fill='currentColor'
            />
            <span
              className={`text-base font-bold font-mono ${user && user.credits === 0 ? 'text-red-500' : 'text-white'}`}
            >
              {user?.credits}
            </span>
            {nextRefill && (
              <span className='text-xs text-gray-400 font-mono ml-2 border-l border-white/20 pl-2'>
                {nextRefill}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className='bg-black/40 hover:bg-black/60 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-105 border border-white/10'
            title='ประวัติการเล่น'
          >
            <History size={24} />
          </button>

          <button
            onClick={() => setMuted(!muted)}
            className='bg-black/40 hover:bg-black/60 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-105 border border-white/10'
          >
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          {gameState === GameState.PLAYING && (
            <button
              onClick={handleSkip}
              className='bg-black/40 hover:bg-black/60 backdrop-blur-md p-3 rounded-full text-white transition-all hover:scale-105 border border-white/10'
              title='ข้ามฉาก'
            >
              <SkipForward size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      {gameState !== GameState.ENDED && (
        <div className='relative w-full h-full flex flex-col'>
          {/* Loading Overlay - Persistent for smooth fade in/out */}
          <div
            className={`absolute inset-0 z-[60] bg-black flex items-center justify-center transition-opacity duration-700 ease-in-out ${isLoadingNode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
            <Loader className='text-primary animate-spin' size={48} />
          </div>

          {/* Background Image Layer */}
          <div className='absolute inset-0 z-0 bg-black'>
            {/* Previous/Transitioning Image */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${isSegmentTransitioning ? 'opacity-0' : 'opacity-100'} ${sceneVisible ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={currentSegment.image || story.coverImage}
                alt='Scene'
                className='w-full h-full object-cover'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40' />
            </div>
          </div>

          {/* Content Area */}
          <div className='flex-grow relative z-10 flex flex-col justify-end pb-12 px-6 md:px-20 max-w-7xl mx-auto w-full'>
            {/* Dialogue / Narrative Box - Only show when PLAYING */}
            {gameState === GameState.PLAYING && (
              <div
                className={`transition-all duration-700 transform ${sceneVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              >
                <div className='bg-black/60 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl mb-8'>
                  <p className='text-lg md:text-2xl leading-relaxed text-gray-100 font-serif drop-shadow-md'>
                    {currentSegment.text}
                  </p>
                </div>
              </div>
            )}

            {/* Choices Overlay */}
            {gameState === GameState.CHOICE && (
              <div className='animate-slide-up-fade w-full max-w-2xl mx-auto px-4'>
                <div className='mb-8 text-center'>
                  <span className='inline-block px-6 py-2 bg-black/50 backdrop-blur-md rounded-full text-sm font-bold uppercase tracking-[0.2em] text-white border border-white/10 shadow-lg'>
                    Choose Your Path
                  </span>
                </div>

                <div
                  className={`flex flex-col gap-4 max-w-xl mx-auto ${selectedChoiceId ? 'pointer-events-none' : ''}`}
                >
                  {currentNode.choices.map((choice, index) => {
                    // Check achievement requirement
                    const isLocked =
                      choice.requiredAchievement &&
                      user &&
                      !user.achievements.includes(choice.requiredAchievement);
                    const isSelected = selectedChoiceId === choice.id;
                    const isNotSelected = selectedChoiceId && selectedChoiceId !== choice.id;

                    return (
                      <button
                        key={choice.id}
                        onClick={() => !isLocked && handleChoice(choice.nextNodeId, choice.id)}
                        disabled={!!isLocked}
                        className={`group relative p-6 md:p-8 rounded-2xl border transition-all duration-500 text-left 
                                        animate-slide-up-fade fill-mode-forwards opacity-0
                                        ${
                                          isLocked
                                            ? 'bg-gray-800/80 border-gray-700 opacity-70 cursor-not-allowed'
                                            : isSelected
                                              ? 'bg-black/90 border-primary scale-110 shadow-[0_0_50px_rgba(59,130,246,0.6)] z-10'
                                              : isNotSelected
                                                ? 'bg-black/70 border-white/10 opacity-0 blur-sm scale-95'
                                                : 'bg-black/80 hover:bg-black/90 border-white/20 hover:border-primary backdrop-blur-md hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                        }
                                    `}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {isLocked && (
                          <div className='absolute top-2 right-2 text-red-400'>
                            <ShieldCheck size={16} />
                          </div>
                        )}
                        <h3
                          className={`text-xl md:text-2xl font-bold mb-2 leading-relaxed transition-colors ${
                            isLocked ? 'text-gray-500' : 'text-white'
                          }`}
                        >
                          {choice.text}
                        </h3>
                        {isLocked && (
                          <p className='text-xs text-red-400 mt-2 flex items-center gap-1'>
                            <ShieldCheck size={12} /> ต้องปลดล็อกความสำเร็จ:{' '}
                            {choice.requiredAchievement}
                          </p>
                        )}
                        {!isLocked && !selectedChoiceId && (
                          <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                        )}
                      </button>
                    );
                  })}

                  {/* Replay Scene Button */}
                  <button
                    onClick={handleReplay}
                    className={`group relative px-6 py-2 rounded-full border border-white/10 bg-black/40 hover:bg-white/10 backdrop-blur-md transition-all text-center flex items-center justify-center gap-2 hover:scale-105 mx-auto mt-4 w-auto animate-slide-up-fade opacity-0 fill-mode-forwards ${selectedChoiceId ? 'opacity-0 duration-300' : ''}`}
                    style={{ animationDelay: `${currentNode.choices.length * 100 + 100}ms` }}
                  >
                    <RotateCcw
                      size={14}
                      className='text-gray-400 group-hover:text-white transition-colors'
                    />
                    <span className='text-xs font-bold text-gray-400 group-hover:text-white uppercase tracking-wider'>
                      เล่นฉากนี้ซ้ำ
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {gameState === GameState.PLAYING && (
              <div className='h-1 bg-white/10 rounded-full overflow-hidden mt-4'>
                <div
                  className='h-full bg-primary transition-all duration-100 ease-linear shadow-[0_0_10px_var(--color-primary)]'
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Log Overlay */}
      {isHistoryOpen && (
        <div className='absolute inset-0 z-[60] bg-black/90 backdrop-blur-md flex justify-end animate-fade-in'>
          <div className='w-full md:w-[500px] h-full bg-[#1a1d26] border-l border-white/10 shadow-2xl flex flex-col animate-slide-up-fade'>
            <div className='p-6 border-b border-white/5 flex justify-between items-center bg-black/20'>
              <h2 className='text-xl font-serif font-bold text-white flex items-center gap-2'>
                <History size={20} className='text-gray-400' />
                บันทึกการเดินทาง
              </h2>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className='p-2 hover:bg-white/10 rounded-full transition-colors'
              >
                <X size={20} className='text-gray-400 hover:text-white' />
              </button>
            </div>
            <div className='flex-grow overflow-y-auto p-6 custom-scrollbar'>
              {historyLog.length === 0 && (
                <div className='text-center text-gray-500 mt-10'>ยังไม่มีบันทึกการเดินทาง</div>
              )}
              <div className='space-y-6'>
                {historyLog.map((item, index) => (
                  <div
                    key={index}
                    className={`relative pl-4 border-l-2 ${item.type === 'narrative' ? 'border-gray-700' : 'border-secondary'}`}
                  >
                    {item.type === 'choice' && (
                      <div className='absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary border-4 border-[#1a1d26]' />
                    )}
                    <span className='text-xs font-bold uppercase tracking-wider mb-1 block text-gray-500'>
                      {item.type === 'narrative' ? 'เรื่องราว' : 'การตัดสินใจ'}
                    </span>
                    <p
                      className={`text-sm leading-relaxed ${item.type === 'choice' ? 'text-secondary font-bold' : 'text-gray-300'}`}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}

                {/* Current Scene (Active) */}
                <div
                  ref={historyEndRef}
                  className='border-l-2 border-primary pl-4 py-2 relative bg-primary/5 rounded-r-lg'
                >
                  <div className='absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-[#1a1d26] shadow-[0_0_10px_var(--color-primary)]' />
                  <span className='text-xs text-primary font-bold uppercase tracking-wider mb-2 block'>
                    {gameState === GameState.ENDED ? 'บทสรุป' : 'ฉากปัจจุบัน'}
                  </span>
                  <p className='text-white leading-relaxed text-base font-medium'>
                    {currentNode.segments.map((s) => s.text).join(' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Click outside to close */}
          <div className='flex-grow' onClick={() => setIsHistoryOpen(false)} />
        </div>
      )}

      {/* End Game Screen */}
      {gameState === GameState.ENDED && (
        <div className='absolute inset-0 z-20 overflow-hidden flex flex-col'>
          {/* Parallax Background */}
          <div
            className='absolute inset-0 z-0 will-change-transform'
            style={{
              // Reduced factor to 0.05 to prevent black bars, clamped to positive values
              transform: `translateY(-${Math.max(0, endScreenScrollY) * 0.05}px)`,
            }}
          >
            {/* Increased scale to 125 to provide buffer for parallax movement */}
            <div
              className={`absolute inset-0 transition-all duration-1000 scale-125 ${endScenePhase === 'initial' ? 'grayscale-0' : 'grayscale'}`}
            >
              <img
                src={story.coverImage}
                alt='Ending'
                className='w-full h-full object-cover opacity-60'
              />
            </div>
          </div>

          {/* Gradient Overlays - Fixed position outside parallax */}
          <div
            className={`absolute inset-0 z-0 pointer-events-none bg-gradient-to-t from-[#0F1117] via-[#0F1117]/80 to-transparent transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Scrollable Content */}
          <div
            className={`relative z-10 flex-grow overflow-y-auto custom-scrollbar pt-32 pb-20 px-4 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}
            onScroll={handleEndScreenScroll}
          >
            <div className='max-w-4xl mx-auto'>
              <div
                className={`text-center mb-8 transition-all duration-700 ease-out delay-100 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className='inline-block px-4 py-1 border border-white/20 rounded-full bg-white/5 backdrop-blur-md text-sm tracking-[0.3em] uppercase mb-4'>
                  The End
                </div>
                {/* Reduced title size from 5xl to 4xl for better focus */}
                <h1 className='text-2xl md:text-4xl font-serif font-bold text-white mb-2 drop-shadow-2xl'>
                  {story.title}
                </h1>
              </div>

              {/* Summary Card containing the Narrative */}
              <div
                className={`bg-surface/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden transition-all duration-700 ease-out delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                {/* Background decoration */}
                <div className='absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />

                <div className='relative z-10 text-center'>
                  {/* Narrative is Priority #1 */}
                  <p className='text-xl md:text-3xl text-white font-serif leading-relaxed italic mb-8 drop-shadow-md'>
                    "{currentNode.segments.map((s) => s.text).join(' ')}"
                  </p>

                  <div className='w-16 h-1 bg-white/10 mx-auto mb-8 rounded-full' />

                  <div className='flex flex-col items-center gap-2'>
                    <GitBranch className='text-secondary opacity-80' size={24} />
                    <h2 className='text-lg font-bold text-gray-200'>บันทึกการเดินทางของคุณ</h2>
                    <p className='text-sm text-gray-400 leading-relaxed max-w-lg mx-auto'>
                      คุณได้เลือกเส้นทางที่นำไปสู่จุดจบอันน่าจดจำ
                      ทุกการตัดสินใจของคุณสะท้อนถึงตัวตนของผู้กล้า
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple Stats Badges */}
              <div
                className={`flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-12 transition-all duration-700 ease-out delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <div className='flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/10 backdrop-blur-sm shadow-sm'>
                  <CheckCircle size={16} className='text-green-500' />
                  <span>ปลดล็อกฉากจบ 1/{story.totalEndings}</span>
                </div>
              </div>

              {/* REWARDS SECTION (Expanded) */}
              {(unlockedAchievements.length > 0 || unlockedAvatars.length > 0) && (
                <div
                  className={`mb-16 transition-all duration-700 ease-out delay-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                  <div className='flex items-center justify-center gap-2 mb-6'>
                    <Sparkles className='text-accent' size={24} />
                    <h3 className='text-2xl font-bold text-white'>รางวัลที่ได้รับ</h3>
                    <Sparkles className='text-accent' size={24} />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Achievement Cards */}
                    {unlockedAchievements.map((ach) => (
                      <div
                        key={ach.id}
                        className='bg-gradient-to-br from-[#1a1d26] to-black border border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-lg hover:border-accent/50 transition-colors group'
                      >
                        <div className='w-16 h-16 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center text-3xl shadow-inner shrink-0 group-hover:scale-105 transition-transform'>
                          {ach.icon}
                        </div>
                        <div className='flex-grow'>
                          <div className='text-xs font-bold text-accent uppercase tracking-widest mb-1'>
                            ปลดล็อกความสำเร็จ
                          </div>
                          <h4 className='text-white font-bold text-lg mb-1'>{ach.title}</h4>

                          {/* Reward Badge */}
                          {/* @ts-ignore */}
                          {ach.creditBonus > 0 && (
                            <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-xs font-bold mt-1'>
                              <TrendingUp size={12} />
                              <span>+{ach.creditBonus} Max Credit Limit</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Avatar Cards */}
                    {unlockedAvatars.map((av) => (
                      <div
                        key={av.id}
                        className='bg-gradient-to-br from-[#1a1d26] to-black border border-secondary/30 p-5 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(168,85,247,0.15)] group relative overflow-hidden'
                      >
                        {/* Glow Effect */}
                        <div className='absolute -right-10 -top-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-colors' />

                        <div className='w-16 h-16 rounded-full border-2 border-secondary p-0.5 shrink-0 relative z-10'>
                          <img
                            src={av.src}
                            alt={av.name}
                            className='w-full h-full object-cover rounded-full'
                          />
                        </div>
                        <div className='flex-grow relative z-10'>
                          <div className='text-xs font-bold text-secondary uppercase tracking-widest mb-1'>
                            ได้รับสกินใหม่
                          </div>
                          <h4 className='text-white font-bold text-lg mb-1'>{av.name} Avatar</h4>
                          <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-xs font-bold mt-1'>
                            <UserIcon size={12} />
                            <span>ใช้งานได้ทันที</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div
                className={`flex flex-wrap justify-center gap-4 mb-20 transition-all duration-700 ease-out delay-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <button
                  onClick={handleReplay}
                  className='px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all hover:scale-105 flex items-center gap-2'
                >
                  <RotateCcw size={20} />
                  เล่นอีกครั้ง
                </button>
                <button
                  onClick={onExit}
                  className='px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full font-bold transition-all hover:scale-105 flex items-center gap-2 backdrop-blur-sm'
                >
                  <GitBranch size={20} />
                  ดูฉากจบอื่นๆ
                </button>
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className='px-8 py-4 bg-secondary/80 hover:bg-secondary text-white rounded-full font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                >
                  <Star size={20} />
                  ให้คะแนน
                </button>
                <button
                  onClick={handleShare}
                  className='px-6 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold transition-all hover:bg-white/10 flex items-center gap-2'
                >
                  {isCopied ? <Check size={20} /> : <Share2 size={20} />}
                </button>
              </div>

              {/* Recommendations (Related Games) */}
              <div
                className={`border-t border-white/10 pt-16 transition-all duration-700 ease-out delay-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              >
                <h3 className='text-2xl font-serif font-bold text-white mb-8 text-center'>
                  เรื่องราวที่คุณอาจสนใจ
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  {relatedStories.map((relatedStory, i) => (
                    <div
                      key={relatedStory.id}
                      className='transform hover:-translate-y-2 transition-transform duration-300'
                    >
                      <StoryCard story={relatedStory} onClick={() => onSelectStory(relatedStory)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
