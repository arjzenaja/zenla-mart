import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info',
  });

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({
      visible: true,
      message,
      type,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification.visible && (
        <Notification
          visible={notification.visible}
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
