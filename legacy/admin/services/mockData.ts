
import { User, UserType, UserStatus, Story, StoryStatus, Scene, StoryReview, Genre, Achievement, AchievementType, AchievementTriggerType, Asset, AdminAccount, AdminRole, AdminLog, SystemConfig, StoryReport, ReportStatus } from '../types';

export const MOCK_GENRES: Genre[] = [
  { id: 'g1', name: 'ผจญภัย', slug: 'adventure', description: 'การเดินทางสำรวจดินแดนลึกลับและไขปริศนา', storyCount: 15, isActive: true },
  { id: 'g2', name: 'แฟนตาซี', slug: 'fantasy', description: 'โลกแห่งเวทมนตร์ สัตว์ในตำนาน และพลังเหนือธรรมชาติ', storyCount: 24, isActive: true },
  { id: 'g3', name: 'ไซเบอร์พังค์', slug: 'cyberpunk', description: 'โลกอนาคตที่เทคโนโลยีล้ำหน้าแต่สังคมเสื่อมโทรม', storyCount: 8, isActive: true },
  { id: 'g4', name: 'สยองขวัญ', slug: 'horror', description: 'เรื่องราวที่น่าสะพรึงกลัวและชวนขนหัวลุก', storyCount: 10, isActive: true },
  { id: 'g5', name: 'รักโรแมนติก', slug: 'romance', description: 'ความรักความสัมพันธ์ที่อบอุ่นหัวใจหรือดราม่า', storyCount: 32, isActive: true },
  { id: 'g6', name: 'สืบสวน', slug: 'mystery', description: 'การไขคดีฆาตกรรมและการหาความจริง', storyCount: 12, isActive: true },
  { id: 'g7', name: 'ดราม่า', slug: 'drama', description: 'เรื่องราวสะเทือนอารมณ์และชีวิตจริง', storyCount: 5, isActive: false },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    title: 'นักสำรวจเรื่องราว',
    description: 'เล่นนิยายครบ 5 เรื่องที่แตกต่างกัน',
    type: AchievementType.AUTO,
    icon: 'compass',
    isActive: true,
    triggerType: AchievementTriggerType.PLAY_COUNT,
    threshold: 5,
    rewardCredits: 50,
    rewardMaxCredits: 0,
    usersUnlocked: 1204,
    unlockTrend: 12
  },
  {
    id: 'a2',
    title: 'ผู้สนับสนุนใจดี',
    description: 'มอบรางวัลสำหรับผู้ที่สนับสนุนเว็บไซต์',
    type: AchievementType.MANUAL,
    icon: 'heart',
    isActive: true,
    rewardCredits: 100,
    rewardMaxCredits: 20,
    usersUnlocked: 45,
    unlockTrend: 5,
    rewardAvatars: ['https://ui-avatars.com/api/?name=Supporter&background=fcd34d&color=fff']
  },
  {
    id: 'a3',
    title: 'นักล่าฉากจบ',
    description: 'สะสมฉากจบครบ 10 แบบ',
    type: AchievementType.AUTO,
    icon: 'flag',
    isActive: true,
    triggerType: AchievementTriggerType.ENDING_COUNT,
    threshold: 10,
    rewardCredits: 200,
    rewardMaxCredits: 5,
    usersUnlocked: 320,
    unlockTrend: -2
  },
  {
    id: 'a4',
    title: 'นักวิจารณ์ปากเอก',
    description: 'เขียนรีวิวและให้คะแนนนิยาย 20 เรื่อง',
    type: AchievementType.AUTO,
    icon: 'star',
    isActive: true,
    triggerType: AchievementTriggerType.RATING_COUNT,
    threshold: 20,
    rewardCredits: 150,
    rewardMaxCredits: 0,
    usersUnlocked: 89,
    unlockTrend: 8
  },
  {
    id: 'a5',
    title: 'แชมป์กิจกรรมฤดูร้อน',
    description: 'ผู้ชนะกิจกรรมแต่งนิยายประจำเดือนเมษายน',
    type: AchievementType.MANUAL,
    icon: 'trophy',
    isActive: false,
    rewardCredits: 500,
    rewardMaxCredits: 50,
    usersUnlocked: 3,
    unlockTrend: 0,
    rewardAvatars: [
        'https://ui-avatars.com/api/?name=Champ+1&background=gold&color=fff',
        'https://ui-avatars.com/api/?name=Champ+2&background=silver&color=fff'
    ]
  },
  { id: 'a6', title: 'ผู้มาเยือนคนแรก', description: 'เข้าสู่ระบบครั้งแรก', type: AchievementType.AUTO, icon: 'gift', isActive: true, rewardCredits: 10, rewardMaxCredits: 0, usersUnlocked: 15000, unlockTrend: 5 },
  { id: 'a7', title: 'นักอ่านยามดึก', description: 'เล่นนิยายในช่วงเวลา 00:00 - 04:00', type: AchievementType.AUTO, icon: 'zap', isActive: true, rewardCredits: 20, rewardMaxCredits: 0, usersUnlocked: 540, unlockTrend: 2 },
  { id: 'a8', title: 'แฟนพันธุ์แท้ไซไฟ', description: 'เล่นนิยายแนวไซเบอร์พังค์ครบ 3 เรื่อง', type: AchievementType.AUTO, icon: 'star', isActive: true, rewardCredits: 100, rewardMaxCredits: 0, usersUnlocked: 120, unlockTrend: 1 },
  { id: 'a9', title: 'ผู้บริจาคระดับทอง', description: 'สนับสนุนเว็บไซต์รวม 1000 บาท', type: AchievementType.MANUAL, icon: 'shield', isActive: true, rewardCredits: 1000, rewardMaxCredits: 100, usersUnlocked: 10, unlockTrend: 0 },
  { id: 'a10', title: 'นักสืบฝึกหัด', description: 'ไขคดีสำเร็จในนิยายสืบสวน 1 เรื่อง', type: AchievementType.AUTO, icon: 'compass', isActive: true, rewardCredits: 50, rewardMaxCredits: 0, usersUnlocked: 800, unlockTrend: 4 }
];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    username: 'story_lover_99',
    email: 'alice@example.com',
    type: UserType.REGISTERED,
    provider: 'email',
    status: UserStatus.ACTIVE,
    credits: 45,
    maxCredits: 50,
    storiesPlayed: 12,
    achievementsUnlocked: 5,
    ratingsCount: 8,
    isDonator: true,
    lastActive: '2023-10-25T14:30:00Z',
    avatar: 'https://picsum.photos/id/64/100/100',
    activityLogs: [
      { id: 'l1', action: 'เข้าสู่ระบบ', details: 'เข้าใช้งานผ่าน Email', timestamp: '2023-10-25T14:30:00Z' },
      { id: 'l2', action: 'เติมเงิน', details: 'ซื้อแพ็คเกจ 100 เครดิต', timestamp: '2023-10-24T10:15:00Z' },
      { id: 'l3', action: 'เล่นนิยายจบ', details: 'จบเรื่อง "วัตถุโบราณที่หายสาบสูญ" (ฉากจบ A)', timestamp: '2023-10-23T20:00:00Z' }
    ],
    storyProgress: [
      { storyId: 's1', title: 'วัตถุโบราณที่หายสาบสูญ', progress: 100, status: 'จบแล้ว', lastPlayed: '2023-10-23T20:00:00Z' },
      { storyId: 's2', title: 'คืนนีออน', progress: 45, status: 'กำลังเล่น', lastPlayed: '2023-10-25T14:10:00Z' }
    ],
    achievements: [
      { id: 'a1', title: 'นักอ่านหน้าใหม่', unlockedAt: '2023-01-15T09:00:00Z' },
      { id: 'a2', title: 'ผู้สนับสนุนใจดี', unlockedAt: '2023-06-10T11:20:00Z' },
      { id: 'a3', title: 'หนอนหนังสือ', unlockedAt: '2023-08-05T16:45:00Z' },
      { id: 'a4', title: 'นักสะสมฉากจบ', unlockedAt: '2023-09-20T13:30:00Z' },
      { id: 'a5', title: 'แฟนพันธุ์แท้', unlockedAt: '2023-10-01T10:00:00Z' }
    ],
    ratings: [
      { storyId: 's1', title: 'วัตถุโบราณที่หายสาบสูญ', rating: 5, comment: 'สนุกมากครับ เนื้อเรื่องเข้มข้น', createdAt: '2023-10-23T20:05:00Z' },
      { storyId: 's3', title: 'รักในโตเกียว', rating: 4, comment: '', createdAt: '2023-09-15T12:00:00Z' }
    ],
    unlockedAvatars: [
      { id: 'av1', name: 'นักล่าสมบัติ', url: 'https://ui-avatars.com/api/?name=Hunter&background=7c3aed&color=fff', sourceStoryId: 's1', sourceStoryTitle: 'วัตถุโบราณที่หายสาบสูญ', unlockCondition: 'any_ending' }
    ]
  },
  {
    id: 'u2',
    username: 'Guest_2819',
    email: null,
    type: UserType.GUEST,
    provider: 'guest',
    status: UserStatus.ACTIVE,
    credits: 10,
    maxCredits: 20,
    storiesPlayed: 1,
    achievementsUnlocked: 0,
    ratingsCount: 0,
    isDonator: false,
    lastActive: '2023-10-26T09:15:00Z',
    avatar: 'https://picsum.photos/id/65/100/100',
    activityLogs: [
      { id: 'l1', action: 'เข้าสู่ระบบ', details: 'เข้าใช้งานแบบ Guest', timestamp: '2023-10-26T09:15:00Z' },
      { id: 'l2', action: 'เริ่มเล่น', details: 'เริ่มเรื่อง "วัตถุโบราณที่หายสาบสูญ"', timestamp: '2023-10-26T09:20:00Z' }
    ],
    storyProgress: [
      { storyId: 's1', title: 'วัตถุโบราณที่หายสาบสูญ', progress: 15, status: 'กำลังเล่น', lastPlayed: '2023-10-26T09:45:00Z' }
    ],
    achievements: [],
    ratings: [],
    unlockedAvatars: []
  },
  {
    id: 'u3',
    username: 'bad_actor',
    email: 'troll@example.com',
    type: UserType.REGISTERED,
    provider: 'google',
    status: UserStatus.BANNED,
    credits: 0,
    maxCredits: 0,
    storiesPlayed: 0,
    achievementsUnlocked: 0,
    ratingsCount: 0,
    isDonator: false,
    lastActive: '2023-09-01T00:00:00Z',
    avatar: 'https://picsum.photos/id/66/100/100',
    activityLogs: [
      { id: 'l1', action: 'ถูกระงับ', details: 'ละเมิดกฎชุมชน', timestamp: '2023-09-01T10:00:00Z' },
      { id: 'l2', action: 'รายงาน', details: 'ถูกผู้ใช้ report 5 ครั้ง', timestamp: '2023-08-31T23:00:00Z' }
    ],
    storyProgress: [],
    achievements: [],
    ratings: [],
    unlockedAvatars: []
  },
  {
    id: 'u4',
    username: 'pro_gamer',
    email: 'gamer@test.com',
    type: UserType.REGISTERED,
    provider: 'email',
    status: UserStatus.ACTIVE,
    credits: 150,
    maxCredits: 200,
    storiesPlayed: 50,
    achievementsUnlocked: 25,
    ratingsCount: 45,
    isDonator: true,
    lastActive: '2023-10-27T08:00:00Z',
    avatar: 'https://picsum.photos/id/68/100/100',
    activityLogs: [
      { id: 'l4', action: 'ปลดล็อคความสำเร็จ', details: 'นักล่าสมบัติระดับตำนาน', timestamp: '2023-10-27T08:05:00Z' }
    ],
    storyProgress: [],
    achievements: [],
    ratings: [],
    unlockedAvatars: []
  },
  // Adding more mock users for pagination
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `u${10 + i}`,
    username: `User_${10 + i}`,
    email: `user${10 + i}@example.com`,
    type: i % 3 === 0 ? UserType.GUEST : UserType.REGISTERED,
    provider: i % 3 === 0 ? 'guest' : 'email' as any,
    status: i % 10 === 0 ? UserStatus.BANNED : UserStatus.ACTIVE,
    credits: Math.floor(Math.random() * 100),
    maxCredits: 50,
    storiesPlayed: Math.floor(Math.random() * 10),
    achievementsUnlocked: Math.floor(Math.random() * 5),
    ratingsCount: Math.floor(Math.random() * 5),
    isDonator: i % 5 === 0,
    lastActive: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    avatar: `https://ui-avatars.com/api/?name=User+${10+i}&background=random`,
    activityLogs: [],
    storyProgress: [],
    achievements: [],
    ratings: [],
    unlockedAvatars: []
  }))
];

export const MOCK_ASSETS: Asset[] = [
    { id: 'img1', url: 'https://picsum.photos/id/30/600/400', type: 'image', uploadDate: '2023-10-01', size: '240 KB', name: 'temple_entrance.jpg' },
    { id: 'img2', url: 'https://picsum.photos/id/31/600/400', type: 'image', uploadDate: '2023-10-01', size: '350 KB', name: 'dark_hallway.jpg' },
    { id: 'img3', url: 'https://picsum.photos/id/32/600/400', type: 'image', uploadDate: '2023-10-02', size: '1.2 MB', name: 'secret_passage.jpg' },
    { id: 'img4', url: 'https://picsum.photos/id/33/600/400', type: 'image', uploadDate: '2023-10-02', size: '800 KB', name: 'treasure_chest.jpg' },
    { id: 'img5', url: 'https://picsum.photos/id/34/600/400', type: 'image', uploadDate: '2023-10-03', size: '500 KB', name: 'empty_room.jpg' },
    { id: 'img6', url: 'https://picsum.photos/id/100/600/400', type: 'image', uploadDate: '2023-09-15', size: '2.5 MB', name: 'forest_bg.jpg' }, // Unused
    { id: 'img7', url: 'https://picsum.photos/id/101/800/600', type: 'image', uploadDate: '2023-09-15', size: '1.8 MB', name: 'promotional_art.jpg' }, // Used in gallery
    { id: 'img8', url: 'https://picsum.photos/id/200/600/400', type: 'image', uploadDate: '2023-08-10', size: '3.1 MB', name: 'old_map.jpg' }, // Unused
    { id: 'audio1', url: 'https://actions.google.com/sounds/v1/ambiences/wind_synth.ogg', type: 'audio', uploadDate: '2023-10-05', size: '2.1 MB', name: 'wind_synth.ogg' },
    { id: 'audio2', url: 'https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg', type: 'audio', uploadDate: '2023-10-05', size: '3.5 MB', name: 'industrial_hum.ogg' },
];

export const MOCK_STORIES: Story[] = [
  {
    id: 's1',
    title: 'วัตถุโบราณที่หายสาบสูญ',
    description: 'การผจญภัยในวิหารโบราณเพื่อตามหาอัญมณีลึกลับที่สามารถเปลี่ยนแปลงชะตาของโลกได้ ผู้เล่นจะต้องเผชิญหน้ากับกับดัก ปริศนา และการทรยศ',
    fullDescription: 'ตำนานเล่าว่า "น้ำตาแห่งทวยเทพ" อัญมณีสีฟ้าครามที่มีพลังในการรักษาโรคทุกชนิดและมอบความอมตะให้แก่ผู้ครอบครอง ถูกซ่อนไว้อยู่ลึกเข้าไปในวิหารทองคำแห่งนครสาบสูญที่ไม่มีใครเคยได้กลับออกมา\n\nคุณคือนักโบราณคดีหนุ่ม/สาวไฟแรง ผู้ได้รับแผนที่ปริศนาจากพ่อที่หายสาบสูญไปเมื่อ 10 ปีก่อน การเดินทางครั้งนี้ไม่ใช่แค่เพื่อค้นหาสมบัติ แต่เพื่อตามหาร่องรอยของพ่อและไขความลับของตระกูล\n\nในระหว่างทาง คุณจะได้พบกับเพื่อนร่วมทางที่หลากหลาย ทั้ง "ลุงสมหมาย" พรานป่าผู้ช่ำชอง และ "อลิซ" นักวิชาการสาวผู้มีความลับซ่อนอยู่ ท่ามกลางป่าดงดิบที่เต็มไปด้วยสัตว์ร้ายและกับดักกลไกโบราณ คุณจะต้องตัดสินใจว่าจะเชื่อใจใคร และจะเสียสละสิ่งใดเพื่อให้ได้มาซึ่งสิ่งที่ต้องการ...',
    genre: 'ผจญภัย',
    status: StoryStatus.PUBLISHED,
    scenesCount: 45,
    totalEndings: 3,
    totalPlayers: 1250,
    rating: 4.8,
    coverImage: 'https://picsum.photos/id/10/200/300',
    headerImage: 'https://picsum.photos/id/11/800/400',
    gallery: [
      { type: 'image', url: 'https://picsum.photos/id/101/800/600' },
      { type: 'image', url: 'https://picsum.photos/id/102/800/600' },
      { type: 'image', url: 'https://picsum.photos/id/103/800/600' },
      { type: 'video', url: '#', thumbnail: 'https://picsum.photos/id/104/800/600' }
    ],
    assets: [
        ...MOCK_ASSETS
    ],
    completionRate: 68,
    duration: '2-3 ชม.',
    tags: ['ปริศนา', 'หักมุม', 'โบราณสถาน'],
    isPopular: true,
    avatarRewards: [
        {
            id: 'av_s1_1',
            name: 'นักล่าสมบัติ',
            url: 'https://ui-avatars.com/api/?name=Hunter&background=7c3aed&color=fff',
            sourceStoryId: 's1',
            sourceStoryTitle: 'วัตถุโบราณที่หายสาบสูญ',
            unlockCondition: 'any_ending'
        }
    ]
  },
  {
    id: 's2',
    title: 'คืนนีออน',
    description: 'ในโลกอนาคตที่เทคโนโลยีครอบงำมนุษย์ คุณคือนักสืบที่ต้องไขคดีฆาตกรรมแอนดรอยด์ที่มีเงื่อนงำเชื่อมโยงกับองค์กรยักษ์ใหญ่',
    fullDescription: 'ปี 2099 มหานครนีโอ-บางกอก เมืองที่ไม่เคยหลับใหล แสงไฟนีออนสาดส่องสะท้อนกับสายฝนกรดที่ตกลงมาอย่างไม่ขาดสาย มนุษย์และจักรกลอยู่ร่วมกันแต่ถูกแบ่งแยกด้วยชนชั้น\n\nคุณคือ "เรย์" อดีตตำรวจที่ผันตัวมาเป็นนักสืบเอกชน รับงานสืบสวนคดีที่ตำรวจไม่อยากยุ่ง คืนหนึ่ง แอนดรอยด์รุ่นพิเศษถูกพบเป็นศพในตรอกมืด โดยมีชิปความทรงจำที่ถูกทำลายอย่างจงใจ\n\nการสืบสวนพาคุณดำดิ่งสู่โลกใต้ดินของตลาดมืด องค์กรยักษ์ใหญ่ "ไซเบอร์เทค" และกลุ่มต่อต้านจักรกล ทุกการตัดสินใจของคุณจะส่งผลต่อความสัมพันธ์ระหว่างเผ่าพันธุ์ และอาจนำไปสู่สงครามครั้งใหม่',
    genre: 'ไซเบอร์พังค์',
    status: StoryStatus.DRAFT,
    scenesCount: 12,
    totalEndings: 0,
    totalPlayers: 850,
    rating: 4.5,
    coverImage: 'https://picsum.photos/id/20/200/300',
    headerImage: 'https://picsum.photos/id/21/800/400',
    gallery: [
      { type: 'image', url: 'https://picsum.photos/id/201/800/600' },
      { type: 'image', url: 'https://picsum.photos/id/202/800/600' }
    ],
    completionRate: 0,
    duration: '4 ชม.',
    tags: ['Sci-Fi', 'สืบสวน', 'ดราม่า'],
    isNew: true
  },
  {
    id: 's3',
    title: 'รักในโตเกียว',
    description: 'เรื่องราวความรักวุ่นๆ ระหว่างนักเรียนแลกเปลี่ยนและไอดอลชื่อดัง',
    genre: 'รักโรแมนติก',
    status: StoryStatus.PUBLISHED,
    scenesCount: 60,
    totalEndings: 5,
    totalPlayers: 3200,
    rating: 4.2,
    coverImage: 'https://picsum.photos/id/30/200/300',
    headerImage: 'https://picsum.photos/id/31/800/400',
    completionRate: 85,
    duration: '5 ชม.',
    tags: ['Love', 'School', 'Idol']
  },
  {
    id: 's4',
    title: 'บ้านร้างท้ายหมู่บ้าน',
    description: 'ท้าพิสูจน์ตำนานผีเฮี้ยนที่ไม่มีใครกล้าย่างกรายเข้าไป',
    genre: 'สยองขวัญ',
    status: StoryStatus.PUBLISHED,
    scenesCount: 25,
    totalEndings: 2,
    totalPlayers: 540,
    rating: 4.7,
    coverImage: 'https://picsum.photos/id/40/200/300',
    headerImage: 'https://picsum.photos/id/41/800/400',
    completionRate: 40,
    duration: '1 ชม.',
    tags: ['Ghost', 'Horror', 'Jump Scare']
  },
  {
    id: 's5',
    title: 'พลิกคดีปริศนา',
    description: 'ทนายความหนุ่มที่ต้องว่าความให้จำเลยที่ดูเหมือนจะมีความผิดเต็มประตู',
    genre: 'สืบสวน',
    status: StoryStatus.PUBLISHED,
    scenesCount: 80,
    totalEndings: 4,
    totalPlayers: 1800,
    rating: 4.6,
    coverImage: 'https://picsum.photos/id/50/200/300',
    headerImage: 'https://picsum.photos/id/51/800/400',
    completionRate: 60,
    duration: '6 ชม.',
    tags: ['Court', 'Mystery', 'Detective']
  },
  { id: 's6', title: 'ตำนานป่าหิมพานต์', description: 'การผจญภัยในโลกวรรณคดีไทย', genre: 'แฟนตาซี', status: StoryStatus.PUBLISHED, scenesCount: 30, totalEndings: 2, totalPlayers: 400, rating: 4.0, coverImage: 'https://picsum.photos/id/60/200/300', headerImage: 'https://picsum.photos/id/61/800/400', completionRate: 50, duration: '2 ชม.', tags: ['Thai', 'Fantasy'] },
  { id: 's7', title: 'รหัสลับดาวินชี', description: 'ตามหาความจริงที่ซ่อนอยู่ในงานศิลปะ', genre: 'สืบสวน', status: StoryStatus.DRAFT, scenesCount: 10, totalEndings: 0, totalPlayers: 0, rating: 0, coverImage: 'https://picsum.photos/id/70/200/300', headerImage: 'https://picsum.photos/id/71/800/400', completionRate: 0, duration: 'TBD', tags: ['Mystery', 'Art'] }
];

export const MOCK_REPORTS: StoryReport[] = [
  {
    id: 'rep1',
    targetType: 'story',
    storyId: 's3',
    storyTitle: 'รักในโตเกียว',
    reporterId: 'u2',
    reporterName: 'Guest_2819',
    reason: 'เนื้อหาไม่เหมาะสม',
    details: 'มีฉากที่มีคำหยาบคายมากเกินไปในบทที่ 5',
    status: ReportStatus.PENDING,
    timestamp: '2023-10-27T10:30:00Z'
  },
  {
    id: 'rep2',
    targetType: 'story',
    storyId: 's1',
    storyTitle: 'วัตถุโบราณที่หายสาบสูญ',
    reporterId: 'u1',
    reporterName: 'story_lover_99',
    reason: 'บั๊ก/ข้อผิดพลาด',
    details: 'ฉากที่ 12 โหลดรูปภาพไม่ขึ้น และกดปุ่มเลือกไม่ได้',
    status: ReportStatus.RESOLVED,
    timestamp: '2023-10-26T15:20:00Z'
  },
  {
    id: 'rep3',
    targetType: 'story',
    storyId: 's4',
    storyTitle: 'บ้านร้างท้ายหมู่บ้าน',
    reporterId: 'u6',
    reporterName: 'scaredy_cat',
    reason: 'การคัดลอกผลงาน',
    details: 'เนื้อเรื่องเหมือนกับนิยายเรื่อง "The Haunting" ในเว็บอื่น',
    status: ReportStatus.PENDING,
    timestamp: '2023-10-27T08:15:00Z'
  },
  {
    id: 'rep4',
    targetType: 'story',
    storyId: 's2',
    storyTitle: 'คืนนีออน',
    reporterId: 'u3',
    reporterName: 'bad_actor',
    reason: 'สแปม',
    details: 'เรื่องนี้สั้นเกินไป เหมือนทำมาปั่นยอดวิวเฉยๆ',
    status: ReportStatus.DISMISSED,
    timestamp: '2023-10-25T11:00:00Z'
  },
  {
    id: 'rep5',
    targetType: 'story',
    storyId: 's5',
    storyTitle: 'พลิกคดีปริศนา',
    reporterId: 'u4',
    reporterName: 'pro_gamer',
    reason: 'บั๊ก/ข้อผิดพลาด',
    details: 'เล่นจบแล้วไม่ได้ Achievement',
    status: ReportStatus.PENDING,
    timestamp: '2023-10-27T12:00:00Z'
  },
  // --- New Review Reports ---
  {
    id: 'rep6',
    targetType: 'review',
    storyId: 's1',
    storyTitle: 'วัตถุโบราณที่หายสาบสูญ',
    reviewId: 'r3',
    reviewContent: 'เกมห่วยแตก อย่าเสียเวลาเล่น (สปอยล์: พระเอกตายตอนจบ)',
    reviewOwnerName: 'bad_actor',
    reporterId: 'u1',
    reporterName: 'story_lover_99',
    reason: 'สปอยล์เนื้อหา',
    details: 'ผู้ใช้นี้สปอยล์ตอนจบในคอมเมนต์โดยไม่ปิดบัง',
    status: ReportStatus.PENDING,
    timestamp: '2023-10-28T09:00:00Z'
  },
  {
    id: 'rep7',
    targetType: 'review',
    storyId: 's4',
    storyTitle: 'บ้านร้างท้ายหมู่บ้าน',
    reviewId: 'r7',
    reviewContent: 'เนื้อเรื่องขยะมาก คนแต่งปัญญาอ่อน',
    reviewOwnerName: 'scaredy_cat',
    reporterId: 'u4',
    reporterName: 'pro_gamer',
    reason: 'คำหยาบคาย/คุกคาม',
    details: 'ใช้คำพูดด่าทอผู้แต่งรุนแรง',
    status: ReportStatus.PENDING,
    timestamp: '2023-10-28T10:15:00Z'
  }
];

export const MOCK_REVIEWS: StoryReview[] = [
  {
    id: 'r1',
    storyId: 's1',
    storyTitle: 'วัตถุโบราณที่หายสาบสูญ',
    userId: 'u1',
    username: 'story_lover_99',
    avatar: 'https://picsum.photos/id/64/100/100',
    rating: 5,
    comment: 'เนื้อเรื่องสนุกมากครับ หักมุมตอนจบทำเอาอึ้งเลย!',
    date: '2023-10-23T20:05:00Z',
    isHidden: false,
    isFeatured: true,
    adminReply: 'ขอบคุณครับ ทีมงานดีใจที่คุณชอบ!',
    adminReplyDate: '2023-10-24T09:00:00Z'
  },
  {
    id: 'r2',
    storyId: 's1',
    storyTitle: 'วัตถุโบราณที่หายสาบสูญ',
    userId: 'u5',
    username: 'casual_reader',
    avatar: 'https://picsum.photos/id/70/100/100',
    rating: 4,
    comment: 'ภาพสวย บรรยากาศดี แต่บางปริศนายากไปหน่อย',
    date: '2023-10-24T10:00:00Z',
    isHidden: false
  },
  {
    id: 'r3',
    storyId: 's1',
    storyTitle: 'วัตถุโบราณที่หายสาบสูญ',
    userId: 'u3',
    username: 'bad_actor',
    avatar: 'https://picsum.photos/id/66/100/100',
    rating: 1,
    comment: 'เกมห่วยแตก อย่าเสียเวลาเล่น (สปอยล์: พระเอกตายตอนจบ)',
    date: '2023-10-25T09:30:00Z',
    isHidden: true
  },
  {
    id: 'r4',
    storyId: 's3',
    storyTitle: 'รักในโตเกียว',
    userId: 'u2',
    username: 'Guest_2819',
    avatar: 'https://picsum.photos/id/65/100/100',
    rating: 5,
    comment: 'ชอบตัวละครมากค่ะ น่ารักสุดๆ',
    date: '2023-10-26T14:20:00Z',
    isHidden: false
  },
  {
    id: 'r5',
    storyId: 's3',
    storyTitle: 'รักในโตเกียว',
    userId: 'u4',
    username: 'pro_gamer',
    avatar: 'https://picsum.photos/id/68/100/100',
    rating: 3,
    comment: 'เนื้อเรื่องยืดเยื้อไปหน่อย แต่จบดี',
    date: '2023-10-22T08:45:00Z',
    isHidden: false,
    adminReply: 'ขอบคุณสำหรับคำแนะนำครับ เราจะปรับปรุงการดำเนินเรื่องในอนาคต',
    adminReplyDate: '2023-10-23T10:00:00Z'
  },
  {
    id: 'r6',
    storyId: 's4',
    storyTitle: 'บ้านร้างท้ายหมู่บ้าน',
    userId: 'u1',
    username: 'story_lover_99',
    avatar: 'https://picsum.photos/id/64/100/100',
    rating: 5,
    comment: 'น่ากลัวจริง จังหวะตุ้งแช่ทำเอาสะดุ้ง',
    date: '2023-10-20T22:15:00Z',
    isHidden: false,
    isFeatured: true
  },
  {
    id: 'r7',
    storyId: 's4',
    storyTitle: 'บ้านร้างท้ายหมู่บ้าน',
    userId: 'u6',
    username: 'scaredy_cat',
    avatar: 'https://picsum.photos/id/72/100/100',
    rating: 2,
    comment: 'เนื้อเรื่องขยะมาก คนแต่งปัญญาอ่อน',
    date: '2023-10-21T11:00:00Z',
    isHidden: false
  },
  {
    id: 'r8',
    storyId: 's5',
    storyTitle: 'พลิกคดีปริศนา',
    userId: 'u4',
    username: 'pro_gamer',
    avatar: 'https://picsum.photos/id/68/100/100',
    rating: 5,
    comment: 'ระบบสืบสวนทำออกมาได้ดีมาก ต้องใช้ความคิดเยอะดี',
    date: '2023-10-27T09:30:00Z',
    isHidden: false
  },
  // Extra reviews for pagination
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `r${10 + i}`,
    storyId: 's1',
    storyTitle: 'วัตถุโบราณที่หายสาบสูญ',
    userId: `u${10 + i}`,
    username: `Reviewer_${i}`,
    avatar: `https://ui-avatars.com/api/?name=R+${i}&background=random`,
    rating: Math.floor(Math.random() * 5) + 1,
    comment: `ความเห็นทดสอบที่ ${i + 1}`,
    date: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    isHidden: false
  }))
];

export const MOCK_SCENES: Scene[] = [
  {
    id: 'sc1',
    storyId: 's1',
    title: 'จุดเริ่มต้น',
    bgMusic: 'https://actions.google.com/sounds/v1/ambiences/wind_synth.ogg',
    segments: [
      {
        text: 'คุณยืนอยู่หน้าทางเข้าวิหารโบราณ บรรยากาศเงียบสงัดจนน่าขนลุก',
        duration: 3000,
        image: 'https://picsum.photos/id/30/600/400'
      },
      {
        text: 'เสียงลมพัดหวีดหวิวราวกับเสียงกระซิบของผู้ที่ล่วงลับ',
        duration: 4000,
        image: 'https://picsum.photos/id/30/600/400'
      }
    ],
    isEnding: false,
    x: 100, y: 300,
    choices: [
      { id: 'c1', text: 'เดินเข้าไปอย่างกล้าหาญ', targetSceneId: 'sc2', cost: 0 },
      { id: 'c2', text: 'สำรวจรอบๆ ก่อน', targetSceneId: 'sc3', cost: 0 }
    ]
  },
  {
    id: 'sc2',
    storyId: 's1',
    title: 'โถงทางเดินหลัก',
    bgMusic: 'https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg',
    segments: [
        {
            text: 'ห้องโถงมืดและชื้น มีคบเพลิงเรียงรายอยู่ตามผนัง',
            duration: 3000,
            image: 'https://picsum.photos/id/31/600/400'
        }
    ],
    isEnding: false,
    x: 400, y: 150,
    choices: [
      { id: 'c3', text: 'จุดคบเพลิง', targetSceneId: 'sc4', cost: 1 }
    ]
  },
  {
    id: 'sc3',
    storyId: 's1',
    title: 'เส้นทางลับ',
    segments: [
        {
            text: 'คุณพบรอยแตกเล็กๆ ที่ผนัง ดูเหมือนจะมีลมพัดออกมา',
            duration: 3000,
            image: 'https://picsum.photos/id/32/600/400'
        }
    ],
    isEnding: false,
    x: 400, y: 450,
    choices: [
      { id: 'c4', text: 'มุดเข้าไป', targetSceneId: 'sc4', cost: 0 }
    ]
  },
  {
    id: 'sc4',
    storyId: 's1',
    title: 'ห้องสมบัติ',
    bgMusic: 'https://actions.google.com/sounds/v1/ambiences/industrial_hum.ogg',
    segments: [
      {
        text: 'คุณตื่นขึ้นมาในห้องที่หนาวเหน็บ อากาศอบอวลไปด้วยกลิ่นโอโซนและสนิม',
        duration: 4000,
        image: 'https://picsum.photos/seed/cyberpunk_room/1920/1080'
      },
      {
        text: 'เสียงเครื่องจักรทำงานหนักดังมาจากที่ไกลๆ ไฟฉุกเฉินสีแดงกระพริบเป็นจังหวะเหมือนชีพจรที่กำลังจะหยุดเต้น',
        duration: 4000,
        image: 'https://picsum.photos/seed/red_light_alarm/1920/1080'
      }
    ],
    isEnding: true,
    endingType: 'ปกติ',
    endingImage: 'https://picsum.photos/seed/red_light_alarm/1920/1080',
    endingTitle: 'สิ้นสุดการเดินทาง',
    endingDescription: 'ชะตากรรมไม่ใช่สิ่งที่ถูกกำหนดไว้ล่วงหน้า แต่เป็นผลรวมของการกระทำเล็กๆ น้อยๆ ที่คุณเลือกในทุกช่วงลมหายใจ',
    x: 700, y: 300,
    choices: []
  },
  // --- Problematic Scenes for Moderation Tools ---
  {
    id: 'sc5_orphan',
    storyId: 's1',
    title: 'ห้องลับที่ถูกลืม',
    segments: [
        {
            text: 'ห้องนี้ไม่มีทางเข้าและไม่มีใครรู้ว่ามันมีอยู่จริง',
            duration: 3000,
            image: 'https://picsum.photos/id/34/600/400'
        }
    ],
    isEnding: false,
    x: 700, y: 500,
    choices: [],
    validationIssues: ['dead_end']
  },
  {
    id: 'sc6_no_img',
    storyId: 's1',
    title: 'ทางเดินมืดมิด',
    segments: [
        {
            text: 'คุณมองไม่เห็นอะไรเลยนอกจากความมืด',
            duration: 3000,
            image: ''
        }
    ],
    isEnding: false,
    x: 200, y: 500,
    choices: [
        { id: 'c5', text: 'กลับไป', targetSceneId: 'sc1', cost: 0 }
    ],
    validationIssues: ['missing_image']
  }
];

export const DAILY_STATS = [
  { name: 'จ.', uv: 400, pv: 2400 },
  { name: 'อ.', uv: 300, pv: 1398 },
  { name: 'พ.', uv: 200, pv: 9800 },
  { name: 'พฤ.', uv: 278, pv: 3908 },
  { name: 'ศ.', uv: 189, pv: 4800 },
  { name: 'ส.', uv: 2390, pv: 3800 },
  { name: 'อา.', uv: 3490, pv: 4300 },
];

export const DASHBOARD_STATS = {
  registeredUsers: 15420,
  activeGuest: 3200,
  activeRegistered: 8500,
  dailyActive: 11700,
  storyPlaysToday: 450,
  creditsConsumedToday: 2100,
  ratingsToday: 35,
  achievementsToday: 120,
  errors: 3
};

export const USER_DISTRIBUTION_DATA = [
  { name: 'สมาชิกทั่วไป', value: 65, color: '#4F46E5' }, // Indigo-600
  { name: 'ผู้เยี่ยมชม', value: 35, color: '#9CA3AF' }, // Gray-400
];

export const FUNNEL_DATA = [
  { name: 'เริ่มเรื่อง', value: 1000 },
  { name: 'บทที่ 1', value: 850 },
  { name: 'จุดเปลี่ยน', value: 600 },
  { name: 'บทช่วงท้าย', value: 400 },
  { name: 'ฉากจบ', value: 280 },
];

export const CREDIT_HEATMAP_DATA = [
  // Intensity 1-5 (5 is highest)
  { day: 'จ.', slots: [1, 1, 2, 3, 5, 4] },
  { day: 'อ.', slots: [1, 2, 2, 4, 4, 3] },
  { day: 'พ.', slots: [1, 1, 3, 4, 5, 3] },
  { day: 'พฤ.', slots: [1, 2, 2, 3, 4, 4] },
  { day: 'ศ.', slots: [2, 3, 4, 5, 5, 5] },
  { day: 'ส.', slots: [3, 4, 5, 5, 4, 3] },
  { day: 'อา.', slots: [3, 4, 5, 5, 4, 3] },
];

export const SYSTEM_LOGS = [
  { id: 1, type: 'error', message: 'Missing Image Asset: scene_104.jpg', time: '10:45 น.', location: 'บ้านร้างท้ายหมู่บ้าน' },
  { id: 2, type: 'warning', message: 'Translation missing for Choice #3', time: '09:20 น.', location: 'รักในโตเกียว' },
  { id: 3, type: 'error', message: 'Dead-end node detected', time: 'เมื่อวาน', location: 'คืนนีออน' },
  { id: 4, type: 'info', message: 'System backup completed', time: '02:00 น.', location: 'System' },
];

// Analytics Data
export const SCENE_DROP_OFF_DATA = [
  { name: 'Scene 1', players: 1200 },
  { name: 'Scene 2', players: 1150 },
  { name: 'Scene 5', players: 900 },
  { name: 'Scene 10', players: 600 },
  { name: 'Ending', players: 450 },
];

export const RETENTION_DATA = [
  { day: 'Day 1', retention: 100 },
  { day: 'Day 2', retention: 60 },
  { day: 'Day 3', retention: 45 },
  { day: 'Day 7', retention: 30 },
  { day: 'Day 14', retention: 20 },
  { day: 'Day 30', retention: 15 },
];

export const USER_GROWTH_DATA = [
  { month: 'Jan', users: 500 },
  { month: 'Feb', users: 800 },
  { month: 'Mar', users: 1200 },
  { month: 'Apr', users: 1800 },
  { month: 'May', users: 2400 },
  { month: 'Jun', users: 3200 },
];

export const ASSET_ERRORS = [
    { id: 'e1', asset: 'bg_forest.jpg', error: '404 Not Found', count: 120 },
    { id: 'e2', asset: 'bg_city_night.jpg', error: 'Load Timeout', count: 45 },
    { id: 'e3', asset: 'sound_rain.mp3', error: 'Format Not Supported', count: 12 },
];

// --- Admin Team Data ---
export const MOCK_ADMINS: AdminAccount[] = [
  {
    id: 'adm1',
    username: 'SuperAdmin',
    email: 'admin@storyweaver.com',
    role: AdminRole.SUPER_ADMIN,
    status: 'active',
    lastActive: new Date().toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=000&color=fff'
  },
  {
    id: 'adm2',
    username: 'EditorJane',
    email: 'jane@storyweaver.com',
    role: AdminRole.STORY_EDITOR,
    status: 'active',
    lastActive: '2023-10-26T15:30:00Z',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Doe&background=random'
  },
  {
    id: 'adm3',
    username: 'SupportTom',
    email: 'tom@storyweaver.com',
    role: AdminRole.USER_MANAGER,
    status: 'active',
    lastActive: '2023-10-27T09:15:00Z',
    avatar: 'https://ui-avatars.com/api/?name=Tom+Smith&background=random'
  },
  {
    id: 'adm4',
    username: 'ModSarah',
    email: 'sarah@storyweaver.com',
    role: AdminRole.ACHIEVEMENT_MANAGER,
    status: 'inactive',
    lastActive: '2023-10-20T11:00:00Z',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Lee&background=random'
  },
  {
    id: 'adm5',
    username: 'ViewerBob',
    email: 'bob@storyweaver.com',
    role: AdminRole.VIEWER,
    status: 'active',
    lastActive: '2023-10-27T08:45:00Z',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Jones&background=random'
  }
];

export const MOCK_ADMIN_LOGS: AdminLog[] = [
  { id: 'al1', adminId: 'adm2', adminName: 'EditorJane', role: AdminRole.STORY_EDITOR, action: 'Edited Story', target: 'วัตถุโบราณที่หายสาบสูญ', timestamp: '2023-10-27T10:30:00Z', type: 'story' },
  { id: 'al2', adminId: 'adm3', adminName: 'SupportTom', role: AdminRole.USER_MANAGER, action: 'Adjusted Credits', target: 'User: story_lover_99 (+50)', timestamp: '2023-10-27T09:45:00Z', type: 'user' },
  { id: 'al3', adminId: 'adm3', adminName: 'SupportTom', role: AdminRole.USER_MANAGER, action: 'Deleted Review', target: 'Review ID: r105', timestamp: '2023-10-27T09:20:00Z', type: 'user' },
  { id: 'al4', adminId: 'adm1', adminName: 'SuperAdmin', role: AdminRole.SUPER_ADMIN, action: 'Changed System Settings', target: 'Max Daily Credits: 200', timestamp: '2023-10-26T18:00:00Z', type: 'system' },
  { id: 'al5', adminId: 'adm2', adminName: 'EditorJane', role: AdminRole.STORY_EDITOR, action: 'Published Story', target: 'รักในโตเกียว', timestamp: '2023-10-26T14:15:00Z', type: 'story' },
  { id: 'al6', adminId: 'adm4', adminName: 'ModSarah', role: AdminRole.ACHIEVEMENT_MANAGER, action: 'Created Achievement', target: 'Summer Event Winner', timestamp: '2023-10-20T10:50:00Z', type: 'system' }
];

export const MOCK_SYSTEM_CONFIG: SystemConfig = {
    siteName: "StoryWeaver",
    maintenanceMode: false,
    creditConfig: {
        baseMaxCreditsNormal: 50,
        baseMaxCreditsGuest: 20,
        refillIntervalMinutes: 30,
        refillAmount: 1,
        ratingReward: 5,
        minCreditToPlay: 10,
        eventMultiplier: 1.5,
        isEventActive: false
    }
}
