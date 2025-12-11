"use client";

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useEffect } from 'react';
import { REFILL_INTERVAL_MS, SYSTEM_ACHIEVEMENTS } from './constants';
import type { User } from './types';

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  toggleFavorite: (storyId: string) => void;
  markStoryPlayed: (storyId: string) => void;
  addRatingBonus: (storyId: string) => boolean;
  spendCredit: () => boolean;
  startSignup: (payload: SignupPayload) => Promise<void>;
  verifySignupOtp: (code: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyResetOtp: (code: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  pendingSignupEmail: string | null;
  resetEmail: string | null;
};

const OTP_CODE = '123456';
const BASE_ACHIEVEMENTS = ['first_step', 'critic'];

const delay = (ms: number = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateMaxCredits = (achievements: string[], isGuest?: boolean) => {
  if (isGuest) return 10;
  const base = 20;
  const bonus = achievements.reduce((total, id) => {
    const achievement = SYSTEM_ACHIEVEMENTS.find((item) => item.id === id);
    if (achievement && 'creditBonus' in achievement) {
      return total + Number(achievement.creditBonus ?? 0);
    }
    return total;
  }, 0);
  return base + bonus;
};

const createUser = ({
  name,
  email,
  isGuest = false,
}: {
  name: string;
  email: string;
  isGuest?: boolean;
}): User => {
  const achievements = isGuest ? [] : BASE_ACHIEVEMENTS;
  const maxCredits = calculateMaxCredits(achievements, isGuest);

  return {
    id: `${isGuest ? 'guest' : 'user'}-${Date.now()}`,
    name,
    email,
    avatar: '',
    achievements,
    playedStories: ['1'],
    endingsUnlocked: 0,
    favorites: [],
    isGuest,
    credits: maxCredits,
    maxCredits,
    lastRefillTime: Date.now(),
    ratedStoriesForBonus: [],
  };
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingSignup, setPendingSignup] = useState<SignupPayload | null>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [resetOtpVerified, setResetOtpVerified] = useState(false);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  const login = useCallback(async (email: string, password: string) => {
    await delay();
    if (!email || !password) {
      throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
    }
    if (email.toLowerCase().includes('fail')) {
      throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    setUser(createUser({ name: email.split('@')[0] || 'ผู้ใช้', email }));
  }, []);

  const loginAsGuest = useCallback(() => {
    setUser(createUser({ name: 'ผู้เยี่ยมชม (Guest)', email: 'guest@chronos.app', isGuest: true }));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const startSignup = useCallback(async (payload: SignupPayload) => {
    if (!payload.name || !payload.email || !payload.password) {
      throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    if (payload.password.length < 8) {
      throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    }
    await delay(500);
    setPendingSignup(payload);
  }, []);

  const verifySignupOtp = useCallback(
    async (code: string) => {
      await delay();
      if (!pendingSignup) {
        throw new Error('กรุณากรอกข้อมูลสมัครสมาชิกก่อน');
      }
      if (code !== OTP_CODE) {
        throw new Error('รหัส OTP ไม่ถูกต้อง');
      }
      setUser(createUser({ name: pendingSignup.name, email: pendingSignup.email }));
      setPendingSignup(null);
    },
    [pendingSignup],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!email) {
      throw new Error('กรุณากรอกอีเมล');
    }
    await delay(500);
    setResetEmail(email);
    setResetOtpVerified(false);
  }, []);

  const verifyResetOtp = useCallback(
    async (code: string) => {
      await delay();
      if (!resetEmail) {
        throw new Error('กรุณากรอกอีเมลก่อน');
      }
      if (code !== OTP_CODE) {
        throw new Error('รหัส OTP ไม่ถูกต้อง');
      }
      setResetOtpVerified(true);
    },
    [resetEmail],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      if (!resetEmail) {
        throw new Error('กรุณากรอกอีเมลก่อน');
      }
      if (!resetOtpVerified) {
        throw new Error('กรุณายืนยันรหัส OTP ก่อน');
      }
      if (password.length < 8) {
        throw new Error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      }
      await delay();
      setResetEmail(null);
      setResetOtpVerified(false);
    },
    [resetEmail, resetOtpVerified],
  );

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((previous) => {
      if (!previous) return previous;

      const achievements = updates.achievements ?? previous.achievements;
      const isGuest = updates.isGuest ?? previous.isGuest;
      const maxCredits = calculateMaxCredits(achievements, isGuest);
      const credits = Math.min(updates.credits ?? previous.credits, maxCredits);

      return {
        ...previous,
        ...updates,
        achievements,
        isGuest,
        credits,
        maxCredits,
      };
    });
  }, []);

  const toggleFavorite = useCallback((storyId: string) => {
    setUser((previous) => {
      if (!previous) return previous;
      const exists = previous.favorites.includes(storyId);
      const favorites = exists
        ? previous.favorites.filter((id) => id !== storyId)
        : [...previous.favorites, storyId];

      return { ...previous, favorites };
    });
  }, []);

  const markStoryPlayed = useCallback((storyId: string) => {
    setUser((previous) => {
      if (!previous) return previous;
      if (previous.playedStories.includes(storyId)) return previous;
      return { ...previous, playedStories: [...previous.playedStories, storyId] };
    });
  }, []);

  const addRatingBonus = useCallback(
    (storyId: string) => {
      let applied = false;
      setUser((previous) => {
        if (!previous) return previous;
        if (previous.ratedStoriesForBonus.includes(storyId)) return previous;

        const nextRated = [...previous.ratedStoriesForBonus, storyId];
        const achievements = previous.achievements.includes('critic')
          ? previous.achievements
          : [...previous.achievements, 'critic'];
        const maxCredits = calculateMaxCredits(achievements, previous.isGuest);
        const credits = Math.min(previous.credits + 5, maxCredits);

        applied = true;
        return { ...previous, ratedStoriesForBonus: nextRated, achievements, maxCredits, credits };
      });
      return applied;
    },
    [],
  );

  const spendCredit = useCallback(() => {
    let success = false;
    setUser((previous) => {
      if (!previous) return previous;
      if (previous.credits <= 0) return previous;
      success = true;
      return {
        ...previous,
        credits: previous.credits - 1,
        lastRefillTime: previous.credits === previous.maxCredits ? Date.now() : previous.lastRefillTime,
      };
    });
    return success;
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    if (user.credits >= user.maxCredits) return undefined;

    const interval = setInterval(() => {
      setUser((previous) => {
        if (!previous) return previous;
        if (previous.credits >= previous.maxCredits) return previous;

        const now = Date.now();
        const elapsed = now - previous.lastRefillTime;
        if (elapsed < REFILL_INTERVAL_MS) return previous;

        const creditsToAdd = Math.floor(elapsed / REFILL_INTERVAL_MS);
        if (creditsToAdd <= 0) return previous;

        const newCredits = Math.min(previous.maxCredits, previous.credits + creditsToAdd);
        const remainder = elapsed % REFILL_INTERVAL_MS;
        const nextRefillTime = now - remainder;

        return { ...previous, credits: newCredits, lastRefillTime: nextRefillTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      user,
      login,
      loginAsGuest,
      logout,
      updateUser,
      toggleFavorite,
      markStoryPlayed,
      addRatingBonus,
      spendCredit,
      startSignup,
      verifySignupOtp,
      requestPasswordReset,
      verifyResetOtp,
      updatePassword,
      pendingSignupEmail: pendingSignup?.email ?? null,
      resetEmail,
    }),
    [
      isAuthenticated,
      login,
      loginAsGuest,
      logout,
      updateUser,
      toggleFavorite,
      markStoryPlayed,
      addRatingBonus,
      spendCredit,
      pendingSignup?.email,
      requestPasswordReset,
      resetEmail,
      startSignup,
      updatePassword,
      user,
      verifyResetOtp,
      verifySignupOtp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
