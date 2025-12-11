'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Flag, MessageSquare, X } from 'lucide-react';
import { createPortal } from 'react-dom';

type ReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
  title: string;
  targetType?: 'story' | 'review';
  contentPreview?: string;
};

const REASONS = [
  { id: 'inappropriate', label: 'เนื้อหาไม่เหมาะสม / รุนแรง / หยาบคาย' },
  { id: 'spam', label: 'สแปม หรือ โฆษณา' },
  { id: 'spoiler', label: 'สปอยล์เนื้อหา (สำหรับความคิดเห็น)' },
  { id: 'harassment', label: 'การคุกคาม หรือ กลั่นแกล้ง' },
  { id: 'other', label: 'อื่นๆ' },
] as const;

export default function ReportModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  targetType = 'story',
  contentPreview,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>('inappropriate');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => {
      setReason('inappropriate');
      setDescription('');
      setSubmitting(false);
    });
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const reasons = useMemo(
    () => REASONS.filter((r) => (targetType === 'story' ? r.id !== 'spoiler' : true)),
    [targetType]
  );

  if (!isOpen || typeof document === 'undefined') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    onSubmit(reason, description.trim());
    setSubmitting(false);
  };

  const modal = (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur'>
      <div className='relative w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900/85 p-6 text-white shadow-2xl'>
        <button
          onClick={onClose}
          className='absolute right-3 top-3 rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white'
          aria-label='Close'
        >
          <X size={18} />
        </button>

        <div className='mb-6 flex items-center gap-3 border-b border-white/10 pb-4'>
          <div className='rounded-full bg-red-500/10 p-3 text-red-400'>
            <Flag size={20} />
          </div>
          <div>
            <h2 className='text-lg font-semibold'>
              {targetType === 'story' ? 'รายงานปัญหาเรื่องราว' : 'รายงานความคิดเห็น'}
            </h2>
            <p className='text-xs text-gray-300'>
              {targetType === 'story' ? 'เรื่อง:' : 'ผู้เขียน:'}{' '}
              <span className='font-medium'>“{title}”</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-5 text-sm text-gray-100'>
          {targetType === 'review' && contentPreview && (
            <div className='flex gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-gray-200'>
              <MessageSquare size={16} className='mt-0.5 text-gray-400' />
              <span className='line-clamp-2'>“{contentPreview}”</span>
            </div>
          )}

          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-gray-300'>
              หัวข้อการรายงาน
            </p>
            <div className='grid grid-cols-1 gap-2'>
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                    reason === r.id
                      ? 'border-red-400/60 bg-red-500/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <input
                    type='radio'
                    name='reason'
                    value={r.id}
                    checked={reason === r.id}
                    onChange={(e) => setReason(e.target.value)}
                    className='h-4 w-4 accent-red-500'
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className='mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-300'>
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='โปรดอธิบายเหตุผลที่คุณรายงานโพสต์นี้...'
              className='h-24 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-white outline-none placeholder:text-gray-500 focus:border-red-400 focus:ring-1 focus:ring-red-400'
            />
          </div>

          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-gray-200 transition hover:bg-white/10'
            >
              ยกเลิก
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {submitting ? 'กำลังส่ง...' : 'ส่งรายงาน'}
            </button>
          </div>
        </form>

        <div className='mt-5 flex items-start gap-2 rounded-lg bg-white/5 p-3 text-xs text-gray-300'>
          <AlertTriangle size={14} className='mt-0.5 text-yellow-400' />
          <p>ทีมงานจะตรวจสอบรายงานของคุณภายใน 24 ชั่วโมง</p>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
