import { LayoutDashboard, Users, GraduationCap, Calendar, BarChart3, Settings, Search, TrendingUp, BookOpen, User, Clock, MessageSquare, GitMerge, Bell } from 'lucide-react';
import hcmutLogo from 'figma:asset/b445ce14bd31ab8c2c7a40cf6b2461ae232800cd.png';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  menuItems: MenuItem[];
  userRole: string;
  unreadCount?: number;
}

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  Settings,
  Search,
  TrendingUp,
  BookOpen,
  User,
  Clock,
  MessageSquare,
  GitMerge,
  Bell,
};

const roleLabels: Record<string, string> = {
  administrator: 'Program Administrator',
  student: 'Student',
  tutor: 'Tutor',
  coordinator: 'Coordinator',
  chair: 'Department Chair',
};

export default function Sidebar({ activeTab, onTabChange, menuItems, userRole, unreadCount = 0 }: SidebarProps) {
  return (
    <div className="w-52 bg-[#0F2D52] h-screen flex flex-col">
      {/* Logo and Title */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <img 
              src={hcmutLogo} 
              alt="HCMUT Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-white">BK TUTOR</h2>
          </div>
        </div>
        <p className="text-white/80 text-sm">{roleLabels[userRole] || 'User'}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = activeTab === item.id;
          const isNotifications = item.id === 'notifications';
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white text-[#0F2D52]'
                  : 'text-white/90 hover:bg-white/10'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {isNotifications && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
