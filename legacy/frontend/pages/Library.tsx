import React, { useState } from 'react';
import { Search, Filter, Heart, Sparkles } from 'lucide-react';
import { StoryCard } from '../components/StoryCard';
import { MOCK_STORIES } from '../constants';
import { Story } from '../types';

interface LibraryProps {
  onSelectStory: (story: Story) => void;
  onlyFavorites?: boolean;
  favoriteIds?: string[];
}

export const Library: React.FC<LibraryProps> = ({ 
  onSelectStory, 
  onlyFavorites = false, 
  favoriteIds = [] 
}) => {
  const [filter, setFilter] = useState('ทั้งหมด');
  const [search, setSearch] = useState('');

  const genres = ['ทั้งหมด', 'ไซไฟ', 'แฟนตาซี', 'สยองขวัญ', 'ระทึกขวัญ', 'คอมเมดี้'];

  const filteredStories = MOCK_STORIES.filter(story => {
    // 1. Filter by favorites if mode is enabled
    if (onlyFavorites && !favoriteIds.includes(story.id)) {
        return false;
    }

    // 2. Filter by Genre
    const matchesGenre = filter === 'ทั้งหมด' || story.genre === filter;

    // 3. Filter by Search
    const matchesSearch = story.title.toLowerCase().includes(search.toLowerCase());

    return matchesGenre && matchesSearch;
  });

  return (
    <div className="pt-24 min-h-screen px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-serif font-bold text-white mb-4">
          {onlyFavorites ? 'รายการโปรดของฉัน' : 'คลังนิยาย'}
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {onlyFavorites 
            ? 'รวบรวมการผจญภัยที่คุณประทับใจไว้ที่นี่' 
            : 'ค้นพบเรื่องราวใหม่ๆ จากหลากหลายแนวที่เราคัดสรรมาเพื่อคุณ'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 justify-between items-center bg-surface/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        {/* Search */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text"
            placeholder="ค้นหาชื่อเรื่อง..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-gray-600"
          />
        </div>

        {/* Filters */}
        {!onlyFavorites && (
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setFilter(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  filter === genre 
                    ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredStories.map((story, index) => (
            <div 
              key={story.id} 
              className="animate-slide-up-fade fill-mode-forwards opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StoryCard 
                story={story} 
                onClick={() => onSelectStory(story)} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
          <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
             {onlyFavorites ? <Heart size={48} className="text-gray-600" /> : <Filter size={48} className="text-gray-600" />}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">ไม่พบนิยายที่คุณตามหา</h3>
          <p className="text-gray-500">
            {onlyFavorites 
              ? 'คุณยังไม่มีรายการโปรด ลองกลับไปที่คลังนิยายแล้วกดหัวใจดูสิ' 
              : 'ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองดูใหม่อีกครั้ง'}
          </p>
        </div>
      )}
    </div>
  );
};