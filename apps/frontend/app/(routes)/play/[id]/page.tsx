"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle,
  GitBranch,
  History,
  Loader,
  RotateCcw,
  Share2,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Star,
  TrendingUp,
  UserIcon,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import StoryCard from "@ui/StoryCard";
import RatingModal from "@ui/modals/RatingModal";
import { MOCK_STORIES, REFILL_INTERVAL_MS, SYSTEM_ACHIEVEMENTS, SYSTEM_AVATARS } from "@lib/constants";
import type { StoryNode } from "@lib/types";
import { GameState } from "@lib/types";

type MediaSegment = {
  text: string;
  image?: string;
  duration?: number;
};

type HistoryItem = {
  type: "narrative" | "choice";
  text: string;
  nodeId?: string;
};

const MOCK_NODES: Record<string, StoryNode> = {
  start: {
    id: "start",
    bgMusic: "https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg",
    segments: [
      {
        text: "คุณตื่นขึ้นมาในห้องที่หนาวเหน็บ อากาศอบอวลไปด้วยกลิ่นโอโซนและสนิม",
        duration: 4000,
        image: "https://picsum.photos/seed/cyberpunk_room/1920/1080",
      },
      {
        text: "เสียงเครื่องจักรทำงานหนักดังมาจากที่ไกลๆ ไฟฉุกเฉินสีแดงกระพริบเป็นจังหวะเหมือนชีพจรที่กำลังจะหยุดเต้น",
        duration: 4000,
        image: "https://picsum.photos/seed/red_light_alarm/1920/1080",
      },
    ],
    choices: [
      { id: "c1", text: "ค้นหาในห้อง", nextNodeId: "search" },
      { id: "c2", text: "ลองเปิดประตู", nextNodeId: "door" },
    ],
  },
  search: {
    id: "search",
    bgMusic: "https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg",
    segments: [
      {
        text: "คุณพบคีย์การ์ดใต้ฟูกที่นอน มันเรืองแสงสีฟ้าจางๆ",
        image: "https://picsum.photos/seed/keycard_bed/1920/1080",
      },
    ],
    choices: [{ id: "c3", text: "เก็บคีย์การ์ด", nextNodeId: "corridor_key" }],
  },
  door: {
    id: "door",
    bgMusic: "https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg",
    segments: [
      {
        text: "ประตูล็อคแน่นหนา สัญญาณเตือนภัยเริ่มดังขึ้น",
        image: "https://picsum.photos/seed/locked_door/1920/1080",
      },
    ],
    choices: [
      { id: "c4", text: "พยายามพังประตู", nextNodeId: "game_over_captured" },
      { id: "c5", text: "ซ่อนใต้เตียง", nextNodeId: "search" },
    ],
  },
  corridor_key: {
    id: "corridor_key",
    bgMusic: "https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg",
    segments: [
      {
        text: "คีย์การ์ดเปิดประตูออกได้ ทางเดินยาวทอดตัวอยู่เบื้องหน้า",
        image: "https://picsum.photos/seed/sci_fi_corridor/1920/1080",
      },
      {
        text: "ทันใดนั้น หุ่นยนต์รักษาความปลอดภัยเลี้ยวหัวมุมมาเจอคุณพอดี",
        image: "https://picsum.photos/seed/robot_security/1920/1080",
      },
    ],
    choices: [
      { id: "c6", text: "ย่องผ่านไป", nextNodeId: "escape" },
      { id: "c7", text: "โจมตีหุ่นยนต์", nextNodeId: "fight" },
    ],
  },
  fight: {
    id: "fight",
    bgMusic: "https://actions.google.com/sounds/v1/weather/thunder_crack.ogg",
    segments: [
      {
        text: "คุณพยายามพุ่งเข้าไปโจมตี แต่ไร้อาวุธ...",
        image: "https://picsum.photos/seed/fighting_pov/1920/1080",
      },
      {
        text: "หุ่นยนต์ยิงกระสุนช็อตไฟฟ้าใส่คุณ คุณล้มลงและสติค่อยๆ ดับวูบ",
        image: "https://picsum.photos/seed/electric_shock/1920/1080",
      },
    ],
    choices: [{ id: "end1", text: "เริ่มใหม่", nextNodeId: "start" }],
  },
  game_over_captured: {
    id: "game_over_captured",
    bgMusic: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
    segments: [
      {
        text: "หน่วยรักษาความปลอดภัยบุกเข้ามาในห้อง คุณถูกจับกุม",
        image: "https://picsum.photos/seed/captured_prison/1920/1080",
      },
    ],
    choices: [{ id: "end2", text: "ลองอีกครั้ง", nextNodeId: "start" }],
  },
  escape: {
    id: "escape",
    bgMusic: "https://actions.google.com/sounds/v1/water/stream_flowing.ogg",
    segments: [
      {
        text: "คุณอาศัยจังหวะเงามืดหลบเลี่ยงเซ็นเซอร์",
        image: "https://picsum.photos/seed/shadows_hide/1920/1080",
      },
      {
        text: "แสงสว่างที่ปลายอุโมงค์... คุณหนีรอดออกมาจากศูนย์วิจัยได้สำเร็จ",
        image: "https://picsum.photos/seed/bright_exit/1920/1080",
      },
    ],
    choices: [],
  },
};

export default function PlayerPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();

  const storyId = useMemo(() => {
    if (!params?.id) return undefined;
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params?.id]);

  const story = useMemo(() => MOCK_STORIES.find((item) => item.id === storyId), [storyId]);

  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.PLAYING);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [historyLog, setHistoryLog] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingNode, setIsLoadingNode] = useState(false);
  const [isSegmentTransitioning, setIsSegmentTransitioning] = useState(false);
  const [sceneVisible, setSceneVisible] = useState(false);
  const [endScenePhase, setEndScenePhase] = useState<"initial" | "content">("initial");
  const [endScreenScrollY, setEndScreenScrollY] = useState(0);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [credits, setCredits] = useState(5);
  const [maxCredits] = useState(5);
  const [nextRefill, setNextRefill] = useState("");
  const [showCreditAlert, setShowCreditAlert] = useState(false);

  const historyEndRef = useRef<HTMLDivElement>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentTimerRef = useRef<NodeJS.Timeout | null>(null);
  const endSceneTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentNode = useMemo(() => MOCK_NODES[currentNodeId] ?? MOCK_NODES.start, [currentNodeId]);
  const currentSegment: MediaSegment = currentNode.segments[currentSegmentIndex] ?? currentNode.segments[0];

  useEffect(() => {
    sfxRef.current = new Audio("https://actions.google.com/sounds/v1/ui/click_on.ogg");
    sfxRef.current.volume = 0.6;
  }, []);

  useEffect(() => {
    if (currentSegmentIndex >= currentNode.segments.length) {
      setCurrentSegmentIndex(0);
    }
  }, [currentSegmentIndex, currentNode.segments.length]);

  useEffect(() => {
    setSceneVisible(false);
    const timer = setTimeout(() => setSceneVisible(true), 120);
    return () => clearTimeout(timer);
  }, [currentNodeId, currentSegmentIndex]);

  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }

    if (gameState !== GameState.PLAYING) return;
    setProgress(0);
    const segmentDuration = currentSegment?.duration || 5000;
    const interval = 50;
    const step = 100 / (segmentDuration / interval);

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + step));
    }, interval);

    segmentTimerRef.current = setTimeout(() => {
      setProgress(100);
      handleSegmentComplete();
    }, segmentDuration);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (segmentTimerRef.current) {
        clearTimeout(segmentTimerRef.current);
        segmentTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeId, currentSegmentIndex, gameState]);

  useEffect(() => {
    if (currentNode.choices.length === 0 && gameState === GameState.CHOICE) {
      setGameState(GameState.ENDED);
      setEndScenePhase("initial");
      const timer = setTimeout(() => setEndScenePhase("content"), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentNode.choices.length, gameState]);

  useEffect(() => {
    if (credits >= maxCredits) {
      setNextRefill("");
      return;
    }
    const interval = setInterval(() => {
      setCredits((prev) => Math.min(maxCredits, prev + 1));
      setNextRefill("");
    }, REFILL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [credits, maxCredits]);

  useEffect(() => {
    if (!isHistoryOpen) return;
    const timer = setTimeout(() => historyEndRef.current?.scrollIntoView({ behavior: "smooth" }), 120);
    return () => clearTimeout(timer);
  }, [historyLog, isHistoryOpen, currentNodeId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [storyId]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (segmentTimerRef.current) {
        clearTimeout(segmentTimerRef.current);
      }
      if (endSceneTimerRef.current) {
        clearTimeout(endSceneTimerRef.current);
      }
    };
  }, []);

  const triggerEndScene = () => {
    setGameState(GameState.ENDED);
    setEndScenePhase("initial");
    if (endSceneTimerRef.current) {
      clearTimeout(endSceneTimerRef.current);
    }
    endSceneTimerRef.current = setTimeout(() => setEndScenePhase("content"), 1500);
  };

  const handleSegmentComplete = () => {
    setIsSegmentTransitioning(true);
    setTimeout(() => {
      const hasMore = currentSegmentIndex < currentNode.segments.length - 1;
      if (hasMore) {
        setCurrentSegmentIndex((prev) => prev + 1);
      } else {
        if (currentNode.choices.length === 0) {
          triggerEndScene();
        } else {
          setGameState(GameState.CHOICE);
        }
      }
      setIsSegmentTransitioning(false);
    }, 180);
  };

  const handleChoice = async (nextNodeId: string, choiceId: string) => {
    if (gameState !== GameState.CHOICE || isLoadingNode) return;
    if (!muted && sfxRef.current) {
      try {
        sfxRef.current.currentTime = 0;
        await sfxRef.current.play();
      } catch (error) {
        console.warn("SFX play blocked", error);
      }
    }

    setSelectedChoiceId(choiceId);
    setIsLoadingNode(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (credits <= 0) {
      setShowCreditAlert(true);
      setIsLoadingNode(false);
      setSelectedChoiceId(null);
      setTimeout(() => setShowCreditAlert(false), 3500);
      return;
    }

    setCredits((prev) => Math.max(0, prev - 1));
    const nodeText = currentNode.segments.map((segment) => segment.text).join(" ");
    const choiceText = currentNode.choices.find((choice) => choice.id === choiceId)?.text ?? "";
    setHistoryLog((prev) => [
      ...prev,
      { type: "narrative", text: nodeText, nodeId: currentNodeId },
      { type: "choice", text: choiceText },
    ]);

    if (nextNodeId === "start") {
      setHistoryLog([]);
    }

    setGameState(GameState.PLAYING);
    setCurrentNodeId(nextNodeId);
    setCurrentSegmentIndex(0);
    setProgress(0);
    setSelectedChoiceId(null);
    setIsLoadingNode(false);
  };

  const handleSkip = () => {
    if (gameState === GameState.PLAYING) {
      handleSegmentComplete();
    }
  };


  const handleReplayScene = () => {
    // Replay only the current scene; keep node, history, and selected choice intact
    setGameState(GameState.PLAYING);
    setCurrentSegmentIndex(0);
    setProgress(0);
  };

  const handleReplay = () => {
    setGameState(GameState.PLAYING);
     setCurrentNodeId("start");
    setCurrentSegmentIndex(0);
    setHistoryLog([]);
    setProgress(0);
    setSelectedChoiceId(null);
  };

  const handleShare = async () => {
    if (!story) return;
    let shareUrl = window.location.href;
    if (!shareUrl.startsWith("http")) {
      shareUrl = `https://chronos.app/story/${story.id}`;
    }
    const lastText = currentNode.segments[currentNode.segments.length - 1]?.text ?? "";
    const shareData = {
      title: `Chronos - ${story.title}`,
      text: `ฉันกำลังเล่น "${story.title}" บน Chronos: "${lastText.slice(0, 60)}..." คุณจะเลือกทางไหน?`,
      url: shareUrl,
    };
    let shared = false;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (error) {
        console.warn("Share cancelled", error);
      }
    }
    if (!shared) {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1800);
      } catch (error) {
        console.error("Copy failed", error);
      }
    }
  };

  const handleRatingSubmit = (rating: number, comment: string) => {
    console.log("Submit rating", rating, comment);
    setIsRatingModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3200);
  };

  const handleEndScreenScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setEndScreenScrollY(event.currentTarget.scrollTop);
  };

  if (!story) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-white">
        <div className="rounded-2xl border border-white/10 bg-surface/90 px-6 py-5 text-center shadow-2xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <X />
          </div>
          <p className="text-lg font-semibold">ไม่พบนิยายที่คุณต้องการ</p>
          <button
            onClick={() => router.push("/stories")}
            className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            กลับไปหน้าคลังนิยาย
          </button>
        </div>
      </main>
    );
  }

  const relatedStories = MOCK_STORIES.filter((item) => item.id !== story.id).slice(0, 3);
  const unlockedAvatars = SYSTEM_AVATARS.filter((avatar) => avatar.type === "unlock" && avatar.requiredStoryId === story.id);
  const unlockedAchievements = SYSTEM_ACHIEVEMENTS.filter((achievement) => achievement.id === "first_step" || achievement.id === "completionist");
  const showContent = endScenePhase === "content";
  const backgroundImage = currentSegment?.image || story.coverImage;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black text-white">
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        storyTitle={story.title}
      />

      {showToast && (
        <div className="fixed right-4 top-24 z-[120] animate-[slideUpFade_0.4s_ease-out_forwards] md:right-8">
          <div className="flex min-w-[280px] items-center gap-3 rounded-xl border border-green-500/30 bg-[#1a1d26]/90 p-4 text-white backdrop-blur-md shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <Zap size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-green-400">บันทึกรีวิวสำเร็จ!</p>
              <p className="text-xs text-gray-400">ขอบคุณสำหรับคำติชม</p>
            </div>
          </div>
        </div>
      )}

      {showCreditAlert && (
        <div className="fixed left-1/2 top-24 z-[120] -translate-x-1/2 animate-[slideUpFade_0.4s_ease-out_forwards]">
          <div className="flex min-w-[300px] items-center gap-4 rounded-xl border border-red-500/50 bg-red-900/90 p-4 text-white backdrop-blur-md shadow-[0_0_30px_rgba(220,38,38,0.4)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-red-400">เครดิตไม่เพียงพอ!</h4>
              <p className="text-xs text-gray-300">กรุณารอรีฟิล หรือเขียนรีวิวเพื่อรับโบนัส</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute left-0 top-0 z-[120] flex w-full items-start justify-between p-6">
        <button
          onClick={() => router.push("/stories")}
          className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-black/60 cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-md cursor-pointer">
            <Zap
              size={18}
              className={`${credits > 0 ? "text-accent" : "text-red-500"} ${credits < maxCredits ? "animate-pulse" : ""}`}
              fill="currentColor"
            />
            <span className={`font-mono text-base font-bold ${credits === 0 ? "text-red-500" : "text-white"}`}>
              {credits}
            </span>
            {nextRefill && (
              <span className="ml-2 border-l border-white/20 pl-2 font-mono text-xs text-gray-400">
                {nextRefill}
              </span>
            )}
          </div>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-black/60 cursor-pointer"
            title="ประวัติการเล่น"
          >
            <History size={22} />
          </button>

          <button
            onClick={() => setMuted((prev) => !prev)}
            className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-black/60 cursor-pointer"
          >
            {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          {gameState === GameState.PLAYING && (
            <button
              onClick={handleSkip}
              className="pointer-events-auto rounded-full border border-white/10 bg-black/40 p-3 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-black/60 cursor-pointer"
              title="ข้ามฉาก"
            >
              <SkipForward size={22} />
            </button>
          )}
        </div>
      </div>

      {gameState !== GameState.ENDED && (
        <div className="relative flex h-full w-full flex-col">
          <div
            className={`absolute inset-0 z-[60] flex items-center justify-center bg-black transition-opacity duration-700 ${
              isLoadingNode ? "opacity-100 pointer-events-auto" : "pointer-events-none opacity-0"
            }`}
          >
            <Loader className="h-12 w-12 animate-spin text-primary" />
          </div>

          <div className="absolute inset-0 z-0 bg-black">
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                isSegmentTransitioning ? "opacity-0" : "opacity-100"
              } ${sceneVisible ? "opacity-100" : "opacity-0"}`}
            >
              <Image src={backgroundImage} alt={story.title} fill priority className="object-cover" sizes="100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
            </div>
          </div>

          <div
            className={`relative z-10 flex grow flex-col px-6 pb-12 md:px-16 max-w-6xl mx-auto w-full ${
              gameState === GameState.CHOICE ? "justify-center" : "justify-end"
            }`}
          >
            {gameState === GameState.PLAYING && (
              <div className={`mb-8 transition-all duration-700 ${sceneVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
                <div className="rounded-2xl border border-white/10 bg-black/60 p-6 text-gray-100 backdrop-blur-md shadow-2xl">
                  <p className="font-serif text-lg leading-relaxed md:text-2xl">{currentSegment.text}</p>
                </div>
              </div>
            )}

            {gameState === GameState.CHOICE && (
              <div className="w-full max-w-2xl mx-auto animate-[slideUpFade_0.6s_ease-out_forwards] px-2 sm:px-4">
                <div className="mb-8 text-center">
                  <span className="inline-block rounded-full border border-white/10 bg-black/50 px-6 py-2 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                    Choose Your Path
                  </span>
                </div>
                <div className={`${selectedChoiceId ? "pointer-events-none" : ""} flex flex-col gap-4`}>
                  {currentNode.choices.map((choice, index) => {
                    const isLocked = Boolean(choice.requiredAchievement);
                    const isSelected = selectedChoiceId === choice.id;
                    const isNotSelected = selectedChoiceId && selectedChoiceId !== choice.id;
                    return (
                      <button
                        key={choice.id}
                        onClick={() => !isLocked && handleChoice(choice.nextNodeId, choice.id)}
                        disabled={isLocked}
                        className={`group relative animate-[slideUpFade_0.5s_ease-out_forwards] rounded-2xl border p-6 text-left transition-all duration-500 cursor-pointer ${
                          isLocked
                            ? "cursor-not-allowed border-gray-700 bg-gray-800/80 opacity-70"
                            : isSelected
                              ? "z-10 scale-105 border-primary bg-black/90 shadow-[0_0_50px_rgba(59,130,246,0.6)]"
                              : isNotSelected
                                ? "border-white/10 bg-black/70 opacity-60 blur-sm"
                                : "border-white/20 bg-black/80 backdrop-blur-md hover:scale-[1.02] hover:border-primary hover:bg-black/90 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        }`}
                        style={{ animationDelay: `${index * 120}ms` }}
                      >
                        {isLocked && (
                          <div className="absolute right-2 top-2 text-red-400">
                            <ShieldCheck size={16} />
                          </div>
                        )}
                        <h3
                          className={`mb-2 text-xl font-bold leading-relaxed transition-colors ${
                            isLocked ? "text-gray-500" : "text-white"
                          }`}
                        >
                          {choice.text}
                        </h3>
                        {isLocked && (
                          <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
                            <ShieldCheck size={12} /> ต้องปลดล็อกความสำเร็จ
                          </p>
                        )}
                        {!isLocked && !selectedChoiceId && (
                          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </button>
                    );
                  })}

                  <button
                    onClick={handleReplayScene}
                    className="mx-auto mt-4 flex w-auto items-center justify-center gap-2 rounded-full border border-white/10 bg-black/40 px-6 py-2 text-center text-xs font-bold uppercase tracking-wider text-gray-400 backdrop-blur-md transition hover:scale-105 hover:bg-white/10 hover:text-white cursor-pointer"
                    style={{ animationDelay: `${currentNode.choices.length * 120 + 120}ms` }}
                  >
                    <RotateCcw size={14} className="text-gray-400" />
                    เล่นฉากนี้ซ้ำ
                  </button>
                </div>
              </div>
            )}

            {gameState === GameState.PLAYING && (
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="absolute inset-0 z-[140] flex animate-fade-in justify-end bg-black/90 backdrop-blur-md">
          <div className="flex h-full w-full animate-[slideUpFade_0.5s_ease-out_forwards] flex-col border-l border-white/10 bg-[#1a1d26] shadow-2xl md:w-[480px]">
            <div className="flex items-center justify-between border-b border-white/5 bg-black/20 p-6">
              <h2 className="flex items-center gap-2 text-xl font-serif font-bold text-white">
                <History size={20} className="text-gray-400" />
                บันทึกการเดินทาง
              </h2>
              <button onClick={() => setIsHistoryOpen(false)} className="rounded-full p-2 transition-colors hover:bg-white/10">
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="custom-scrollbar flex-grow overflow-y-auto p-6">
              {historyLog.length === 0 && <div className="mt-10 text-center text-gray-500">ยังไม่มีบันทึกการเดินทาง</div>}
              <div className="space-y-6">
                {historyLog.map((item, index) => (
                  <div
                    key={`${item.text}-${index}`}
                    className={`relative border-l-2 pl-4 ${
                      item.type === "narrative" ? "border-gray-700" : "border-secondary"
                    }`}
                  >
                    {item.type === "choice" && <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-[#1a1d26] bg-secondary" />}
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                      {item.type === "narrative" ? "เรื่องราว" : "การตัดสินใจ"}
                    </span>
                    <p className={`text-sm leading-relaxed ${item.type === "choice" ? "text-secondary font-bold" : "text-gray-300"}`}>
                      {item.text}
                    </p>
                  </div>
                ))}

                <div ref={historyEndRef} className="relative rounded-r-lg border-l-2 border-primary bg-primary/5 pl-4 py-2">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-[#1a1d26] bg-primary shadow-[0_0_10px_var(--color-primary)]" />
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-primary">
                    {gameState === GameState.ENDED ? "บทสรุป" : "ฉากปัจจุบัน"}
                  </span>
                  <p className="text-base font-medium leading-relaxed text-white">
                    {currentNode.segments.map((segment) => segment.text).join(" ")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-grow" onClick={() => setIsHistoryOpen(false)} />
        </div>
      )}

      {gameState === GameState.ENDED && (
        <div className="absolute inset-0 z-[90] flex flex-col overflow-hidden">
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translateY(-${Math.max(0, endScreenScrollY) * 0.05}px)` }}
          >
            <div className={`absolute inset-0 transition-all duration-1000 scale-125 ${endScenePhase === "initial" ? "grayscale-0" : "grayscale"}`}>
              <Image src={story.coverImage} alt="Ending" fill className="object-cover opacity-60" sizes="100vw" priority />
            </div>
          </div>

          <div
            className={`pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-[#0F1117] via-[#0F1117]/80 to-transparent transition-opacity duration-1000 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className={`custom-scrollbar relative z-10 flex-grow overflow-y-auto px-4 pb-20 pt-32 transition-opacity duration-1000 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
            onScroll={handleEndScreenScroll}
          >
            <div className="mx-auto max-w-4xl">
              <div
                className={`mb-8 text-center transition-all duration-700 ease-out delay-100 ${
                  showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <div className="mb-4 inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1 text-sm uppercase tracking-[0.3em]">
                  The End
                </div>
                <h1 className="text-2xl font-serif font-bold text-white drop-shadow-2xl md:text-4xl">{story.title}</h1>
              </div>

              <div
                className={`relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-surface/40 p-8 text-center shadow-2xl backdrop-blur-xl transition-all duration-700 ease-out delay-200 ${
                  showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 p-32 blur-3xl" />
                <div className="relative z-10">
                  <p className="mb-8 font-serif text-xl italic leading-relaxed text-white md:text-3xl">
                    &quot;{currentNode.segments.map((segment) => segment.text).join(" ")}&quot;
                  </p>
                  <div className="mx-auto mb-8 h-1 w-16 rounded-full bg-white/10" />
                  <div className="flex flex-col items-center gap-2">
                    <GitBranch className="text-secondary opacity-80" size={24} />
                    <h2 className="text-lg font-bold text-gray-200">บันทึกการเดินทางของคุณ</h2>
                    <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-400">
                      คุณได้เลือกเส้นทางที่นำไปสู่จุดจบอันน่าจดจำ ทุกการตัดสินใจของคุณสะท้อนถึงตัวตนของผู้กล้า
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`mb-12 flex flex-wrap justify-center gap-4 text-sm text-gray-400 transition-all duration-700 ease-out delay-300 ${
                  showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-sm shadow-sm">
                  <CheckCircle size={16} className="text-green-500" />
                  <span>ปลดล็อกฉากจบ 1/{story.totalEndings}</span>
                </div>
              </div>

              {(unlockedAchievements.length > 0 || unlockedAvatars.length > 0) && (
                <div
                  className={`mb-16 transition-all duration-700 ease-out delay-500 ${
                    showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-center gap-2">
                    <Sparkles className="text-accent" size={24} />
                    <h3 className="text-2xl font-bold text-white">รางวัลที่ได้รับ</h3>
                    <Sparkles className="text-accent" size={24} />
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1d26] to-black p-5 shadow-lg transition-colors hover:border-accent/50 cursor-pointer"
                  >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-black/50 text-3xl shadow-inner group-hover:scale-105 transition-transform">
                          {achievement.icon}
                        </div>
                        <div className="flex-grow">
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-accent">ปลดล็อกความสำเร็จ</div>
                          <h4 className="mb-1 text-lg font-bold text-white">{achievement.title}</h4>
                          {"creditBonus" in achievement && achievement.creditBonus > 0 && (
                            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                              <TrendingUp size={12} />
                              <span>+{achievement.creditBonus} Max Credit Limit</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {unlockedAvatars.map((avatar) => (
                      <div
                        key={avatar.id}
                        className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-secondary/30 bg-gradient-to-br from-[#1a1d26] to-black p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] cursor-pointer"
                      >
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-secondary/10 blur-2xl transition-colors group-hover:bg-secondary/20" />
                        <div className="relative z-10 h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-secondary">
                          <Image src={avatar.src} alt={avatar.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="relative z-10 flex-grow">
                          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">ได้รับสกินใหม่</div>
                          <h4 className="mb-1 text-lg font-bold text-white">{avatar.name} Avatar</h4>
                          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                            <UserIcon size={12} />
                            <span>ใช้งานได้ทันที</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className={`mb-20 flex flex-wrap justify-center gap-4 transition-all duration-700 ease-out delay-700 ${
                  showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <button
                  onClick={handleReplay}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-gray-200 cursor-pointer"
                >
                  <RotateCcw size={20} />
                  เล่นอีกครั้ง
                </button>
                <button
                  onClick={() => router.push("/stories")}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-sm transition hover:scale-105 hover:bg-white/20 cursor-pointer"
                >
                  <GitBranch size={20} />
                  ดูฉากจบอื่นๆ
                </button>
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-secondary/80 px-8 py-4 font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition hover:scale-105 hover:bg-secondary cursor-pointer"
                >
                  <Star size={20} />
                  ให้คะแนน
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 font-bold text-white transition hover:bg-white/10 cursor-pointer"
                >
                  {isCopied ? <Check size={20} /> : <Share2 size={20} />}
                </button>
              </div>

              <div
                className={`border-t border-white/10 pt-16 transition-all duration-700 ease-out delay-1000 ${
                  showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              >
                <h3 className="mb-8 text-center text-2xl font-serif font-bold text-white">เรื่องราวที่คุณอาจสนใจ</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {relatedStories.map((relatedStory) => (
                    <div
                      key={relatedStory.id}
                      className="transition-transform duration-300 hover:-translate-y-2 cursor-pointer"
                    >
                      <StoryCard story={relatedStory} onClick={() => router.push(`/stories/${relatedStory.id}`)} />
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
}
