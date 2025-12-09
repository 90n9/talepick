
import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Trophy, Settings, BarChart, LogOut, Menu, X, Tags, Star, ShieldAlert, Shield, UserCircle, Flag } from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <NavLink 
      to={to} 
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-1
        ${isActive 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </NavLink>
  );
};

interface LayoutProps {
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-800">
      {/* Sidebar - Desktop & Mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0 flex flex-col
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">StoryAdmin</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <SidebarItem to="/" icon={LayoutDashboard} label="ภาพรวมระบบ" />
          <SidebarItem to="/users" icon={Users} label="จัดการผู้ใช้" />
          <SidebarItem to="/stories" icon={BookOpen} label="จัดการนิยาย" />
          <SidebarItem to="/genres" icon={Tags} label="จัดการแนวเรื่อง" />
          <SidebarItem to="/reviews" icon={Star} label="รีวิว & เรตติ้ง" />
          <SidebarItem to="/reports" icon={Flag} label="รายงานปัญหา" />
          <SidebarItem to="/content-tools" icon={ShieldAlert} label="ตรวจสอบเนื้อหา" />
          <SidebarItem to="/achievements" icon={Trophy} label="ความสำเร็จ" />
          <SidebarItem to="/analytics" icon={BarChart} label="สถิติ" />
          <div className="my-2 border-t border-gray-800"></div>
          <SidebarItem to="/team" icon={Shield} label="ทีมผู้ดูแล" />
          <SidebarItem to="/profile" icon={UserCircle} label="บัญชีของฉัน" />
          <SidebarItem to="/settings" icon={Settings} label="ตั้งค่า" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={onLogout}
            className="flex items-center space-x-3 text-gray-400 hover:text-white w-full px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:hidden z-40">
          <div className="flex items-center">
             <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600 mr-4">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg">แผงควบคุม</span>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
