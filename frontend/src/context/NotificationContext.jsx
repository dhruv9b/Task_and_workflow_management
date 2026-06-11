import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      ...notification,
      timestamp: new Date(),
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper methods for common notification types
  const showAnnouncementNotification = useCallback((title, message) => {
    return addNotification({
      type: 'announcement',
      title: '📢 New Announcement',
      message: `${title}: ${message}`,
      severity: 'info',
    });
  }, [addNotification]);

  const showTaskAssignedNotification = useCallback((taskTitle, assignedBy) => {
    return addNotification({
      type: 'task_assigned',
      title: '📋 New Task Assigned',
      message: `Task "${taskTitle}" assigned by ${assignedBy}`,
      severity: 'success',
    });
  }, [addNotification]);

  const showTaskCompletedNotification = useCallback((taskTitle, completedBy) => {
    return addNotification({
      type: 'task_completed',
      title: '✅ Task Completed',
      message: `Task "${taskTitle}" completed by ${completedBy}`,
      severity: 'success',
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showAnnouncementNotification,
    showTaskAssignedNotification,
    showTaskCompletedNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
