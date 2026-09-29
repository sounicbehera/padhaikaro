import React from 'react';

const ProfileHeader = ({ userData }) => {
  if (!userData) return null;

  return (
    <section className="bg-surface-container-high rounded-xl border-t border-l border-white/10 p-unit-lg flex flex-col md:flex-row items-center md:items-start gap-unit-lg relative overflow-hidden shadow-[0px_20px_40px_rgba(0,0,0,0.3)]">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      
      <img 
        alt={`${userData.name} Profile Picture`} 
        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-surface z-10" 
        src={userData.avatar} 
      />
      
      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 w-full">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-unit-xs">
          {userData.name}
        </h1>
        
        <div className="flex items-center gap-unit-sm mb-unit-md">
          <span className="inline-flex items-center gap-1 bg-[#332A00] text-[#FFD700] px-3 py-1 rounded-full font-label-sm text-label-sm border border-[#FFD700]/30 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            {userData.scholarStatus}
          </span>
        </div>
        
        <div className="w-full bg-surface-container-lowest rounded-lg p-unit-md border border-white/5 flex items-center justify-between mt-auto">
          <div>
            <div className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">Total Points</div>
            <div className="font-headline-md text-headline-md text-primary mt-1">
              {userData.points.toLocaleString()} <span className="text-on-surface-variant text-body-sm font-body-sm">pts</span>
            </div>
          </div>
          <button className="bg-transparent border border-white/10 text-on-surface px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-white/5 transition-colors cursor-pointer">
            View Details
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
