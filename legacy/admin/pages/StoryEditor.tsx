
import React, { useState } from 'react';
import { Scene, SceneChoice, SceneSegment, Story, Asset } from '../types';
import { MOCK_SCENES, MOCK_STORIES } from '../services/mockData';
import { StoryGraph } from '../components/StoryGraph';
import { Save, Plus, ArrowLeft, Wand2, Loader2, Image as ImageIcon, Music, AlertTriangle, LayoutGrid, Search, Trash2, Code, Layout, ArrowUp, ArrowDown, Clock, Folder, X, FileAudio } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { generateSceneDescription } from '../services/geminiService';
import { useToast } from '../components/Toast';

export const StoryEditor: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>(MOCK_SCENES);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editor Mode State
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [jsonCode, setJsonCode] = useState('');
  
  // Asset Selector State
  const [assetSelector, setAssetSelector] = useState<{
      isOpen: boolean;
      type: 'image' | 'audio';
      onSelect: (url: string) => void;
  }>({ isOpen: false, type: 'image', onSelect: () => {} });

  const { addToast } = useToast();

  const selectedScene = scenes.find(s => s.id === selectedSceneId);
  // Derive current story from scene data (mocking relationship)
  const currentStoryId = scenes.length > 0 ? scenes[0].storyId : 's1';
  const currentStory = MOCK_STORIES.find(s => s.id === currentStoryId);

  // Validation Metrics
  const issuesCount = scenes.reduce((acc, s) => {
    let count = 0;
    if(!s.segments || s.segments.length === 0 || s.segments.some(seg => !seg.image)) count++;
    if(!s.isEnding && !s.choices?.length) count++;
    return acc + count;
  }, 0);

  const handleUpdateScene = (field: keyof Scene, value: any) => {
    if (!selectedSceneId) return;
    setScenes(scenes.map(s => s.id === selectedSceneId ? { ...s, [field]: value } : s));
  };

  const handleUpdateChoice = (choiceId: string, field: keyof SceneChoice, value: any) => {
     if (!selectedScene) return;
     const updatedChoices = selectedScene.choices.map(c => 
        c.id === choiceId ? { ...c, [field]: value } : c
     );
     handleUpdateScene('choices', updatedChoices);
  };

  const handleAddChoice = () => {
    if (!selectedScene) return;
    const newChoice: SceneChoice = {
        id: `c${Date.now()}`,
        text: 'ทางเลือกใหม่',
        targetSceneId: null,
        cost: 0
    };
    handleUpdateScene('choices', [...selectedScene.choices, newChoice]);
  };

  const handleDeleteChoice = (choiceId: string) => {
    if (!selectedScene) return;
    handleUpdateScene('choices', selectedScene.choices.filter(c => c.id !== choiceId));
  }

  // --- Segment Handlers ---
  const handleUpdateSegment = (index: number, field: keyof SceneSegment, value: any) => {
    if (!selectedScene || !selectedScene.segments) return;
    const updatedSegments = [...selectedScene.segments];
    updatedSegments[index] = { ...updatedSegments[index], [field]: value };
    handleUpdateScene('segments', updatedSegments);
  };

  const handleAddSegment = () => {
    if (!selectedScene) return;
    const newSegment: SceneSegment = {
      text: '',
      image: 'https://picsum.photos/seed/new/1920/1080',
      duration: 3000
    };
    handleUpdateScene('segments', [...(selectedScene.segments || []), newSegment]);
  };

  const handleRemoveSegment = (index: number) => {
    if (!selectedScene || !selectedScene.segments) return;
    const updatedSegments = [...selectedScene.segments];
    updatedSegments.splice(index, 1);
    handleUpdateScene('segments', updatedSegments);
  };

  const handleMoveSegment = (index: number, direction: 'up' | 'down') => {
    if (!selectedScene || !selectedScene.segments) return;
    const segments = [...selectedScene.segments];
    if (direction === 'up' && index > 0) {
      [segments[index], segments[index - 1]] = [segments[index - 1], segments[index]];
    } else if (direction === 'down' && index < segments.length - 1) {
      [segments[index], segments[index + 1]] = [segments[index + 1], segments[index]];
    }
    handleUpdateScene('segments', segments);
  };

  const handleGenerateDescription = async (index: number) => {
    if (!selectedScene || !selectedScene.segments) return;
    setIsGenerating(true);
    const desc = await generateSceneDescription(selectedScene.title);
    
    // Update specific segment text
    const updatedSegments = [...selectedScene.segments];
    updatedSegments[index] = { ...updatedSegments[index], text: desc };
    handleUpdateScene('segments', updatedSegments);
    
    setIsGenerating(false);
    addToast('สร้างคำบรรยายสำเร็จ', 'success');
  };

  const handleSaveStory = async () => {
    // If saving in JSON mode, try to parse first
    if (viewMode === 'json') {
      try {
        const parsed = JSON.parse(jsonCode);
        setScenes(parsed);
      } catch (e) {
        addToast('JSON ไม่ถูกต้อง กรุณาตรวจสอบไวยากรณ์ก่อนบันทึก', 'error');
        return;
      }
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    addToast('บันทึกโครงสร้างนิยายเรียบร้อยแล้ว', 'success');
  };

  const handleAutoLayout = () => {
      // Very basic Mock Layout
      const newScenes = scenes.map((s, i) => ({
          ...s,
          x: 100 + (i % 3) * 350,
          y: 100 + Math.floor(i / 3) * 250
      }));
      setScenes(newScenes);
      addToast('จัดเรียงเลย์เอาท์เรียบร้อย', 'info');
  }

  // Toggle View Mode Logic
  const handleToggleViewMode = () => {
    if (viewMode === 'visual') {
      // Switch to JSON: Serialize scenes
      setJsonCode(JSON.stringify(scenes, null, 2));
      setViewMode('json');
    } else {
      // Switch to Visual: Parse JSON
      try {
        const parsed = JSON.parse(jsonCode);
        if (!Array.isArray(parsed)) throw new Error('Root must be an array of scenes');
        setScenes(parsed);
        setViewMode('visual');
      } catch (e) {
        addToast('รูปแบบ JSON ไม่ถูกต้อง ไม่สามารถกลับสู่โหมดกราฟิกได้', 'error');
      }
    }
  };

  // Asset Picker Helper
  const openAssetSelector = (type: 'image' | 'audio', onSelect: (url: string) => void) => {
      setAssetSelector({
          isOpen: true,
          type,
          onSelect
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 md:-m-8">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center space-x-3">
           <NavLink to="/stories" className="text-gray-500 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-md transition-colors">
             <ArrowLeft size={20} />
           </NavLink>
           <div className="border-r border-gray-200 pr-4 mr-2">
             <h1 className="text-sm font-bold text-gray-900">{currentStory?.title || 'Unknown Story'}</h1>
             <p className="text-[10px] text-gray-500">แก้ไขล่าสุด 2 นาทีที่แล้ว</p>
           </div>
           
           <div className="hidden md:flex space-x-1 border-r border-gray-200 pr-2 mr-1">
             <button 
                onClick={handleToggleViewMode}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'visual' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="โหมดกราฟิก"
                disabled={viewMode === 'visual'}
             >
                <Layout size={16} className="mr-1" /> Visual
             </button>
             <button 
                onClick={handleToggleViewMode}
                className={`flex items-center space-x-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${viewMode === 'json' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="แก้ไขโค้ด JSON"
                disabled={viewMode === 'json'}
             >
                <Code size={16} className="mr-1" /> JSON
             </button>
           </div>

           {viewMode === 'visual' && (
             <div className="hidden md:flex space-x-1">
               <button onClick={handleAutoLayout} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="จัดเรียงอัตโนมัติ">
                  <LayoutGrid size={18} />
               </button>
               <button className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="ค้นหาฉาก">
                  <Search size={18} />
               </button>
             </div>
           )}
        </div>

        <div className="flex items-center space-x-3">
          {viewMode === 'visual' && issuesCount > 0 && (
             <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-100">
                <AlertTriangle size={14} className="mr-1.5" />
                {issuesCount} ปัญหาที่พบ
             </div>
          )}
          
          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {viewMode === 'visual' && (
            <button className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 text-xs font-medium transition-colors">
               <Plus size={14} className="mr-1.5"/> เพิ่มฉาก
            </button>
          )}
          <button 
            onClick={handleSaveStory}
            disabled={isSaving}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
             {isSaving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5"/>}
             {isSaving ? 'บันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* VIEW MODE: VISUAL */}
        {viewMode === 'visual' && (
          <>
            {/* Graph Area */}
            <div className="flex-1 bg-gray-100 relative overflow-hidden">
               <StoryGraph 
                 scenes={scenes} 
                 selectedSceneId={selectedSceneId} 
                 onSceneSelect={setSelectedSceneId} 
               />
            </div>

            {/* Inspector Panel */}
            <div className={`w-[450px] bg-white border-l border-gray-200 flex flex-col overflow-y-auto shadow-xl transform transition-transform duration-300 absolute right-0 bottom-0 top-14 md:relative md:top-0 z-20 ${selectedSceneId ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:border-l-0'}`}>
               {selectedScene ? (
                 <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{selectedScene.id}</span>
                          <button onClick={() => setSelectedSceneId(null)} className="text-gray-400 hover:text-gray-600 md:hidden">
                            <ArrowLeft size={16} />
                          </button>
                       </div>
                       <div className="flex items-center space-x-2">
                          <input 
                            type="text" 
                            value={selectedScene.title} 
                            onChange={(e) => handleUpdateScene('title', e.target.value)}
                            className="font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 text-lg w-full placeholder-gray-400"
                            placeholder="ชื่อฉาก"
                          />
                       </div>
                       {/* Background Music Input */}
                       <div className="mt-3 flex items-center space-x-2 bg-white px-2 py-1.5 rounded-md border border-gray-200">
                          <Music size={14} className="text-gray-400" />
                          <input 
                            type="text" 
                            value={selectedScene.bgMusic || ''} 
                            onChange={(e) => handleUpdateScene('bgMusic', e.target.value)}
                            className="flex-1 text-xs border-none focus:ring-0 p-0 text-gray-600 placeholder-gray-400"
                            placeholder="URL เพลงประกอบ (bgMusic)"
                          />
                          <button 
                            onClick={() => openAssetSelector('audio', (url) => handleUpdateScene('bgMusic', url))}
                            className="text-indigo-600 hover:bg-indigo-50 p-1 rounded"
                            title="เลือกไฟล์เสียง"
                          >
                              <Folder size={14} />
                          </button>
                       </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                       
                       {/* Segments Editor */}
                       <div className="space-y-3">
                          <div className="flex justify-between items-center">
                             <label className="text-xs font-semibold text-gray-500 uppercase flex items-center">
                                <Layout size={12} className="mr-1.5"/> Segments ({selectedScene.segments?.length || 0})
                             </label>
                             <button onClick={handleAddSegment} className="text-xs text-indigo-600 font-medium hover:underline flex items-center">
                                <Plus size={12} className="mr-1"/> เพิ่ม Segment
                             </button>
                          </div>
                          
                          {/* Segment List */}
                          <div className="space-y-4">
                             {(selectedScene.segments || []).map((segment, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm group hover:border-indigo-200 transition-colors">
                                   <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center space-x-2">
                                         <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 rounded">#{idx + 1}</span>
                                         <div className="flex space-x-1">
                                            <button 
                                              onClick={() => handleMoveSegment(idx, 'up')} 
                                              disabled={idx === 0}
                                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded"
                                            >
                                               <ArrowUp size={12} />
                                            </button>
                                            <button 
                                              onClick={() => handleMoveSegment(idx, 'down')} 
                                              disabled={idx === (selectedScene.segments?.length || 0) - 1}
                                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded"
                                            >
                                               <ArrowDown size={12} />
                                            </button>
                                         </div>
                                      </div>
                                      <button onClick={() => handleRemoveSegment(idx)} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50">
                                         <Trash2 size={12} />
                                      </button>
                                   </div>

                                   <div className="flex gap-3">
                                      {/* Left: Image */}
                                      <div className="w-1/3 space-y-2">
                                         <div className="aspect-video bg-gray-100 rounded overflow-hidden border border-gray-200 relative group/img">
                                            {segment.image ? (
                                               <img src={segment.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                               <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                  <ImageIcon size={20} />
                                               </div>
                                            )}
                                         </div>
                                         <div className="flex space-x-1">
                                            <input 
                                                type="text" 
                                                placeholder="URL..." 
                                                value={segment.image}
                                                onChange={(e) => handleUpdateSegment(idx, 'image', e.target.value)}
                                                className="w-full text-[10px] border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                                            />
                                            <button 
                                                onClick={() => openAssetSelector('image', (url) => handleUpdateSegment(idx, 'image', url))}
                                                className="p-1 bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 border border-gray-200 rounded"
                                            >
                                                <Folder size={12} />
                                            </button>
                                         </div>
                                      </div>

                                      {/* Right: Text & Duration */}
                                      <div className="flex-1 space-y-2">
                                         <div className="relative">
                                            <textarea 
                                              rows={3}
                                              value={segment.text}
                                              onChange={(e) => handleUpdateSegment(idx, 'text', e.target.value)}
                                              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                              placeholder="เนื้อเรื่อง..."
                                            />
                                            <button 
                                              onClick={() => handleGenerateDescription(idx)}
                                              className="absolute bottom-1 right-1 p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                              title="AI Generate"
                                            >
                                               <Wand2 size={10} className={isGenerating ? 'animate-spin' : ''} />
                                            </button>
                                         </div>
                                         <div className="flex items-center space-x-2">
                                            <Clock size={12} className="text-gray-400" />
                                            <input 
                                              type="number"
                                              value={segment.duration}
                                              onChange={(e) => handleUpdateSegment(idx, 'duration', parseInt(e.target.value))}
                                              className="w-16 text-xs border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:border-indigo-500"
                                            />
                                            <span className="text-[10px] text-gray-400">ms</span>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             ))}
                             
                             {(!selectedScene.segments || selectedScene.segments.length === 0) && (
                                <div 
                                  onClick={handleAddSegment}
                                  className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                >
                                   <p className="text-xs text-gray-400 font-medium">+ คลิกเพื่อเพิ่ม Segment แรก</p>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Choices Editor */}
                       <div className="space-y-3 pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-500 uppercase">ทางเลือก ({selectedScene.choices?.length || 0})</label>
                            <button onClick={handleAddChoice} className="text-xs text-indigo-600 font-medium hover:underline">+ เพิ่มทางเลือก</button>
                          </div>

                          <div className="space-y-4">
                             {selectedScene.choices?.map((choice, idx) => (
                                <div key={choice.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 group">
                                   <div className="flex justify-between items-start mb-2">
                                      <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-1.5 rounded">#{idx + 1}</span>
                                      <button onClick={() => handleDeleteChoice(choice.id)} className="text-gray-400 hover:text-red-500">
                                         <Trash2 size={12} />
                                      </button>
                                   </div>
                                   
                                   <div className="space-y-2">
                                      <input 
                                        value={choice.text} 
                                        onChange={(e) => handleUpdateChoice(choice.id, 'text', e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                        placeholder="ข้อความตัวเลือก"
                                      />
                                   </div>

                                   <div className="flex mt-2 space-x-2">
                                      <div className="flex-1">
                                         <label className="text-[10px] text-gray-500 block mb-0.5">ไปยังฉาก</label>
                                         <select
                                            value={choice.targetSceneId || ''}
                                            onChange={(e) => handleUpdateChoice(choice.id, 'targetSceneId', e.target.value || null)}
                                            className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                         >
                                            <option value="">-- ไม่ระบุ (จบ/ทางตัน) --</option>
                                            {scenes.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.title} ({s.id})
                                                </option>
                                            ))}
                                         </select>
                                      </div>
                                      <div className="w-20">
                                         <label className="text-[10px] text-gray-500 block mb-0.5">ราคา (Credit)</label>
                                         <input 
                                           type="number"
                                           value={choice.cost} 
                                           onChange={(e) => handleUpdateChoice(choice.id, 'cost', parseInt(e.target.value))}
                                           className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-center"
                                         />
                                      </div>
                                   </div>
                                </div>
                             ))}
                             {(!selectedScene.choices || selectedScene.choices.length === 0) && (
                                <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                   <p className="text-xs text-gray-400">ยังไม่มีทางเลือก</p>
                                </div>
                             )}
                          </div>
                       </div>

                       {/* Ending Config */}
                       <div className="pt-4 border-t border-gray-100">
                          <label className="flex items-center space-x-2 mb-2">
                            <input 
                              type="checkbox" 
                              checked={selectedScene.isEnding} 
                              onChange={(e) => handleUpdateScene('isEnding', e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500" 
                            />
                            <span className="text-sm font-medium text-gray-900">กำหนดเป็นฉากจบ</span>
                          </label>
                          
                          {selectedScene.isEnding && (
                             <div className="ml-6 mt-2 p-3 bg-green-50 rounded-lg border border-green-100 space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-green-800 mb-1">ประเภทฉากจบ</label>
                                    <select 
                                    value={selectedScene.endingType || 'ปกติ'}
                                    onChange={(e) => handleUpdateScene('endingType', e.target.value)}
                                    className="w-full border-green-200 rounded px-2 py-1.5 text-sm focus:ring-green-500 bg-white text-green-900"
                                    >
                                    <option>ปกติ</option>
                                    <option>พิเศษ</option>
                                    <option>สมบูรณ์แบบ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-green-800 mb-1">ชื่อฉากจบ (Title)</label>
                                    <input 
                                      type="text" 
                                      value={selectedScene.endingTitle || ''} 
                                      onChange={(e) => handleUpdateScene('endingTitle', e.target.value)}
                                      className="w-full border-green-200 rounded px-2 py-1.5 text-sm focus:ring-green-500 bg-white"
                                      placeholder="เช่น สิ้นสุดการเดินทาง"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-green-800 mb-1">คำบรรยายฉากจบ</label>
                                    <textarea 
                                      rows={3}
                                      value={selectedScene.endingDescription || ''} 
                                      onChange={(e) => handleUpdateScene('endingDescription', e.target.value)}
                                      className="w-full border-green-200 rounded px-2 py-1.5 text-xs focus:ring-green-500 bg-white resize-none"
                                      placeholder="ข้อความสรุปตอนจบ..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-green-800 mb-1">รูปภาพฉากจบ</label>
                                    <div className="flex gap-2">
                                        <div className="w-16 h-16 bg-white border border-green-200 rounded overflow-hidden flex-shrink-0">
                                            {selectedScene.endingImage ? (
                                                <img src={selectedScene.endingImage} className="w-full h-full object-cover" alt="Ending" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-green-200"><ImageIcon size={20}/></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex space-x-1">
                                                <input 
                                                    type="text"
                                                    value={selectedScene.endingImage || ''}
                                                    onChange={(e) => handleUpdateScene('endingImage', e.target.value)}
                                                    className="w-full border-green-200 rounded px-2 py-1.5 text-xs focus:ring-green-500 bg-white mb-1"
                                                    placeholder="URL รูปภาพ..."
                                                />
                                                <button 
                                                    onClick={() => openAssetSelector('image', (url) => handleUpdateScene('endingImage', url))}
                                                    className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded h-fit"
                                                >
                                                    <Folder size={12} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-green-600">แสดงผลเมื่อผู้เล่นจบเกม</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                          )}
                       </div>
                       
                       <div className="h-10"></div> {/* Spacer */}
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                      <Wand2 size={24} className="opacity-50 text-indigo-500" />
                   </div>
                   <p className="font-medium text-gray-900">เลือกฉากเพื่อแก้ไข</p>
                   <p className="text-sm mt-1 text-gray-500 max-w-[200px]">คลิกที่โหนดในแผนผังด้านซ้ายเพื่อดูรายละเอียดและแก้ไข</p>
                 </div>
               )}
            </div>
          </>
        )}

        {/* VIEW MODE: JSON EDITOR */}
        {viewMode === 'json' && (
          <div className="flex-1 bg-gray-900 flex flex-col h-full overflow-hidden relative">
            <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center text-xs text-gray-400">
              <span>scenes.json</span>
              <span>{JSON.stringify(scenes).length} chars</span>
            </div>
            <textarea
              className="flex-1 w-full bg-gray-900 text-green-400 font-mono text-sm p-4 outline-none resize-none"
              value={jsonCode}
              onChange={(e) => setJsonCode(e.target.value)}
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Asset Selector Modal/Popover */}
      {assetSelector.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
                  <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="font-bold text-gray-900 text-lg flex items-center">
                          <Folder size={20} className="mr-2 text-indigo-600"/>
                          เลือกไฟล์ {assetSelector.type === 'image' ? 'รูปภาพ' : 'เสียง'}
                      </h3>
                      <button onClick={() => setAssetSelector({...assetSelector, isOpen: false})} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto bg-gray-50">
                      {currentStory?.assets && currentStory.assets.filter(a => a.type === assetSelector.type).length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                              {currentStory.assets
                                .filter(a => a.type === assetSelector.type)
                                .map((asset) => (
                                  <div 
                                    key={asset.id} 
                                    onClick={() => {
                                        assetSelector.onSelect(asset.url);
                                        setAssetSelector({...assetSelector, isOpen: false});
                                    }}
                                    className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
                                  >
                                      <div className="aspect-square bg-gray-100 relative flex items-center justify-center">
                                          {asset.type === 'image' ? (
                                              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                          ) : (
                                              <FileAudio size={32} className="text-gray-400" />
                                          )}
                                          <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                      </div>
                                      <div className="p-2">
                                          <p className="text-[10px] font-medium text-gray-900 truncate">{asset.name}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-12 text-gray-400">
                              <p>ไม่พบไฟล์ {assetSelector.type === 'image' ? 'รูปภาพ' : 'เสียง'} ในนิยายเรื่องนี้</p>
                              <p className="text-xs mt-1">กรุณาอัปโหลดไฟล์ที่หน้า "จัดการนิยาย > Assets"</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
