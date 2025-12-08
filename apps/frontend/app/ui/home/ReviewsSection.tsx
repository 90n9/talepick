"use client";

import { useEffect, useState } from "react";
import { MOCK_REVIEWS } from "@lib/constants";
import { Quote, Star } from "lucide-react";

const reviews = [
  ...MOCK_REVIEWS,
  {
    id: "legacy-4",
    user: "ShadowWalker",
    rating: 5,
    comment: "บรรยากาศเกมทำให้รู้สึกเหมือนอยู่ในหนัง Sci-fi ยุค 80s จริงๆ",
    date: "2023-10-20",
  },
  {
    id: "legacy-5",
    user: "Luna_Love",
    rating: 4,
    comment: "ตัวละครมีมิติมาก อยากให้มีรูทโรแมนติกเพิ่มอีกหน่อยค่ะ",
    date: "2023-10-22",
  },
  {
    id: "legacy-6",
    user: "PixelMaster",
    rating: 5,
    comment: "Effect ตอนเลือก Choice คือเท่มาก UI สวยสะอาดตา",
    date: "2023-10-25",
  },
];

export default function ReviewsSection() {
  const [index, setIndex] = useState(0);
  const visible = 3;
  const maxIndex = Math.max(0, reviews.length - visible);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [maxIndex]);

  return (
    <section className="relative py-24 bg-gradient-to-b from-transparent to-black/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-4xl font-serif font-bold text-white mb-4">
            เสียงจากนักเดินทาง
          </h2>
          <p className="text-gray-400">
            สิ่งที่ผู้เล่นพูดถึงเกี่ยวกับการผจญภัยของพวกเขา
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative reveal-on-scroll">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${index * (100 / visible)}%)` }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="shrink-0 px-4"
                  style={{ width: `${100 / visible}%` }}
                >
                  <div className="h-full bg-surface/30 backdrop-blur-sm p-8 rounded-2xl border border-white/5 relative hover:border-white/20 transition-colors shadow-lg">
                    <Quote
                      className="absolute top-6 right-6 text-primary/20"
                      size={40}
                    />
                    <div className="flex items-center gap-1 mb-4 text-accent">
                      {[...Array(5)].map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={16}
                          fill={
                            starIndex < review.rating ? "currentColor" : "none"
                          }
                          className={
                            starIndex >= review.rating ? "text-gray-600" : ""
                          }
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 italic mb-6 leading-relaxed line-clamp-3">
                      &quot;{review.comment}&quot;
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-gray-400">
                        {review.user.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {review.user}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
