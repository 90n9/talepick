"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search, Sparkles } from "lucide-react";
import StoryCard from "@ui/StoryCard";
import { MOCK_STORIES } from "@lib/constants";
import type { Story } from "@lib/types";

const GENRES = ["ทั้งหมด", "ไซไฟ", "แฟนตาซี", "สยองขวัญ", "ระทึกขวัญ", "คอมเมดี้"];

export default function StoriesPage() {
  const router = useRouter();
  const [activeGenre, setActiveGenre] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStories = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return MOCK_STORIES.filter((story) => {
      const matchesGenre = activeGenre === "ทั้งหมด" || story.genre === activeGenre;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        story.title.toLowerCase().includes(normalizedSearch);

      return matchesGenre && matchesSearch;
    });
  }, [activeGenre, searchQuery]);

  const handleStorySelect = (story: Story) => {
    router.push(`/stories/${story.id}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-10 -top-10 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-20 -right-10 h-96 w-96 rounded-full bg-secondary/15 blur-[140px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]">
            <Sparkles size={16} />
            <span>เลือกเส้นทางการผจญภัย</span>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl">
            คลังนิยาย
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            ค้นพบเรื่องราวใหม่ๆ จากหลากหลายแนวที่เราคัดสรรมาเพื่อคุณ
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-white/10 bg-surface/40 p-4 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="group relative w-full lg:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-primary"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ค้นหาชื่อเรื่อง..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-10 py-3 text-white placeholder:text-gray-600 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex w-full gap-2 overflow-x-auto pb-2 lg:w-auto lg:pb-0 [scrollbar-width:none] [-ms-overflow-style:none]">
              {GENRES.map((genre) => {
                const isActive = genre === activeGenre;
                return (
                  <button
                    key={genre}
                    onClick={() => setActiveGenre(genre)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "border-primary bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                        : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 pb-20 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story, index) => (
              <div
                key={story.id}
                className="opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <StoryCard story={story} onClick={() => handleStorySelect(story)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 border-dashed bg-white/5 py-20 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/5 p-4">
              <Filter size={48} className="text-gray-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">ไม่พบนิยายที่คุณตามหา</h3>
            <p className="text-gray-500">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองดูใหม่อีกครั้ง</p>
          </div>
        )}
      </section>
    </main>
  );
}
