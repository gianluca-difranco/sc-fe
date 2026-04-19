import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Calendar = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matches');
        setMatches(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) return <div>Caricamento...</div>;

  return (
    <div>
      <h1 className="page-title">Calendario</h1>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <ul style={{ listStyle: 'none' }}>
          {matches.map(m => (
            <li key={m.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
              <strong>Giornata {m.matchday}</strong>: {m.home_team_id} vs {m.away_team_id} 
              <span style={{ float: 'right', color: 'var(--primary)' }}>
                {m.home_score !== null ? `${m.home_score} - ${m.away_score}` : 'Da giocare'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
