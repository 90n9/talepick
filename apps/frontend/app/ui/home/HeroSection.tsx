"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, PlayCircle, Sparkles } from 'lucide-react';

type HeroSectionProps = {
  storyCount: number;
  reviewCount: number;
};

export default function HeroSection({ storyCount, reviewCount }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div 
            className="absolute inset-0 z-0 will-change-transform"
            style={{ 
                transform: `translateY(${scrollY * 0.5}px)` 
            }}
        >
           {/* Fallback Image */}
           <Image
                src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2568&auto=format&fit=crop"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
                fill
           />
           
           {!videoError && (
               <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-50 scale-125 transition-opacity duration-1000" 
                onError={() => setVideoError(true)}
               >
                 <source src="https://cdn.pixabay.com/video/2021/04/14/71067-537482590_large.mp4" type="video/mp4" />
               </video>
           )}

          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>

        {/* Hero Content - Parallax Text */}
        <div 
            className="relative z-10 text-center px-4 max-w-4xl mx-auto will-change-transform"
            style={{ 
                transform: `translateY(${scrollY * 0.2}px)`,
                opacity: 1 - Math.min(1, scrollY / 600) 
            }}
        >
          <div className="inline-block mb-4 px-3 py-1 border border-primary/50 rounded-full bg-primary/10 backdrop-blur-md animate-fade-in">
            <span className="text-primary text-xs tracking-[0.2em] uppercase font-bold">ประสบการณ์แบบโต้ตอบ</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-6 drop-shadow-2xl tracking-tight leading-tight">
            เลือกเส้นทางของคุณ<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              กำหนดชะตากรรม
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            ดำดิ่งสู่เรื่องราวที่แตกแขนงไปตามการตัดสินใจของคุณ ทุกทางเลือกส่งผลกระทบต่อกาลเวลา คุณจะกลายเป็นใครในตอนจบ?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/stories"
              className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-2 group"
            >
              <PlayCircle size={20} className="group-hover:rotate-12 transition-transform" />
              เริ่มเล่นทันที
            </Link>
            <Link
              href="/support"
              className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/10 text-white rounded-full font-semibold backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <Heart size={20} className="text-pink-500 animate-pulse-slow" />
              สนับสนุนโปรเจกต์
            </Link>
          </div>
        </div>
      </section>
  );
}
