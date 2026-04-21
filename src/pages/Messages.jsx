import React, { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', text: string }

  if (user?.role !== 'TA') {
    return (
      <div>
        <h1 className="page-title">Messaggi</h1>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Accesso negato: questa sezione è riservata agli amministratori.
          </p>
        </div>
      </div>
    );
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    setFeedback(null);

    try {
      await api.post('/messages/send', { content });
      setFeedback({ type: 'success', text: 'Messaggio inviato con successo!' });
      setContent('');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Errore durante l\'invio del messaggio.';
      setFeedback({ type: 'error', text: detail });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Invia Messaggio</h1>

      <div className="glass-card" style={{ padding: '2rem', maxWidth: '700px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Il messaggio verrà inviato alla coda e salvato nel sistema.
          Solo gli amministratori del tenant possono inviare messaggi.
        </p>

        <form onSubmit={handleSend}>
          <label
            htmlFor="msg-content"
            style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}
          >
            Testo del messaggio
          </label>
          <textarea
            id="msg-content"
            className="input-field"
            rows={5}
            placeholder="Scrivi il tuo messaggio qui..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={sending}
            style={{ resize: 'vertical', marginBottom: '1rem' }}
          />

          {feedback && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                backgroundColor:
                  feedback.type === 'success'
                    ? 'rgba(16,185,129,0.15)'
                    : 'rgba(239,68,68,0.15)',
                color: feedback.type === 'success' ? 'var(--primary)' : 'var(--danger)',
                border: `1px solid ${feedback.type === 'success' ? 'var(--primary)' : 'var(--danger)'}`,
              }}
            >
              {feedback.text}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={sending || !content.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Send size={16} />
            {sending ? 'Invio in corso...' : 'Invia Messaggio'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
