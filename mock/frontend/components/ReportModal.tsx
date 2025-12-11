import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Flag, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => void;
  title: string; // Story title or Review User Name
  targetType?: 'story' | 'review'; // Default is story
  contentPreview?: string; // For reviews, show snippet
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  targetType = 'story',
  contentPreview,
}) => {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState('inappropriate');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setReason('inappropriate');
      setDescription('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onSubmit(reason, description);
      setIsLoading(false);
    }, 1000);
  };

  const reportReasons = [
    { id: 'inappropriate', label: 'เนื้อหาไม่เหมาะสม / รุนแรง / หยาบคาย' },
    { id: 'spam', label: 'สแปม หรือ โฆษณา' },
    { id: 'spoiler', label: 'สปอยล์เนื้อหา (สำหรับความคิดเห็น)' },
    { id: 'harassment', label: 'การคุกคาม หรือ กลั่นแกล้ง' },
    { id: 'other', label: 'อื่นๆ' },
  ];

  const modalContent = (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in'>
      <div className='relative w-full max-w-lg bg-[#1a1d26] border border-white/10 rounded-2xl shadow-2xl p-6 animate-scale-in'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full'
        >
          <X size={24} />
        </button>

        <div className='flex items-center gap-3 mb-6 border-b border-white/5 pb-4'>
          <div className='p-3 bg-red-500/10 rounded-full text-red-500'>
            <Flag size={24} />
          </div>
          <div>
            <h2 className='text-xl font-serif font-bold text-white'>
              {targetType === 'story' ? 'รายงานปัญหาเรื่องราว' : 'รายงานความคิดเห็น'}
            </h2>
            <p className='text-xs text-gray-400'>
              {targetType === 'story' ? 'เรื่อง: ' : 'ผู้เขียน: '}
              <span className='text-white font-medium'>"{title}"</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Context Preview (For Reviews) */}
          {targetType === 'review' && contentPreview && (
            <div className='p-3 bg-white/5 rounded-lg border border-white/5 text-sm italic text-gray-300 flex gap-2'>
              <MessageSquare size={16} className='shrink-0 mt-0.5 text-gray-500' />
              <span className='line-clamp-2'>"{contentPreview}"</span>
            </div>
          )}

          {/* Reasons Radio */}
          <div className='space-y-3'>
            <label className='text-sm font-bold text-gray-300 uppercase tracking-wider'>
              หัวข้อการรายงาน
            </label>
            <div className='grid grid-cols-1 gap-2'>
              {reportReasons.map((r) => {
                // Filter out irrelevant reasons based on target type if needed
                if (targetType === 'story' && r.id === 'spoiler') return null;
                if (targetType === 'review' && r.id === 'bug') return null; // Assuming bug was in list

                return (
                  <label
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      reason === r.id
                        ? 'bg-red-500/10 border-red-500/50 text-white'
                        : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type='radio'
                      name='reason'
                      value={r.id}
                      checked={reason === r.id}
                      onChange={(e) => setReason(e.target.value)}
                      className='w-4 h-4 accent-red-500'
                    />
                    <span className='text-sm'>{r.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className='block text-sm font-bold text-gray-300 uppercase tracking-wider mb-2'>
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='โปรดอธิบายเหตุผลที่คุณรายงานโพสต์นี้...'
              className='w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none h-24 placeholder:text-gray-600 text-sm'
            />
          </div>

          {/* Buttons */}
          <div className='flex gap-3 pt-2'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 py-3 px-4 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white font-medium transition-colors'
            >
              ยกเลิก
            </button>
            <button
              type='submit'
              disabled={isLoading}
              className='flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2'
            >
              {isLoading ? (
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                'ส่งรายงาน'
              )}
            </button>
          </div>
        </form>

        <div className='mt-6 flex items-start gap-2 text-xs text-gray-500 bg-black/20 p-3 rounded-lg'>
          <AlertTriangle size={14} className='shrink-0 mt-0.5' />
          <p>
            ทีมงานจะตรวจสอบรายงานของคุณภายใน 24 ชั่วโมง
            การรายงานเท็จอาจส่งผลให้บัญชีของคุณถูกระงับการใช้งาน
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
