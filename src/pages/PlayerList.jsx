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

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await api.post('/players/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      fetchPlayers();
      alert('Importazione completata con successo!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Errore durante l\'importazione');
    } finally {
      setLoading(false);
      e.target.value = null; // Reset input
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Listone</h1>
        {user?.role === 'TA' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label className="btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              Importa tramite CSV
              <input 
                type="file" 
                accept=".csv" 
                style={{ display: 'none' }} 
                onChange={handleImportCSV} 
              />
            </label>
            <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Annulla' : 'Aggiungi giocatore'}
            </button>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>Nuovo Giocatore</h3>
          <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nome</label>
              <input 
                type="text" 
                className="form-input"
                value={newPlayer.name} 
                onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} 
                required 
              />
            </div>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Ruolo</label>
              <select 
                className="form-input"
                value={newPlayer.role} 
                onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value})} 
              >
                <option value="P">P</option>
                <option value="D">D</option>
                <option value="C">C</option>
                <option value="A">A</option>
              </select>
            </div>
            <div style={{ width: '100px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Costo</label>
              <input 
                type="number" 
                className="form-input"
                min="1" 
                value={newPlayer.credits} 
                onChange={(e) => setNewPlayer({...newPlayer, credits: parseInt(e.target.value)})} 
                required 
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
