import React from 'react';

const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-1/4 max-w-sm min-h-screen sticky top-0 left-0 bg-surface-container-lowest text-primary p-unit-md gap-unit-sm z-30 border-r border-white/5">
      {/* Header */}
      <div className="flex items-center gap-unit-sm mb-unit-lg cursor-pointer">
        <img 
          alt="University Logo" 
          className="w-10 h-10 rounded-lg" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaqVCZ3ElwrJ4bzWNXRDqnrCo2CE-KkBb2x4hwSfVOffpE54GkvrHxIYnJEWNrLBvh_54i1HNjcesV003nFPw3xXivkQR5i1chpRO6bOjAc7JpcPYNxuWU-JV8teUbLKHNKvs_uBIlzsV9Nve0hz6TsD6VsJziYm02dY3Btj5rNMg0gWVNsj_MqYkptkv013JwSpIHjlXzPtXAKbBW44mWL0Y2rxsCClwyTae8dnnw0S1OVoQHd8kvOw" 
        />
        <div>
          <div className="font-headline-sm text-headline-sm font-extrabold">LMS Flow</div>
          <div className="text-on-surface-variant text-label-sm">Student Portal</div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex flex-col gap-unit-xs flex-grow font-label-md text-label-md">
        <a href="#" className="flex items-center gap-unit-sm px-unit-md py-unit-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined text-xl">dashboard</span>
          Dashboard
        </a>
        <a href="#" className="flex items-center gap-unit-sm px-unit-md py-unit-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined text-xl">school</span>
          My Courses
        </a>
        <a href="#" className="flex items-center gap-unit-sm px-unit-md py-unit-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all duration-200">
          <span className="material-symbols-outlined text-xl">calendar_month</span>
          Schedule
        </a>
        <a href="#" className="flex items-center gap-unit-sm px-unit-md py-unit-sm bg-secondary-container text-on-secondary-container rounded-lg duration-200">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          Settings
        </a>
      </nav>
      
      {/* Footer / CTA */}
      <div className="mt-auto flex flex-col gap-unit-sm">
        <button className="w-full py-unit-sm px-unit-md bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity">
          Upgrade Plan
        </button>
        <div className="border-t border-white/5 my-unit-xs pt-unit-xs flex flex-col gap-unit-xs">
          <a href="#" className="flex items-center gap-unit-sm px-unit-md py-unit-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all duration-200 font-label-md text-label-md">
            <span className="material-symbols-outlined text-xl">help</span>
            Help Center
          </a>
          <a href="#" className="flex items-center gap-unit-sm px-unit-md py-unit-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all duration-200 font-label-md text-label-md">
            <span className="material-symbols-outlined text-xl">logout</span>
            Logout
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
