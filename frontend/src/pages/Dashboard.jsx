import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_DATA } from '../graphql/dashboardQueries';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import ProfileHeader from '../components/dashboard/ProfileHeader';
import WeeklyGoal from '../components/dashboard/WeeklyGoal';
import RecentActivity from '../components/dashboard/RecentActivity';
import EarnedCertificates from '../components/dashboard/EarnedCertificates';

const MOCK_DATA = {
  me: {
    id: "1",
    name: "Alex Chen",
    points: 1250,
    scholarStatus: "Gold Scholar",
    weeklyGoal: {
      targetHours: 10,
      completedPercentage: 85
    },
    recentActivity: [],
    certificates: []
  }
};

const Dashboard = () => {
  const { data } = useQuery(GET_DASHBOARD_DATA);
  
  // Combine GraphQL certificates with locally earned ones
  const localCerts = JSON.parse(localStorage.getItem('earnedCertificates') || '[]');
  const allCertificates = [...(data?.me?.certificates || []), ...localCerts];

  // Use GraphQL data if available, otherwise fallback to mock data
  const dashboardData = data?.me ? {
    ...MOCK_DATA.me,
    ...data.me,
    points: data.me.points ?? MOCK_DATA.me.points,
    scholarStatus: data.me.scholarStatus ?? MOCK_DATA.me.scholarStatus,
    weeklyGoal: data.me.weeklyGoal ?? MOCK_DATA.me.weeklyGoal,
    recentActivity: data.me.recentActivity || [],
    certificates: allCertificates,
  } : {
    ...MOCK_DATA.me,
    certificates: localCerts
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
      <Sidebar />
      
      <main className="flex-1 flex flex-col p-gutter min-h-screen pb-margin-desktop w-full md:max-w-[calc(100%-25%)] lg:max-w-[calc(100%-280px)]">
        <TopBar />
        
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-unit-lg flex-1">
          <ProfileHeader userData={dashboardData} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-unit-lg w-full">
            <WeeklyGoal weeklyGoal={dashboardData.weeklyGoal} />
            <RecentActivity activities={dashboardData.recentActivity} />
          </div>
          
          <EarnedCertificates certificates={dashboardData.certificates} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
