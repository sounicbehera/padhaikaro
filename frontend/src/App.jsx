import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
  const token = localStorage.getItem('token');
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch(e) {}
  }
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  return (
    <nav className="bg-surface-container shadow-sm border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-on-surface">LMS Platform</span>
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {(userRole === 'Instructor' || userRole === 'Admin') && (
                  <Link to="/admin" className="text-primary font-medium hover:underline">
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-4">
                  <button className="p-2 text-on-surface-variant hover:text-on-surface bg-surface-variant/30 hover:bg-surface-variant/50 rounded-full transition-colors relative flex items-center justify-center">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-error hover:bg-error/90 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                  <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                    <img 
                      src="https://ui-avatars.com/api/?name=Student" 
                      alt="Dashboard" 
                      className="w-8 h-8 rounded-full border border-outline-variant shadow-sm" 
                    />
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
