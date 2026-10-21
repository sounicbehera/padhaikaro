import client from '../apollo';
import { RECORD_TIME_SPENT, COMPLETE_VIDEO_LESSON, MARK_PDF_AS_READ } from '../graphql/dashboardQueries';

const STORAGE_KEYS = {
  TIME_SPENT: 'pk_study_time_spent_seconds',
  LOCAL_POINTS: 'pk_study_local_points',
  COMPLETED_VIDEOS: 'pk_completed_videos',
  COMPLETED_PDFS: 'pk_completed_pdfs',
  LAST_ACTIVE: 'pk_last_active_timestamp'
};

// State
let isVideoCurrentlyPlaying = false;
let lastInteractionTime = Date.now();
let pendingSecondsToSync = 0;
let isSyncing = false;
let trackerInterval = null;

// Helper to get array from localStorage
const getStoredArray = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
};

// Helper to set array to localStorage
const setStoredArray = (key, arr) => {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {}
};

// Get current tracked time in seconds
export const getTimeSpentSeconds = () => {
  const stored = parseInt(localStorage.getItem(STORAGE_KEYS.TIME_SPENT), 10);
  return isNaN(stored) ? 0 : stored;
};

// Get locally tracked extra points (for guest / offline fallback)
export const getLocalPoints = () => {
  const stored = parseInt(localStorage.getItem(STORAGE_KEYS.LOCAL_POINTS), 10);
  return isNaN(stored) ? 0 : stored;
};

// Format seconds into human readable duration
export const formatDuration = (totalSeconds) => {
  const seconds = Math.max(0, parseInt(totalSeconds, 10) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Format time with full breakdown
export const getTimeBreakdown = (totalSeconds) => {
  const seconds = Math.max(0, parseInt(totalSeconds, 10) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { hours, minutes, seconds: secs, formatted: formatDuration(seconds) };
};

// Notify all listeners across the app
export const emitTrackerUpdate = (detail = {}) => {
  const event = new CustomEvent('pk-tracker-update', {
    detail: {
      timeSpentSeconds: getTimeSpentSeconds(),
      localPoints: getLocalPoints(),
      completedVideos: getStoredArray(STORAGE_KEYS.COMPLETED_VIDEOS),
      completedPdfs: getStoredArray(STORAGE_KEYS.COMPLETED_PDFS),
      ...detail
    }
  });
  window.dispatchEvent(event);
};

// Show celebration toast
export const showPointCelebration = (message, points = 10) => {
  const toastEvent = new CustomEvent('pk-point-toast', {
    detail: { message, points }
  });
  window.dispatchEvent(toastEvent);
};

// Tell tracker if a video is actively playing right now
export const setVideoPlayingState = (isPlaying) => {
  isVideoCurrentlyPlaying = !!isPlaying;
  if (isPlaying) {
    lastInteractionTime = Date.now();
  }
};

// Check if lesson video is completed
export const isVideoCompleted = (lessonId) => {
  if (!lessonId) return false;
  const list = getStoredArray(STORAGE_KEYS.COMPLETED_VIDEOS);
  return list.includes(lessonId.toString());
};

// Check if lesson PDF is completed
export const isPdfCompleted = (lessonId) => {
  if (!lessonId) return false;
  const list = getStoredArray(STORAGE_KEYS.COMPLETED_PDFS);
  return list.includes(lessonId.toString());
};

// Mark video completed
export const recordVideoCompletion = async ({ lessonId, lessonTitle, courseId }) => {
  if (!lessonId) return { success: false, alreadyCompleted: true };
  const lidStr = lessonId.toString();
  const completedList = getStoredArray(STORAGE_KEYS.COMPLETED_VIDEOS);

  if (completedList.includes(lidStr)) {
    return { success: true, alreadyCompleted: true };
  }

  // Update local storage
  completedList.push(lidStr);
  setStoredArray(STORAGE_KEYS.COMPLETED_VIDEOS, completedList);

  // Add 10 points locally
  const currentPts = getLocalPoints();
  localStorage.setItem(STORAGE_KEYS.LOCAL_POINTS, currentPts + 10);

  // Emit event & celebration
  showPointCelebration(`Watched: "${lessonTitle || 'Lesson Video'}"`, 10);
  emitTrackerUpdate({ type: 'video_complete', lessonId: lidStr });

  // If user is authenticated, sync to GraphQL backend
  const token = sessionStorage.getItem('token');
  if (token && client) {
    try {
      await client.mutate({
        mutation: COMPLETE_VIDEO_LESSON,
        variables: { lessonId: lidStr, courseId: courseId || null }
      });
    } catch (err) {
      console.warn('[Tracker] Failed to sync video completion to backend:', err);
    }
  }

  return { success: true, alreadyCompleted: false };
};

// Mark PDF as read
export const recordPdfCompletion = async ({ lessonId, lessonTitle, courseId }) => {
  if (!lessonId) return { success: false, alreadyCompleted: true };
  const lidStr = lessonId.toString();
  const completedList = getStoredArray(STORAGE_KEYS.COMPLETED_PDFS);

  if (completedList.includes(lidStr)) {
    return { success: true, alreadyCompleted: true };
  }

  // Update local storage
  completedList.push(lidStr);
  setStoredArray(STORAGE_KEYS.COMPLETED_PDFS, completedList);

  // Add 10 points locally
  const currentPts = getLocalPoints();
  localStorage.setItem(STORAGE_KEYS.LOCAL_POINTS, currentPts + 10);

  // Emit event & celebration
  showPointCelebration(`Read: "${lessonTitle || 'PDF Material'}"`, 10);
  emitTrackerUpdate({ type: 'pdf_complete', lessonId: lidStr });

  // If user is authenticated, sync to GraphQL backend
  const token = sessionStorage.getItem('token');
  if (token && client) {
    try {
      await client.mutate({
        mutation: MARK_PDF_AS_READ,
        variables: { lessonId: lidStr, courseId: courseId || null }
      });
    } catch (err) {
      console.warn('[Tracker] Failed to sync PDF completion to backend:', err);
    }
  }

  return { success: true, alreadyCompleted: false };
};

// Sync pending seconds to backend
const syncTimeToBackend = async () => {
  if (pendingSecondsToSync <= 0 || isSyncing) return;
  const token = sessionStorage.getItem('token');
  if (!token || !client) {
    pendingSecondsToSync = 0;
    return;
  }

  const secondsToSend = pendingSecondsToSync;
  isSyncing = true;
  try {
    await client.mutate({
      mutation: RECORD_TIME_SPENT,
      variables: { seconds: secondsToSend }
    });
    pendingSecondsToSync = Math.max(0, pendingSecondsToSync - secondsToSend);
  } catch (err) {
    console.warn('[Tracker] Time sync error (will retry next cycle):', err);
  } finally {
    isSyncing = false;
  }
};

// Track interaction
const recordActivity = () => {
  lastInteractionTime = Date.now();
};

// Initialize time tracker
export const initTimeTracker = () => {
  if (trackerInterval) return; // Already running

  // Listen to user interactions
  window.addEventListener('mousemove', recordActivity, { passive: true });
  window.addEventListener('keydown', recordActivity, { passive: true });
  window.addEventListener('scroll', recordActivity, { passive: true });
  window.addEventListener('touchstart', recordActivity, { passive: true });

  let tickCounter = 0;

  trackerInterval = setInterval(() => {
    // Only track if document is visible
    if (document.hidden) return;

    // Consider active if interacted in past 2 mins OR video is currently playing
    const isRecentlyActive = (Date.now() - lastInteractionTime) < 120000;
    if (!isRecentlyActive && !isVideoCurrentlyPlaying) {
      return;
    }

    // Increment 1 second
    const current = getTimeSpentSeconds() + 1;
    localStorage.setItem(STORAGE_KEYS.TIME_SPENT, current);
    pendingSecondsToSync += 1;
    tickCounter += 1;

    // Emit local update every 5 seconds to minimize unnecessary re-renders
    if (tickCounter % 5 === 0) {
      emitTrackerUpdate();
    }

    // Sync to backend every 30 seconds
    if (tickCounter % 30 === 0) {
      syncTimeToBackend();
    }
  }, 1000);

  // Sync on tab close or navigation
  window.addEventListener('beforeunload', () => {
    if (pendingSecondsToSync > 0) {
      syncTimeToBackend();
    }
  });
};
