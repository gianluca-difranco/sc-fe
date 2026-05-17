import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Calendar = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches/');
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleGenerateCalendar = async () => {
    try {
      setGenerating(true);
      const teamsRes = await api.get('/teams/');
      const teams = teamsRes.data;
      if (teams.length < 2) {
        alert('Servono almeno 2 squadre per generare il calendario.');
        setGenerating(false);
        return;
      }
      
      const teamIds = teams.map(t => t.id);
      // Calcola un numero di giornate standard (andata e ritorno per tutti)
      const totalMatchdays = (teams.length - 1) * 2; 
      
      // team_ids è List[int] (Body) in FastAPI, total_matchdays è int (Query)
      await api.post('/matches/generate-calendar', teamIds, {
        params: { total_matchdays: totalMatchdays }
      });
      
      await fetchMatches();
    } catch (err) {
      console.error(err);
      alert('Errore durante la generazione del calendario.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Calendario</h1>
        {matches.length === 0 && !loading && (user?.role?.toUpperCase() === 'TA') && (
          <button 
            className="btn btn-primary" 
            onClick={handleGenerateCalendar}
            disabled={generating}
            style={{ margin: 0 }}
          >
            {generating ? 'Generazione in corso...' : 'Genera Calendario'}
          </button>
        )}
      </div>
      <div className="glass-card" style={{ padding: '2rem' }}>
        {matches.length === 0 ? (
          <p>Nessuna partita presente in calendario.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Calendar;
