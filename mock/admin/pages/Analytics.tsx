import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  Users,
  TrendingUp,
  AlertTriangle,
  FileWarning,
  Server,
  MousePointerClick,
  Flag,
  Clock,
  ArrowRight,
  Database,
  Globe,
  Cpu,
  CheckCircle,
} from 'lucide-react';
import {
  SCENE_DROP_OFF_DATA,
  RETENTION_DATA,
  USER_GROWTH_DATA,
  ASSET_ERRORS,
  SYSTEM_LOGS,
} from '../services/mockData';

// Mock Data for components specific to this page
const ENDING_DISTRIBUTION = [
  { name: 'ฉากจบปกติ', value: 65, color: '#3B82F6' },
  { name: 'ฉากจบพิเศษ', value: 25, color: '#8B5CF6' },
  { name: 'Bad End', value: 10, color: '#EF4444' },
];

const POPULAR_CHOICES = [
  {
    id: 1,
    text: 'เดินเข้าไปอย่างกล้าหาญ',
    story: 'วัตถุโบราณที่หายสาบสูญ',
    count: 1250,
    percentage: 85,
  },
  { id: 2, text: 'เผชิญหน้ากับความจริง', story: 'คืนนีออน', count: 980, percentage: 62 },
  { id: 3, text: 'เปิดกล่องปริศนา', story: 'รักในโตเกียว', count: 850, percentage: 45 },
  { id: 4, text: 'ร้องขอความช่วยเหลือ', story: 'บ้านร้างท้ายหมู่บ้าน', count: 720, percentage: 30 },
  { id: 5, text: 'ยอมรับข้อเสนอ', story: 'พลิกคดีปริศนา', count: 600, percentage: 25 },
];

const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subValue?: string;
  icon: any;
  color: string;
}) => (
  <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between'>
    <div>
      <p className='text-sm font-medium text-gray-500'>{title}</p>
      <h3 className='text-2xl font-bold mt-1 text-gray-900'>{value}</h3>
      {subValue && <p className='text-xs text-gray-400 mt-1'>{subValue}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
      <Icon size={20} />
    </div>
  </div>
);

export const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'story' | 'user' | 'system'>('story');

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>วิเคราะห์ข้อมูลและรายงาน</h1>
        <p className='text-sm text-gray-500 mt-1'>
          ติดตามประสิทธิภาพของนิยาย พฤติกรรมผู้ใช้ และสถานะระบบ
        </p>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-gray-200 bg-white px-4 rounded-t-xl shadow-sm'>
        <button
          onClick={() => setActiveTab('story')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'story' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Flag size={16} className='mr-2' /> วิเคราะห์นิยาย (Story)
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'user' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={16} className='mr-2' /> วิเคราะห์ผู้ใช้ (User)
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'system' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Server size={16} className='mr-2' /> วิเคราะห์ระบบ (System)
        </button>
      </div>

      {/* Content */}
      <div className='space-y-6'>
        {/* --- STORY ANALYTICS --- */}
        {activeTab === 'story' && (
          <div className='space-y-6 animate-fade-in'>
            {/* Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <StatCard
                title='เวลาเล่นเฉลี่ย'
                value='18 นาที'
                subValue='+2 นาที จากเดือนที่แล้ว'
                icon={Clock}
                color='bg-blue-500'
              />
              <StatCard
                title='อัตราการเล่นจบ'
                value='68%'
                subValue='โดยเฉลี่ยทุกเรื่อง'
                icon={Flag}
                color='bg-green-500'
              />
              <StatCard
                title='ทางเลือกทั้งหมด'
                value='15,420'
                subValue='การตัดสินใจในวันนี้'
                icon={MousePointerClick}
                color='bg-purple-500'
              />
              <StatCard
                title='ผู้เล่นกลับมาเล่นซ้ำ'
                value='42%'
                subValue='Retention Rate'
                icon={TrendingUp}
                color='bg-orange-500'
              />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Drop-off Rate Chart */}
              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                <h3 className='text-lg font-bold text-gray-800 mb-4'>
                  อัตราการออกจากเกม (Drop-off Rate)
                </h3>
                <div className='h-72'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={SCENE_DROP_OFF_DATA}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' vertical={false} />
                      <XAxis dataKey='name' fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar
                        dataKey='players'
                        fill='#6366f1'
                        radius={[4, 4, 0, 0]}
                        name='ผู้เล่นคงเหลือ'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ending Distribution */}
              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                <h3 className='text-lg font-bold text-gray-800 mb-4'>
                  สัดส่วนฉากจบที่ผู้เล่นทำได้
                </h3>
                <div className='h-72 flex items-center justify-center'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={ENDING_DISTRIBUTION}
                        cx='50%'
                        cy='50%'
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey='value'
                      >
                        {ENDING_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign='bottom' height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Popular Choices */}
            <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='p-6 border-b border-gray-100'>
                <h3 className='text-lg font-bold text-gray-800'>ทางเลือกยอดนิยม</h3>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        ทางเลือก
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                        นิยาย
                      </th>
                      <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                        จำนวนครั้ง
                      </th>
                      <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                        ความนิยม
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {POPULAR_CHOICES.map((choice) => (
                      <tr key={choice.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                          {choice.text}
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-500'>{choice.story}</td>
                        <td className='px-6 py-4 text-sm text-gray-500 text-center'>
                          {choice.count.toLocaleString()}
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <div className='flex items-center justify-end'>
                            <span className='text-sm font-bold text-indigo-600 mr-2'>
                              {choice.percentage}%
                            </span>
                            <div className='w-24 bg-gray-200 rounded-full h-1.5'>
                              <div
                                className='bg-indigo-600 h-1.5 rounded-full'
                                style={{ width: `${choice.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- USER ANALYTICS --- */}
        {activeTab === 'user' && (
          <div className='space-y-6 animate-fade-in'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <StatCard
                title='ผู้ใช้ใหม่เดือนนี้'
                value='3,450'
                subValue='+12% Growth'
                icon={Users}
                color='bg-indigo-500'
              />
              <StatCard
                title='Conversion Rate'
                value='5.2%'
                subValue='Guest → Registered'
                icon={ArrowRight}
                color='bg-green-500'
              />
              <StatCard
                title='เครดิตเฉลี่ย/Session'
                value='15'
                subValue='ต่อการเล่น 1 ครั้ง'
                icon={Activity}
                color='bg-amber-500'
              />
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* User Growth */}
              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                <h3 className='text-lg font-bold text-gray-800 mb-4'>
                  การเติบโตของผู้ใช้งาน (User Growth)
                </h3>
                <div className='h-72'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart
                      data={USER_GROWTH_DATA}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray='3 3' vertical={false} />
                      <XAxis dataKey='month' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='users'
                        stroke='#4f46e5'
                        strokeWidth={3}
                        name='ผู้ใช้ทั้งหมด'
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Retention Curve */}
              <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                <h3 className='text-lg font-bold text-gray-800 mb-4'>
                  การคงอยู่ของผู้ใช้ (Retention Curve)
                </h3>
                <div className='h-72'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart
                      data={RETENTION_DATA}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id='colorRetention' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
                          <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' vertical={false} />
                      <XAxis dataKey='day' />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type='monotone'
                        dataKey='retention'
                        stroke='#10b981'
                        fillOpacity={1}
                        fill='url(#colorRetention)'
                        name='% Retention'
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SYSTEM ANALYTICS --- */}
        {activeTab === 'system' && (
          <div className='space-y-6 animate-fade-in'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
              <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
                <div className='p-3 bg-green-100 text-green-600 rounded-lg'>
                  <Globe size={24} />
                </div>
                <div>
                  <p className='text-xs text-gray-500'>API Status</p>
                  <h4 className='text-lg font-bold text-green-600'>Online</h4>
                </div>
              </div>
              <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
                <div className='p-3 bg-blue-100 text-blue-600 rounded-lg'>
                  <Database size={24} />
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Database</p>
                  <h4 className='text-lg font-bold text-blue-600'>Healthy</h4>
                </div>
              </div>
              <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
                <div className='p-3 bg-purple-100 text-purple-600 rounded-lg'>
                  <Cpu size={24} />
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Server Load</p>
                  <h4 className='text-lg font-bold text-purple-600'>24%</h4>
                </div>
              </div>
              <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4'>
                <div className='p-3 bg-red-100 text-red-600 rounded-lg'>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Critical Errors</p>
                  <h4 className='text-lg font-bold text-red-600'>0</h4>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Asset Errors */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
                  <h3 className='text-lg font-bold text-gray-800 flex items-center'>
                    <FileWarning size={20} className='mr-2 text-amber-500' />
                    รายงานไฟล์สูญหาย (Missing Assets)
                  </h3>
                </div>
                <div className='p-0'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                          ชื่อไฟล์
                        </th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                          Error
                        </th>
                        <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                          จำนวนครั้ง
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {ASSET_ERRORS.map((err) => (
                        <tr key={err.id}>
                          <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                            {err.asset}
                          </td>
                          <td className='px-6 py-4 text-sm text-red-500'>{err.error}</td>
                          <td className='px-6 py-4 text-sm text-gray-500 text-right'>
                            {err.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Logs */}
              <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
                  <h3 className='text-lg font-bold text-gray-800 flex items-center'>
                    <Activity size={20} className='mr-2 text-indigo-500' />
                    บันทึกระบบล่าสุด (System Logs)
                  </h3>
                </div>
                <div className='p-4 space-y-3 max-h-[300px] overflow-y-auto'>
                  {SYSTEM_LOGS.map((log) => (
                    <div
                      key={log.id}
                      className='flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm'
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mr-3 mt-0.5 ${
                          log.type === 'error'
                            ? 'bg-red-100 text-red-700'
                            : log.type === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {log.type}
                      </span>
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900'>{log.message}</p>
                        <div className='flex justify-between mt-1 text-xs text-gray-500'>
                          <span>{log.location}</span>
                          <span>{log.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className='text-center pt-2 text-xs text-gray-400'>End of recent logs</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
