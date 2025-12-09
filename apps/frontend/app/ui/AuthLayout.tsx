"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { APP_NAME } from '@lib/constants';

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onClose?: () => void;
};

export default function AuthLayout({
  children,
  title,
  subtitle,
  onClose,
}: AuthLayoutProps) {
  const router = useRouter();
  const [videoError, setVideoError] = useState(false);

  const handleClose = useMemo(
    () =>
      onClose ??
      (() => {
        if (typeof window !== 'undefined') {
          const fallback = sessionStorage.getItem('lastNonAuthPath');
          if (fallback && !fallback.startsWith('/auth')) {
            router.push(fallback);
            return;
          }
          if (window.history.length > 1) {
            router.back();
            return;
          }
        }
        router.push('/');
      }),
    [onClose, router],
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white py-12 md:py-16">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2568&auto=format&fit=crop"
          alt="Space Background"
          fill
          priority
          className="object-cover opacity-70"
        />
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            onError={() => setVideoError(true)}
          >
            <source src="https://cdn.pixabay.com/video/2021/04/14/71067-537482590_large.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <button
        onClick={handleClose}
        className="absolute right-6 top-6 z-20 rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:border-white/20 hover:bg-white/20"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block text-3xl font-semibold tracking-wide text-white drop-shadow transition hover:text-primary">
            {APP_NAME}
          </Link>
        </div>

        <div className="space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-200">{subtitle}</p>
          </div>
          <div>{children}</div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} {APP_NAME} Entertainment. สงวนลิขสิทธิ์
        </p>
      </div>
    </div>
  );
}
