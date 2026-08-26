import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import Catalog from './pages/Catalog';
import CoursePlayer from './pages/CoursePlayer';
import Auth from './pages/Auth';

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

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<div className="text-center mt-20"><h1 className="text-4xl font-bold">Welcome to the LMS</h1></div>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/course/:slug" element={<CoursePlayer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
