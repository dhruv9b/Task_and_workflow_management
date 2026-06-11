import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { websocketService } from '../services/websocketService';
import { useNotification } from './NotificationContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { getToken, isAuthenticated, user } = useAuth();
  const { showAnnouncementNotification, showTaskAssignedNotification, showTaskCompletedNotification } = useNotification();
  const [connected, setConnected] = useState(false);
  const announcementCallbackRef = useRef(null);
  const taskCallbackRef = useRef(null);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      const token = getToken();
      if (token) {
        websocketService.connect(token)
          .then(() => {
            if (active) {
              setConnected(true);
              console.log('WebSocket connected successfully');
            }
          })
          .catch((error) => {
            console.error('Failed to connect WebSocket:', error);
            if (active) {
              setConnected(false);
            }
          });
      }
    }

    return () => {
      active = false;
      websocketService.disconnect();
      setConnected(false);
    };
  }, [isAuthenticated]);

  // Subscribe to announcements
  useEffect(() => {
    if (connected && user) {
      // Subscribe based on user role
      const destination = user.role === 'MANAGER'
        ? '/topic/manager/announcements'
        : '/topic/employee/announcements';

      const subscription = websocketService.subscribe(destination, (data) => {
        console.log('📢 Announcement received:', data);

        // Show notification
        if (data && data.title && data.message) {
          showAnnouncementNotification(data.title, data.message);
        }

        // Call custom callback if provided
        if (announcementCallbackRef.current) {
          announcementCallbackRef.current(data);
        }
      });

      return () => {
        websocketService.unsubscribe(destination);
      };
    }
  }, [connected, user?.role, user?.id, showAnnouncementNotification]);

  // Subscribe to task updates
  useEffect(() => {
    if (connected && user) {
      let destination;

      if (user.role === 'MANAGER') {
        // Manager subscribes to task completions from their team
        destination = '/topic/manager/tasks';
      } else {
        // Employee subscribes to task assignments
        destination = '/topic/employee/tasks';
      }

      const subscription = websocketService.subscribe(destination, (data) => {
        console.log('📋 Task update received:', data);

        // Show notification based on event type
        if (data) {
          if (data.eventType === 'TASK_ASSIGNED') {
            showTaskAssignedNotification(data.taskTitle, data.assignedBy);
          } else if (data.eventType === 'TASK_COMPLETED') {
            showTaskCompletedNotification(data.taskTitle, data.completedBy);
          }
        }

        // Call custom callback if provided
        if (taskCallbackRef.current) {
          taskCallbackRef.current(data);
        }
      });

      return () => {
        websocketService.unsubscribe(destination);
      };
    }
  }, [connected, user?.role, user?.id, showTaskAssignedNotification, showTaskCompletedNotification]);

  const publishAnnouncement = useCallback((announcement) => {
    if (user && user.role === 'MANAGER') {
      websocketService.publish('/app/announcement', announcement);
    }
  }, [user]);

  const publishTaskUpdate = useCallback((taskUpdate) => {
    websocketService.publish('/app/task', taskUpdate);
  }, []);

  const setAnnouncementCallback = useCallback((callback) => {
    announcementCallbackRef.current = callback;
  }, []);

  const setTaskCallback = useCallback((callback) => {
    taskCallbackRef.current = callback;
  }, []);

  const value = {
    connected,
    setAnnouncementCallback,
    setTaskCallback,
    publishAnnouncement,
    publishTaskUpdate,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
