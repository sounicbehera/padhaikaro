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
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2dGW8sA3QPNjU02Y5blGbngPP1jj7tTK1DVvNFO6TreaVzRzwWQDyAS7lRUFAtsu4anX3y1u_dntMkLuI1LbSJaKlLdOYEMYKFNvDyloo2qfO_2tDToU4ALU5F3BojEMGu_gQzoTW1N2ZAXNK2Rv1d-grt3znuGTNzNlIpzteitSwKsBtyfV8hZBzPtsc0ZyLI5fHrAI6EQb0yVfewc1YtI3YTap-wL6qTUhuufmgaXm0ekQI8Cycaw",
    points: 1250,
    scholarStatus: "Gold Scholar",
    weeklyGoal: {
      targetHours: 10,
      completedPercentage: 85
    },
    recentActivity: [
      { id: "a1", title: "Completed Module 4: Scalability", subtitle: "Advanced System Design", type: "completed", timeAgo: "2 hours ago" },
      { id: "a2", title: "Earned System Design Badge", subtitle: "Achievement unlocked", type: "badge", timeAgo: "5 hours ago" },
      { id: "a3", title: "Started: Data Structures Refresher", subtitle: "Algorithms 101", type: "started", timeAgo: "1 day ago" }
    ],
    certificates: [
      { id: "c1", title: "Advanced System Design", issueDate: "Oct 12, 2023", type: "primary" },
      { id: "c2", title: "Frontend Architecture Mastery", issueDate: "Aug 05, 2023", type: "secondary" }
    ]
  }
};

const Dashboard = () => {
  const { data } = useQuery(GET_DASHBOARD_DATA);
  
  // Use GraphQL data if available, otherwise fallback to mock data
  const dashboardData = data?.me ? {
    ...MOCK_DATA.me,
    ...data.me,
    points: data.me.points ?? MOCK_DATA.me.points,
    scholarStatus: data.me.scholarStatus ?? MOCK_DATA.me.scholarStatus,
    weeklyGoal: data.me.weeklyGoal ?? MOCK_DATA.me.weeklyGoal,
    recentActivity: data.me.recentActivity?.length ? data.me.recentActivity : MOCK_DATA.me.recentActivity,
    certificates: data.me.certificates?.length ? data.me.certificates : MOCK_DATA.me.certificates,
  } : MOCK_DATA.me;

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
