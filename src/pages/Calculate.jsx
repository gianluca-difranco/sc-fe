import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Calculate = () => {
  const { user } = useAuth();
  const [matchday, setMatchday] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [bonuses, setBonuses] = useState({}); // playerId -> bonus value
  const [playersLoading, setPlayersLoading] = useState(false);

  // Load players for the selected matchday
  const loadPlayers = async () => {
    if (!matchday) {
      alert('Seleziona una giornata prima di caricare i giocatori');
      return;
    }
    try {
      setPlayersLoading(true);
      const res = await api.get('/players');
      setPlayers(res.data);
    } catch (err) {
      console.error(err);
      alert('Errore nel caricamento dei giocatori');
    } finally {
      setPlayersLoading(false);
    }
  };

  const handleBonusChange = (playerId, value) => {
    setBonuses(prev => ({ ...prev, [playerId]: value }));
  };

  const handleCalculate = async () => {
    if (!matchday) {
      alert('Seleziona una giornata');
      return;
    }
    try {
      setLoading(true);
      const performances = {};
      Object.entries(bonuses).forEach(([pid, bonus]) => {
        const baseScore = parseFloat(bonus);
        if (!isNaN(baseScore)) {
          performances[pid] = { base_score: baseScore, modifier_ids: [] };
        }
      });
      const payload = { matchday: Number(matchday), performances };
      await api.post('/matches/calculate', payload);
      alert(`Giornata ${matchday} calcolata con successo`);
    } catch (err) {
      console.error(err);
      alert('Errore durante il calcolo della giornata');
    } finally {
      setLoading(false);
    }
  };

  // Restrict access to tenant admin (TA)
  if (!user || user.role !== 'TA') {
    return <div>Accesso negato.</div>;
  }

  return (
    <div className="glass-card" style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1 className="page-title" style={{ marginBottom: '1rem' }}>Calcolo Giornata</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="matchday" style={{ marginRight: '0.5rem' }}>Giornata:</label>
        <input
          id="matchday"
          type="number"
          min="1"
          value={matchday}
          onChange={e => setMatchday(e.target.value)}
          style={{ width: '80px', marginRight: '1rem' }}
        />
        <button className="btn btn-secondary" onClick={loadPlayers} disabled={playersLoading}>
          {playersLoading ? 'Caricamento...' : 'Carica Giocatori'}
        </button>
      </div>

      {players.length > 0 && (
        <div style={{ marginBottom: '1rem', overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid var(--border)' }}>Nome</th>
                <th style={{ borderBottom: '1px solid var(--border)' }}>Ruolo</th>
                <th style={{ borderBottom: '1px solid var(--border)' }}>Bonus</th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id}>
                  <td style={{ padding: '0.5rem' }}>{p.name}</td>
                  <td style={{ padding: '0.5rem' }}>{p.role}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={bonuses[p.id] || ''}
                      onChange={e => handleBonusChange(p.id, e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleCalculate}
        disabled={loading}
        style={{ width: '100%' }}
      >
        {loading ? 'Calcolando...' : 'Calcola e assegna punteggi'}
      </button>
    </div>
  );
};

export default Calculate;
