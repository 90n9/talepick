
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { StoriesPage } from './pages/Stories';
import { StoryEditor } from './pages/StoryEditor';
import { GenresPage } from './pages/Genres';
import { AchievementsPage } from './pages/Achievements';
import { ReviewsPage } from './pages/Reviews';
import { ContentToolsPage } from './pages/ContentTools';
import { AnalyticsPage } from './pages/Analytics';
import { AdminTeamPage } from './pages/AdminTeam';
import { SettingsPage } from './pages/Settings';
import { ProfilePage } from './pages/Profile';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ReportModerationPage } from './pages/ReportModeration';
import { ToastProvider } from './components/Toast';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth_token') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('auth_token', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/" element={
            isAuthenticated ? <Layout onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="stories" element={<StoriesPage />} />
            <Route path="stories/editor" element={<StoryEditor />} />
            <Route path="genres" element={<GenresPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="reports" element={<ReportModerationPage />} />
            <Route path="content-tools" element={<ContentToolsPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="team" element={<AdminTeamPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;
