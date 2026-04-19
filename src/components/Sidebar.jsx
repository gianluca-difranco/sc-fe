import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  ClipboardList, 
  Calendar, 
  Swords, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">FantaCloud</div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <NavLink to="/" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          Schiera Formazione
        </NavLink>
        
        <NavLink to="/standings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Trophy size={20} />
          Classifica
        </NavLink>
        
        <NavLink to="/teams" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          Squadre
        </NavLink>
        
        {user?.role === 'TA' && (
          <NavLink to="/users" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            Utenti
          </NavLink>
        )}
        
        <NavLink to="/players" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <ClipboardList size={20} />
          Listone
        </NavLink>

        <NavLink to="/calendar" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          Calendario
        </NavLink>

        <NavLink to="/next-match" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Swords size={20} />
          Prossimo Incontro
        </NavLink>
      </nav>

      <button onClick={logout} className="nav-link" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
        <LogOut size={20} color="#ef4444" />
        <span style={{ color: '#ef4444' }}>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
