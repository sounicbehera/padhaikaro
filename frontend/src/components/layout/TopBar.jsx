import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_DATA } from '../../graphql/dashboardQueries';

const TopBar = () => {
  // Stubbing Apollo Client useQuery for highly volatile state
  const { data } = useQuery(GET_DASHBOARD_DATA);
  const unreadCount = data?.notifications?.unreadCount || 0;
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

  return (
    <>
      {/* TopNavBar (Mobile Only) */}
      <nav className="md:hidden w-full h-16 bg-surface/60 backdrop-blur-md text-primary font-headline-sm text-headline-sm border-b border-white/10 shadow-sm flex justify-between items-center px-gutter sticky top-0 z-40">
        <div className="font-bold cursor-pointer active:scale-95 duration-200">
          LMS Flow
        </div>
        <div className="flex items-center gap-unit-md">
          <span className="material-symbols-outlined text-on-surface-variant font-medium hover:bg-surface-container-high/50 transition-colors cursor-pointer active:scale-95 duration-200 p-unit-xs rounded-full">search</span>
          <button className="relative text-on-surface-variant font-medium hover:bg-surface-container-high/50 transition-colors cursor-pointer active:scale-95 duration-200 p-unit-xs rounded-full">
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
            )}
          </button>
          <span className="material-symbols-outlined text-on-surface-variant font-medium hover:bg-surface-container-high/50 transition-colors cursor-pointer active:scale-95 duration-200 p-unit-xs rounded-full">inbox</span>
          {avatarUrl ? (
            <img 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-white/10 cursor-pointer active:scale-95 duration-200 object-cover" 
              src={avatarUrl}
            />
          ) : (
            <div className="w-8 h-8 rounded-full border border-white/10 cursor-pointer active:scale-95 duration-200 bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
              {initials}
            </div>
          )}
        </div>
      </nav>

      {/* Top App Bar Desktop Equivalent (Search/Profile area) */}
      <header className="hidden md:flex justify-between items-center w-full h-16 mb-unit-lg">
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            className="w-full bg-surface-container-high border border-white/10 rounded-full py-2 pl-10 pr-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-sm text-body-sm" 
            placeholder="Search courses, modules..." 
            type="text" 
          />
        </div>
        <div className="flex items-center gap-unit-md">
          <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            )}
          </button>
          <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined">inbox</span>
          </button>
          {avatarUrl ? (
            <img 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-white/10 cursor-pointer active:scale-95 duration-200 object-cover" 
              src={avatarUrl}
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-white/10 cursor-pointer active:scale-95 duration-200 bg-primary flex items-center justify-center text-on-primary font-bold text-sm">
              {initials}
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default TopBar;
