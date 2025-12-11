'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function SupportSection() {
  return (
    <section className='reveal-on-scroll'>
      <div className='mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 px-6 py-10 backdrop-blur'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <div className='flex items-center gap-2 text-rose-200'>
            <Heart size={18} />
            <span className='text-sm uppercase tracking-wide'>สนับสนุนทีมพัฒนา</span>
          </div>
          <p className='max-w-2xl text-sm text-slate-100'>
            โปรเจกต์นี้ขับเคลื่อนโดยชุมชน ทุกเครดิตและคำแนะนำช่วยให้เราสร้างเรื่องราวใหม่ๆ
            ให้ผู้เล่นได้เลือกเส้นทางมากยิ่งขึ้น
          </p>
          <Link
            href='/support'
            className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:scale-[1.02]'
          >
            สนับสนุนเรา
          </Link>
        </div>
      </div>
    </section>
  );
}
