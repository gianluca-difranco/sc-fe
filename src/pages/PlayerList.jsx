import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const PlayerList = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', role: 'P', credits: 1 });

  const fetchPlayers = async () => {
    try {
      const res = await api.get('/players');
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/players/', newPlayer);
      setShowAddForm(false);
      setNewPlayer({ name: '', role: 'P', credits: 1 });
      fetchPlayers(); // Ricarica la lista
    } catch (err) {
      console.error(err);
      alert('Errore durante l\'aggiunta del giocatore');
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Listone</h1>
        {user?.role === 'TA' && (
          <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Annulla' : 'Aggiungi giocatore'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>Nuovo Giocatore</h3>
          <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Nome</label>
              <input 
                type="text" 
                value={newPlayer.name} 
                onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} 
                required 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} 
              />
            </div>
            <div style={{ width: '100px' }}>
              <label>Ruolo</label>
              <select 
                value={newPlayer.role} 
                onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value})} 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              >
                <option value="P">P</option>
                <option value="D">D</option>
                <option value="C">C</option>
                <option value="A">A</option>
              </select>
            </div>
            <div style={{ width: '100px' }}>
              <label>Costo</label>
              <input 
                type="number" 
                min="1" 
                value={newPlayer.credits} 
                onChange={(e) => setNewPlayer({...newPlayer, credits: parseInt(e.target.value)})} 
                required 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} 
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Salva</button>
          </form>
        </div>
      )}

      <div className="glass-card" style={{ padding: '2rem' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Ruolo</th>
              <th>Nome</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id}>
                <td>{p.role}</td>
                <td>{p.name}</td>
                <td>{p.credits} cr.</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerList;
