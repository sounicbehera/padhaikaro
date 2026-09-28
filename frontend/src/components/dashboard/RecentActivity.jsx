import React from 'react';

const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'completed':
      return (
        <div className="mt-1 w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-[0_0_10px_rgba(5,102,217,0.3)] group-hover:scale-110 transition-transform shrink-0">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
        </div>
      );
    case 'badge':
      return (
        <div className="mt-1 w-8 h-8 rounded-full bg-[#332A00] flex items-center justify-center text-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.2)] group-hover:scale-110 transition-transform shrink-0">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
        </div>
      );
    case 'started':
    default:
      return (
        <div className="mt-1 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform shrink-0">
          <span className="material-symbols-outlined text-[16px]">play_circle</span>
        </div>
      );
  }
};

const RecentActivity = ({ activities }) => {
  if (!activities || activities.length === 0) return null;

  return (
    <section className="bg-surface-container-high rounded-xl border-t border-l border-white/10 p-unit-lg flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-unit-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Recent Activity</h2>
        <button className="text-secondary hover:text-secondary-fixed font-label-sm text-label-sm transition-colors cursor-pointer">
          View All
        </button>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1;
          const textHoverColor = activity.type === 'badge' ? 'group-hover:text-[#FFD700]' : 'group-hover:text-secondary';
          
          return (
            <div key={activity.id} className="flex items-start gap-unit-md group">
              <ActivityIcon type={activity.type} />
              <div className={`flex-1 pb-4 ${isLast ? '' : 'border-b border-white/5'}`}>
                <div className={`font-body-md text-body-md text-on-surface ${textHoverColor} transition-colors`}>
                  {activity.title}
                </div>
                <div className="text-on-surface-variant font-body-sm text-body-sm mt-1">
                  {activity.subtitle} • {activity.timeAgo}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecentActivity;
