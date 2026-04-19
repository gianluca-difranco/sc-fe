import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Standings = () => {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await api.get('/teams/standings');
        setStandings(res.data);
      } catch (err) {
        console.error("Errore classifica", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStandings();
  }, []);

  if (loading) return <div>Caricamento in corso...</div>;

  return (
    <div>
      <h1 className="page-title">Classifica</h1>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Squadra</th>
              <th>Pt</th>
              <th>G</th>
              <th>V</th>
              <th>N</th>
              <th>P</th>
              <th>GF</th>
              <th>GS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, index) => (
              <tr key={s.team_id}>
                <td style={{ fontWeight: 'bold' }}>{index + 1}</td>
                <td>{s.team_name}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{s.points}</td>
                <td>{s.played}</td>
                <td>{s.won}</td>
                <td>{s.drawn}</td>
                <td>{s.lost}</td>
                <td>{s.goals_for}</td>
                <td>{s.goals_against}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>Nessun dato in classifica</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Standings;
