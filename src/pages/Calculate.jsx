import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Calculator, Users, CheckCircle, AlertCircle } from 'lucide-react';

const Calculate = () => {
  const { user } = useAuth();
  const [matchday, setMatchday] = useState('');
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [bonuses, setBonuses] = useState({});
  const [playersLoading, setPlayersLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const loadPlayers = async () => {
    if (!matchday) {
      showToast('error', 'Seleziona una giornata prima di caricare i giocatori');
      return;
    }
    try {
      setPlayersLoading(true);
      const res = await api.get('/players');
      setPlayers(res.data);
      setBonuses({});
    } catch (err) {
      console.error(err);
      showToast('error', 'Errore nel caricamento dei giocatori');
    } finally {
      setPlayersLoading(false);
    }
  };

  const handleBonusChange = (playerId, value) => {
    setBonuses(prev => ({ ...prev, [playerId]: value }));
  };

  const handleCalculate = async () => {
    if (!matchday) {
      showToast('error', 'Seleziona una giornata');
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
      showToast('success', `Giornata ${matchday} calcolata con successo!`);
    } catch (err) {
      console.error(err);
      showToast('error', 'Errore durante il calcolo della giornata');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'TA') {
    return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Accesso negato.</div>;
  }

  return (
    <div style={{ maxWidth: '860px', margin: 'auto' }}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem',
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
          borderRadius: '12px', padding: '0.875rem 1.25rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          zIndex: 999, fontWeight: 500, fontSize: '0.9rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        }}>
          {toast.type === 'success'
            ? <CheckCircle size={18} />
            : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Calcolo Giornata</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Inserisci i voti dei giocatori e calcola i punteggi di giornata
        </p>
      </div>

      {/* Step 1 — Selezione giornata */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Step 1 — Seleziona la giornata
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label
              htmlFor="matchday"
              style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}
            >
              N° Giornata
            </label>
            <input
              id="matchday"
              type="number"
              min="1"
              value={matchday}
              onChange={e => setMatchday(e.target.value)}
              className="form-input"
              style={{ width: '100px' }}
              placeholder="Es. 1"
            />
          </div>
          <button
            className="btn-primary"
            onClick={loadPlayers}
            disabled={playersLoading || !matchday}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: !matchday ? 0.5 : 1,
              cursor: !matchday ? 'not-allowed' : 'pointer',
            }}
          >
            <Users size={16} />
            {playersLoading ? 'Caricamento...' : 'Carica Giocatori'}
          </button>
        </div>
      </div>

      {/* Step 2 — Tabella voti */}
      {players.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Step 2 — Inserisci i voti ({players.length} giocatori)
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Ruolo</th>
                  <th style={{ width: '150px' }}>Voto (base)</th>
                </tr>
              </thead>
              <tbody>
                {players.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: 'rgba(16,185,129,0.1)',
                        color: 'var(--primary)',
                      }}>
                        {p.role}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={bonuses[p.id] || ''}
                        onChange={e => handleBonusChange(p.id, e.target.value)}
                        className="form-input"
                        style={{ width: '110px' }}
                        placeholder="0.0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3 — Calcola */}
      <button
        className="btn-primary"
        onClick={handleCalculate}
        disabled={loading || players.length === 0}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
          padding: '0.875rem',
          fontSize: '1rem',
          opacity: players.length === 0 ? 0.45 : 1,
          cursor: players.length === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        <Calculator size={18} />
        {loading ? 'Calcolando...' : 'Calcola e assegna punteggi'}
      </button>
    </div>
  );
};

export default Calculate;
