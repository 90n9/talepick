import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { Player } from './pages/Player';
import { Support } from './pages/Support';
import { Oracle } from './pages/Oracle';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { StoryDetail } from './pages/StoryDetail';
import { TermsOfUse } from './pages/TermsOfUse';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Profile } from './pages/Profile';
import { Story, User } from './types';
import { MOCK_STORIES, SYSTEM_ACHIEVEMENTS, REFILL_INTERVAL_MS } from './constants';

// --- Auth Context ---
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  loginAsGuest: () => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  deductCredit: () => boolean;
  addRatingBonus: (storyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  loginAsGuest: () => {},
  logout: () => {},
  updateUser: () => {},
  deductCredit: () => false,
  addRatingBonus: () => false,
});

export const useAuth = () => useContext(AuthContext);

const calculateMaxCredits = (achievements: string[], isGuest: boolean = false) => {
  if (isGuest) return 10;
  const base = 20;
  const bonus = achievements.reduce((acc, achId) => {
    const ach = SYSTEM_ACHIEVEMENTS.find((sa) => sa.id === achId);
    return acc + (ach && 'creditBonus' in ach ? (ach.creditBonus as number) : 0);
  }, 0);
  return base + bonus;
};

const initialAchievements = ['first_step', 'critic'];
const MockUser: User = {
  id: 'u1',
  name: 'นักเดินทาง',
  email: 'traveler@chronos.com',
  avatar: '',
  achievements: initialAchievements,
  playedStories: ['1'],
  endingsUnlocked: 3,
  favorites: ['1', '3'],

  credits: 20,
  maxCredits: calculateMaxCredits(initialAchievements),
  lastRefillTime: Date.now(),
  ratedStoriesForBonus: [],
};

// --- Main App ---
const App: React.FC = () => {
  // Routing State (Hash-based simulation for SPA)
  const [currentPage, setCurrentPage] = useState('home');
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Credit System Constants
  const RATING_BONUS = 5;

  // --- Credit Refill Logic ---
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkRefill = () => {
      const now = Date.now();
      const timePassed = now - user.lastRefillTime;

      if (timePassed >= REFILL_INTERVAL_MS && user.credits < user.maxCredits) {
        const creditsToAdd = Math.floor(timePassed / REFILL_INTERVAL_MS);
        if (creditsToAdd > 0) {
          const newCredits = Math.min(user.maxCredits, user.credits + creditsToAdd);
          // Reset timer to "now" minus the remainder to keep the cycle smooth
          const remainder = timePassed % REFILL_INTERVAL_MS;
          const newLastRefillTime = now - remainder;

          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  credits: newCredits,
                  lastRefillTime: newLastRefillTime,
                }
              : null
          );
        }
      } else if (user.credits >= user.maxCredits) {
        // If full, just update timestamp to now so when they spend, the timer starts fresh
        setUser((prev) => (prev ? { ...prev, lastRefillTime: now } : null));
      }
    };

    const interval = setInterval(checkRefill, 1000); // Check every second
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.credits, user?.lastRefillTime, user?.maxCredits]);

  const login = () => {
    setIsAuthenticated(true);
    if (!user) {
      // Reset mock user with full credits on fresh login
      setUser({
        ...MockUser,
        lastRefillTime: Date.now(),
      });
    }

    if (['login', 'signup', 'forgot-password'].includes(currentPage)) {
      setCurrentPage(previousPage || 'home');
    }
  };

  const loginAsGuest = () => {
    setIsAuthenticated(true);
    setUser({
      id: 'guest-' + Date.now(),
      name: 'ผู้เยี่ยมชม (Guest)',
      email: '',
      avatar: '',
      achievements: [],
      playedStories: [],
      endingsUnlocked: 0,
      favorites: [],
      isGuest: true,
      credits: 10, // Guest Limit
      maxCredits: 10, // Guest Max
      lastRefillTime: Date.now(),
      ratedStoriesForBonus: [],
    });

    if (['login', 'signup', 'forgot-password'].includes(currentPage)) {
      setCurrentPage(previousPage || 'home');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('home');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const deductCredit = (): boolean => {
    if (!user) return false;
    if (user.credits > 0) {
      setUser({
        ...user,
        credits: user.credits - 1,
        // If we were at max, the timer effectively starts now for the next refill
        lastRefillTime: user.credits === user.maxCredits ? Date.now() : user.lastRefillTime,
      });
      return true;
    }
    return false;
  };

  const addRatingBonus = (storyId: string): boolean => {
    if (!user) return false;

    let newAchievements = [...user.achievements];
    let newMaxCredits = user.maxCredits;

    // Unlock 'critic' achievement if not already owned
    if (!newAchievements.includes('critic')) {
      newAchievements.push('critic');
      newMaxCredits = calculateMaxCredits(newAchievements, user.isGuest);
    }

    // Check if already received bonus for this story
    if (user.ratedStoriesForBonus.includes(storyId)) {
      // Even if bonus received, we might have just updated achievements
      if (
        newMaxCredits !== user.maxCredits ||
        newAchievements.length !== user.achievements.length
      ) {
        setUser({
          ...user,
          achievements: newAchievements,
          maxCredits: newMaxCredits,
        });
      }
      return false;
    }

    setUser({
      ...user,
      achievements: newAchievements,
      maxCredits: newMaxCredits,
      credits: Math.min(newMaxCredits, user.credits + RATING_BONUS),
      ratedStoriesForBonus: [...user.ratedStoriesForBonus, storyId],
    });
    return true;
  };

  const handleNavigate = (page: string) => {
    const authPages = ['login', 'signup', 'forgot-password'];
    if (authPages.includes(page) && !authPages.includes(currentPage)) {
      setPreviousPage(currentPage);
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setCurrentPage(previousPage || 'home');
  };

  const handleSelectStory = (story: Story) => {
    setActiveStory(story);
    setCurrentPage('story-detail');
  };

  const handleStartPlaying = () => {
    if (!isAuthenticated) {
      alert('กรุณาเข้าสู่ระบบก่อนเริ่มเล่น');
      handleNavigate('login');
      return;
    }
    setCurrentPage('player');
  };

  const handleLoginRequired = () => {
    handleNavigate('login');
  };

  const renderContent = () => {
    if (currentPage === 'player' && activeStory) {
      return (
        <Player
          story={activeStory}
          onExit={() => {
            setCurrentPage('story-detail');
          }}
          onComplete={(endingId) => {
            console.log(`Story completed with ending: ${endingId}`);
          }}
          onSelectStory={handleSelectStory}
        />
      );
    }

    if (currentPage === 'login') return <Login onNavigate={handleNavigate} onBack={handleBack} />;
    if (currentPage === 'signup') return <Signup onNavigate={handleNavigate} onBack={handleBack} />;
    if (currentPage === 'forgot-password')
      return <ForgotPassword onNavigate={handleNavigate} onBack={handleBack} />;

    const content = () => {
      switch (currentPage) {
        case 'home':
          return <Home onNavigate={handleNavigate} onSelectStory={handleSelectStory} />;
        case 'library':
          return <Library onSelectStory={handleSelectStory} />;
        case 'wishlist':
          return (
            <Library
              onSelectStory={handleSelectStory}
              onlyFavorites={true}
              favoriteIds={user?.favorites || []}
            />
          );
        case 'story-detail':
          if (!activeStory) return <Library onSelectStory={handleSelectStory} />;
          return (
            <StoryDetail
              story={activeStory}
              onPlay={handleStartPlaying}
              onBack={() => handleNavigate('library')}
              onSelectStory={handleSelectStory}
              isAuthenticated={isAuthenticated}
              onLoginRequired={handleLoginRequired}
            />
          );
        case 'oracle':
          return <Oracle onSelectStory={(id) => console.log(id)} />;
        case 'support':
          return <Support />;
        case 'terms':
          return <TermsOfUse />;
        case 'privacy':
          return <PrivacyPolicy />;
        case 'profile':
          return <Profile onNavigate={handleNavigate} onSelectStory={handleSelectStory} />;
        default:
          return <Home onNavigate={handleNavigate} onSelectStory={handleSelectStory} />;
      }
    };

    return (
      <Layout onNavigate={handleNavigate} currentPage={currentPage}>
        {content()}
      </Layout>
    );
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        loginAsGuest,
        logout,
        updateUser,
        deductCredit,
        addRatingBonus,
      }}
    >
      {renderContent()}
    </AuthContext.Provider>
  );
};

export default App;
