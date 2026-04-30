import React, { useEffect, useState } from 'react';
import { Trash2, Plus, X, Shield, Users, ChevronRight, AlertTriangle } from 'lucide-react';
import api from '../api/client';

const Fantacalci = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // tenant da eliminare
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    admin_email: '',
    allow_duplicate_players: false,
    lineup_size: 5,
    bench_size: 5,
    role_constraints: null,
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tenants/');
      setTenants(res.data);
    } catch (err) {
      setError('Impossibile caricare i tenant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tenants/', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        admin_email: '',
        allow_duplicate_players: false,
        lineup_size: 5,
        bench_size: 5,
        role_constraints: null,
      });
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore nella creazione del tenant.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      await api.delete(`/tenants/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchTenants();
    } catch (err) {
      setError(err.response?.data?.detail || 'Errore nell\'eliminazione del tenant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Fantacalci Attivi
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Gestisci tutti i campionati sulla piattaforma
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={18} />
          Nuovo Fantacalcio
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          color: '#f87171',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tenant list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Caricamento...
        </div>
      ) : tenants.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          background: 'var(--card-bg)', borderRadius: '16px',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
        }}>
          <Shield size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '1.1rem' }}>Nessun fantacalcio attivo.</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Crea il primo per iniziare!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {/* Icon */}
              <div style={{
                width: 46, height: 46, borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={22} color="white" />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {tenant.name}
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ID: <strong style={{ color: 'var(--text-primary)' }}>#{tenant.id}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Formazione: <strong style={{ color: 'var(--text-primary)' }}>{tenant.lineup_size}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Panchina: <strong style={{ color: 'var(--text-primary)' }}>{tenant.bench_size}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Doppioni: <strong style={{ color: tenant.allow_duplicate_players ? '#4ade80' : '#f87171' }}>
                      {tenant.allow_duplicate_players ? 'Sì' : 'No'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => setDeleteConfirm(tenant)}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '8px',
                  color: '#f87171',
                  cursor: 'pointer',
                  padding: '0.5rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              >
                <Trash2 size={15} />
                Elimina
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'var(--sidebar-bg)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '2rem',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Nuovo Fantacalcio
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Nome campionato *
                </label>
                <input
                  className="form-input"
                  type="text"
                  required
                  placeholder="Es. Fantacalcio Serie A 2024"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Email admin (TA) *
                </label>
                <input
                  className="form-input"
                  type="email"
                  required
                  placeholder="admin@example.com"
                  value={formData.admin_email}
                  onChange={e => setFormData(f => ({ ...f, admin_email: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Titolari
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.lineup_size}
                    onChange={e => setFormData(f => ({ ...f, lineup_size: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Panchina
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    max="15"
                    value={formData.bench_size}
                    onChange={e => setFormData(f => ({ ...f, bench_size: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="allow_dup"
                  checked={formData.allow_duplicate_players}
                  onChange={e => setFormData(f => ({ ...f, allow_duplicate_players: e.target.checked }))}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="allow_dup" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Permetti giocatori duplicati tra le squadre
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Plus size={16} />
                  {submitting ? 'Creazione...' : 'Crea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}>
          <div style={{
            background: 'var(--sidebar-bg)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '18px',
            padding: '2rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            textAlign: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <AlertTriangle size={28} color="#f87171" />
            </div>

            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Elimina "{deleteConfirm.name}"?
            </h2>
            <p style={{ margin: '0 0 1.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Questa azione è <strong style={{ color: '#f87171' }}>irreversibile</strong>. Verranno eliminati tutti gli utenti,
              le squadre, i giocatori, le partite e i dati associati a questo campionato.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={submitting}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                Annulla
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Eliminazione...' : 'Sì, elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fantacalci;
