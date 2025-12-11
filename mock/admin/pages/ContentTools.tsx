import React, { useState, useEffect } from 'react';
import { MOCK_STORIES, MOCK_SCENES, MOCK_ASSETS } from '../services/mockData';
import { Scene, Story, Asset, ContentIssue, ContentIssueType } from '../types';
import {
  AlertTriangle,
  ImageOff,
  GitMerge,
  FileWarning,
  CheckCircle,
  Trash2,
  RefreshCw,
  Filter,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { NavLink } from 'react-router-dom';

export const ContentToolsPage: React.FC = () => {
  const [issues, setIssues] = useState<ContentIssue[]>([]);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [unusedAssets, setUnusedAssets] = useState<Asset[]>([]);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [activeTab, setActiveTab] = useState<'issues' | 'assets'>('issues');

  const { addToast } = useToast();

  // Scanner Logic
  const runScan = () => {
    setScanStatus('scanning');

    setTimeout(() => {
      const foundIssues: ContentIssue[] = [];
      const usedAssetUrls = new Set<string>();

      // 1. Scan Scenes
      MOCK_SCENES.forEach((scene) => {
        const story = MOCK_STORIES.find((s) => s.id === scene.storyId);
        if (!story) return;

        // Track used images from segments
        scene.segments?.forEach((seg) => {
          if (seg.image) usedAssetUrls.add(seg.image);
        });

        // Check: Missing Image (in any segment)
        if (
          !scene.segments ||
          scene.segments.length === 0 ||
          scene.segments.some((s) => !s.image)
        ) {
          foundIssues.push({
            id: `issue_${Date.now()}_${scene.id}_img`,
            storyId: story.id,
            storyTitle: story.title,
            sceneId: scene.id,
            sceneTitle: scene.title,
            type: 'missing_image',
            severity: 'medium',
          });
        }

        // Check: Dead End (Not ending, no choices)
        if (!scene.isEnding && (!scene.choices || scene.choices.length === 0)) {
          foundIssues.push({
            id: `issue_${Date.now()}_${scene.id}_dead`,
            storyId: story.id,
            storyTitle: story.title,
            sceneId: scene.id,
            sceneTitle: scene.title,
            type: 'dead_end',
            severity: 'high',
          });
        }

        // Check: Orphan (Simplified check: No other scene links to this, and not start scene)
        if (
          scene.id !== 'sc1' &&
          !MOCK_SCENES.some((s) => s.choices?.some((c) => c.targetSceneId === scene.id))
        ) {
          foundIssues.push({
            id: `issue_${Date.now()}_${scene.id}_orphan`,
            storyId: story.id,
            storyTitle: story.title,
            sceneId: scene.id,
            sceneTitle: scene.title,
            type: 'orphan',
            severity: 'low',
          });
        }
      });

      // 2. Scan Stories for Gallery usage
      MOCK_STORIES.forEach((story) => {
        story.gallery?.forEach((item) => {
          usedAssetUrls.add(item.url);
          if (item.thumbnail) usedAssetUrls.add(item.thumbnail);
        });
        if (story.coverImage) usedAssetUrls.add(story.coverImage);
        if (story.headerImage) usedAssetUrls.add(story.headerImage);
      });

      // 3. Determine Unused Assets
      const unused = assets.filter((asset) => !usedAssetUrls.has(asset.url));

      setIssues(foundIssues);
      setUnusedAssets(unused);
      setScanStatus('done');
      addToast(`ตรวจสอบเสร็จสิ้น พบ ${foundIssues.length} ปัญหา`, 'info');
    }, 1000);
  };

  useEffect(() => {
    runScan();
  }, []);

  const handleFixPlaceholder = () => {
    if (!confirm('ต้องการใส่รูปภาพ Placeholder ให้กับทุกฉากที่ขาดหายไปหรือไม่?')) return;

    // In real app: Update backend
    // Mock: Remove issues locally
    setIssues(issues.filter((i) => i.type !== 'missing_image'));
    addToast('แก้ไขรูปภาพ Placeholder เรียบร้อยแล้ว', 'success');
  };

  const handleDeleteUnusedAsset = (id: string) => {
    setUnusedAssets(unusedAssets.filter((a) => a.id !== id));
    setAssets(assets.filter((a) => a.id !== id));
    addToast('ลบไฟล์เรียบร้อยแล้ว', 'success');
  };

  const handleCleanAllAssets = () => {
    if (!confirm(`ยืนยันการลบไฟล์ที่ไม่ได้ใช้งานทั้งหมด ${unusedAssets.length} ไฟล์?`)) return;
    const unusedIds = new Set(unusedAssets.map((a) => a.id));
    setAssets(assets.filter((a) => !unusedIds.has(a.id)));
    setUnusedAssets([]);
    addToast('ลบไฟล์ขยะทั้งหมดเรียบร้อยแล้ว', 'success');
  };

  const getIssueIcon = (type: ContentIssueType) => {
    switch (type) {
      case 'missing_image':
        return <ImageOff className='text-amber-500' size={18} />;
      case 'dead_end':
        return <AlertTriangle className='text-red-500' size={18} />;
      case 'orphan':
        return <GitMerge className='text-blue-500' size={18} />;
      default:
        return <FileWarning className='text-gray-500' size={18} />;
    }
  };

  const getIssueLabel = (type: ContentIssueType) => {
    switch (type) {
      case 'missing_image':
        return 'ไม่มีรูปภาพประกอบ (ใน Segment)';
      case 'dead_end':
        return 'ทางตัน (ไม่มีทางเลือก/ฉากจบ)';
      case 'orphan':
        return 'ฉากกำพร้า (ไม่มีทางเข้า)';
      default:
        return 'ข้อผิดพลาด';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>ตรวจสอบคุณภาพเนื้อหา</h1>
          <p className='text-sm text-gray-500 mt-1'>
            เครื่องมือตรวจหาข้อผิดพลาดของนิยายและจัดการไฟล์ขยะ
          </p>
        </div>
        <button
          onClick={runScan}
          disabled={scanStatus === 'scanning'}
          className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors disabled:opacity-70'
        >
          <RefreshCw
            size={18}
            className={`mr-2 ${scanStatus === 'scanning' ? 'animate-spin' : ''}`}
          />
          {scanStatus === 'scanning' ? 'กำลังตรวจสอบ...' : 'เริ่มการตรวจสอบ'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
          <p className='text-xs text-gray-500 uppercase font-semibold'>ฉากที่ตรวจสอบ</p>
          <h3 className='text-2xl font-bold text-gray-900 mt-1'>{MOCK_SCENES.length}</h3>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
          <p className='text-xs text-gray-500 uppercase font-semibold'>พบปัญหาทั้งหมด</p>
          <h3
            className={`text-2xl font-bold mt-1 ${issues.length > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            {issues.length}
          </h3>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
          <p className='text-xs text-gray-500 uppercase font-semibold'>ขาดรูปภาพ</p>
          <h3 className='text-2xl font-bold text-amber-600 mt-1'>
            {issues.filter((i) => i.type === 'missing_image').length}
          </h3>
        </div>
        <div className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
          <p className='text-xs text-gray-500 uppercase font-semibold'>ไฟล์ขยะ (Unused)</p>
          <h3 className='text-2xl font-bold text-gray-500 mt-1'>{unusedAssets.length}</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]'>
        <div className='border-b border-gray-100 flex'>
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'issues' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            รายการปัญหา ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assets' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            ไฟล์ที่ไม่ได้ใช้ ({unusedAssets.length})
          </button>
        </div>

        <div className='p-6 flex-1 bg-gray-50/50'>
          {activeTab === 'issues' && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='text-sm font-bold text-gray-700'>รายการข้อผิดพลาดที่พบ</h3>
                <div className='flex space-x-2'>
                  <button
                    onClick={handleFixPlaceholder}
                    disabled={issues.filter((i) => i.type === 'missing_image').length === 0}
                    className='px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 disabled:opacity-50'
                  >
                    ใส่รูป Placeholder อัตโนมัติ
                  </button>
                </div>
              </div>

              {issues.length > 0 ? (
                <div className='bg-white rounded-lg border border-gray-200 divide-y divide-gray-100'>
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className='p-4 flex items-center justify-between hover:bg-gray-50'
                    >
                      <div className='flex items-center space-x-4'>
                        <div
                          className={`p-2 rounded-lg ${
                            issue.severity === 'high'
                              ? 'bg-red-100'
                              : issue.severity === 'medium'
                                ? 'bg-amber-100'
                                : 'bg-blue-100'
                          }`}
                        >
                          {getIssueIcon(issue.type)}
                        </div>
                        <div>
                          <div className='flex items-center space-x-2'>
                            <span className='text-sm font-bold text-gray-900'>
                              {getIssueLabel(issue.type)}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${
                                issue.severity === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : issue.severity === 'medium'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {issue.severity}
                            </span>
                          </div>
                          <div className='text-xs text-gray-500 mt-1'>
                            นิยาย:{' '}
                            <span className='font-medium text-gray-700'>{issue.storyTitle}</span> •
                            ฉาก:{' '}
                            <span className='font-medium text-gray-700'>{issue.sceneTitle}</span> (
                            {issue.sceneId})
                          </div>
                        </div>
                      </div>

                      <NavLink
                        to={`/stories/editor`}
                        className='flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium'
                      >
                        แก้ไข <ExternalLink size={12} className='ml-1' />
                      </NavLink>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                  <CheckCircle size={48} className='text-green-500 mb-4 opacity-50' />
                  <p className='font-medium text-gray-900'>ไม่พบข้อผิดพลาด</p>
                  <p className='text-sm'>เนื้อหานิยายของคุณสมบูรณ์แบบ!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div className='space-y-4'>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='text-sm font-bold text-gray-700'>ไฟล์รูปภาพที่ไม่ได้ใช้งาน</h3>
                <button
                  onClick={handleCleanAllAssets}
                  disabled={unusedAssets.length === 0}
                  className='px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 flex items-center'
                >
                  <Trash2 size={12} className='mr-1.5' /> ลบทั้งหมด
                </button>
              </div>

              {unusedAssets.length > 0 ? (
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                  {unusedAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className='group relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow'
                    >
                      <div className='aspect-square bg-gray-100 relative'>
                        <img src={asset.url} alt='' className='w-full h-full object-cover' />
                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                          <button
                            onClick={() => handleDeleteUnusedAsset(asset.id)}
                            className='p-2 bg-red-600 text-white rounded-full hover:bg-red-700'
                            title='ลบไฟล์'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className='p-2'>
                        <div className='flex items-center text-xs text-gray-500 mb-1'>
                          <ImageIcon size={10} className='mr-1' /> {asset.size}
                        </div>
                        <p className='text-[10px] text-gray-400'>อัปโหลด: {asset.uploadDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-12 text-gray-400'>
                  <CheckCircle size={48} className='text-green-500 mb-4 opacity-50' />
                  <p className='font-medium text-gray-900'>สะอาดหมดจด</p>
                  <p className='text-sm'>ไม่มีไฟล์ขยะในระบบ</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
