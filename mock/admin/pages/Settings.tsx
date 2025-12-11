import React, { useState } from 'react';
import { MOCK_SYSTEM_CONFIG } from '../services/mockData';
import { SystemConfig } from '../types';
import {
  Settings,
  Coins,
  Clock,
  Zap,
  Lock,
  Unlock,
  Save,
  AlertTriangle,
  BatteryCharging,
  Gift,
  PlayCircle,
} from 'lucide-react';
import { useToast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>(MOCK_SYSTEM_CONFIG);
  const [activeTab, setActiveTab] = useState<'general' | 'economy'>('economy');
  const [isSaving, setIsSaving] = useState(false);

  const { addToast } = useToast();

  const handleCreditChange = (field: keyof SystemConfig['creditConfig'], value: any) => {
    setConfig({
      ...config,
      creditConfig: {
        ...config.creditConfig,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      addToast('บันทึกการตั้งค่าเรียบร้อยแล้ว', 'success');
    }, 1000);
  };

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>การตั้งค่าระบบ</h1>
          <p className='text-sm text-gray-500 mt-1'>กำหนดค่าพื้นฐานและระบบเศรษฐกิจภายในเกม</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className='flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium shadow-sm transition-colors disabled:opacity-70'
        >
          <Save size={18} className='mr-2' />
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='border-b border-gray-100 flex'>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'general' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Settings size={16} className='mr-2' /> ทั่วไป & ความปลอดภัย
          </button>
          <button
            onClick={() => setActiveTab('economy')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'economy' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Coins size={16} className='mr-2' /> ระบบเครดิต & เศรษฐกิจ
          </button>
        </div>

        <div className='p-6 bg-gray-50 min-h-[500px]'>
          {/* ECONOMY TAB */}
          {activeTab === 'economy' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in'>
              {/* User Limits Card */}
              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                <div className='flex items-center space-x-3 mb-6'>
                  <div className='p-2 bg-blue-100 text-blue-600 rounded-lg'>
                    <BatteryCharging size={24} />
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900'>ขีดจำกัดผู้ใช้งาน</h3>
                    <p className='text-xs text-gray-500'>
                      กำหนดเพดานเครดิตสูงสุดสำหรับผู้ใช้แต่ละประเภท
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      สมาชิกทั่วไป (Registered)
                    </label>
                    <div className='flex items-center'>
                      <input
                        type='number'
                        value={config.creditConfig.baseMaxCreditsNormal}
                        onChange={(e) =>
                          handleCreditChange('baseMaxCreditsNormal', parseInt(e.target.value))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                      />
                      <span className='ml-2 text-sm text-gray-500 w-16'>เครดิต</span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      ผู้เยี่ยมชม (Guest)
                    </label>
                    <div className='flex items-center'>
                      <input
                        type='number'
                        value={config.creditConfig.baseMaxCreditsGuest}
                        onChange={(e) =>
                          handleCreditChange('baseMaxCreditsGuest', parseInt(e.target.value))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none'
                      />
                      <span className='ml-2 text-sm text-gray-500 w-16'>เครดิต</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refill Logic Card */}
              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                <div className='flex items-center space-x-3 mb-6'>
                  <div className='p-2 bg-green-100 text-green-600 rounded-lg'>
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900'>การฟื้นฟูเครดิตอัตโนมัติ</h3>
                    <p className='text-xs text-gray-500'>กำหนดความเร็วในการได้รับเครดิตฟรี</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      ระยะเวลา (นาที)
                    </label>
                    <div className='flex items-center'>
                      <input
                        type='number'
                        value={config.creditConfig.refillIntervalMinutes}
                        onChange={(e) =>
                          handleCreditChange('refillIntervalMinutes', parseInt(e.target.value))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none'
                      />
                      <span className='ml-2 text-sm text-gray-500 w-16'>นาที</span>
                    </div>
                    <p className='text-xs text-gray-400 mt-1'>
                      ผู้ใช้จะได้รับเครดิตเมื่อครบกำหนดเวลานี้
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      จำนวนที่ได้รับ
                    </label>
                    <div className='flex items-center'>
                      <input
                        type='number'
                        value={config.creditConfig.refillAmount}
                        onChange={(e) =>
                          handleCreditChange('refillAmount', parseInt(e.target.value))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none'
                      />
                      <span className='ml-2 text-sm text-gray-500 w-16'>แต้ม</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rewards & Costs Card */}
              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                <div className='flex items-center space-x-3 mb-6'>
                  <div className='p-2 bg-purple-100 text-purple-600 rounded-lg'>
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900'>รางวัลและเงื่อนไข</h3>
                    <p className='text-xs text-gray-500'>การให้รางวัลและการเข้าถึงเนื้อหา</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      รางวัลการรีวิว (Review Reward)
                    </label>
                    <div className='flex items-center'>
                      <input
                        type='number'
                        value={config.creditConfig.ratingReward}
                        onChange={(e) =>
                          handleCreditChange('ratingReward', parseInt(e.target.value))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none'
                      />
                      <span className='ml-2 text-sm text-gray-500 w-16'>เครดิต</span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      เครดิตขั้นต่ำในการเล่น
                    </label>
                    <div className='flex items-center'>
                      <input
                        type='number'
                        value={config.creditConfig.minCreditToPlay}
                        onChange={(e) =>
                          handleCreditChange('minCreditToPlay', parseInt(e.target.value))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none'
                      />
                      <span className='ml-2 text-sm text-gray-500 w-16'>เครดิต</span>
                    </div>
                    <p className='text-xs text-gray-400 mt-1'>
                      ผู้ใช้ต้องมีเครดิตอย่างน้อยเท่านี้จึงจะเริ่มอ่านได้
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Mode Card */}
              <div
                className={`bg-white p-6 rounded-xl border-2 shadow-sm transition-colors ${config.creditConfig.isEventActive ? 'border-amber-400' : 'border-gray-200'}`}
              >
                <div className='flex items-center justify-between mb-6'>
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`p-2 rounded-lg ${config.creditConfig.isEventActive ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <Zap size={24} />
                    </div>
                    <div>
                      <h3 className='font-bold text-gray-900'>โหมดกิจกรรม (Event Mode)</h3>
                      <p className='text-xs text-gray-500'>คูณเครดิตรางวัลในช่วงเวลาพิเศษ</p>
                    </div>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={config.creditConfig.isEventActive}
                      onChange={(e) => handleCreditChange('isEventActive', e.target.checked)}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div
                  className={`space-y-4 ${!config.creditConfig.isEventActive ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      ตัวคูณรางวัล (Multiplier)
                    </label>
                    <div className='flex items-center'>
                      <span className='mr-2 text-lg font-bold text-amber-600'>x</span>
                      <input
                        type='number'
                        step='0.1'
                        value={config.creditConfig.eventMultiplier}
                        onChange={(e) =>
                          handleCreditChange('eventMultiplier', parseFloat(e.target.value))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none'
                      />
                    </div>
                    <p className='text-xs text-amber-600 mt-2 font-medium'>
                      * มีผลกับรางวัลความสำเร็จและการเติมเงิน
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className='max-w-2xl mx-auto space-y-6 animate-fade-in'>
              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                <h3 className='text-lg font-bold text-gray-900 mb-4 border-b pb-2'>
                  ข้อมูลเว็บไซต์
                </h3>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      ชื่อเว็บไซต์
                    </label>
                    <input
                      type='text'
                      value={config.siteName}
                      onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 outline-none'
                    />
                  </div>
                </div>
              </div>

              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                <h3 className='text-lg font-bold text-gray-900 mb-4 border-b pb-2 flex items-center text-red-600'>
                  <AlertTriangle size={20} className='mr-2' /> โหมดบำรุงรักษา
                </h3>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium text-gray-900'>ปิดปรับปรุงระบบ</p>
                    <p className='text-sm text-gray-500'>
                      ผู้ใช้ทั่วไปจะไม่สามารถเข้าใช้งานได้ (ยกเว้น Admin)
                    </p>
                  </div>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={config.maintenanceMode}
                      onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
