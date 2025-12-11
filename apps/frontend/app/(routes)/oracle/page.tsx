'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Send, Sparkles } from 'lucide-react';
import { getGeminiRecommendation } from '@lib/geminiService';
import { MOCK_STORIES } from '@lib/constants';

export default function OraclePage() {
  const [mood, setMood] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && typeof videoRef.current.play === 'function' && !videoError) {
      videoRef.current.play().catch(() => {
        setVideoError(true);
      });
    }
  }, [videoError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mood.trim()) return;

    setLoading(true);
    setResponse(null);

    const result = await getGeminiRecommendation(mood, MOCK_STORIES);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className='relative flex min-h-screen w-full flex-col items-center overflow-hidden'>
      <div className='absolute inset-0 z-0'>
        <div className='absolute inset-0'>
          <Image
            src='https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2672&auto=format&fit=crop'
            alt='Space Background'
            fill
            className='object-cover'
            priority
          />
        </div>
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className='absolute inset-0 h-full w-full scale-110 object-cover opacity-60'
            onError={() => setVideoError(true)}
          >
            <source
              src='https://cdn.pixabay.com/video/2021/04/14/71067-537482590_large.mp4'
              type='video/mp4'
            />
          </video>
        )}
        <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px]' />
        <div className='absolute inset-0 bg-gradient-to-b from-background via-transparent to-background' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-50' />
      </div>

      <div className='relative z-10 flex w-full max-w-4xl flex-col items-center px-4 pb-20 pt-32 animate-fade-in'>
        <div className='mb-12 text-center'>
          <div className='mb-6 inline-block rounded-full border border-secondary/20 bg-secondary/10 p-4 shadow-[0_0_30px_rgba(168,85,247,0.3)] backdrop-blur-md'>
            <Sparkles size={48} className='animate-pulse-slow text-secondary' />
          </div>
          <h2 className='mb-6 text-4xl font-serif font-bold text-white drop-shadow-2xl md:text-6xl'>
            ถามไถ่เทพพยากรณ์
          </h2>
          <p className='mx-auto max-w-lg text-lg leading-relaxed text-gray-300'>
            ไม่แน่ใจว่าจะเริ่มจากตรงไหน? บอกเล่าอารมณ์ ความกลัว หรือความปรารถนาของคุณ ให้ AI
            เทพพยากรณ์นำทางชะตาของคุณ
          </p>
        </div>

        <form onSubmit={handleSubmit} className='relative z-20 w-full max-w-2xl'>
          <div className='group relative'>
            <input
              type='text'
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              placeholder='เช่น ฉันอยากได้เรื่องที่ตื่นเต้นและลึกลับ...'
              className='w-full rounded-full border border-white/20 bg-black/50 px-8 py-5 text-white shadow-xl backdrop-blur-md transition-all placeholder:text-gray-400 focus:border-secondary focus:bg-black/70 focus:outline-none focus:ring-1 focus:ring-secondary disabled:opacity-60'
              disabled={loading}
            />
            <button
              type='submit'
              disabled={loading || !mood.trim()}
              className='absolute right-2 top-2 rounded-full bg-secondary p-3 text-white transition-all hover:bg-secondary/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? (
                <div className='h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white' />
              ) : (
                <Send size={24} className='ml-0.5' />
              )}
            </button>
          </div>
        </form>

        {response && (
          <div className='relative mt-12 w-full max-w-2xl overflow-hidden rounded-2xl border border-secondary/30 bg-black/60 p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-scale-in'>
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent' />
            <Sparkles size={24} className='absolute right-4 top-4 text-secondary opacity-50' />
            <Sparkles size={24} className='absolute bottom-4 left-4 text-secondary opacity-50' />
            <h3 className='mb-4 font-serif font-bold uppercase tracking-widest text-secondary'>
              คำทำนาย
            </h3>
            <p className='text-xl font-serif leading-relaxed text-white md:text-2xl'>
              &ldquo;{response}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
