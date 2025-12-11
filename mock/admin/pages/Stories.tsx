import React, { useState, useMemo, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { MOCK_STORIES, MOCK_REVIEWS, MOCK_SCENES } from '../services/mockData';
import {
  Story,
  StoryStatus,
  StoryReview,
  GalleryItem,
  AvatarUnlockCondition,
  AvatarReward,
  Asset,
} from '../types';
import {
  Edit,
  MoreHorizontal,
  Plus,
  Copy,
  Archive,
  Search,
  Filter,
  Image as ImageIcon,
  X,
  Save,
  Trash2,
  Tag,
  Calendar,
  Clock,
  Star,
  Eye,
  EyeOff,
  MessageSquare,
  MessageCircle,
  Trophy,
  FileJson,
  Upload,
  Video,
  PlayCircle,
  User,
  ArrowLeft,
  Layout,
  Settings,
  Lock,
  Check,
  Youtube,
  Link as LinkIcon,
  GripVertical,
  FileImage,
  Film,
  Music,
  FileAudio,
  Folder,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { Pagination } from '../components/Pagination';

const WordCounter = ({ text }: { text: string }) => {
  const charCount = text.length;
  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

  return (
    <div className='text-right text-xs text-gray-400 mt-1'>
      {wordCount} คำ | {charCount} ตัวอักษร
    </div>
  );
};

export const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [reviews, setReviews] = useState<StoryReview[]>(MOCK_REVIEWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Master-Detail State
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'media' | 'reviews' | 'settings' | 'assets'
  >('overview');

  // Editing State (within Detail View)
  const [editingStory, setEditingStory] = useState<Partial<Story>>({});
  const [tagInput, setTagInput] = useState('');

  // Refs for file uploads
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputCoverRef = useRef<HTMLInputElement>(null);
  const fileInputHeaderRef = useRef<HTMLInputElement>(null);
  const assetsInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Gallery State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [addMediaTab, setAddMediaTab] = useState<'upload' | 'scene' | 'youtube'>('upload');

  // YouTube Input State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeCover, setYoutubeCover] = useState('');
  const youtubeCoverRef = useRef<HTMLInputElement>(null);

  // Avatar Reward Modal State
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [currentReward, setCurrentReward] = useState<Partial<AvatarReward>>({});
  const rewardFileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'archive' | 'delete';
    storyId: string;
    storyTitle: string;
  }>({ isOpen: false, type: 'archive', storyId: '', storyTitle: '' });

  // Reply Modal in Ratings
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean;
    reviewId: string | null;
    text: string;
  }>({ isOpen: false, reviewId: null, text: '' });

  const { addToast } = useToast();

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // When story is selected, initialize editing state
  useEffect(() => {
    if (selectedStory) {
      setEditingStory({ ...selectedStory });
      setTagInput(selectedStory.tags.join(', '));
      setActiveTab('overview');
    }
  }, [selectedStory]);

  // Get Ending Scenes for current story
  const endingScenes = useMemo(() => {
    if (!editingStory?.id) return [];
    return MOCK_SCENES.filter((s) => s.storyId === editingStory.id && s.isEnding);
  }, [editingStory?.id]);

  // Get All Scene Images for "Select from Scene"
  const availableSceneImages = useMemo(() => {
    if (!editingStory?.id) return [];
    const images = new Set<string>();
    MOCK_SCENES.filter((s) => s.storyId === editingStory.id).forEach((s) => {
      s.segments?.forEach((seg) => {
        if (seg.image) images.add(seg.image);
      });
    });
    return Array.from(images);
  }, [editingStory?.id]);

  const handleCreate = () => {
    const newStoryTemplate: Partial<Story> = {
      title: 'นิยายเรื่องใหม่',
      description: '',
      fullDescription: '',
      genre: 'ผจญภัย',
      status: StoryStatus.DRAFT,
      coverImage: '',
      headerImage: '',
      gallery: [],
      duration: '',
      tags: [],
      isNew: true,
      isPopular: false,
      comingSoon: false,
      scenesCount: 0,
      totalEndings: 0,
      totalPlayers: 0,
      rating: 0,
      completionRate: 0,
      avatarRewards: [],
      assets: [],
    };

    // Create new story immediately and select it
    const newStory = {
      ...newStoryTemplate,
      id: `s${Date.now()}`,
    } as Story;

    setStories([...stories, newStory]);
    setSelectedStory(newStory);
    setActiveTab('settings'); // Jump to settings
    addToast('สร้างนิยายใหม่แล้ว กรุณากรอกรายละเอียด', 'success');
  };

  const handleSaveMetadata = () => {
    if (!editingStory?.title) return;

    // Process tags
    const processedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t);

    const updatedStory = { ...editingStory, tags: processedTags } as Story;

    setStories(stories.map((s) => (s.id === updatedStory.id ? updatedStory : s)));
    setSelectedStory(updatedStory); // Update view
    addToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
  };

  // --- Image Upload Helpers ---
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'coverImage' | 'headerImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingStory) return;

    const mockUrl = URL.createObjectURL(file);
    setEditingStory({ ...editingStory, [field]: mockUrl });

    e.target.value = ''; // Reset input
  };

  const triggerUpload = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  // --- Asset Management ---
  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingStory) return;

    const newAssets: Asset[] = Array.from(files).map((file) => {
      const isAudio = file.type.startsWith('audio/');
      return {
        id: `ast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        url: URL.createObjectURL(file),
        type: isAudio ? 'audio' : 'image',
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
      };
    });

    setEditingStory({
      ...editingStory,
      assets: [...(editingStory.assets || []), ...newAssets],
    });

    e.target.value = '';
    addToast(`อัปโหลด ${newAssets.length} ไฟล์เรียบร้อยแล้ว`, 'success');
  };

  const handleDeleteAsset = (assetId: string) => {
    if (!confirm('ยืนยันการลบไฟล์นี้? หากมีการใช้งานในฉากอาจทำให้เกิดข้อผิดพลาด')) return;
    const newAssets = (editingStory.assets || []).filter((a) => a.id !== assetId);
    setEditingStory({ ...editingStory, assets: newAssets });
    addToast('ลบไฟล์เรียบร้อยแล้ว', 'success');
  };

  const handleAssetDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newAssets: Asset[] = Array.from(files).map((file) => {
        const isAudio = file.type.startsWith('audio/');
        return {
          id: `ast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          url: URL.createObjectURL(file),
          type: isAudio ? 'audio' : 'image',
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          uploadDate: new Date().toISOString().split('T')[0],
        };
      });

      setEditingStory({
        ...editingStory,
        assets: [...(editingStory.assets || []), ...newAssets],
      });
      addToast(`อัปโหลด ${newAssets.length} ไฟล์เรียบร้อยแล้ว`, 'success');
    }
  };

  // --- Avatar Reward Management ---
  const handleAddReward = () => {
    setCurrentReward({
      id: `av_${Date.now()}`,
      name: '',
      url: '',
      unlockCondition: 'any_ending',
      sourceStoryId: editingStory.id,
      sourceStoryTitle: editingStory.title,
    });
    setIsRewardModalOpen(true);
  };

  const handleEditReward = (reward: AvatarReward) => {
    setCurrentReward({ ...reward });
    setIsRewardModalOpen(true);
  };

  const handleDeleteReward = (rewardId: string) => {
    if (!confirm('ยืนยันการลบรางวัลนี้?')) return;
    const newRewards = (editingStory.avatarRewards || []).filter((r) => r.id !== rewardId);
    setEditingStory({ ...editingStory, avatarRewards: newRewards });
    addToast('ลบรางวัลเรียบร้อยแล้ว', 'success');
  };

  const handleSaveReward = () => {
    if (!currentReward.name || !currentReward.url) {
      addToast('กรุณากรอกชื่อและอัปโหลดรูปภาพ', 'warning');
      return;
    }

    const newReward = currentReward as AvatarReward;
    const existingRewards = editingStory.avatarRewards || [];
    const index = existingRewards.findIndex((r) => r.id === newReward.id);
    let updatedRewards;

    if (index >= 0) {
      updatedRewards = [...existingRewards];
      updatedRewards[index] = newReward;
    } else {
      updatedRewards = [...existingRewards, newReward];
    }

    setEditingStory({ ...editingStory, avatarRewards: updatedRewards });
    setIsRewardModalOpen(false);
    addToast('บันทึกรางวัลเรียบร้อยแล้ว', 'success');
  };

  const handleRewardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentReward({ ...currentReward, url: URL.createObjectURL(file) });
    }
  };

  // --- Gallery Logic ---
  const handleGalleryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingStory) return;

    const newItems: GalleryItem[] = Array.from(files).map((file) => {
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      return {
        type: fileType,
        url: URL.createObjectURL(file),
        thumbnail: fileType === 'video' ? 'https://picsum.photos/id/104/800/600' : undefined,
      };
    });

    setEditingStory({
      ...editingStory,
      gallery: [...(editingStory.gallery || []), ...newItems],
    });

    e.target.value = '';
    setIsAddMediaModalOpen(false);
    addToast(`เพิ่ม ${newItems.length} ไฟล์เรียบร้อยแล้ว`, 'success');
  };

  const handleAddFromScene = (imgUrl: string) => {
    const newItem: GalleryItem = { type: 'image', url: imgUrl };
    setEditingStory({
      ...editingStory,
      gallery: [...(editingStory.gallery || []), newItem],
    });
    setIsAddMediaModalOpen(false);
    addToast('เพิ่มรูปจากฉากเรียบร้อยแล้ว', 'success');
  };

  const handleYoutubeUploadCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setYoutubeCover(URL.createObjectURL(file));
  };

  const handleAddYoutube = () => {
    if (!youtubeUrl) {
      addToast('กรุณากรอก URL ของ YouTube', 'warning');
      return;
    }
    const newItem: GalleryItem = {
      type: 'video',
      url: youtubeUrl,
      thumbnail: youtubeCover || 'https://img.youtube.com/vi/placeholder/hqdefault.jpg',
    };
    setEditingStory({
      ...editingStory,
      gallery: [...(editingStory.gallery || []), newItem],
    });
    setYoutubeUrl('');
    setYoutubeCover('');
    setIsAddMediaModalOpen(false);
    addToast('เพิ่มวิดีโอ YouTube เรียบร้อยแล้ว', 'success');
  };

  const handleRemoveGalleryItem = (index: number) => {
    if (!editingStory) return;
    const newGallery = [...(editingStory.gallery || [])];
    newGallery.splice(index, 1);
    setEditingStory({ ...editingStory, gallery: newGallery });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !editingStory.gallery) return;

    const newGallery = [...editingStory.gallery];
    const draggedItem = newGallery[draggedIndex];
    newGallery.splice(draggedIndex, 1);
    newGallery.splice(targetIndex, 0, draggedItem);

    setEditingStory({ ...editingStory, gallery: newGallery });
    setDraggedIndex(null);
  };

  // --- List View Actions ---
  const handleDuplicate = (story: Story, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newStory: Story = {
      ...story,
      id: `s${Date.now()}`,
      title: `${story.title} (Copy)`,
      status: StoryStatus.DRAFT,
      totalPlayers: 0,
      rating: 0,
      completionRate: 0,
      isNew: true,
    };
    setStories([...stories, newStory]);
    addToast('คัดลอกนิยายเรียบร้อยแล้ว', 'success');
  };

  const handleDeleteClick = (story: Story, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      storyId: story.id,
      storyTitle: story.title,
    });
  };

  const executeConfirmation = () => {
    if (confirmModal.type === 'delete') {
      setStories(stories.filter((s) => s.id !== confirmModal.storyId));
      if (selectedStory?.id === confirmModal.storyId) setSelectedStory(null);
      addToast('ลบนิยายเรียบร้อยแล้ว', 'success');
    }
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // --- Import Logic ---
  const handleImportClick = () => {
    if (importInputRef.current) {
      importInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const itemsToImport = Array.isArray(json) ? json : [json];
        const validStories: Story[] = [];

        itemsToImport.forEach((item: any) => {
          if (item.title && item.genre) {
            const newStory: Story = {
              ...item,
              id: item.id || `s${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              status: item.status || StoryStatus.DRAFT,
              scenesCount: item.scenesCount || 0,
              totalEndings: item.totalEndings || 0,
              totalPlayers: 0,
              rating: 0,
              completionRate: 0,
              isNew: true,
              tags: item.tags || [],
              gallery: item.gallery || [],
              avatarRewards: item.avatarRewards || [],
              assets: item.assets || [],
            };
            validStories.push(newStory);
          }
        });

        if (validStories.length > 0) {
          setStories([...stories, ...validStories]);
          addToast(`นำเข้าสำเร็จ ${validStories.length} เรื่อง`, 'success');
        } else {
          addToast('ไม่พบข้อมูลนิยายที่ถูกต้อง', 'error');
        }
      } catch (error) {
        console.error('Import Error:', error);
        addToast('รูปแบบไฟล์ไม่ถูกต้อง', 'error');
      } finally {
        if (importInputRef.current) importInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- Rating Management ---
  const handleToggleHideReview = (reviewId: string) => {
    setReviews(reviews.map((r) => (r.id === reviewId ? { ...r, isHidden: !r.isHidden } : r)));
    addToast('อัปเดตสถานะรีวิวเรียบร้อย', 'info');
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) return;
    setReviews(reviews.filter((r) => r.id !== reviewId));
    addToast('ลบุรีวิวเรียบร้อยแล้ว', 'success');
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

  const activeReviews = useMemo(() => {
    if (!selectedStory) return [];
    return reviews.filter((r) => r.storyId === selectedStory.id);
  }, [reviews, selectedStory]);

  const filteredStories = stories.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedStories = filteredStories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // DETAIL VIEW RENDER
  if (selectedStory) {
    return (
      <div className='flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {/* Header */}
        <div className='flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => setSelectedStory(null)}
              className='mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                {selectedStory.title}
                <span
                  className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                         ${selectedStory.status === StoryStatus.PUBLISHED ? 'bg-green-100 text-green-800' : ''}
                         ${selectedStory.status === StoryStatus.DRAFT ? 'bg-yellow-100 text-yellow-800' : ''}
                         ${selectedStory.status === StoryStatus.ARCHIVED ? 'bg-gray-100 text-gray-800' : ''}
                       `}
                >
                  {selectedStory.status}
                </span>
              </h2>
              <p className='text-xs text-gray-500 font-mono mt-1'>ID: {selectedStory.id}</p>
            </div>
          </div>
          <div className='flex space-x-2'>
            <NavLink
              to='/stories/editor'
              className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm transition-colors'
            >
              <Edit size={16} className='mr-2' />
              แก้ไขเนื้อเรื่อง (Editor)
            </NavLink>
            <button
              onClick={(e) => handleDeleteClick(selectedStory, e)}
              className='flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition-colors'
            >
              <Trash2 size={16} className='mr-2' /> ลบ
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200 bg-white overflow-x-auto'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[100px] md:flex-none md:w-32 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            ภาพรวม
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 min-w-[120px] md:flex-none md:w-40 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'assets' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Assets (ไฟล์เกม)
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 min-w-[120px] md:flex-none md:w-40 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'media' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Gallery (หน้าปก)
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 min-w-[100px] md:flex-none md:w-32 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'reviews' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            รีวิว ({activeReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[100px] md:flex-none md:w-32 py-4 text-sm font-medium border-b-2 text-center transition-colors ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            ตั้งค่า
          </button>
        </div>

        {/* Content Area */}
        <div className='p-6 overflow-y-auto flex-1 bg-gray-50/50'>
          <div className='max-w-5xl mx-auto'>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className='space-y-6'>
                {/* Stats */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm'>
                    <p className='text-xs text-gray-500 uppercase font-bold'>ผู้เล่นทั้งหมด</p>
                    <h3 className='text-2xl font-bold text-gray-900 mt-1'>
                      {selectedStory.totalPlayers.toLocaleString()}
                    </h3>
                  </div>
                  <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm'>
                    <p className='text-xs text-gray-500 uppercase font-bold'>เรตติ้ง</p>
                    <h3 className='text-2xl font-bold text-yellow-500 mt-1 flex items-center'>
                      {selectedStory.rating} <Star size={18} className='fill-current ml-1' />
                    </h3>
                  </div>
                  <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm'>
                    <p className='text-xs text-gray-500 uppercase font-bold'>อัตราเล่นจบ</p>
                    <h3 className='text-2xl font-bold text-green-600 mt-1'>
                      {selectedStory.completionRate}%
                    </h3>
                  </div>
                  <div className='bg-white p-4 rounded-xl border border-gray-200 shadow-sm'>
                    <p className='text-xs text-gray-500 uppercase font-bold'>ฉากทั้งหมด</p>
                    <h3 className='text-2xl font-bold text-indigo-600 mt-1'>
                      {selectedStory.scenesCount}
                    </h3>
                  </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  <div className='lg:col-span-2 space-y-6'>
                    <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                      <h3 className='font-bold text-gray-900 mb-4'>เรื่องย่อ</h3>
                      <p className='text-gray-700 text-sm leading-relaxed whitespace-pre-wrap'>
                        {selectedStory.fullDescription ||
                          selectedStory.description ||
                          'ไม่มีรายละเอียด'}
                      </p>
                    </div>
                    <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                      <h3 className='font-bold text-gray-900 mb-4'>ข้อมูลทั่วไป</h3>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-500'>แนวเรื่อง:</span>{' '}
                          <span className='font-medium'>{selectedStory.genre}</span>
                        </div>
                        <div>
                          <span className='text-gray-500'>ความยาว:</span>{' '}
                          <span className='font-medium'>{selectedStory.duration}</span>
                        </div>
                        <div>
                          <span className='text-gray-500'>ฉากจบ:</span>{' '}
                          <span className='font-medium'>{selectedStory.totalEndings} แบบ</span>
                        </div>
                        <div>
                          <span className='text-gray-500'>วันที่เปิดตัว:</span>{' '}
                          <span className='font-medium'>{selectedStory.launchDate || '-'}</span>
                        </div>
                      </div>
                      <div className='mt-4 flex flex-wrap gap-2'>
                        {selectedStory.tags.map((tag) => (
                          <span
                            key={tag}
                            className='px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200'
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-6'>
                    <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center'>
                      <h3 className='font-bold text-gray-900 mb-4 self-start'>รูปปก</h3>
                      <div className='w-32 h-48 bg-gray-100 rounded overflow-hidden shadow-sm mb-2'>
                        <img
                          src={selectedStory.coverImage}
                          alt='Cover'
                          className='w-full h-full object-cover'
                        />
                      </div>
                    </div>
                    {selectedStory.avatarRewards && selectedStory.avatarRewards.length > 0 && (
                      <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm'>
                        <h3 className='font-bold text-gray-900 mb-3 flex items-center'>
                          <Trophy size={16} className='mr-2 text-indigo-500' />
                          รางวัลเมื่อจบ ({selectedStory.avatarRewards.length})
                        </h3>
                        <div className='space-y-3'>
                          {selectedStory.avatarRewards.slice(0, 3).map((reward) => (
                            <div
                              key={reward.id}
                              className='flex items-center space-x-3 p-2 bg-gray-50 rounded-lg'
                            >
                              <img
                                src={reward.url}
                                className='w-10 h-10 rounded-full border border-gray-200'
                                alt='Reward'
                              />
                              <div>
                                <p className='text-sm font-bold'>{reward.name}</p>
                                <p className='text-xs text-gray-500'>
                                  {reward.unlockCondition === 'any_ending'
                                    ? 'จบแบบใดก็ได้'
                                    : reward.unlockCondition === 'specific_ending'
                                      ? 'ฉากจบเฉพาะ'
                                      : 'เงื่อนไขพิเศษ'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ASSETS TAB */}
            {activeTab === 'assets' && (
              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6'>
                <div className='flex justify-between items-center mb-2'>
                  <h3 className='font-bold text-gray-900'>จัดการไฟล์เกม (Assets)</h3>
                  <span className='text-xs text-gray-500'>
                    ไฟล์เหล่านี้จะปรากฏให้เลือกในหน้า Editor
                  </span>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleAssetDrop}
                  className='border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-colors'
                  onClick={() => assetsInputRef.current?.click()}
                >
                  <input
                    type='file'
                    multiple
                    className='hidden'
                    ref={assetsInputRef}
                    onChange={handleAssetUpload}
                    accept='image/*,audio/*'
                  />
                  <div className='bg-white p-4 rounded-full shadow-sm mb-4'>
                    <Upload size={32} className='text-indigo-500' />
                  </div>
                  <p className='font-medium text-gray-700 text-lg'>
                    ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด
                  </p>
                  <p className='text-sm text-gray-500 mt-1'>
                    รองรับรูปภาพ (JPG, PNG) และเสียง (MP3, OGG)
                  </p>
                </div>

                <div>
                  <h4 className='font-bold text-gray-800 mb-4 flex items-center'>
                    <Folder size={18} className='mr-2 text-indigo-600' />
                    ไฟล์ทั้งหมด ({editingStory.assets?.length || 0})
                  </h4>

                  {editingStory.assets && editingStory.assets.length > 0 ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                      {editingStory.assets.map((asset) => (
                        <div
                          key={asset.id}
                          className='group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all'
                        >
                          <div className='aspect-square bg-gray-100 relative flex items-center justify-center'>
                            {asset.type === 'image' ? (
                              <img
                                src={asset.url}
                                alt={asset.name}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <div className='flex flex-col items-center text-gray-400'>
                                <FileAudio size={32} className='mb-2' />
                                <span className='text-xs uppercase font-bold'>AUDIO</span>
                              </div>
                            )}
                            <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                              <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className='p-2 bg-red-600 text-white rounded-full hover:bg-red-700'
                                title='ลบไฟล์'
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className='p-3'>
                            <p
                              className='text-xs font-medium text-gray-900 truncate'
                              title={asset.name}
                            >
                              {asset.name}
                            </p>
                            <div className='flex justify-between items-center mt-1'>
                              <span className='text-[10px] text-gray-500 uppercase bg-gray-100 px-1.5 py-0.5 rounded'>
                                {asset.type}
                              </span>
                              <span className='text-[10px] text-gray-400'>{asset.size}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-12 border border-gray-100 rounded-lg bg-gray-50'>
                      <p className='text-gray-400 text-sm'>ยังไม่มีไฟล์ในระบบ</p>
                    </div>
                  )}
                </div>

                <div className='border-t border-gray-100 pt-6 flex justify-end'>
                  <button
                    onClick={handleSaveMetadata}
                    className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm'
                  >
                    <Save size={16} className='mr-2' /> บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>
            )}

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6'>
                <div>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='font-bold text-gray-900'>
                      แกลเลอรีสื่อ ({editingStory.gallery?.length || 0})
                    </h3>
                    <button
                      onClick={() => setIsAddMediaModalOpen(true)}
                      className='flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm'
                    >
                      <Plus size={16} className='mr-2' /> เพิ่มสื่อ (Add Media)
                    </button>
                  </div>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {editingStory.gallery?.map((item, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 transition-all cursor-move
                                    ${draggedIndex === idx ? 'border-indigo-500 opacity-50' : 'border-gray-200 hover:border-indigo-300'}
                                `}
                      >
                        <div className='absolute top-2 left-2 z-10 p-1 bg-black/30 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                          <GripVertical size={14} />
                        </div>
                        {item.type === 'video' ? (
                          <div className='w-full h-full relative flex items-center justify-center bg-black'>
                            {item.url.includes('youtube') ? (
                              <Youtube size={32} className='text-red-500 z-10' />
                            ) : (
                              <PlayCircle size={32} className='text-white opacity-70 z-10' />
                            )}
                            <img
                              src={item.thumbnail}
                              className='absolute inset-0 w-full h-full object-cover opacity-50'
                              alt=''
                            />
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt=''
                            className='w-full h-full object-cover pointer-events-none'
                          />
                        )}
                        <button
                          onClick={() => handleRemoveGalleryItem(idx)}
                          className='absolute top-2 right-2 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-20'
                        >
                          <Trash2 size={14} />
                        </button>
                        <span className='absolute bottom-1 right-2 text-[10px] text-white/80 font-mono pointer-events-none'>
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className='border-t border-gray-100 pt-6'>
                  <button
                    onClick={handleSaveMetadata}
                    className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-sm ml-auto'
                  >
                    <Save size={16} className='mr-2' /> บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className='space-y-4'>
                {activeReviews.length > 0 ? (
                  activeReviews.map((review) => (
                    <div
                      key={review.id}
                      className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${review.isHidden ? 'opacity-75 bg-gray-50' : ''}`}
                    >
                      <div className='flex justify-between items-start'>
                        <div className='flex items-center space-x-3'>
                          <img
                            src={review.avatar}
                            alt=''
                            className='w-10 h-10 rounded-full border border-gray-200'
                          />
                          <div>
                            <div className='flex items-center space-x-2'>
                              <span className='font-bold text-sm text-gray-900'>
                                {review.username}
                              </span>
                              <span className='text-xs text-gray-400'>
                                {new Date(review.date).toLocaleDateString('th-TH')}
                              </span>
                              {review.isHidden && (
                                <span className='bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded'>
                                  ซ่อนอยู่
                                </span>
                              )}
                            </div>
                            <div className='flex items-center mt-1'>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handleReplyClick(review)}
                            className='p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded'
                            title='ตอบกลับ'
                          >
                            <MessageCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleHideReview(review.id)}
                            className='p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded'
                            title={review.isHidden ? 'แสดง' : 'ซ่อน'}
                          >
                            {review.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded'
                            title='ลบ'
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className='mt-3 text-sm text-gray-700 pl-14'>{review.comment}</p>
                      {review.adminReply && (
                        <div className='mt-3 ml-14 p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm'>
                          <p className='text-indigo-800 font-bold text-xs mb-1 flex items-center'>
                            <MessageCircle size={12} className='mr-1' /> ตอบกลับจากผู้ดูแล
                          </p>
                          <p className='text-indigo-900'>{review.adminReply}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed'>
                    <MessageSquare size={48} className='mx-auto mb-3 opacity-20' />
                    <p>ยังไม่มีรีวิว</p>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6'>
                <h3 className='font-bold text-gray-900 border-b border-gray-100 pb-3'>
                  แก้ไขข้อมูลนิยาย
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      ชื่อเรื่อง
                    </label>
                    <input
                      type='text'
                      value={editingStory.title}
                      onChange={(e) => setEditingStory({ ...editingStory, title: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none'
                    />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>คำโปรย</label>
                    <textarea
                      value={editingStory.description}
                      onChange={(e) =>
                        setEditingStory({ ...editingStory, description: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none font-mono text-sm'
                    />
                    <WordCounter text={editingStory.description || ''} />
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      เนื้อเรื่องย่อ (Full)
                    </label>
                    <textarea
                      value={editingStory.fullDescription}
                      onChange={(e) =>
                        setEditingStory({ ...editingStory, fullDescription: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none font-mono text-sm'
                    />
                    <WordCounter text={editingStory.fullDescription || ''} />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      แนวเรื่อง
                    </label>
                    <select
                      value={editingStory.genre}
                      onChange={(e) => setEditingStory({ ...editingStory, genre: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white'
                    >
                      <option>ผจญภัย</option>
                      <option>แฟนตาซี</option>
                      <option>ไซเบอร์พังค์</option>
                      <option>รักโรแมนติก</option>
                      <option>สยองขวัญ</option>
                      <option>สืบสวน</option>
                      <option>ดราม่า</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>สถานะ</label>
                    <select
                      value={editingStory.status}
                      onChange={(e) =>
                        setEditingStory({ ...editingStory, status: e.target.value as StoryStatus })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white'
                    >
                      <option value={StoryStatus.DRAFT}>แบบร่าง</option>
                      <option value={StoryStatus.PUBLISHED}>เผยแพร่แล้ว</option>
                      <option value={StoryStatus.ARCHIVED}>จัดเก็บ</option>
                    </select>
                  </div>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>แท็ก</label>
                    <div className='flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white'>
                      <Tag size={16} className='text-gray-400 mr-2' />
                      <input
                        type='text'
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className='flex-1 outline-none text-sm'
                        placeholder='คั่นด้วยจุลภาค...'
                      />
                    </div>
                  </div>

                  <div className='md:col-span-2 border-t border-gray-100 pt-6'>
                    <h4 className='text-sm font-bold text-gray-900 mb-4 flex items-center'>
                      <ImageIcon size={16} className='mr-2' />
                      รูปภาพหลัก
                    </h4>
                    <div className='grid grid-cols-2 gap-6'>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-2'>
                          รูปหน้าปก (Cover)
                        </label>
                        <input
                          type='file'
                          ref={fileInputCoverRef}
                          onChange={(e) => handleImageUpload(e, 'coverImage')}
                          className='hidden'
                          accept='image/*'
                        />
                        <div className='w-32 h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group'>
                          {editingStory.coverImage ? (
                            <>
                              <img
                                src={editingStory.coverImage}
                                alt='Cover'
                                className='w-full h-full object-cover'
                              />
                              <button
                                onClick={() => triggerUpload(fileInputCoverRef)}
                                className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs'
                              >
                                เปลี่ยน
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => triggerUpload(fileInputCoverRef)}
                              className='w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors'
                            >
                              <Upload size={24} className='mb-2' />
                              <span className='text-xs'>อัปโหลด</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-2'>
                          รูปส่วนหัว (Header)
                        </label>
                        <input
                          type='file'
                          ref={fileInputHeaderRef}
                          onChange={(e) => handleImageUpload(e, 'headerImage')}
                          className='hidden'
                          accept='image/*'
                        />
                        <div className='w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group'>
                          {editingStory.headerImage ? (
                            <>
                              <img
                                src={editingStory.headerImage}
                                alt='Header'
                                className='w-full h-full object-cover'
                              />
                              <button
                                onClick={() => triggerUpload(fileInputHeaderRef)}
                                className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs'
                              >
                                เปลี่ยน
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => triggerUpload(fileInputHeaderRef)}
                              className='w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors'
                            >
                              <Upload size={32} className='mb-2' />
                              <span className='text-sm'>อัปโหลด</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='md:col-span-2 border-t border-gray-100 pt-6'>
                    <div className='bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100'>
                      <div className='flex justify-between items-center mb-4'>
                        <h4 className='text-sm font-bold text-indigo-900 flex items-center'>
                          <Trophy size={18} className='mr-2 text-indigo-600' />
                          รางวัลเมื่อเล่นจบ (Avatar Rewards)
                        </h4>
                        <button
                          onClick={handleAddReward}
                          className='text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 flex items-center shadow-sm'
                        >
                          <Plus size={14} className='mr-1' /> เพิ่มรางวัล
                        </button>
                      </div>

                      {editingStory.avatarRewards && editingStory.avatarRewards.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          {editingStory.avatarRewards.map((reward) => (
                            <div
                              key={reward.id}
                              className='bg-white p-3 rounded-lg border border-indigo-100 shadow-sm flex items-center space-x-3 group relative'
                            >
                              <img
                                src={reward.url}
                                alt={reward.name}
                                className='w-12 h-12 rounded-full border border-gray-200 object-cover'
                              />
                              <div className='flex-1 min-w-0'>
                                <p className='text-sm font-bold text-gray-900 truncate'>
                                  {reward.name}
                                </p>
                                <p className='text-xs text-gray-500 truncate'>
                                  {reward.unlockCondition === 'any_ending'
                                    ? 'จบแบบใดก็ได้'
                                    : reward.unlockCondition === 'all_endings'
                                      ? 'ครบทุกฉากจบ'
                                      : reward.unlockCondition === 'complete_100'
                                        ? 'เก็บครบ 100%'
                                        : 'ฉากจบเฉพาะ'}
                                </p>
                              </div>
                              <div className='flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button
                                  onClick={() => handleEditReward(reward)}
                                  className='p-1.5 bg-gray-100 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded'
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteReward(reward.id)}
                                  className='p-1.5 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded'
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='text-center py-8 text-gray-400 bg-white/50 rounded-lg border border-dashed border-indigo-200'>
                          <Trophy size={32} className='mx-auto mb-2 opacity-30' />
                          <p className='text-xs'>ยังไม่มีรางวัลสำหรับนิยายเรื่องนี้</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='border-t border-gray-100 pt-6 flex justify-end'>
                  <button
                    onClick={handleSaveMetadata}
                    className='flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors'
                  >
                    <Save size={18} className='mr-2' /> บันทึกข้อมูล
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Declarations inside Detail View */}
        {replyModal.isOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden'>
              <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
                <h3 className='font-bold text-gray-900 flex items-center'>
                  <MessageCircle size={18} className='mr-2 text-indigo-500' /> ตอบกลับรีวิว
                </h3>
                <button onClick={() => setReplyModal({ isOpen: false, reviewId: null, text: '' })}>
                  <X size={20} className='text-gray-400' />
                </button>
              </div>
              <div className='p-4'>
                <textarea
                  value={replyModal.text}
                  onChange={(e) => setReplyModal({ ...replyModal, text: e.target.value })}
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none'
                  placeholder='ข้อความตอบกลับ...'
                />
              </div>
              <div className='p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50'>
                <button
                  onClick={() => setReplyModal({ isOpen: false, reviewId: null, text: '' })}
                  className='px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50'
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSubmitReply}
                  className='px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700'
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}

        {isAddMediaModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[85vh]'>
              <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
                <h3 className='font-bold text-gray-900 text-lg'>เพิ่มสื่อในแกลเลอรี</h3>
                <button
                  onClick={() => setIsAddMediaModalOpen(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={20} />
                </button>
              </div>

              <div className='flex border-b border-gray-200'>
                <button
                  onClick={() => setAddMediaTab('upload')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center transition-colors ${addMediaTab === 'upload' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Upload size={16} className='mr-2' /> อัปโหลดไฟล์
                </button>
                <button
                  onClick={() => setAddMediaTab('scene')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center transition-colors ${addMediaTab === 'scene' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <FileImage size={16} className='mr-2' /> เลือกจากฉาก
                </button>
                <button
                  onClick={() => setAddMediaTab('youtube')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 flex items-center justify-center transition-colors ${addMediaTab === 'youtube' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  <Youtube size={16} className='mr-2' /> YouTube
                </button>
              </div>

              <div className='p-6 overflow-y-auto'>
                {addMediaTab === 'upload' && (
                  <div className='flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-colors bg-gray-50'>
                    <div className='p-4 bg-white rounded-full shadow-sm mb-4'>
                      <Upload size={32} className='text-indigo-500' />
                    </div>
                    <p className='text-gray-600 font-medium mb-1'>
                      ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                    </p>
                    <input
                      type='file'
                      multiple
                      className='hidden'
                      ref={fileInputRef}
                      onChange={handleGalleryFileUpload}
                      accept='image/*,video/*'
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className='px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium transition-colors'
                    >
                      เลือกไฟล์จากคอมพิวเตอร์
                    </button>
                  </div>
                )}
                {addMediaTab === 'scene' && (
                  <div>
                    <p className='text-sm text-gray-500 mb-4'>
                      เลือกรูปภาพที่ใช้งานอยู่ในฉากต่างๆ ของนิยายเรื่องนี้
                    </p>
                    {availableSceneImages.length > 0 ? (
                      <div className='grid grid-cols-3 sm:grid-cols-4 gap-4'>
                        {availableSceneImages.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleAddFromScene(img)}
                            className='aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group relative'
                          >
                            <img src={img} alt='' className='w-full h-full object-cover' />
                            <div className='absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center'>
                              <Plus
                                className='text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all'
                                size={24}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-12 text-gray-400'>
                        <FileImage size={48} className='mx-auto mb-2 opacity-30' />
                        <p>ไม่พบรูปภาพในฉาก</p>
                      </div>
                    )}
                  </div>
                )}
                {addMediaTab === 'youtube' && (
                  <div className='space-y-6 max-w-lg mx-auto'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        ลิงก์วิดีโอ YouTube
                      </label>
                      <div className='flex items-center'>
                        <div className='bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-500'>
                          <LinkIcon size={16} />
                        </div>
                        <input
                          type='text'
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder='https://www.youtube.com/watch?v=...'
                          className='flex-1 px-3 py-2 border border-gray-300 rounded-r-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full'
                        />
                      </div>
                    </div>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        รูปหน้าปกวิดีโอ (Thumbnail)
                      </label>
                      <input
                        type='file'
                        ref={youtubeCoverRef}
                        onChange={handleYoutubeUploadCover}
                        className='hidden'
                        accept='image/*'
                      />
                      <div
                        onClick={() => youtubeCoverRef.current?.click()}
                        className='w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-gray-50 transition-colors relative overflow-hidden'
                      >
                        {youtubeCover ? (
                          <img
                            src={youtubeCover}
                            alt='Cover'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <>
                            <Film size={32} className='text-gray-400 mb-2' />
                            <span className='text-sm text-gray-500'>คลิกเพื่ออัปโหลดรูปปก</span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleAddYoutube}
                      className='w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors flex items-center justify-center'
                    >
                      <Plus size={18} className='mr-2' /> เพิ่มวิดีโอ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isRewardModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in'>
            <div className='bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-scale-in'>
              <div className='flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50'>
                <h3 className='font-bold text-gray-900 flex items-center'>
                  <Trophy size={18} className='mr-2 text-indigo-500' /> จัดการรางวัล (Avatar Reward)
                </h3>
                <button onClick={() => setIsRewardModalOpen(false)}>
                  <X size={20} className='text-gray-400' />
                </button>
              </div>
              <div className='p-6 space-y-4'>
                <div className='flex flex-col items-center'>
                  <label className='block text-xs font-medium text-gray-600 mb-2'>รูปอวาตาร์</label>
                  <input
                    type='file'
                    ref={rewardFileInputRef}
                    onChange={handleRewardImageUpload}
                    className='hidden'
                    accept='image/*'
                  />
                  <div className='w-24 h-24 rounded-full border-4 border-white shadow-sm bg-gray-50 overflow-hidden relative group'>
                    {currentReward.url ? (
                      <>
                        <img
                          src={currentReward.url}
                          alt='Avatar'
                          className='w-full h-full object-cover'
                        />
                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                          <button
                            onClick={() => triggerUpload(rewardFileInputRef)}
                            className='p-1.5 bg-white rounded-full text-gray-800 hover:bg-gray-100'
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => triggerUpload(rewardFileInputRef)}
                        className='w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors'
                      >
                        <Plus size={24} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    ชื่ออวาตาร์
                  </label>
                  <input
                    type='text'
                    value={currentReward.name || ''}
                    onChange={(e) => setCurrentReward({ ...currentReward, name: e.target.value })}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500'
                    placeholder='เช่น นักล่าสมบัติ'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    เงื่อนไขการปลดล็อค
                  </label>
                  <select
                    value={currentReward.unlockCondition || 'any_ending'}
                    onChange={(e) =>
                      setCurrentReward({
                        ...currentReward,
                        unlockCondition: e.target.value as AvatarUnlockCondition,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white focus:ring-1 focus:ring-indigo-500'
                  >
                    <option value='any_ending'>จบแบบใดก็ได้ (Any Ending)</option>
                    <option value='all_endings'>เก็บครบทุกฉากจบ (All Endings)</option>
                    <option value='complete_100'>เล่นครบ 100% (All Scenes)</option>
                    <option value='specific_ending'>จบแบบเฉพาะเจาะจง (Specific Ending)</option>
                  </select>
                </div>
                {currentReward.unlockCondition === 'specific_ending' && (
                  <div className='animate-fade-in'>
                    <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center'>
                      <Lock size={14} className='mr-1' /> เลือกฉากจบที่ต้องผ่าน
                    </label>
                    <select
                      value={currentReward.targetEndingId || ''}
                      onChange={(e) =>
                        setCurrentReward({ ...currentReward, targetEndingId: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-indigo-200 bg-indigo-50 rounded-lg outline-none text-indigo-900 focus:ring-1 focus:ring-indigo-500'
                    >
                      <option value=''>-- เลือกฉากจบ --</option>
                      {endingScenes.map((scene) => (
                        <option key={scene.id} value={scene.id}>
                          {scene.title} ({scene.endingType})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className='p-4 border-t border-gray-100 flex justify-end space-x-2 bg-gray-50'>
                <button
                  onClick={() => setIsRewardModalOpen(false)}
                  className='px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50'
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveReward}
                  className='px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 shadow-sm'
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <div className='flex flex-col h-full space-y-4'>
      {/* Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>จัดการนิยาย</h1>
          <p className='text-sm text-gray-500 mt-1'>สร้าง แก้ไข และจัดการนิยายทั้งหมดในระบบ</p>
        </div>
        <div className='flex space-x-2'>
          <input
            type='file'
            ref={importInputRef}
            className='hidden'
            accept='.json'
            onChange={handleFileChange}
          />
          <button
            onClick={handleImportClick}
            className='flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-colors'
          >
            <FileJson size={18} className='mr-2' /> นำเข้า JSON
          </button>
          <button
            onClick={handleCreate}
            className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-colors'
          >
            <Plus size={18} className='mr-2' /> สร้างนิยายใหม่
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className='bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between'>
        <div className='relative w-full md:w-96'>
          <Search
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
            size={18}
          />
          <input
            type='text'
            placeholder='ค้นหาชื่อเรื่อง, Genre...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
          />
        </div>
        <div className='flex items-center space-x-2 w-full md:w-auto overflow-x-auto'>
          <Filter size={18} className='text-gray-400 flex-shrink-0' />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
          >
            <option value='all'>สถานะทั้งหมด</option>
            <option value={StoryStatus.PUBLISHED}>{StoryStatus.PUBLISHED}</option>
            <option value={StoryStatus.DRAFT}>{StoryStatus.DRAFT}</option>
            <option value={StoryStatus.ARCHIVED}>{StoryStatus.ARCHIVED}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden'>
        <div className='overflow-x-auto flex-1'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  เรื่อง
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  สถิติ
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  สถานะ
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell'>
                  อัปเดตล่าสุด
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paginatedStories.length > 0 ? (
                paginatedStories.map((story) => (
                  <tr
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className='cursor-pointer hover:bg-gray-50 transition-colors group'
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='h-16 w-12 bg-gray-200 rounded overflow-hidden flex-shrink-0 border border-gray-300'>
                          {story.coverImage ? (
                            <img
                              className='h-full w-full object-cover'
                              src={story.coverImage}
                              alt=''
                            />
                          ) : (
                            <div className='h-full w-full flex items-center justify-center text-gray-400'>
                              <FileImage size={20} />
                            </div>
                          )}
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-bold text-gray-900 flex items-center'>
                            {story.title}
                            {story.isNew && (
                              <span className='ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full'>
                                New
                              </span>
                            )}
                          </div>
                          <div className='text-xs text-gray-500'>{story.genre}</div>
                          <div className='text-[10px] text-gray-400 mt-1 font-mono'>
                            ID: {story.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='text-xs text-gray-600 space-y-1'>
                        <div className='flex items-center justify-center'>
                          <User size={12} className='mr-1' /> {story.totalPlayers.toLocaleString()}
                        </div>
                        <div className='flex items-center justify-center text-yellow-600 font-bold'>
                          <Star size={12} className='mr-1 fill-current' /> {story.rating}
                        </div>
                        <div className='text-[10px] text-gray-400'>{story.scenesCount} ฉาก</div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${story.status === StoryStatus.PUBLISHED ? 'bg-green-100 text-green-800' : ''}
                        ${story.status === StoryStatus.DRAFT ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${story.status === StoryStatus.ARCHIVED ? 'bg-gray-100 text-gray-800' : ''}
                      `}
                      >
                        {story.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-xs text-gray-500 hidden md:table-cell'>
                      {story.launchDate || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStory(story);
                          }}
                          className='p-1.5 text-indigo-600 hover:bg-indigo-50 rounded'
                          title='แก้ไขรายละเอียด'
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(story, e)}
                          className='p-1.5 text-gray-500 hover:bg-gray-100 rounded'
                          title='คัดลอก'
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(story, e)}
                          className='p-1.5 text-red-600 hover:bg-red-50 rounded'
                          title='ลบ / จัดเก็บ'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className='px-6 py-12 text-center text-gray-500'>
                    ไม่พบข้อมูลนิยายตามเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredStories.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in'>
            <div className='p-6 text-center'>
              <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4'>
                <AlertTriangle className='h-6 w-6 text-red-600' />
              </div>
              <h3 className='text-lg font-bold text-gray-900 mb-2'>
                {confirmModal.type === 'delete' ? 'ยืนยันการลบ' : 'ยืนยันการจัดเก็บ'}
              </h3>
              <p className='text-sm text-gray-500'>
                คุณต้องการ{confirmModal.type === 'delete' ? 'ลบ' : 'จัดเก็บ'}นิยายเรื่อง "
                {confirmModal.storyTitle}" ใช่หรือไม่?
                {confirmModal.type === 'delete' && <br />}
                {confirmModal.type === 'delete' && (
                  <span className='text-red-500 text-xs'>การกระทำนี้ไม่สามารถย้อนกลับได้</span>
                )}
              </p>
            </div>
            <div className='bg-gray-50 px-6 py-4 flex space-x-3'>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className='flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm transition-colors'
              >
                ยกเลิก
              </button>
              <button
                onClick={executeConfirmation}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors ${confirmModal.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
