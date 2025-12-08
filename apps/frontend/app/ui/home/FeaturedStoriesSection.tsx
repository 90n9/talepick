"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import StoryCard from "../StoryCard";
import type { Story } from "@lib/types";

type FeaturedStoriesSectionProps = {
  stories: Story[];
  scrollY: number;
};

export default function FeaturedStoriesSection({
  stories,
  scrollY,
}: FeaturedStoriesSectionProps) {
  const router = useRouter();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
      {/* Floating Background Elements */}
      <div
        className="absolute top-20 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"
        style={{ transform: `translateY(${-scrollY * 0.1}px)` }}
      />
      <div
        className="absolute bottom-20 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"
        style={{ transform: `translateY(${-scrollY * 0.15}px)` }}
      />

      <div className="flex justify-between items-end mb-16 reveal-on-scroll">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2 font-serif">
            เรื่องราวแนะนำ
          </h2>
          <p className="text-gray-400 text-lg">
            คัดสรรการผจญภัยสุดพิเศษมาเพื่อคุณ
          </p>
        </div>
        <Link
          href="/stories"
          className="text-primary hover:text-white transition-colors text-sm font-semibold tracking-widest uppercase border-b border-primary/50 pb-1"
        >
          ดูทั้งหมด →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-1000">
        {stories.map((story, index) => (
          <div
            key={story.id}
            className="reveal-on-scroll"
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <StoryCard
              story={story}
              onClick={() => router.push(`/stories/${story.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
