import Login from './pages/login'
import AdminDashBoard from './pages/AdminDashBoard.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import {Routes, Route, Navigate } from 'react-router-dom'; // Import core router elements
import ManagerPage from './pages/ManagerDashBoard.jsx';
import ManagerAnnouncements from './pages/ManagerAnnouncement.jsx';
import UserAnnouncements from './pages/EmployeeAnnouncements.jsx';
import UserDashboard from './pages/EmployeeDashBoard.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AccountSettings from './pages/AccountSettings.jsx';
import LoginHistory from './pages/LoginHistory.jsx';
import RouteLoader from './loading/RouteLoader.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { WebSocketProvider } from './context/WebSocketContext.jsx';
import NotificationToast from './components/NotificationToast.jsx';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <WebSocketProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/change-password" element={<RouteLoader><ChangePassword /></RouteLoader>} />
      <Route path="/reset-password" element={<RouteLoader><ResetPassword/></RouteLoader>} />
      <Route path="/account-settings" element={<RouteLoader><AccountSettings /></RouteLoader>} />
      <Route path="/login-history" element={<RouteLoader><LoginHistory /></RouteLoader>} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <RouteLoader delay={500}>
              <AdminDashBoard />
            </RouteLoader>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute role="MANAGER">
            <RouteLoader delay={500}>
              <ManagerPage />
            </RouteLoader>
          </ProtectedRoute>
        }
      />
      <Route
  path="/manager/announcements"
  element={
    <ProtectedRoute role="MANAGER">
      <RouteLoader delay={500}>
        <ManagerAnnouncements />
      </RouteLoader>
    </ProtectedRoute>
  }
/>
    <Route
  path="/employees"
  element={
    <ProtectedRoute>
      <RouteLoader delay={500}>
        <UserDashboard />
      </RouteLoader>
    </ProtectedRoute>
  }
/>

<Route
  path="/employees/announcements"
  element={
    <ProtectedRoute role="EMPLOYEE">
      <RouteLoader delay={500}>
        <UserAnnouncements />
      </RouteLoader>
    </ProtectedRoute>
  }
/>
      </Routes>
      <NotificationToast />
        </WebSocketProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
