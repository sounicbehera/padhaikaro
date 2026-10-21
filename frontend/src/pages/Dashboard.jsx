import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DASHBOARD_DATA } from '../graphql/dashboardQueries';
import Sidebar from '../components/layout/Sidebar';
import TopBar from '../components/layout/TopBar';
import ProfileHeader from '../components/dashboard/ProfileHeader';
import WeeklyGoal from '../components/dashboard/WeeklyGoal';
import RecentActivity from '../components/dashboard/RecentActivity';
import EarnedCertificates from '../components/dashboard/EarnedCertificates';
import { getTimeSpentSeconds, getLocalPoints } from '../utils/tracker';

const MOCK_DATA = {
  me: {
    id: "1",
    name: "Alex Chen",
    points: 1250,
    scholarStatus: "Gold Scholar",
    weeklyGoal: {
      targetHours: 10,
      completedPercentage: 85,
      timeSpentSeconds: 0
    },
    recentActivity: [],
    certificates: []
  }
};

const Dashboard = () => {
  const { data, refetch } = useQuery(GET_DASHBOARD_DATA, {
    fetchPolicy: 'cache-and-network'
  });

  const [localPoints, setLocalPoints] = useState(getLocalPoints());
  const [localTimeSpent, setLocalTimeSpent] = useState(getTimeSpentSeconds());

  useEffect(() => {
    const handleTrackerChange = (e) => {
      if (e.detail?.localPoints !== undefined) {
        setLocalPoints(e.detail.localPoints);
      }
      if (e.detail?.timeSpentSeconds !== undefined) {
        setLocalTimeSpent(e.detail.timeSpentSeconds);
      }
      refetch?.();
    };

    window.addEventListener('pk-tracker-update', handleTrackerChange);
    return () => window.removeEventListener('pk-tracker-update', handleTrackerChange);
  }, [refetch]);
  
  // Combine GraphQL certificates with locally earned ones
  const localCerts = JSON.parse(localStorage.getItem('earnedCertificates') || '[]');
  const allCertificates = [...(data?.me?.certificates || []), ...localCerts];

  // Calculate points: if user is logged in, use their points from DB. If guest/fallback, start with 1250 + localPoints.
  let totalPoints = 0;
  if (data?.me) {
    totalPoints = data.me.points !== undefined && data.me.points !== null ? data.me.points : 0;
  } else {
    totalPoints = MOCK_DATA.me.points + localPoints;
  }

  // Calculate weekly goal
  const weeklyGoalData = data?.me?.weeklyGoal ? {
    ...data.me.weeklyGoal,
    timeSpentSeconds: Math.max(data.me.weeklyGoal.timeSpentSeconds || 0, localTimeSpent)
  } : {
    ...MOCK_DATA.me.weeklyGoal,
    timeSpentSeconds: localTimeSpent
  };

  // Build dashboard data
  const dashboardData = data?.me ? {
    ...MOCK_DATA.me,
    ...data.me,
    points: totalPoints,
    scholarStatus: data.me.scholarStatus || (totalPoints >= 1000 ? 'Diamond Scholar' : totalPoints >= 500 ? 'Gold Scholar' : 'Silver Scholar'),
    weeklyGoal: weeklyGoalData,
    recentActivity: data.me.recentActivity || [],
    certificates: allCertificates,
  } : {
    ...MOCK_DATA.me,
    points: totalPoints,
    scholarStatus: totalPoints >= 1000 ? 'Diamond Scholar' : totalPoints >= 500 ? 'Gold Scholar' : 'Silver Scholar',
    weeklyGoal: weeklyGoalData,
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
          
          <EarnedCertificates certificates={dashboardData.certificates} userName={dashboardData.name} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
