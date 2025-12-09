import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200 mt-auto gap-4 sm:gap-0">
      <div className="text-sm text-gray-700 order-2 sm:order-1">
        แสดง <span className="font-medium">{startItem}</span> ถึง <span className="font-medium">{endItem}</span> จาก <span className="font-medium">{totalItems}</span> รายการ
      </div>
      <div className="flex items-center space-x-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-md border ${currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="hidden sm:flex space-x-1">
          {getPageNumbers().map((page, index) => (
             typeof page === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 text-sm font-medium rounded-md border ${
                  currentPage === page
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
             ) : (
               <span key={index} className="px-2 py-1 text-gray-400">...</span>
             )
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-md border ${currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};