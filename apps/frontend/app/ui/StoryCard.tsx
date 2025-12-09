"use client";

import Image from "next/image";
import { Calendar, Clock, GitBranch, Star, Users } from "lucide-react";
import type { Story } from "@lib/types";

type StoryCardProps = {
  story: Story;
  onClick?: () => void;
};

export default function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-surface rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:-translate-y-2 hover:scale-[1.02] cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={story.coverImage}
          alt={story.title}
          fill
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            story.comingSoon ? "grayscale-[50%]" : ""
          }`}
          sizes="(min-width: 1024px) 400px, 100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {story.comingSoon ? (
            <span className="px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded shadow-lg flex items-center gap-1">
              <Calendar size={12} />
              เร็วๆ นี้
            </span>
          ) : (
            <>
              {story.isNew && (
                <span className="px-2 py-1 bg-secondary text-white text-xs font-bold rounded shadow-lg animate-pulse-slow">
                  ใหม่
                </span>
              )}
              {story.isPopular && (
                <span className="px-2 py-1 bg-accent text-black text-xs font-bold rounded shadow-lg">
                  ฮิต
                </span>
              )}
            </>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 bg-black/50 backdrop-blur text-gray-200 text-xs rounded border border-white/10">
            {story.genre}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {story.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {story.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
          {story.comingSoon ? (
            <div className="w-full flex items-center justify-between text-primary font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                <span>เปิดให้เล่น:</span>
                <span>{story.launchDate ?? "เร็วๆ นี้"}</span>
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1" title="Rating">
                <Star size={14} className="text-accent" />
                <span>{story.rating}</span>
              </div>
              <div className="flex items-center gap-1" title="ผู้เล่น">
                <Users size={14} />
                <span>{story.totalPlayers ? story.totalPlayers.toLocaleString() : 0}</span>
              </div>
              <div className="flex items-center gap-1" title="ความยาว">
                <Clock size={14} />
                <span>{story.duration}</span>
              </div>
              <div className="flex items-center gap-1" title="ฉากจบ">
                <GitBranch size={14} />
                <span>{story.totalEndings} จบ</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
