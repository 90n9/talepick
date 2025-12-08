"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Lock, User, X } from 'lucide-react';
import { SYSTEM_AVATARS } from '@lib/constants';
import type { User as UserType } from '@lib/types';

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (data: { name: string; avatar: string }) => void;
};

export default function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      setName(user.name);
      setAvatar(user.avatar);
      setSaving(false);
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen, user.name, user.avatar]);

  const avatars = useMemo(() => SYSTEM_AVATARS, []);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSave = () => {
    setSaving(true);
    onSave({ name: name.trim(), avatar });
    setSaving(false);
    onClose();
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/90 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={18} />
            <h2 className="text-lg font-semibold text-neutral-900">แก้ไขโปรไฟล์</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 text-lg font-semibold text-neutral-700">
            {avatar ? (
              <Image src={avatar} alt="avatar" fill className="object-cover" sizes="80px" />
            ) : (
              name.charAt(0)
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">ชื่อที่แสดง</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">เลือกรูปโปรไฟล์</p>
            <div className="grid grid-cols-4 gap-3">
              {avatars.map((av) => {
                const unlocked =
                  av.type === 'free' || (av.type === 'unlock' && user.playedStories.includes(av.requiredStoryId ?? ''));
                const selected = avatar === av.src;
                return (
                  <button
                    key={av.id}
                    type="button"
                    disabled={!unlocked}
                    onClick={() => unlocked && setAvatar(av.src)}
                    className={`relative aspect-square overflow-hidden rounded-lg border transition ${
                      selected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-neutral-200'
                    } ${!unlocked ? 'cursor-not-allowed opacity-40' : 'hover:border-indigo-400'}`}
                    title={!unlocked ? av.hint : av.name}
                  >
                    <Image
                      src={av.src}
                      alt={av.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    {!unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                        <Lock size={14} />
                      </div>
                    )}
                    {selected && (
                      <div className="absolute right-1 top-1 rounded-full bg-indigo-500 p-1 text-white">
                        <Check size={10} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="หรือวางลิงก์รูปภาพ"
              className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            disabled={saving || !name.trim()}
            onClick={handleSave}
            className="flex-1 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
