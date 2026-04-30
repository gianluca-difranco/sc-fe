import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Trophy,
  ClipboardList,
  Calendar,
  Swords,
  LogOut,
  Calculator,
  MessageSquare,
  Shield,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronRight,
  Gamepad2
} from 'lucide-react';


const Sidebar = () => {
  const { user, logout } = useAuth();
  const [fantaOpen, setFantaOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  return (
    <div className="sidebar">
      <div className="sidebar-logo">FantaCloud</div>

      <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {user?.role === 'AS' ? (
          /* ── Menù Amministratore Supremo ── */
          <div className="nav-group">
            <NavLink to="/fantacalci" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Shield size={20} />
              Fantacalci
            </NavLink>
          </div>
        ) : (
          /* ── Menù TA / TU ── */
          <>
            <div className="nav-group">
              <NavLink to="/myteam" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                Schiera Formazione
              </NavLink>
            </div>

            <button 
              className="nav-dropdown-btn" 
              onClick={() => setFantaOpen(!fantaOpen)}
              style={{ marginTop: '1rem' }}
            >
              <div className="btn-content">
                <Gamepad2 size={20} />
                <span>Menu Fanta</span>
              </div>
              {fantaOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {fantaOpen && (
              <div className="nav-sub-group">
                <NavLink to="/next-match" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Swords size={18} />
                  Prossimo Incontro
                </NavLink>

                <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Calendar size={18} />
                  Calendario
                </NavLink>

                <NavLink to="/teams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Users size={18} />
                  Squadre
                </NavLink>

                <NavLink to="/players" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <ClipboardList size={18} />
                  Listone
                </NavLink>
              </div>
            )}

            {user?.role === 'TA' && (
              <>
                <button 
                  className="nav-dropdown-btn" 
                  onClick={() => setAdminOpen(!adminOpen)}
                  style={{ marginTop: '0.5rem' }}
                >
                  <div className="btn-content">
                    <Shield size={20} />
                    <span>Menu Admin</span>
                  </div>
                  {adminOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {adminOpen && (
                  <div className="nav-sub-group">
                    <NavLink to="/calculate" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <Calculator size={18} />
                      Calcolo
                    </NavLink>

                    <NavLink to="/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <Users size={18} />
                      Utenti
                    </NavLink>

                    <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <MessageSquare size={18} />
                      Messaggi
                    </NavLink>

                    <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <SettingsIcon size={18} />
                      Impostazioni
                    </NavLink>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </nav>

      <button onClick={logout} className="nav-link logout-btn" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', marginTop: 'auto' }}>
        <LogOut size={20} color="#ef4444" />
        <span style={{ color: '#ef4444' }}>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;