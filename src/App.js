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

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index element={<Formation />} />
        <Route path="standings" element={<Standings />} />
        <Route path="teams" element={<Teams />} />
        <Route path="users" element={<Users />} />
        <Route path="players" element={<PlayerList />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="next-match" element={<NextMatch />} />
        <Route path="calculate" element={<Calculate />} />
      </Route>
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