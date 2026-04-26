import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Formation from './pages/Formation';
import Standings from './pages/Standings';
import Teams from './pages/Teams';
import PlayerList from './pages/PlayerList';
import Calendar from './pages/Calendar';
import NextMatch from './pages/NextMatch';
import Users from './pages/Users';
import Calculate from './pages/Calculate';
import Messages from './pages/Messages';
import Fantacalci from './pages/Fantacalci';
import SetPassword from './pages/SetPassword';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Redirect AS su /fantacalci, tutti gli altri su /myteam
const HomeRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'AS') return <Navigate to="/fantacalci" replace />;
  return <Navigate to="/myteam" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<HomeRedirect />} />
        <Route path="myteam" element={<Formation />} />
        <Route path="standings" element={<Standings />} />
        <Route path="teams" element={<Teams />} />
        <Route path="users" element={<Users />} />
        <Route path="players" element={<PlayerList />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="next-match" element={<NextMatch />} />
        <Route path="calculate" element={<Calculate />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
        <Route path="fantacalci" element={<Fantacalci />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;