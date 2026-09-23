import { gql } from '@apollo/client';

// Stub for dashboard data
export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    me {
      id
      name
      avatar
      points
      scholarStatus
      weeklyGoal {
        targetHours
        completedPercentage
      }
      recentActivity {
        id
        title
        subtitle
        type
        timeAgo
      }
      certificates {
        id
        title
        issueDate
        type
      }
    }
    notifications {
      unreadCount
    }
  }
`;
