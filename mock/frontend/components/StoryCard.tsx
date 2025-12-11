import React from 'react';
import { Star, Clock, GitBranch, Calendar, Users } from 'lucide-react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  return (
    <div
      className='group relative bg-surface rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:-translate-y-2 hover:scale-[1.02] cursor-pointer'
      onClick={onClick}
    >
      {/* Image Container */}
      <div className='relative aspect-video overflow-hidden'>
        <img
          src={story.coverImage}
          alt={story.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${story.comingSoon ? 'grayscale-[50%]' : ''}`}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80' />

        {/* Badges */}
        <div className='absolute top-3 left-3 flex gap-2 flex-wrap'>
          {story.comingSoon ? (
            <span className='px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1'>
              <Calendar size={12} />
              เร็วๆ นี้
            </span>
          ) : (
            <>
              {story.isNew && (
                <span className='px-2 py-1 bg-secondary text-white text-xs font-bold rounded shadow-lg animate-pulse-slow'>
                  ใหม่
                </span>
              )}
              {story.isPopular && (
                <span className='px-2 py-1 bg-accent text-black text-xs font-bold rounded shadow-lg'>
                  ฮิต
                </span>
              )}
            </>
          )}
        </div>

        <div className='absolute bottom-3 left-3'>
          <span className='px-2 py-0.5 bg-black/50 backdrop-blur text-gray-200 text-xs rounded border border-white/10'>
            {story.genre}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className='p-5'>
        <h3 className='text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1'>
          {story.title}
        </h3>
        <p className='text-gray-400 text-sm mb-4 line-clamp-2'>{story.description}</p>

        {/* Stats */}
        <div className='flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3'>
          {story.comingSoon ? (
            <div className='w-full flex items-center justify-between text-primary font-medium'>
              <span className='flex items-center gap-1'>เปิดให้เล่น: {story.launchDate}</span>
            </div>
          ) : (
            <>
              <div className='flex items-center gap-1' title='Rating'>
                <Star size={14} className='text-accent' />
                <span>{story.rating}</span>
              </div>
              <div className='flex items-center gap-1' title='ผู้เล่น'>
                <Users size={14} />
                <span>{story.totalPlayers ? story.totalPlayers.toLocaleString() : 0}</span>
              </div>
              <div className='flex items-center gap-1' title='ความยาว'>
                <Clock size={14} />
                <span>{story.duration}</span>
              </div>
              <div className='flex items-center gap-1' title='ฉากจบ'>
                <GitBranch size={14} />
                <span>{story.totalEndings} จบ</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
