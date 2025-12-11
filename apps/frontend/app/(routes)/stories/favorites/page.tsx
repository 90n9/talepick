"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, LogIn, Search, Sparkles } from "lucide-react";
import StoryCard from "@ui/StoryCard";
import { MOCK_STORIES } from "@lib/constants";
import { useAuth } from "@lib/auth-context";
import type { Story } from "@lib/types";

export default function FavoriteStoriesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const favorites = useMemo(() => {
    if (!user) return [] as Story[];
    return user.favorites
      .map((id) => MOCK_STORIES.find((story) => story.id === id))
      .filter(Boolean) as Story[];
  }, [user]);

  const filteredFavorites = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    if (!normalizedSearch) return favorites;
    return favorites.filter((story) => story.title.toLowerCase().includes(normalizedSearch));
  }, [favorites, searchQuery]);

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-surface/70 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
            <LogIn />
          </div>
          <h1 className="text-2xl font-serif font-bold">เข้าสู่ระบบเพื่อดูรายการโปรด</h1>
          <p className="mt-2 text-sm text-gray-400">บันทึกนิยายที่คุณชอบและกลับมาเล่นต่อได้ง่าย</p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push("/auth/login?redirect=/stories/favorites")}
              className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition hover:bg-blue-600"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 -top-10 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-20 -right-10 h-96 w-96 rounded-full bg-secondary/15 blur-[140px]" />
      </div>

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-primary shadow-[0_0_20px_rgba(59,130,246,0.25)]">
            <Sparkles size={16} />
            <span>เรื่องราวที่คุณชื่นชอบ</span>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-white sm:text-5xl">รายการโปรด</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">เก็บนิยายที่อยากกลับมาเล่นอีกครั้งไว้ที่นี่</p>
        </div>

        <div className="mb-10 rounded-2xl border border-white/10 bg-surface/40 p-4 backdrop-blur sm:p-6">
          <div className="group relative w-full lg:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-primary"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ค้นหาในรายการโปรด..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-10 py-3 text-white placeholder:text-gray-600 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 pb-20 md:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map((story, index) => (
              <div
                key={story.id}
                className="opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <StoryCard story={story} onClick={() => router.push(`/stories/${story.id}`)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 border-dashed bg-white/5 py-20 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white/5 p-4">
              <Heart size={48} className="text-gray-600" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">ยังไม่มีนิยายในรายการโปรด</h3>
            <p className="text-gray-500">กลับไปเลือกนิยายที่ถูกใจจากคลังแล้วกดเพิ่มลงรายการโปรด</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => router.push("/stories")}
                className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_0_18px_rgba(59,130,246,0.35)] transition hover:bg-blue-600"
              >
                ไปยังคลังนิยาย
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
