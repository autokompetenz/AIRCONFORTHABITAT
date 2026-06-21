import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatEuro } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminPuppies() {
  const [puppies, setPuppies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { addToast } = useToastStore();
  const location = useLocation();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setLoadError(false);
    adminAPI.puppies()
      .then(r => { setPuppies(Array.isArray(r.data?.puppies) ? r.data.puppies : []); setLoading(false); })
      .catch(() => { setPuppies([]); setLoadError(true); setLoading(false); });
  };

  useEffect(load, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      addToast(location.state.successMessage, 'success');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  const handleToggle = async (puppy) => {
    try {
      const { data } = await adminAPI.togglePuppy(puppy.id);
      setPuppies(prev => prev.map(p => p.id === puppy.id ? data.puppy : p));
      addToast(data.message || 'Statut mis à jour', 'success');
    } catch { addToast('Erreur', 'error'); }
  };

  const handleDelete = async (puppy) => {
    if (!window.confirm(`Supprimer définitivement ${puppy.name} ? Cette action est irréversible.`)) return;
    try {
      await adminAPI.deletePuppy(puppy.id);
      setPuppies(prev => prev.filter(p => p.id !== puppy.id));
      addToast('Chiot supprimé', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Suppression impossible', 'error');
    }
  };

  if (loading) return <div style={{ padding: 40 }}><Loader text="Chargement des chiots..." /></div>;

  return (
    <div style={{ padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
        <div>
          <div className="section-eyebrow">Inventaire</div>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Chiots <span style={{ color: 'var(--text-3)', fontSize: '0.55em', fontWeight: 600 }}>({puppies.length})</span>
          </h1>
        </div>
        <Link to="/admin/puppies/new" className="btn-primary" style={{ fontSize: 14, padding: '14px 24px', alignSelf: 'flex-end' }}>
          + Ajouter un chiot
        </Link>
      </div>

      {loadError && (
        <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <p style={{ color: '#EF4444', fontWeight: 600, marginBottom: 12 }}>Impossible de charger les chiots.</p>
          <button type="button" className="btn-ghost" onClick={load}>Réessayer</button>
        </div>
      )}

      {puppies.length === 0 && !loadError ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🐶</p>
          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Aucun chiot</p>
          <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>Ajoutez votre premier chiot au catalogue.</p>
          <Link to="/admin/puppies/new" className="btn-primary">+ Ajouter un chiot</Link>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Photo', 'Nom', 'Race', 'Prix', 'Statut', 'Actif', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '14px 20px', background: 'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {puppies.map(puppy => (
                  <tr key={puppy.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s var(--ease)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      {puppy.imageUrl ? (
                        <img src={puppy.imageUrl} alt="" style={{ width: 88, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: 88, height: 64, borderRadius: 10, background: 'var(--bg-card2)', border: '1px solid var(--border)' }} />
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 800, color: 'var(--text)', fontSize: 16 }}>{puppy.name}</p>
                        {puppy.featured && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.1em' }}>★ NOUVEAU</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>{puppy.breed}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--primary)', fontSize: 17, letterSpacing: '-0.01em' }}>{formatEuro(puppy.price)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 12, letterSpacing: '0.04em',
                        background: puppy.status === 'available' ? 'rgba(34,197,94,0.12)' : puppy.status === 'reserved' ? 'rgba(250,204,21,0.12)' : 'rgba(239,68,68,0.1)',
                        color: puppy.status === 'available' ? '#22C55E' : puppy.status === 'reserved' ? '#EAB308' : '#EF4444',
                        border: `1px solid ${puppy.status === 'available' ? 'rgba(34,197,94,0.28)' : puppy.status === 'reserved' ? 'rgba(250,204,21,0.28)' : 'rgba(239,68,68,0.25)'}` }}>{puppy.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 12, letterSpacing: '0.04em', background: puppy.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: puppy.isActive ? '#22C55E' : '#EF4444', border: `1px solid ${puppy.isActive ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.25)'}` }}>
                        {puppy.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to={`/admin/puppies/${puppy.id}/edit`} style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 800 }}>
                          Modifier
                        </Link>
                        <button type="button" onClick={() => handleToggle(puppy)}
                          style={{ fontSize: 13, color: puppy.isActive ? '#DC2626' : 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 700 }}>
                          {puppy.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button type="button" onClick={() => handleDelete(puppy)}
                          style={{ fontSize: 13, color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 800 }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
