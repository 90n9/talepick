"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, X } from 'lucide-react';

type RatingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  storyTitle: string;
};

export default function RatingModal({
  isOpen,
  onClose,
  onSubmit,
  storyTitle,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900/80 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition hover:text-white"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="mb-2 text-center text-2xl font-semibold">ให้คะแนนเรื่องราว</h2>
        <p className="mb-8 text-center text-sm text-gray-300">
          คุณคิดอย่างไรกับ <span className="font-semibold text-indigo-300">&quot;{storyTitle}&quot;</span>?
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition hover:scale-110 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400 drop-shadow'
                      : 'fill-transparent text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-200">
              ความคิดเห็น (ไม่บังคับ)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="บอกเล่าความประทับใจของคุณ..."
              className="h-28 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-gray-500 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="flex-1 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              ส่งรีวิว
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
