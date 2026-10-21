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
        timeSpentSeconds
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
      completedVideos
      completedPdfs
    }
  }
`;

export const UPLOAD_AVATAR = gql`
  mutation UploadAvatar($base64Image: String!) {
    uploadAvatar(base64Image: $base64Image) {
      id
      avatar
    }
  }
`;

export const RECORD_TIME_SPENT = gql`
  mutation RecordTimeSpent($seconds: Int!) {
    recordTimeSpent(seconds: $seconds) {
      id
      weeklyGoal {
        targetHours
        completedPercentage
        timeSpentSeconds
      }
    }
  }
`;

export const COMPLETE_VIDEO_LESSON = gql`
  mutation CompleteVideoLesson($lessonId: ID!, $courseId: ID) {
    completeVideoLesson(lessonId: $lessonId, courseId: $courseId) {
      id
      points
      scholarStatus
      completedVideos
      recentActivity {
        id
        title
        subtitle
        type
        timeAgo
      }
    }
  }
`;

export const MARK_PDF_AS_READ = gql`
  mutation MarkPdfAsRead($lessonId: ID!, $courseId: ID) {
    markPdfAsRead(lessonId: $lessonId, courseId: $courseId) {
      id
      points
      scholarStatus
      completedPdfs
      recentActivity {
        id
        title
        subtitle
        type
        timeAgo
      }
    }
  }
`;
