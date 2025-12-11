import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { getGeminiRecommendation } from '../services/geminiService';
import { MOCK_STORIES } from '../constants';
import { Story } from '../types';

interface OracleProps {
  onSelectStory: (storyId: string) => void;
}

export const Oracle: React.FC<OracleProps> = ({ onSelectStory }) => {
  const [mood, setMood] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Force play to handle browser autoplay policies
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch((err) => {
        console.warn('Video autoplay prevented:', err);
      });
    }
  }, [videoError]);

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    setLoading(true);
    setResponse(null);

    // Simulate thinking delay for effect + API call
    const result = await getGeminiRecommendation(mood, MOCK_STORIES);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className='relative min-h-screen w-full overflow-hidden flex flex-col items-center'>
      {/* Video Background */}
      <div className='absolute inset-0 z-0'>
        <img
          src='https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2672&auto=format&fit=crop'
          alt='Space Background'
          className='absolute inset-0 w-full h-full object-cover'
        />
        {!videoError && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className='absolute inset-0 w-full h-full object-cover opacity-60 scale-110'
            onError={() => setVideoError(true)}
          >
            <source
              src='https://cdn.pixabay.com/video/2021/04/14/71067-537482590_large.mp4'
              type='video/mp4'
            />
          </video>
        )}
        {/* Overlays */}
        <div className='absolute inset-0 bg-black/40 backdrop-blur-[2px]' />
        <div className='absolute inset-0 bg-gradient-to-b from-background via-transparent to-background' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-50' />
      </div>

      {/* Main Content */}
      <div className='relative z-10 w-full max-w-4xl px-4 pt-32 pb-20 flex flex-col items-center animate-fade-in'>
        <div className='text-center mb-12'>
          <div className='inline-block p-4 rounded-full bg-secondary/10 border border-secondary/20 mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.3)]'>
            <Sparkles size={48} className='text-secondary animate-pulse-slow' />
          </div>
          <h2 className='text-4xl md:text-6xl font-serif font-bold text-white mb-6 drop-shadow-2xl'>
            ถามไถ่เทพพยากรณ์
          </h2>
          <p className='text-gray-300 max-w-lg mx-auto text-lg leading-relaxed'>
            ไม่แน่ใจว่าจะเริ่มจากตรงไหน? บอกเล่าอารมณ์ ความกลัว หรือความปรารถนาของคุณ ให้ AI
            เทพพยากรณ์นำทางชะตาของคุณ
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleConsult} className='w-full max-w-2xl relative z-20'>
          <div className='relative group'>
            <input
              type='text'
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder='เช่น ฉันอยากได้เรื่องที่ตื่นเต้นและลึกลับ...'
              className='w-full bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-8 py-5 text-white placeholder:text-gray-400 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary focus:bg-black/70 transition-all shadow-xl'
              disabled={loading}
            />
            <button
              type='submit'
              disabled={loading || !mood.trim()}
              className='absolute right-2 top-2 p-3 bg-secondary hover:bg-secondary/80 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] active:scale-95'
            >
              {loading ? (
                <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <Send size={24} className='ml-0.5' />
              )}
            </button>
          </div>
        </form>

        {/* Response Card */}
        {response && (
          <div className='mt-12 bg-black/60 backdrop-blur-xl border border-secondary/30 p-8 rounded-2xl max-w-2xl w-full text-center relative overflow-hidden animate-scale-in shadow-[0_0_50px_rgba(0,0,0,0.5)]'>
            <div className='absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent pointer-events-none' />
            <Sparkles size={24} className='text-secondary absolute top-4 right-4 opacity-50' />
            <Sparkles size={24} className='text-secondary absolute bottom-4 left-4 opacity-50' />

            <h3 className='text-secondary font-serif font-bold tracking-widest uppercase text-sm mb-4'>
              คำทำนาย
            </h3>
            <p className='text-xl md:text-2xl text-white font-serif leading-relaxed drop-shadow-md'>
              "{response}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
