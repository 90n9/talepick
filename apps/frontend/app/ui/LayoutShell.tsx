"use client";

import Link from "next/link";
import { ReactNode, useEffect, useRef, useState } from "react";
import { APP_NAME, APP_VERSION, REFILL_INTERVAL_MS } from "@lib/constants";
import {
  ChevronDown,
  Edit3,
  Heart,
  LogIn,
  LogOut,
  Menu,
  Settings,
  UserIcon,
  X,
  Zap,
} from "lucide-react";

type LayoutShellProps = {
  children: ReactNode;
};

const navLinks = [
  { href: "/stories", label: "คลังนิยาย" },
  { href: "/oracle", label: "เทพพยากรณ์" },
  { href: "/support", label: "สนับสนุน" },
];

export default function LayoutShell({ children }: LayoutShellProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [nextRefill, setNextRefill] = useState<string>("");

  // TODO: find the current page value for set current navbar
  const currentPage = "";

  // TODO: check login status
  const isAuthenticated = false;

  // TODO: get user profile from database
  const user = {
    name: "GongIdeas",
    avatar: undefined,
    email: "contact@gongideas.com",
    credits: 10,
    maxCredits: 20,
    lastRefillTime: Date.now(),
  };

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate Countdown
  useEffect(() => {
    if (!user || user.credits >= user.maxCredits) {
      setNextRefill("");
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLast = now - user.lastRefillTime;
      const timeRemaining = Math.max(0, REFILL_INTERVAL_MS - timeSinceLast);

      if (timeRemaining > 0) {
        const m = Math.floor(timeRemaining / 60000);
        const s = Math.floor((timeRemaining % 60000) / 1000);
        setNextRefill(`${m}:${s.toString().padStart(2, "0")}`);
      } else {
        setNextRefill(""); // ready to refill
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user?.credits, user?.lastRefillTime, user?.maxCredits]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-100 bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${
          isScrolled
            ? "bg-black/80 backdrop-blur-xl border-white/10 shadow-lg py-2"
            : "bg-transparent border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* 1. Logo Section */}
            <Link
              href="/"
              className="flex-shrink-0 cursor-pointer group flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
                T
              </div>
              <h1 className="text-xl md:text-2xl font-serif font-bold tracking-[0.15em] text-white group-hover:text-primary transition-colors">
                {APP_NAME}
              </h1>
            </Link>

            {/* 2. Desktop Navigation (Centered) */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-baseline space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
                      currentPage === link.href
                        ? "text-white bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                        : "text-gray-300 hover:text-white hover:bg-white/5 drop-shadow-md"
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {currentPage === link.href && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]"></span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Auth Buttons / User Profile (Right) */}
            <div className="hidden lg:flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  {/* Credit Display */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 cursor-pointer"
                    title={`รีฟิล 1 เครดิตทุก 5 นาที (${user.credits}/${user.maxCredits})`}
                  >
                    <Zap
                      size={16}
                      className={`${
                        user.credits > 0 ? "text-accent" : "text-red-500"
                      } ${
                        user.credits < user.maxCredits ? "animate-pulse" : ""
                      }`}
                      fill="currentColor"
                    />
                    <span
                      className={`text-sm font-bold font-mono ${
                        user.credits === 0 ? "text-red-500" : "text-white"
                      }`}
                    >
                      {user.credits}/{user.maxCredits}
                    </span>
                    {user.credits < user.maxCredits && (
                      <span className="text-[10px] text-gray-400 font-mono ml-1 border-l border-white/10 pl-2 min-w-[32px]">
                        {nextRefill}
                      </span>
                    )}
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/20 transition-all group backdrop-blur-sm cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-sm font-bold text-white shadow-md">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-gray-400 transition-transform duration-300 ${
                          isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* User Dropdown Menu */}
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 rounded-xl bg-[#1a1d26] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden animate-scale-in origin-top-right z-50">
                        <div className="px-4 py-4 border-b border-white/5 bg-white/5">
                          <p className="text-sm font-bold text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user.email || "Guest User"}
                          </p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <UserIcon size={16} /> โปรไฟล์
                          </Link>
                          <Link
                            href="/wishlist"
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Heart size={16} /> รายการโปรด
                          </Link>
                        </div>
                        <div className="border-t border-white/5 py-2">
                          <Link
                            href="auth/logout"
                            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <LogOut size={16} /> ออกจากระบบ
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="group relative px-6 py-2 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-2">
                    <LogIn
                      size={16}
                      className="text-primary group-hover:text-white transition-colors"
                    />
                    <span className="text-sm font-bold text-white shadow-sm">
                      เข้าสู่ระบบ
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-4">
              {isAuthenticated && (
                <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 border border-white/5">
                    <Zap
                      size={14}
                      className={`${
                        user && user.credits > 0
                          ? "text-accent"
                          : "text-red-500"
                      }`}
                      fill="currentColor"
                    />
                    <span className="text-xs font-bold font-mono text-white">
                      {user?.credits}
                    </span>
                    {user && user.credits < user.maxCredits && (
                      <span className="text-[9px] text-gray-400 font-mono ml-1 border-l border-white/10 pl-1">
                        {nextRefill}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/profile"
                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-sm font-bold text-white cursor-pointer active:scale-95 transition-transform"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user?.name.charAt(0)
                    )}
                  </Link>
                </div>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div
          className={`lg:hidden absolute top-full left-0 w-full bg-[#0F1117]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`block w-full text-left px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  currentPage === link.href
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-white/5 my-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit3 size={18} />
                    แก้ไขโปรไฟล์
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <Heart size={18} />
                    รายการโปรด
                  </Link>
                  <Link
                    href="/auth/logout"
                    className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    ออกจากระบบ
                  </Link>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold bg-white text-black mt-2"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-0">{children}</main>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                C
              </div>
              {APP_NAME}
            </h2>
            <p className="text-gray-400 max-w-sm">
              เปิดประสบการณ์การเล่าเรื่องแบบ Interactive
              ที่ทุกทางเลือกของคุณมีความหมาย กำหนดชะตากรรมของคุณเองในโลกแฟนตาซี
              ไซไฟ และสยองขวัญ
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              แพลตฟอร์ม
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/stories"
                  className="text-gray-300 hover:text-primary transition text-sm drop-shadow-md"
                >
                  เลือกดูนิยาย
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-gray-300 hover:text-primary transition text-sm drop-shadow-md"
                >
                  สนับสนุนเรา
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-use"
                  className="text-gray-300 hover:text-primary transition text-sm drop-shadow-md"
                >
                  ข้อตกลงการใช้งาน
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-300 hover:text-primary transition text-sm drop-shadow-md"
                >
                  นโยบายความเป็นส่วนตัว
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              เชื่อมต่อ
            </h3>
            <div className="flex space-x-4">
              <button className="text-gray-500 hover:text-blue-400 transition">
                Twitter
              </button>
              <button className="text-gray-500 hover:text-pink-600 transition">
                Instagram
              </button>
              <button className="text-gray-500 hover:text-indigo-500 transition">
                Discord
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-600 text-sm border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 px-4 sm:px-8 lg:px-12">
          <span>&copy; 2024 {APP_NAME} Entertainment. สงวนลิขสิทธิ์</span>
          <span
            className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-gray-500 hover:text-gray-400 transition-colors cursor-default"
            title="เวอร์ชันระบบ"
          >
            {APP_VERSION}
          </span>
        </div>
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header
        className={`sticky top-0 z-20 border-b transition-all ${
          isScrolled
            ? "border-white/10 bg-slate-950/80 shadow-lg shadow-black/30 backdrop-blur"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-cyan-500 text-lg font-bold text-white shadow-md">
              C
            </span>
            <span className="font-serif text-xl">{APP_NAME}</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-200 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full py-10">{children}</main>

      <footer className="border-t border-white/10 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 text-sm text-slate-300 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-bold text-white">
                C
              </span>
              <span className="font-serif text-lg">{APP_NAME}</span>
            </div>
            <p className="mt-3 max-w-md text-slate-200">
              เปิดประสบการณ์การเล่าเรื่องแบบ Interactive
              ที่ทุกทางเลือกของคุณมีความหมาย กำหนดชะตากรรมของคุณเองในโลกแฟนตาซี
              ไซไฟ และสยองขวัญ
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              แพลตฟอร์ม
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/stories" className="hover:text-white">
                เลือกดูนิยาย
              </Link>
              <Link href="/support" className="hover:text-white">
                สนับสนุนเรา
              </Link>
              <Link href="/terms-of-use" className="hover:text-white">
                ข้อตกลงการใช้งาน
              </Link>
              <Link href="/privacy-policy" className="hover:text-white">
                นโยบายความเป็นส่วนตัว
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              เชื่อมต่อ
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <span className="text-slate-500">Twitter</span>
              <span className="text-slate-500">Instagram</span>
              <span className="text-slate-500">Discord</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-slate-950/90">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2024 {APP_NAME} Entertainment. สงวนลิขสิทธิ์</span>
            <span className="rounded bg-white/5 px-2 py-1 font-mono text-slate-300">
              เวอร์ชัน {APP_VERSION}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
