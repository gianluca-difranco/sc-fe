import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'TU' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'TA') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/', newUser);
      setShowAddUser(false);
      setNewUser({ email: '', password: '', role: 'TU' });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Errore durante la creazione dell'utente");
    }
  };

  if (loading) return <div>Caricamento...</div>;

  if (user?.role !== 'TA') {
    return <div>Accesso negato: questa pagina è riservata agli amministratori.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Gestione Utenti</h1>
        <button className="btn-primary" onClick={() => setShowAddUser(!showAddUser)}>
          {showAddUser ? 'Annulla' : 'Aggiungi Utente'}
        </button>
      </div>

      {showAddUser && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>Nuovo Utente</h3>
          <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Email</label>
              <input 
                type="email" 
                value={newUser.email} 
                onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                required 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Password</label>
              <input 
                type="password" 
                value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                required 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} 
              />
            </div>
            <div style={{ width: '120px' }}>
              <label>Ruolo</label>
              <select 
                value={newUser.role} 
                onChange={(e) => setNewUser({...newUser, role: e.target.value})} 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              >
                <option value="TU">TU (Normale)</option>
                <option value="TA">TA (Admin)</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Salva</button>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: '2rem' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Ruolo</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nessun utente trovato</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
