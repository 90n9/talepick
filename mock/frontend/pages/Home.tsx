
import React, { useEffect, useState } from 'react';
import { PlayCircle, Heart, Quote, Star } from 'lucide-react';
import { StoryCard } from '../components/StoryCard';
import { MOCK_STORIES, MOCK_REVIEWS } from '../constants';
import { Story } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
  onSelectStory: (story: Story) => void;
}

// Extended mock reviews for slider
const EXTENDED_REVIEWS = [
    ...MOCK_REVIEWS,
    { id: '4', user: 'ShadowWalker', rating: 5, comment: 'บรรยากาศเกมทำให้รู้สึกเหมือนอยู่ในหนัง Sci-fi ยุค 80s จริงๆ', date: '2023-10-20' },
    { id: '5', user: 'Luna_Love', rating: 4, comment: 'ตัวละครมีมิติมาก อยากให้มีรูทโรแมนติกเพิ่มอีกหน่อยค่ะ', date: '2023-10-22' },
    { id: '6', user: 'PixelMaster', rating: 5, comment: 'Effect ตอนเลือก Choice คือเท่มาก UI สวยสะอาดตา', date: '2023-10-25' }
];

export const Home: React.FC<HomeProps> = ({ onNavigate, onSelectStory }) => {
  const featuredStories = MOCK_STORIES.slice(0, 3);
  const [scrollY, setScrollY] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerScreen, setItemsPerScreen] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for Reveal on Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Responsive Slider Logic
  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 768) setItemsPerScreen(1);
        else if (window.innerWidth < 1024) setItemsPerScreen(2);
        else setItemsPerScreen(3);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto Slide
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentSlide((prev) => {
            const maxIndex = EXTENDED_REVIEWS.length - itemsPerScreen;
            // If we reached the end, loop back to 0
            return prev >= maxIndex ? 0 : prev + 1;
        });
    }, 4000);
    return () => clearInterval(interval);
  }, [itemsPerScreen]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div 
            className="absolute inset-0 z-0 will-change-transform"
            style={{ 
                transform: `translateY(${scrollY * 0.5}px)` 
            }}
        >
           {/* Fallback Image */}
           <img
                src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2568&auto=format&fit=crop"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
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
            <button 
              onClick={() => onNavigate('library')}
              className="px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-full font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all hover:scale-105 flex items-center justify-center gap-2 group"
            >
              <PlayCircle size={20} className="group-hover:rotate-12 transition-transform" />
              เริ่มเล่นทันที
            </button>
            <button 
              onClick={() => onNavigate('support')}
              className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/10 text-white rounded-full font-semibold backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <Heart size={20} className="text-pink-500 animate-pulse-slow" />
              สนับสนุนโปรเจกต์
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        
        {/* Floating Background Elements */}
        <div className="absolute top-20 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" 
             style={{ transform: `translateY(${-scrollY * 0.1}px)` }} />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" 
             style={{ transform: `translateY(${-scrollY * 0.15}px)` }} />

        <div className="flex justify-between items-end mb-16 reveal-on-scroll">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2 font-serif">เรื่องราวแนะนำ</h2>
            <p className="text-gray-400 text-lg">คัดสรรการผจญภัยสุดพิเศษมาเพื่อคุณ</p>
          </div>
          <button 
            onClick={() => onNavigate('library')}
            className="text-primary hover:text-white transition-colors text-sm font-semibold tracking-widest uppercase border-b border-primary/50 pb-1"
          >
            ดูทั้งหมด &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
          {featuredStories.map((story, index) => (
            <div 
                key={story.id} 
                className="reveal-on-scroll" 
                style={{ transitionDelay: `${index * 150}ms` }}
            >
                <StoryCard 
                story={story} 
                onClick={() => onSelectStory(story)} 
                />
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 border-t border-white/5 overflow-hidden">
         {/* Moving Gradient Background */}
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.3),transparent_70%)]" 
              style={{ transform: `scale(${1 + scrollY * 0.0005})` }} />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-20 font-serif reveal-on-scroll">วิธีการเล่น</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: "🎬", title: "รับชม", desc: "สัมผัสประสบการณ์การเล่าเรื่องผ่านฉากวิดีโอที่สมจริงและน่าตื่นตาตื่นใจ" },
              { icon: "⚡", title: "ตัดสินใจ", desc: "เลือกเส้นทางของคุณในเวลาที่กำหนด ทุกการตัดสินใจจะเปลี่ยนทิศทางของเนื้อเรื่อง" },
              { icon: "🔓", title: "ปลดล็อก", desc: "ค้นพบฉากจบที่หลากหลายและสะสมความสำเร็จที่ซ่อนอยู่" }
            ].map((step, i) => (
              <div 
                key={i} 
                className="reveal-on-scroll relative group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">{step.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4 font-serif">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white animate-[spin_10s_linear_infinite]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews / Ratings Section (Slider) */}
      <section className="relative py-24 bg-gradient-to-b from-transparent to-black/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 reveal-on-scroll">
                <h2 className="text-4xl font-serif font-bold text-white mb-4">เสียงจากนักเดินทาง</h2>
                <p className="text-gray-400">สิ่งที่ผู้เล่นพูดถึงเกี่ยวกับการผจญภัยของพวกเขา</p>
            </div>

            {/* Slider Container */}
            <div className="relative reveal-on-scroll">
                <div className="overflow-hidden">
                    <div 
                        className="flex transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * (100 / itemsPerScreen)}%)` }}
                    >
                        {EXTENDED_REVIEWS.map((review, i) => (
                            <div 
                                key={review.id}
                                className="flex-shrink-0 px-4"
                                style={{ width: `${100 / itemsPerScreen}%` }}
                            >
                                <div className="h-full bg-surface/30 backdrop-blur-sm p-8 rounded-2xl border border-white/5 relative hover:border-white/20 transition-colors shadow-lg">
                                    <Quote className="absolute top-6 right-6 text-primary/20" size={40} />
                                    <div className="flex items-center gap-1 mb-4 text-accent">
                                        {[...Array(5)].map((_, starIndex) => (
                                            <Star 
                                                key={starIndex} 
                                                size={16} 
                                                fill={starIndex < review.rating ? "currentColor" : "none"} 
                                                className={starIndex >= review.rating ? "text-gray-600" : ""}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-300 italic mb-6 leading-relaxed line-clamp-3">"{review.comment}"</p>
                                    <div className="flex items-center gap-3 mt-auto">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-gray-400">
                                            {review.user.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{review.user}</div>
                                            <div className="text-xs text-gray-500">{review.date}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Slider Indicators */}
                <div className="flex justify-center mt-10 gap-2">
                    {Array.from({ length: EXTENDED_REVIEWS.length - itemsPerScreen + 1 }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                currentSlide === idx 
                                ? 'w-8 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.6)]' 
                                : 'w-2 bg-gray-600 hover:bg-gray-400'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};
