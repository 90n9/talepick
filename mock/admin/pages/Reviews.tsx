import React, { useState, useEffect } from 'react';
import { MOCK_REVIEWS, MOCK_STORIES } from '../services/mockData';
import { StoryReview } from '../types';
import {
  Star,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  ThumbsUp,
  User as UserIcon,
  AlertTriangle,
  Check,
  Trophy,
  MessageCircle,
  X,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pagination } from '../components/Pagination';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<StoryReview[]>(MOCK_REVIEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'hidden' | 'featured'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reply Modal
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean;
    reviewId: string | null;
    text: string;
  }>({ isOpen: false, reviewId: null, text: '' });

  const { addToast } = useToast();

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, starFilter, statusFilter]);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.storyTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStar = starFilter === 'all' || r.rating === starFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'hidden' && r.isHidden) ||
      (statusFilter === 'featured' && r.isFeatured);

    return matchesSearch && matchesStar && matchesStatus;
  });

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics Data Calculation
  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    name: `${star} ดาว`,
    count: reviews.filter((r) => r.rating === star).length,
    color: star >= 4 ? '#4ADE80' : star === 3 ? '#FACC15' : '#F87171',
  }));

  const lowRatedStories = MOCK_STORIES.filter((s) => s.rating < 4.0 && s.totalPlayers > 0)
    .sort((a, b) => a.rating - b.rating)
    .slice(0, 5);

  // Actions
  const handleToggleHide = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, isHidden: !r.isHidden } : r)));
    const review = reviews.find((r) => r.id === id);
    addToast(review?.isHidden ? 'แสดงรีวิวแล้ว' : 'ซ่อนรีวิวแล้ว', 'info');
  };

  const handleToggleFeature = (id: string) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, isFeatured: !r.isFeatured } : r)));
    const review = reviews.find((r) => r.id === id);
    addToast(review?.isFeatured ? 'ยกเลิกการแนะนำรีวิว' : 'ตั้งเป็นรีวิวแนะนำแล้ว', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้ถาวร?')) {
      setReviews(reviews.filter((r) => r.id !== id));
      addToast('ลบุรีวิวเรียบร้อยแล้ว', 'success');
    }
  };

  const handleReplyClick = (review: StoryReview) => {
    setReplyModal({
      isOpen: true,
      reviewId: review.id,
      text: review.adminReply || '',
    });
  };

  const handleSubmitReply = () => {
    if (!replyModal.reviewId) return;

    setReviews(
      reviews.map((r) =>
        r.id === replyModal.reviewId
          ? {
              ...r,
              adminReply: replyModal.text,
              adminReplyDate: replyModal.text ? new Date().toISOString() : undefined,
            }
          : r
      )
    );

    addToast('บันทึกการตอบกลับเรียบร้อยแล้ว', 'success');
    setReplyModal({ isOpen: false, reviewId: null, text: '' });
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>รีวิว & เรตติ้ง</h1>
          <p className='text-sm text-gray-500 mt-1'>ตรวจสอบความคิดเห็นผู้ใช้และดูแลคุณภาพชุมชน</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Rating Distribution */}
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col'>
          <h3 className='text-sm font-bold text-gray-700 mb-4'>การกระจายตัวของคะแนน</h3>
          <div className='h-40 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={ratingDistribution}>
                <XAxis dataKey='name' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey='count' radius={[4, 4, 0, 0]} barSize={30}>
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Rated Stories */}
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col'>
          <h3 className='text-sm font-bold text-gray-700 mb-4 flex items-center'>
            <AlertTriangle size={16} className='text-amber-500 mr-2' />
            นิยายที่ควรปรับปรุง (เรตติ้งต่ำ)
          </h3>
          <div className='flex-1 overflow-y-auto space-y-3'>
            {lowRatedStories.length > 0 ? (
              lowRatedStories.map((story) => (
                <div
                  key={story.id}
                  className='flex justify-between items-center p-2 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-2 overflow-hidden'>
                    <div className='w-8 h-8 rounded bg-gray-200 flex-shrink-0 overflow-hidden'>
                      <img src={story.coverImage} alt='' className='w-full h-full object-cover' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-xs font-semibold text-gray-900 truncate'>{story.title}</p>
                      <p className='text-[10px] text-gray-500'>
                        {story.totalPlayers.toLocaleString()} ผู้เล่น
                      </p>
                    </div>
                  </div>
                  <span className='text-xs font-bold text-amber-600 flex items-center'>
                    <Star size={10} className='fill-amber-600 mr-1' /> {story.rating}
                  </span>
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center h-full text-gray-400'>
                <ThumbsUp size={24} className='mb-2 opacity-50' />
                <p className='text-xs'>ไม่มีนิยายเรตติ้งต่ำ</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Stats */}
        <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-2 gap-4'>
          <div className='flex flex-col justify-center items-center bg-blue-50 rounded-lg p-2'>
            <MessageSquare className='text-blue-500 mb-2' size={24} />
            <span className='text-2xl font-bold text-blue-700'>{reviews.length}</span>
            <span className='text-xs text-blue-600'>รีวิวทั้งหมด</span>
          </div>
          <div className='flex flex-col justify-center items-center bg-gray-100 rounded-lg p-2'>
            <EyeOff className='text-gray-500 mb-2' size={24} />
            <span className='text-2xl font-bold text-gray-700'>
              {reviews.filter((r) => r.isHidden).length}
            </span>
            <span className='text-xs text-gray-600'>ซ่อนอยู่</span>
          </div>
          <div className='col-span-2 flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100'>
            <div className='flex items-center text-yellow-800'>
              <Trophy size={16} className='mr-2' />
              <span className='text-sm font-medium'>รีวิวแนะนำ (Featured)</span>
            </div>
            <span className='text-lg font-bold text-yellow-700'>
              {reviews.filter((r) => r.isFeatured).length}
            </span>
          </div>
        </div>
      </div>

      {/* Reviews Table Section */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col'>
        {/* Controls */}
        <div className='p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center'>
          <div className='relative w-full md:w-80'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='ค้นหาข้อความ, ชื่อเรื่อง, ผู้ใช้...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
            />
          </div>

          <div className='flex gap-2 w-full md:w-auto overflow-x-auto'>
            <select
              value={starFilter}
              onChange={(e) =>
                setStarFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className='px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value='all'>ทุกคะแนน</option>
              <option value='5'>5 ดาว</option>
              <option value='4'>4 ดาว</option>
              <option value='3'>3 ดาว</option>
              <option value='2'>2 ดาว</option>
              <option value='1'>1 ดาว</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className='px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
            >
              <option value='all'>สถานะทั้งหมด</option>
              <option value='hidden'>ซ่อนอยู่</option>
              <option value='featured'>แนะนำ (Featured)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  นิยาย
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ผู้ใช้
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  คะแนน
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3'>
                  ความเห็น
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  วันที่
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedReviews.length > 0 ? (
                paginatedReviews.map((review) => (
                  <tr
                    key={review.id}
                    className={`hover:bg-gray-50 group ${review.isHidden ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>{review.storyTitle}</div>
                      <div className='text-xs text-gray-500 font-mono'>{review.storyId}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <img className='h-8 w-8 rounded-full mr-2' src={review.avatar} alt='' />
                        <div className='text-sm text-gray-700'>{review.username}</div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex justify-center'>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <p
                        className={`text-sm text-gray-600 line-clamp-2 ${review.isHidden ? 'italic text-gray-400' : ''}`}
                      >
                        {review.comment}
                      </p>
                      <div className='flex flex-wrap gap-1 mt-1'>
                        {review.isFeatured && (
                          <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800'>
                            <Trophy size={10} className='mr-1' /> แนะนำ
                          </span>
                        )}
                        {review.isHidden && (
                          <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 text-gray-600'>
                            <EyeOff size={10} className='mr-1' /> ซ่อนอยู่
                          </span>
                        )}
                      </div>
                      {review.adminReply && (
                        <div className='mt-2 p-2 bg-indigo-50 rounded border border-indigo-100 text-xs'>
                          <p className='text-indigo-800 font-semibold mb-0.5 flex items-center'>
                            <MessageCircle size={10} className='mr-1' /> ตอบกลับจากผู้ดูแล
                          </p>
                          <p className='text-indigo-600'>{review.adminReply}</p>
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500'>
                      {new Date(review.date).toLocaleDateString('th-TH')}
                      <br />
                      {new Date(review.date).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={() => handleReplyClick(review)}
                          className='p-1.5 rounded transition-colors text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                          title='ตอบกลับ'
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleFeature(review.id)}
                          className={`p-1.5 rounded transition-colors ${review.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
                          title={review.isFeatured ? 'ยกเลิกแนะนำ' : 'ตั้งเป็นรีวิวแนะนำ'}
                        >
                          <Trophy size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleHide(review.id)}
                          className={`p-1.5 rounded transition-colors ${review.isHidden ? 'bg-gray-200 text-gray-600' : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'}`}
                          title={review.isHidden ? 'แสดงรีวิว' : 'ซ่อนรีวิว'}
                        >
                          {review.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <NavLink
                          to={`/users?userId=${review.userId}`}
                          className='p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded'
                          title='ดูโปรไฟล์ผู้ใช้'
                        >
                          <UserIcon size={16} />
                        </NavLink>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded'
                          title='ลบ'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>
                    ไม่พบรีวิวตามเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredReviews.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredReviews.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Reply Modal */}
      {replyModal.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in'>
            <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
              <h3 className='font-bold text-gray-900 text-lg flex items-center'>
                <MessageCircle size={20} className='mr-2 text-indigo-500' />
                ตอบกลับรีวิว
              </h3>
              <button
                onClick={() => setReplyModal({ isOpen: false, reviewId: null, text: '' })}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={20} />
              </button>
            </div>

            <div className='p-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>ข้อความตอบกลับ</label>
              <textarea
                value={replyModal.text}
                onChange={(e) => setReplyModal({ ...replyModal, text: e.target.value })}
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none'
                placeholder='พิมพ์ข้อความตอบกลับถึงผู้ใช้...'
              />
              <p className='text-xs text-gray-500 mt-2'>
                ข้อความนี้จะแสดงใต้รีวิวของผู้ใช้ และผู้ใช้จะได้รับการแจ้งเตือน
              </p>
            </div>

            <div className='p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50'>
              <button
                onClick={() => setReplyModal({ isOpen: false, reviewId: null, text: '' })}
                className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg'
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmitReply}
                className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm'
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
