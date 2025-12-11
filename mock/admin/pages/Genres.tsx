import React, { useState, useEffect } from 'react';
import { MOCK_GENRES } from '../services/mockData';
import { Genre } from '../types';
import { Plus, Search, Edit, Trash2, X, Save, Tags, Check, AlertCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { Pagination } from '../components/Pagination';

export const GenresPage: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>(MOCK_GENRES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Partial<Genre> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { addToast } = useToast();

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredGenres = genres.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedGenres = filteredGenres.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreate = () => {
    setEditingGenre({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      storyCount: 0,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre({ ...genre });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบแนวเรื่องนี้? นิยายที่เกี่ยวข้องอาจได้รับผลกระทบ')) return;
    setGenres(genres.filter((g) => g.id !== id));
    addToast('ลบแนวเรื่องเรียบร้อยแล้ว', 'success');
  };

  const handleSave = () => {
    if (!editingGenre?.name || !editingGenre?.slug) {
      addToast('กรุณากรอกชื่อและ Slug ให้ครบถ้วน', 'warning');
      return;
    }

    if (editingGenre.id) {
      // Update
      setGenres(
        genres.map((g) => (g.id === editingGenre.id ? ({ ...g, ...editingGenre } as Genre) : g))
      );
      addToast('แก้ไขแนวเรื่องเรียบร้อยแล้ว', 'success');
    } else {
      // Create
      const newGenre: Genre = {
        ...editingGenre,
        id: `g${Date.now()}`,
        storyCount: 0,
      } as Genre;
      setGenres([...genres, newGenre]);
      addToast('เพิ่มแนวเรื่องเรียบร้อยแล้ว', 'success');
    }
    setIsModalOpen(false);
    setEditingGenre(null);
  };

  const generateSlug = (name: string) => {
    // Simple mock slug generator
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>จัดการแนวเรื่อง</h1>
          <p className='text-sm text-gray-500 mt-1'>
            กำหนดหมวดหมู่ของนิยายเพื่อให้ผู้ใช้ค้นหาได้ง่ายขึ้น
          </p>
        </div>
        <button
          onClick={handleCreate}
          className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors'
        >
          <Plus size={18} className='mr-2' />
          เพิ่มแนวเรื่องใหม่
        </button>
      </div>

      {/* Stats Cards (Optional) */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
          <div className='p-3 bg-blue-50 text-blue-600 rounded-lg'>
            <Tags size={24} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>แนวเรื่องทั้งหมด</p>
            <h3 className='text-xl font-bold text-gray-900'>{genres.length}</h3>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
          <div className='p-3 bg-green-50 text-green-600 rounded-lg'>
            <Check size={24} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>เปิดใช้งาน</p>
            <h3 className='text-xl font-bold text-gray-900'>
              {genres.filter((g) => g.isActive).length}
            </h3>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
          <div className='p-3 bg-gray-50 text-gray-600 rounded-lg'>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>ปิดใช้งาน</p>
            <h3 className='text-xl font-bold text-gray-900'>
              {genres.filter((g) => !g.isActive).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col'>
        {/* Filter Bar */}
        <div className='p-4 border-b border-gray-100 bg-gray-50 flex items-center'>
          <div className='relative w-full md:w-96'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='ค้นหาชื่อแนวเรื่อง หรือ Slug...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
            />
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto flex-1'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ชื่อแนวเรื่อง
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Slug
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell'>
                  คำอธิบาย
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  จำนวนนิยาย
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  สถานะ
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedGenres.length > 0 ? (
                paginatedGenres.map((genre) => (
                  <tr key={genre.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-bold text-gray-900'>{genre.name}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block'>
                        {genre.slug}
                      </div>
                    </td>
                    <td className='px-6 py-4 hidden md:table-cell'>
                      <div className='text-sm text-gray-500 truncate max-w-xs'>
                        {genre.description || '-'}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'>
                        {genre.storyCount} เรื่อง
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${genre.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {genre.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={() => handleEdit(genre)}
                        className='text-indigo-600 hover:text-indigo-900 mx-2 p-1 hover:bg-indigo-50 rounded'
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(genre.id)}
                        className='text-red-600 hover:text-red-900 mx-2 p-1 hover:bg-red-50 rounded'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>
                    ไม่พบข้อมูลแนวเรื่อง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredGenres.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredGenres.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && editingGenre && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up'>
            <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
              <h3 className='font-bold text-gray-900 text-lg'>
                {editingGenre.id ? 'แก้ไขแนวเรื่อง' : 'สร้างแนวเรื่องใหม่'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={20} />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  ชื่อแนวเรื่อง
                </label>
                <input
                  type='text'
                  value={editingGenre.name}
                  onChange={(e) => setEditingGenre({ ...editingGenre, name: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
                  placeholder='เช่น แฟนตาซี'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Slug (URL)</label>
                <input
                  type='text'
                  value={editingGenre.slug}
                  onChange={(e) => setEditingGenre({ ...editingGenre, slug: e.target.value })}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm'
                  placeholder='เช่น fantasy'
                />
                <p className='text-xs text-gray-400 mt-1'>
                  ใช้ภาษาอังกฤษตัวพิมพ์เล็กและขีดกลาง (-) เท่านั้น
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>คำอธิบาย</label>
                <textarea
                  value={editingGenre.description}
                  onChange={(e) =>
                    setEditingGenre({ ...editingGenre, description: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24'
                  placeholder='รายละเอียดเกี่ยวกับแนวเรื่องนี้...'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={editingGenre.isActive}
                  onChange={(e) => setEditingGenre({ ...editingGenre, isActive: e.target.checked })}
                  className='rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4'
                />
                <label htmlFor='isActive' className='text-sm font-medium text-gray-700'>
                  เปิดใช้งานทันที
                </label>
              </div>
            </div>

            <div className='p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg'
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm'
              >
                <Save size={16} className='mr-2' /> บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
