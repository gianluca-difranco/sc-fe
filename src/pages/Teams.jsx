import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', owner_id: '' });
  
  // Assign player state
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [playerToAssign, setPlayerToAssign] = useState('');

  const fetchData = async () => {
    try {
      const [teamsRes, playersRes] = await Promise.all([
        api.get('/teams'),
        api.get('/players')
      ]);
      setTeams(teamsRes.data);
      setPlayers(playersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams/', { name: newTeam.name, owner_id: parseInt(newTeam.owner_id) });
      setShowAddTeam(false);
      setNewTeam({ name: '', owner_id: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Errore durante la creazione della squadra');
    }
  };

  const handleAssignPlayer = async (teamId) => {
    if (!playerToAssign) return;
    try {
      await api.post(`/teams/${teamId}/players/${playerToAssign}`);
      setPlayerToAssign('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Errore durante l'assegnazione del giocatore");
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">Squadre Iscritte</h1>
        {user?.role === 'TA' && (
          <button className="btn-primary" onClick={() => setShowAddTeam(!showAddTeam)}>
            {showAddTeam ? 'Annulla' : 'Aggiungi Squadra'}
          </button>
        )}
      </div>

      {showAddTeam && (
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h3>Nuova Squadra</h3>
          <form onSubmit={handleAddTeam} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Nome Squadra</label>
              <input 
                type="text" 
                value={newTeam.name} 
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} 
                required 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>ID Utente Proprietario</label>
              <input 
                type="number" 
                value={newTeam.owner_id} 
                onChange={(e) => setNewTeam({...newTeam, owner_id: e.target.value})} 
                required 
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} 
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Salva</button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {teams.map(team => (
          <div key={team.id} className="glass-card" style={{ padding: '2rem' }}>
            <h2>{team.name}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Giocatori in rosa: {team.players?.length || 0}</p>
            
            <button 
              className="btn-primary" 
              style={{ marginTop: '1rem', width: '100%' }}
              onClick={() => setSelectedTeamId(selectedTeamId === team.id ? null : team.id)}
            >
              {selectedTeamId === team.id ? 'Nascondi Dettagli' : 'Gestisci Squadra'}
            </button>

            {selectedTeamId === team.id && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <h4>Rosa Attuale</h4>
                <ul style={{ listStyleType: 'none', padding: 0, marginBottom: '1rem' }}>
                  {team.players?.map(p => (
                    <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                      <span>{p.role} - {p.name}</span>
                    </li>
                  ))}
                  {(!team.players || team.players.length === 0) && (
                    <li style={{ color: 'var(--text-muted)' }}>Nessun giocatore</li>
                  )}
                </ul>

                {user?.role === 'TA' && (
                  <div>
                    <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Associa Giocatore</h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select 
                        value={playerToAssign}
                        onChange={(e) => setPlayerToAssign(e.target.value)}
                        style={{ flex: 1, padding: '0.5rem' }}
                      >
                        <option value="">Seleziona un giocatore...</option>
                        {players.map(p => (
                          <option key={p.id} value={p.id}>{p.role} - {p.name}</option>
                        ))}
                      </select>
                      <button 
                        className="btn-primary" 
                        onClick={() => handleAssignPlayer(team.id)}
                        disabled={!playerToAssign}
                      >
                        Aggiungi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
