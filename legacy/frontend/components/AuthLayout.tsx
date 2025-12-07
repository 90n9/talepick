
import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { X } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onClose?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, onClose }) => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <img
            src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2568&auto=format&fit=crop"
            alt="Space Background"
            className="absolute inset-0 w-full h-full object-cover"
        />
        {!videoError && (
            <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
            onError={() => setVideoError(true)}
            >
             <source src="https://cdn.pixabay.com/video/2021/04/14/71067-537482590_large.mp4" type="video/mp4" />
            </video>
        )}
        {/* Blur & Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/5 hover:border-white/20 hover:scale-105 active:scale-95"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {APP_NAME}
          </h1>
        </div>

        {/* Glass Card */}
        <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          
          {/* Subtle sheen effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="text-center mb-8 relative z-10 animate-slide-up-fade">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
        
        <div className="text-center mt-6 text-xs text-gray-500 animate-slide-up-fade delay-500">
            &copy; {new Date().getFullYear()} {APP_NAME} Entertainment. สงวนลิขสิทธิ์
        </div>
      </div>
    </div>
  );
};
