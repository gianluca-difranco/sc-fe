import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Calculate = () => {
  const { user } = useAuth();
  const [matchday, setMatchday] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (!matchday) {
      alert('Seleziona una giornata');
      return;
    }
    try {
      setLoading(true);
      // Invia una richiesta vuota di performance; backend gestirà i calcoli
      const payload = { matchday: Number(matchday), performances: {} };
      await api.post('/matches/calculate', payload);
      alert(`Giornata ${matchday} calcolata con successo`);
    } catch (err) {
      console.error(err);
      alert('Errore durante il calcolo della giornata');
    } finally {
      setLoading(false);
    }
  };

  // Non mostrare nulla se utente non è admin
  if (!user || user.role !== 'TA') {
    return <div>Accesso negato.</div>;
  }

  return (
    <div className="glass-card" style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1 className="page-title" style={{ marginBottom: '1rem' }}>Calcolo Giornata</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="matchday" style={{ marginRight: '0.5rem' }}>Giornata:</label>
        <input
          id="matchday"
          type="number"
          min="1"
          value={matchday}
          onChange={e => setMatchday(e.target.value)}
          style={{ width: '80px' }}
        />
      </div>
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
