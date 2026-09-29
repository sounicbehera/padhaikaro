import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/CoursePlayer';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

import AdminDashboard from './pages/AdminDashboard';
import AdminCourseEditor from './pages/AdminCourseEditor';
import Dashboard from './pages/Dashboard';

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
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-on-surface-variant hover:text-error transition"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
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
  const isFullPage = location.pathname.startsWith('/course/') || location.pathname === '/auth' || location.pathname === '/';

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
          <Route path="/admin" element={<AdminDashboard />} />
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
