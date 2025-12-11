import React, { useState, useEffect } from 'react';
import { MOCK_REPORTS } from '../services/mockData';
import { StoryReport, ReportStatus, ReportTargetType } from '../types';
import {
  Flag,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  User as UserIcon,
  Clock,
  MessageSquare,
  Eye,
  BookOpen,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { NavLink } from 'react-router-dom';
import { Pagination } from '../components/Pagination';

export const ReportModerationPage: React.FC = () => {
  const [reports, setReports] = useState<StoryReport[]>(MOCK_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReportStatus>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | ReportTargetType>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal for details
  const [selectedReport, setSelectedReport] = useState<StoryReport | null>(null);

  const { addToast } = useToast();

  // Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.storyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || r.targetType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = (id: string, newStatus: ReportStatus) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));

    if (selectedReport?.id === id) {
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    if (newStatus === ReportStatus.RESOLVED) {
      addToast('ทำเครื่องหมายว่าแก้ไขแล้ว', 'success');
    } else if (newStatus === ReportStatus.DISMISSED) {
      addToast('ยกเลิก/ปฏิเสธรายงานแล้ว', 'info');
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ReportStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case ReportStatus.DISMISSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>รายงานปัญหา (Reports)</h1>
          <p className='text-sm text-gray-500 mt-1'>
            จัดการคำร้องเรียนและรายงานความผิดปกติจากผู้ใช้งาน
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
          <div className='p-3 bg-yellow-50 text-yellow-600 rounded-lg'>
            <Clock size={24} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>รอดำเนินการ</p>
            <h3 className='text-xl font-bold text-gray-900'>
              {reports.filter((r) => r.status === ReportStatus.PENDING).length}
            </h3>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
          <div className='p-3 bg-green-50 text-green-600 rounded-lg'>
            <CheckCircle size={24} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>แก้ไขแล้ว</p>
            <h3 className='text-xl font-bold text-gray-900'>
              {reports.filter((r) => r.status === ReportStatus.RESOLVED).length}
            </h3>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
          <div className='p-3 bg-red-50 text-red-600 rounded-lg'>
            <MessageSquare size={24} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>รีวิวที่ถูกรายงาน</p>
            <h3 className='text-xl font-bold text-gray-900'>
              {reports.filter((r) => r.targetType === 'review').length}
            </h3>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
          <div className='p-3 bg-gray-50 text-gray-600 rounded-lg'>
            <Flag size={24} />
          </div>
          <div>
            <p className='text-sm text-gray-500'>รายงานทั้งหมด</p>
            <h3 className='text-xl font-bold text-gray-900'>{reports.length}</h3>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between'>
        <div className='relative w-full md:w-80'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            size={18}
          />
          <input
            type='text'
            placeholder='ค้นหาชื่อเรื่อง, ผู้รายงาน, สาเหตุ...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
          />
        </div>
        <div className='flex items-center space-x-2 w-full md:w-auto overflow-x-auto'>
          <Filter size={18} className='text-gray-400 flex-shrink-0' />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReportTargetType | 'ALL')}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value='ALL'>ทุกประเภท</option>
            <option value='story'>นิยาย (Story)</option>
            <option value='review'>รีวิว (Review)</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'ALL')}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value='ALL'>สถานะทั้งหมด</option>
            <option value={ReportStatus.PENDING}>{ReportStatus.PENDING}</option>
            <option value={ReportStatus.RESOLVED}>{ReportStatus.RESOLVED}</option>
            <option value={ReportStatus.DISMISSED}>{ReportStatus.DISMISSED}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  เป้าหมาย (Target)
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  นิยาย
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  ผู้รายงาน
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  สาเหตุ / วันที่
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
              {paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <tr key={report.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {report.targetType === 'story' ? (
                        <div className='flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit text-xs font-medium border border-indigo-100'>
                          <BookOpen size={14} className='mr-1.5' />
                          <span>เนื้อหานิยาย</span>
                        </div>
                      ) : (
                        <div className='flex items-center text-pink-600 bg-pink-50 px-2 py-1 rounded w-fit text-xs font-medium border border-pink-100'>
                          <MessageSquare size={14} className='mr-1.5' />
                          <span>รีวิว/คอมเมนต์</span>
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-bold text-gray-900 truncate max-w-[200px]'>
                        {report.storyTitle}
                      </div>
                      <div className='text-xs text-gray-500 font-mono mt-1'>{report.storyId}</div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <UserIcon size={14} className='text-gray-400 mr-2' />
                        <span className='text-sm text-gray-700'>{report.reporterName}</span>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>{report.reason}</div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {new Date(report.timestamp).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className='p-1.5 text-gray-500 hover:bg-gray-100 rounded'
                          title='ดูรายละเอียด'
                        >
                          <Eye size={16} />
                        </button>
                        {report.status === ReportStatus.PENDING && (
                          <>
                            <button
                              onClick={() => handleStatusChange(report.id, ReportStatus.RESOLVED)}
                              className='p-1.5 text-green-600 hover:bg-green-50 rounded'
                              title='ทำเครื่องหมายว่าแก้ไขแล้ว'
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(report.id, ReportStatus.DISMISSED)}
                              className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'
                              title='ยกเลิก/ไม่พบปัญหา'
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='px-6 py-12 text-center text-gray-500'>
                    ไม่พบรายการรายงานปัญหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredReports.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredReports.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Details Modal */}
      {selectedReport && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in'>
            <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
              <h3 className='font-bold text-gray-900 text-lg flex items-center'>
                <AlertTriangle size={20} className='text-amber-500 mr-2' />
                รายละเอียดการรายงาน
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className='p-6 space-y-4'>
              {/* Target Info */}
              <div className='bg-gray-50 p-3 rounded-lg border border-gray-100'>
                <div className='flex items-center space-x-2 mb-2'>
                  <span className='text-xs font-bold text-gray-500 uppercase'>เป้าหมาย:</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${selectedReport.targetType === 'review' ? 'bg-pink-100 text-pink-700' : 'bg-indigo-100 text-indigo-700'}`}
                  >
                    {selectedReport.targetType === 'review' ? 'รีวิว/คอมเมนต์' : 'เนื้อหานิยาย'}
                  </span>
                </div>
                <p className='text-sm font-medium text-gray-900'>{selectedReport.storyTitle}</p>

                {selectedReport.targetType === 'review' && selectedReport.reviewContent && (
                  <div className='mt-3 bg-white p-3 rounded border border-gray-200 shadow-sm relative'>
                    <MessageSquare size={12} className='absolute top-2 right-2 text-gray-300' />
                    <p className='text-xs text-gray-500 mb-1'>
                      ข้อความที่ถูกรีพอร์ต (โดย {selectedReport.reviewOwnerName})
                    </p>
                    <p className='text-sm text-gray-800 italic'>"{selectedReport.reviewContent}"</p>
                  </div>
                )}
              </div>

              {/* Reporter Info */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase block mb-1'>
                    ผู้รายงาน
                  </label>
                  <div className='flex items-center'>
                    <UserIcon size={14} className='mr-1 text-gray-400' />
                    <span className='text-sm'>{selectedReport.reporterName}</span>
                  </div>
                </div>
                <div>
                  <label className='text-xs font-bold text-gray-500 uppercase block mb-1'>
                    วันที่แจ้ง
                  </label>
                  <span className='text-sm'>
                    {new Date(selectedReport.timestamp).toLocaleString('th-TH')}
                  </span>
                </div>
              </div>

              {/* Reason & Details */}
              <div className='bg-white p-4 rounded-lg border border-gray-200'>
                <label className='text-xs font-bold text-gray-500 uppercase block mb-2 flex justify-between'>
                  <span>สาเหตุ: {selectedReport.reason}</span>
                  <Flag size={14} className='text-red-500' />
                </label>
                <p className='text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
                  "{selectedReport.details}"
                </p>
              </div>

              {/* Status Indicator */}
              <div className='flex items-center space-x-2 pt-2 border-t border-gray-100 mt-2'>
                <span className='text-sm font-medium text-gray-700'>สถานะปัจจุบัน:</span>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}
                >
                  {selectedReport.status}
                </span>
              </div>
            </div>

            <div className='p-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50'>
              <button
                onClick={() => setSelectedReport(null)}
                className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium'
              >
                ปิด
              </button>
              {selectedReport.status === ReportStatus.PENDING && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, ReportStatus.DISMISSED)}
                    className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium'
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedReport.id, ReportStatus.RESOLVED)}
                    className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium'
                  >
                    แก้ไขแล้ว
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
