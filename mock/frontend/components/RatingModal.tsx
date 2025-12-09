import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  storyTitle: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, storyTitle }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    // Reset form
    setRating(0);
    setComment('');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1a1d26] border border-white/10 rounded-2xl shadow-2xl p-6 animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-serif font-bold text-white mb-2 text-center">ให้คะแนนเรื่องราว</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">
          คุณคิดอย่างไรกับ <span className="text-primary font-semibold">"{storyTitle}"</span>?
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 focus:outline-none p-1"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={32} 
                  className={`transition-colors duration-200 ${
                    star <= (hoverRating || rating) 
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                      : 'fill-transparent text-gray-600'
                  }`} 
                />
              </button>
            ))}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              ความคิดเห็น (ไม่บังคับ)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="บอกเล่าความประทับใจของคุณ..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none h-32 placeholder:text-gray-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white font-medium transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              ส่งรีวิว
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};