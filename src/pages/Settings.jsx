import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    allow_duplicate_players: false,
    lineup_size: 11,
    bench_size: 15,
    base_score_for_goal: 66.0,
    step_for_goal: 6.0
  });

  const fetchTenant = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenants/mine');
      setFormData({
        name: res.data.name || '',
        allow_duplicate_players: res.data.allow_duplicate_players || false,
        lineup_size: res.data.lineup_size || 11,
        bench_size: res.data.bench_size || 15,
        base_score_for_goal: res.data.base_score_for_goal || 66.0,
        step_for_goal: res.data.step_for_goal || 6.0
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Impossibile caricare le impostazioni.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'TA') {
      fetchTenant();
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await api.put('/tenants/mine/settings', formData);
      setFeedback({ type: 'success', text: 'Impostazioni salvate con successo!' });
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Errore nel salvataggio delle impostazioni.' });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'TA') {
    return <div style={{ padding: '2rem' }}>Accesso negato. Solo i Tenant Admin possono vedere questa pagina.</div>;
  }

  if (loading) return <div style={{ padding: '2rem' }}>Caricamento impostazioni...</div>;

  return (
    <div>
      <h1 className="page-title">Impostazioni Tenant</h1>
      
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
        {feedback && (
          <div style={{
            padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px',
            backgroundColor: feedback.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: feedback.type === 'success' ? '#34d399' : '#f87171',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            {feedback.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nome Fantacalcio</label>
            <input 
              type="text"
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Soglia 1° Gol (punti)</label>
              <input 
                type="number"
                step="0.5"
                className="form-input"
                value={formData.base_score_for_goal}
                onChange={e => setFormData({...formData, base_score_for_goal: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Scatto gol successivi (punti)</label>
              <input 
                type="number"
                step="0.5"
                className="form-input"
                value={formData.step_for_goal}
                onChange={e => setFormData({...formData, step_for_goal: parseFloat(e.target.value)})}
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Dimensione Formazione</label>
              <input 
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={formData.lineup_size}
                onChange={e => setFormData({...formData, lineup_size: parseInt(e.target.value)})}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Dimensione Panchina</label>
              <input 
                type="number"
                min="0"
                max="15"
                className="form-input"
                value={formData.bench_size}
                onChange={e => setFormData({...formData, bench_size: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input 
              type="checkbox"
              id="dup_players"
              checked={formData.allow_duplicate_players}
              onChange={e => setFormData({...formData, allow_duplicate_players: e.target.checked})}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="dup_players" style={{ cursor: 'pointer' }}>Permetti giocatori duplicati tra le squadre</label>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}
          >
            <Save size={18} />
            {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
