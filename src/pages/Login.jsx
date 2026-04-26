import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerMode, setRegisterMode] = useState('create'); // 'create' or 'join'
  const [fantaName, setFantaName] = useState('');
  const [fantaCode, setFantaCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegistering) {
      try {
        const payload = {
          email,
          ...(registerMode === 'create' ? { fanta_name: fantaName } : { fanta_code: fantaCode })
        };
        await api.post('/auth/register', payload);
        setSuccess('Registrazione completata. Controlla la tua email per impostare la password!');
        setIsRegistering(false);
      } catch (err) {
        setError(err.response?.data?.detail || 'Errore durante la registrazione');
      }
    } else {
      try {
        await login(email, password);
        navigate('/');
      } catch (err) {
        setError('Credenziali non valide');
      }
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--primary)' }}>FantaCloud</h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          {!isRegistering ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ color: 'var(--text-muted)' }}>
                  <input type="radio" checked={registerMode === 'create'} onChange={() => setRegisterMode('create')} style={{ marginRight: '0.5rem' }} />
                  Crea Fantacalcio
                </label>
                <label style={{ color: 'var(--text-muted)' }}>
                  <input type="radio" checked={registerMode === 'join'} onChange={() => setRegisterMode('join')} style={{ marginRight: '0.5rem' }} />
                  Unisciti
                </label>
              </div>

              {registerMode === 'create' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Nome Fantacalcio</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={fantaName}
                    onChange={(e) => setFantaName(e.target.value)}
                    required 
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Codice Fantacalcio</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={fantaCode}
                    onChange={(e) => setFantaCode(e.target.value)}
                    required 
                  />
                </div>
              )}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            {isRegistering ? 'Registrati' : 'Accedi'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Hai già un account? Accedi' : 'Sei nuovo? Registrati'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
