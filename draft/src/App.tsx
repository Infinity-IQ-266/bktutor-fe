import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { api } from './utils/api';
import './utils/debugDatabase'; // Load debug utilities
import './utils/validateDatabase'; // Load validation utilities
import './utils/validateRealTimeSync'; // Load sync testing utilities
import './utils/validateSessionData'; // Load session data validation
import './utils/verifySessionDatabase'; // VERIFY SESSION DATA FOR ALL STUDENTS
import './utils/debugDashboard'; // DEBUG DASHBOARD DATA
import './utils/testDashboardFix'; // TEST DASHBOARD FIX
import './utils/quickTest'; // QUICK TEST COMMANDS

// Program Administrator Views
import DashboardView from './components/DashboardView';
import TutorView from './components/TutorView';
import StudentView from './components/StudentView';
import SessionsView from './components/SessionsView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

// Student Views
import StudentDashboard from './components/student/StudentDashboard';
import FindTutorView from './components/student/FindTutorView';
import StudentSessionsView from './components/student/StudentSessionsView';
import StudentProgressView from './components/student/StudentProgressView';
import StudentMaterialsView from './components/student/StudentMaterialsView';
import StudentProfileView from './components/student/StudentProfileView';
import StudentNotificationsView from './components/student/StudentNotificationsView';

// Tutor Views
import TutorDashboardView from './components/tutor/TutorDashboardView';
import TutorStudentsView from './components/tutor/TutorStudentsView';
import TutorSessionsView from './components/tutor/TutorSessionsView';
import TutorAvailabilityView from './components/tutor/TutorAvailabilityView';
import TutorFeedbackView from './components/tutor/TutorFeedbackView';
import TutorMaterialsView from './components/tutor/TutorMaterialsView';
import TutorProfileView from './components/tutor/TutorProfileView';
import TutorNotificationsView from './components/tutor/TutorNotificationsView';

// Coordinator Views
import CoordinatorDashboardView from './components/coordinator/CoordinatorDashboardView';
import CoordinatorMatchingView from './components/coordinator/CoordinatorMatchingView';
import CoordinatorReportsView from './components/coordinator/CoordinatorReportsView';

// Department Chair Views
import ChairDashboardView from './components/chair/ChairDashboardView';
import ChairStudentsView from './components/chair/ChairStudentsView';
import ChairReportsView from './components/chair/ChairReportsView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [ssoEmail, setSsoEmail] = useState('');
  const [ssoUserData, setSsoUserData] = useState<any>(null);
  const [userRole, setUserRole] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogin = async (role: string, data: any) => {
    if (role === 'sso_new') {
      // SSO user not registered in program - show signup
      setSsoEmail(data.email);
      setSsoUserData(data);
      setShowSignup(true);
    } else {
      // User is registered in program - proceed with login
      setUserRole(role);
      setUserData(data);
      setIsLoggedIn(true);
      setActiveTab('dashboard');
      
      // 🔥 FIX: Save email to localStorage for components that need it
      localStorage.setItem('currentUserEmail', data.email);
      console.log('✅ Login successful - Email saved:', data.email);
    }
  };

  const handleSignupComplete = async (newUserData: any) => {
    try {
      // Create the user in the database
      const response = await api.createUser(newUserData);
      
      if (response.success && response.user) {
        // Auto-login the new user
        setUserRole(response.user.role);
        setUserData(response.user);
        setIsLoggedIn(true);
        setShowSignup(false);
        setSsoEmail('');
        setActiveTab('dashboard');
        
        // 🔥 FIX: Save email to localStorage
        localStorage.setItem('currentUserEmail', response.user.email);
        console.log('✅ Signup complete - Email saved:', response.user.email);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSignupCancel = () => {
    setShowSignup(false);
    setSsoEmail('');
    setSsoUserData(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowSignup(false);
    setSsoEmail('');
    setSsoUserData(null);
    setUserRole('');
    setUserData(null);
    setActiveTab('dashboard');
    setUnreadCount(0);
    
    // 🔥 FIX: Clear email from localStorage
    localStorage.removeItem('currentUserEmail');
    console.log('✅ Logout complete - Email cleared');
  };

  // Initialize databases on app load
  useEffect(() => {
    // Import and initialize the backend
    import('./utils/realBackend').then((module) => {
      module.RealBackend.initialize();
      
      // Show welcome message with debug commands
      console.log('\n');
      console.log('🎓 BK TUTOR System - Ready!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💡 Debug Commands Available:');
      console.log('   help()           - Show all commands');
      console.log('   checkEmail()     - Verify login status');
      console.log('   quickStats()     - Show user stats');
      console.log('   debugDashboard() - Full debug info');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n');
    });
  }, []);

  // Fetch unread notifications count
  useEffect(() => {
    if (!isLoggedIn || !userData?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await api.getNotificationsForUser(userData.id);
        const unread = response.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchUnreadCount();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [isLoggedIn, userData]);

  // Render content based on role and active tab
  const renderContent = () => {
    // PROGRAM ADMINISTRATOR
    if (userRole === 'administrator') {
      switch (activeTab) {
        case 'dashboard':
          return <DashboardView userData={userData} />;
        case 'tutor':
          return <TutorView />;
        case 'student':
          return <StudentView />;
        case 'sessions':
          return <SessionsView />;
        case 'reports':
          return <ReportsView />;
        case 'settings':
          return <SettingsView />;
        default:
          return <DashboardView userData={userData} />;
      }
    }

    // STUDENT
    if (userRole === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard userData={userData} />;
        case 'find-tutor':
          return <FindTutorView userData={userData} />;
        case 'my-sessions':
          return <StudentSessionsView userData={userData} />;
        case 'progress':
          return <StudentProgressView userData={userData} />;
        case 'materials':
          return <StudentMaterialsView userData={userData} />;
        case 'notifications':
          return <StudentNotificationsView userData={userData} />;
        case 'profile':
          return <StudentProfileView userData={userData} />;
        default:
          return <StudentDashboard userData={userData} />;
      }
    }

    // TUTOR
    if (userRole === 'tutor') {
      switch (activeTab) {
        case 'dashboard':
          return <TutorDashboardView userData={userData} />;
        case 'students':
          return <TutorStudentsView userData={userData} />;
        case 'sessions':
          return <TutorSessionsView userData={userData} />;
        case 'availability':
          return <TutorAvailabilityView userData={userData} />;
        case 'feedback':
          return <TutorFeedbackView userData={userData} />;
        case 'materials':
          return <TutorMaterialsView userData={userData} />;
        case 'notifications':
          return <TutorNotificationsView userData={userData} />;
        case 'profile':
          return <TutorProfileView userData={userData} />;
        default:
          return <TutorDashboardView userData={userData} />;
      }
    }

    // COORDINATOR
    if (userRole === 'coordinator') {
      switch (activeTab) {
        case 'dashboard':
          return <CoordinatorDashboardView userData={userData} />;
        case 'matching':
          return <CoordinatorMatchingView />;
        case 'tutors':
          return <TutorView />;
        case 'students':
          return <StudentView />;
        case 'sessions':
          return <SessionsView />;
        case 'reports':
          return <CoordinatorReportsView />;
        default:
          return <CoordinatorDashboardView userData={userData} />;
      }
    }

    // DEPARTMENT CHAIR
   // DEPARTMENT CHAIR
    if (userRole === 'chair') {
      switch (activeTab) {
        case 'dashboard':
          return <ChairDashboardView userData={userData} />;
        case 'students':
          return <ChairStudentsView userData={userData} />; // <--- SỬA Ở ĐÂY
        case 'reports':
          return <ChairReportsView userData={userData} />; // <--- SỬA Ở ĐÂY
        default:
          return <ChairDashboardView userData={userData} />;
      }
    }

    return <DashboardView userData={userData} />;
  };

  // Get menu items based on role
  const getMenuItems = () => {
    if (userRole === 'administrator') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'tutor', label: 'Tutors', icon: 'GraduationCap' },
        { id: 'student', label: 'Students', icon: 'Users' },
        { id: 'sessions', label: 'Sessions', icon: 'Calendar' },
        { id: 'reports', label: 'Reports', icon: 'BarChart3' },
        { id: 'settings', label: 'Settings', icon: 'Settings' },
      ];
    }

    if (userRole === 'student') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'find-tutor', label: 'Find Tutor', icon: 'Search' },
        { id: 'my-sessions', label: 'My Sessions', icon: 'Calendar' },
        { id: 'progress', label: 'Progress', icon: 'TrendingUp' },
        { id: 'materials', label: 'Materials', icon: 'BookOpen' },
        { id: 'notifications', label: 'Notifications', icon: 'Bell' },
        { id: 'profile', label: 'Profile', icon: 'User' },
      ];
    }

    if (userRole === 'tutor') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'students', label: 'My Students', icon: 'Users' },
        { id: 'sessions', label: 'Sessions', icon: 'Calendar' },
        { id: 'availability', label: 'Availability', icon: 'Clock' },
        { id: 'feedback', label: 'Feedback', icon: 'MessageSquare' },
        { id: 'materials', label: 'Materials', icon: 'BookOpen' },
        { id: 'notifications', label: 'Notifications', icon: 'Bell' },
        { id: 'profile', label: 'Profile', icon: 'User' },
      ];
    }

    if (userRole === 'coordinator') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'matching', label: 'Matching', icon: 'GitMerge' },
        { id: 'tutors', label: 'Tutors', icon: 'GraduationCap' },
        { id: 'students', label: 'Students', icon: 'Users' },
        { id: 'sessions', label: 'Sessions', icon: 'Calendar' },
        { id: 'reports', label: 'Reports', icon: 'BarChart3' },
      ];
    }

    if (userRole === 'chair') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
        { id: 'students', label: 'Department Students', icon: 'Users' },
        { id: 'reports', label: 'Reports', icon: 'BarChart3' },
      ];
    }

    return [];
  };

  // Show signup page for first-time SSO users
  if (showSignup) {
    return (
      <SignupPage 
        ssoEmail={ssoEmail}
        ssoUser={ssoUserData}
        onComplete={handleSignupComplete}
        onCancel={handleSignupCancel}
      />
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        menuItems={getMenuItems()}
        userRole={userRole}
        unreadCount={unreadCount}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userData={userData} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// All views are now implemented!
