import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { BookOpen, LogOut } from 'lucide-react';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/CoursePlayer';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

import AdminDashboard from './pages/AdminDashboard';
import AdminCourseEditor from './pages/AdminCourseEditor';
import AdminQuizManager from './pages/AdminQuizManager';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';

const Navbar = () => {
  const token = sessionStorage.getItem('token');
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch(e) {}
  }
  
  const GET_ME = gql`
    query GetMe {
      me {
        id
        name
        avatar
      }
    }
  `;

  const GET_UNREAD_COUNT = gql`
    query GetUnreadCount {
      getUnreadNotificationCount
    }
  `;

  const GET_NOTIFICATIONS = gql`
    query GetNotifications {
      getNotifications {
        id
        message
        createdAt
      }
    }
  `;

  const MARK_AS_READ = gql`
    mutation MarkAsRead {
      markNotificationsAsRead
    }
  `;

  const [showNotifications, setShowNotifications] = useState(false);

  const { data } = useQuery(GET_ME, { skip: !isAuthenticated });
  const { data: countData, refetch: refetchCount } = useQuery(GET_UNREAD_COUNT, { skip: !isAuthenticated, fetchPolicy: 'network-only' });
  const { data: notifData, refetch: refetchNotifs } = useQuery(GET_NOTIFICATIONS, { skip: !isAuthenticated });
  const [markAsRead] = useMutation(MARK_AS_READ);

  const unreadCount = countData?.getUnreadNotificationCount || 0;
  const notifications = notifData?.getNotifications || [];
  const userName = data?.me?.name || 'User Name';
  const avatarUrl = data?.me?.avatar;

  const getInitials = (name) => {
    if (!name) return 'UN';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(userName);
  
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    window.location.href = '/auth';
  };

  const handleBellClick = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      try {
        await markAsRead();
        refetchCount();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <nav className="bg-surface-container shadow-sm border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-on-surface">PadhaiKaro LMS</span>
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {(userRole === 'Instructor' || userRole === 'Admin') && (
                  <Link to="/admin" className="text-primary font-medium hover:underline">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-4 relative">
                  <div className="relative">
                    <button 
                      onClick={handleBellClick}
                      className="p-2 text-on-surface-variant hover:text-on-surface bg-surface-variant/30 hover:bg-surface-variant/50 rounded-full transition-colors relative flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined">notifications</span>
                      {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-surface-container rounded-lg shadow-lg border border-outline-variant z-50 overflow-hidden">
                        <div className="p-4 border-b border-outline-variant bg-surface-container-highest">
                          <h3 className="font-bold text-on-surface">Notifications</h3>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-on-surface-variant">No notifications yet.</div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className="p-4 border-b border-outline-variant hover:bg-surface-variant/30">
                                <p className="text-sm text-on-surface">{n.message}</p>
                                <span className="text-xs text-on-surface-variant mt-1 block">
                                  {new Date(parseInt(n.createdAt)).toLocaleString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-[#FF3B30] hover:bg-[#FF453A] rounded-md transition-colors shadow-[0_0_10px_rgba(255,59,48,0.3)]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                  <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-outline-variant shadow-sm object-cover" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-outline-variant shadow-sm bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                        {initials}
                      </div>
                    )}
                  </Link>
                </div>
              </>
            ) : (
              <Link to="/auth" className="px-4 py-2 rounded-md bg-primary text-on-primary font-medium hover:bg-primary/90 transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const isFullPage = location.pathname.startsWith('/course/') || location.pathname.startsWith('/quiz/') || location.pathname === '/auth' || location.pathname === '/';

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-on-background">
      {!isFullPage && <Navbar />}
      <main className={`flex-grow w-full ${!isFullPage ? 'container mx-auto px-4 py-8 max-w-7xl' : ''}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:slug" element={<CoursePlayer />} />
          <Route path="/quiz/:subject" element={<QuizPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/quizzes" element={<AdminQuizManager />} />
          <Route path="/admin/course/:slug" element={<AdminCourseEditor />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
