import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const ROLE_LABELS = { P: 'Por', D: 'Dif', C: 'Cen', A: 'Att' };

const getRoleKey = (role) => {
  if (!role) return 'A';
  return role[0].toUpperCase();
};

const PlayerBadge = ({ player, isStarter, isBench, onAdd, onRemove, isLocked }) => {
  const roleKey = getRoleKey(player.role);
  const roleColors = {
    P: '#f59e0b',
    D: '#3b82f6',
    C: '#22c55e',
    A: '#ef4444',
  };
  const color = roleColors[roleKey] || '#8b5cf6';

  return (
    <tr key={player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <td style={{ padding: '0.5rem 0.75rem' }}>
        <span style={{
          background: color,
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}>{ROLE_LABELS[roleKey] || player.role}</span>
      </td>
      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 500 }}>{player.name}</td>
      <td style={{ padding: '0.5rem 0.75rem', color: '#a78bfa' }}>{player.credits} cr</td>
      <td style={{ padding: '0.5rem 0.75rem' }}>
        {!isLocked && (
          isStarter ? (
            <button
              onClick={() => onRemove(player.id, 'starter')}
              style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}
            >Rimuovi</button>
          ) : isBench ? (
            <button
              onClick={() => onRemove(player.id, 'bench')}
              style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem' }}
            >Togli panchina</button>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => onAdd(player.id, 'starter')}
                style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
              >Titolare</button>
              <button
                onClick={() => onAdd(player.id, 'bench')}
                style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '0.8rem' }}
              >Panchina</button>
            </div>
          )
        )}
      </td>
    </tr>
  );
};

const PitchPlayer = ({ player, onRemove, isLocked }) => {
  const roleKey = getRoleKey(player?.role);
  const roleColors = { P: '#f59e0b', D: '#3b82f6', C: '#22c55e', A: '#ef4444' };
  const color = roleColors[roleKey] || '#8b5cf6';

  if (!player) return <div style={{ width: 60 }} />;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: isLocked ? 'default' : 'pointer' }}
      onClick={() => !isLocked && onRemove(player.id, 'starter')}
      title={isLocked ? "" : "Clicca per rimuovere"}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: color, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 800, color: '#fff',
        fontSize: '1rem', border: '2px solid rgba(255,255,255,0.4)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'transform 0.15s',
      }}>
        {ROLE_LABELS[roleKey] || '?'}
      </div>
      <span style={{
        marginTop: 4, fontSize: '0.65rem', color: '#e2e8f0', fontWeight: 600,
        textShadow: '0 1px 3px rgba(0,0,0,0.8)', maxWidth: 64,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center',
      }}>
        {player.name.split(' ').pop()}
      </span>
    </div>
  );
};

const EmptySlot = ({ label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      border: '2px dashed rgba(255,255,255,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem' }}>+</span>
    </div>
    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: 4 }}>{label}</span>
  </div>
);

const PitchRow = ({ players, allPlayers, onRemove, label, slots, isLocked }) => {
  const filled = players.map(id => allPlayers.find(p => p.id === id)).filter(Boolean);
  const empties = Math.max(0, slots - filled.length);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.2rem' }}>
      {filled.map(p => <PitchPlayer key={p.id} player={p} onRemove={onRemove} isLocked={isLocked} />)}
      {Array.from({ length: empties }).map((_, i) => <EmptySlot key={i} label={label} />)}
    </div>
  );
};

const Formation = () => {
  const [team, setTeam] = useState(null);
  const [starterIds, setStarterIds] = useState([]);
  const [benchIds, setBenchIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [matchday, setMatchday] = useState(1);
  const [isLocked, setIsLocked] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [teamRes, matchesRes] = await Promise.all([
        api.get('/teams/mine'),
        api.get('/matches/')
      ]);
      
      setTeam(teamRes.data);

      // Verifica se la giornata è calcolata
      const matchdayMatches = matchesRes.data.filter(m => m.matchday === matchday);
      const calculated = matchdayMatches.some(m => m.home_score !== null);
      setIsLocked(calculated);

      try {
        const lineupRes = await api.get(`/matches/lineups/${teamRes.data.id}?matchday=${matchday}`);
        setStarterIds(lineupRes.data.player_ids || []);
        setBenchIds(lineupRes.data.bench_ids || []);
      } catch {
        setStarterIds([]);
        setBenchIds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [matchday]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = (playerId, type) => {
    if (isLocked) return;
    if (type === 'starter') {
      setStarterIds(prev => [...prev, playerId]);
    } else {
      setBenchIds(prev => [...prev, playerId]);
    }
  };

  const handleRemove = (playerId, type) => {
    if (isLocked) return;
    if (type === 'starter') {
      setStarterIds(prev => prev.filter(id => id !== playerId));
    } else {
      setBenchIds(prev => prev.filter(id => id !== playerId));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await api.post(`/matches/lineups/${team.id}`, {
        matchday,
        player_ids: starterIds,
        bench_ids: benchIds,
      });
      setFeedback({ type: 'success', msg: 'Formazione salvata con successo!' });
    } catch (e) {
      setFeedback({ type: 'error', msg: e.response?.data?.detail || 'Errore nel salvataggio.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Caricamento in corso...</div>;
  if (!team) return <div style={{ color: '#fff', padding: '2rem' }}>Nessuna squadra trovata.</div>;

  const players = team.players || [];

  // Dividi titolari per ruolo (ordine sul campo: A → C → D → P)
  const starterPlayers = starterIds.map(id => players.find(p => p.id === id)).filter(Boolean);
  const getByRole = (key) => starterPlayers.filter(p => getRoleKey(p.role) === key).map(p => p.id);

  const attackers = getByRole('A');
  const midfielders = getByRole('C');
  const defenders = getByRole('D');
  const goalkeepers = getByRole('P');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Schiera la Formazione</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Giornata:&nbsp;
            <select
              className="form-input"
              value={matchday}
              onChange={e => setMatchday(Number(e.target.value))}
            >
              {Array.from({ length: 38 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Giornata {d}</option>
              ))}
            </select>
          </label>
          {!isLocked && (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? '#475569' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '0.5rem 1.25rem', cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontSize: '0.9rem',
              }}
            >
              {saving ? 'Salvando...' : '💾 Salva Formazione'}
            </button>
          )}
        </div>
      </div>

      {isLocked && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem',
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.4)',
          color: '#93c5fd',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🔒 Questa giornata è già stata calcolata. La formazione è in sola visualizzazione.</span>
        </div>
      )}

      {feedback && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: feedback.type === 'success' ? '#86efac' : '#fca5a5',
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Campetto */}
      <div style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        background: 'linear-gradient(180deg, #166534 0%, #15803d 30%, #16a34a 60%, #15803d 90%, #166534 100%)',
        padding: '1.5rem 1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        marginBottom: '2rem',
        minHeight: 340,
      }}>
        {/* Linee campo */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 80, height: 80, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
          }} />
          <div style={{ position: 'absolute', top: '5%', left: '30%', right: '30%', bottom: '5%', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px' }} />
        </div>

        {/* Righe giocatori */}
        <PitchRow players={attackers} allPlayers={players} onRemove={handleRemove} label="Att" slots={1} isLocked={isLocked} />
        <PitchRow players={midfielders} allPlayers={players} onRemove={handleRemove} label="Cen" slots={2} isLocked={isLocked} />
        <PitchRow players={defenders} allPlayers={players} onRemove={handleRemove} label="Dif" slots={1} isLocked={isLocked} />
        <PitchRow players={goalkeepers} allPlayers={players} onRemove={handleRemove} label="Por" slots={1} isLocked={isLocked} />
      </div>

      {/* Panchina */}
      {benchIds.length > 0 && (
        <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Panchina ({benchIds.length})
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {benchIds.map(id => {
              const p = players.find(pl => pl.id === id);
              if (!p) return null;
              return (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px 10px',
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ROLE_LABELS[getRoleKey(p.role)] || p.role}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.name}</span>
                  {!isLocked && (
                    <button
                      onClick={() => handleRemove(id, 'bench')}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}
                      title="Rimuovi dalla panchina"
                    >×</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rosa */}
      <div className="glass-card" style={{ padding: '1rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#e2e8f0' }}>
          Rosa Disponibile
          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            ({starterIds.length} titolari · {benchIds.length} panchina)
          </span>
        </h2>
        <table className="premium-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Ruolo</th>
              <th>Nome</th>
              <th>Crediti</th>
              <th>Azione</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <PlayerBadge
                key={p.id}
                player={p}
                isStarter={starterIds.includes(p.id)}
                isBench={benchIds.includes(p.id)}
                onAdd={handleAdd}
                onRemove={handleRemove}
                isLocked={isLocked}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Formation;
