import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/CoursePlayer';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-brand-600" />
            <span className="font-bold text-xl text-gray-900">LMS Platform</span>
          </Link>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/auth" className="px-4 py-2 rounded-md bg-brand-600 text-white font-medium hover:bg-brand-700 transition">
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
  const isFullPage = location.pathname.startsWith('/course') || location.pathname === '/auth' || location.pathname === '/';

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-on-background">
      {!isFullPage && <Navbar />}
      <main className={`flex-grow w-full ${!isFullPage ? 'container mx-auto px-4 py-8 max-w-7xl' : ''}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/course/:slug" element={<CoursePlayer />} />
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
