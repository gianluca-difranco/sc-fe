import React, { useState, useEffect } from 'react';
import api from '../api/client';

const NextMatch = () => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextMatch = async () => {
      try {
        const teamRes = await api.get('/teams/mine');
        const myTeamId = teamRes.data.id;
        
        const matchesRes = await api.get('/matches/');
        // Troviamo il primo match non giocato per questa squadra
        const upcoming = matchesRes.data.find(m => 
          (m.home_team_id === myTeamId || m.away_team_id === myTeamId) && 
          m.home_score === null
        );
        
        setMatch(upcoming);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNextMatch();
  }, []);

  if (loading) return <div>Caricamento...</div>;
  if (!match) return <div>Nessun incontro in programma.</div>;

  return (
    <div>
      <h1 className="page-title">Prossimo Incontro</h1>
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Giornata {match.matchday}</h2>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2rem', marginTop: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Team {match.home_team_id}</div>
          <div style={{ fontSize: '2rem', color: 'var(--primary)' }}>VS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Team {match.away_team_id}</div>
        </div>
      </div>
    </div>
  );
};

export default NextMatch;
