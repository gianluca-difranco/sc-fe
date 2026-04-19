import React, { useState, useEffect } from 'react';
import api from '../api/client';

const Formation = () => {
  const [team, setTeam] = useState(null);
  const [lineup, setLineup] = useState(null);
  const [loading, setLoading] = useState(true);
  const matchday = 1; // Esempio statico, potrebbe essere selezionato

  useEffect(() => {
    const fetchTeamAndLineup = async () => {
      try {
        const teamRes = await api.get('/teams/mine');
        setTeam(teamRes.data);

        try {
          const lineupRes = await api.get(`/matches/lineups/${teamRes.data.id}?matchday=${matchday}`);
          setLineup(lineupRes.data);
        } catch (e) {
          // Nessuna formazione schierata
          setLineup({ player_ids: [], bench_ids: [] });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamAndLineup();
  }, []);

  if (loading) return <div>Caricamento in corso...</div>;
  if (!team) return <div>Nessuna squadra trovata.</div>;

  // Semplificazione: filtriamo i giocatori per ruolo
  const players = team.players || [];
  
  // Sostituiamo gli ID della formazione con i giocatori veri e propri
  const starters = lineup?.player_ids.map(id => players.find(p => p.id === id)).filter(Boolean) || [];
  
  // Dividiamo i titolari in ruoli (per disegnare il campo in stile 4-3-3 o simile)
  const goalkeepers = starters.filter(p => p.role.startsWith('P'));
  const defenders = starters.filter(p => p.role.startsWith('D'));
  const midfielders = starters.filter(p => p.role.startsWith('C'));
  const forwards = starters.filter(p => p.role.startsWith('A'));

  const renderRow = (playersList) => (
    <div className="formation-row">
      {playersList.map((p, idx) => (
        <div key={idx} className="player-avatar-container">
          <div className="player-avatar">
            {p.role[0]}
          </div>
          <div className="player-name">{p.name}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Schiera la Formazione</h1>
      
      <div className="pitch-container">
        <div className="pitch-lines" />
        <div className="pitch-center-line" />
        <div className="pitch-center-circle" />

        <div className="formation-grid">
          {renderRow(forwards)}
          {renderRow(midfielders)}
          {renderRow(defenders)}
          {renderRow(goalkeepers)}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Rosa Disponibile</h2>
        <div className="glass-card" style={{ padding: '1rem', marginTop: '1rem' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Ruolo</th>
                <th>Nome</th>
                <th>Azione</th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id}>
                  <td>{p.role}</td>
                  <td>{p.name}</td>
                  <td>
                    <button className="btn-outline" style={{ padding: '0.25rem 0.5rem' }}>Aggiungi</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Formation;
