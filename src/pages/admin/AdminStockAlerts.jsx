import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatDate, getInitials } from '../../utils/helpers';
import { Loader } from '../../components/UI';
import { useToastStore } from '../../store';

export default function AdminStockAlerts() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const load = () => {
    setLoading(true);
    adminAPI.stockAlerts()
      .then(r => { setEntries(Array.isArray(r.data?.alerts) ? r.data.alerts : []); setLoading(false); })
      .catch(() => { setEntries([]); setLoading(false); });
  };
  useEffect(load, []);

  const handleNotified = async (entry) => {
    try {
      await adminAPI.notifyStockAlert?.(entry.id);
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, notified: true } : e));
      addToast('Client marqué comme notifié', 'success');
    } catch { addToast('Erreur', 'error'); }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`Supprimer l'alerte de ${entry.name || entry.email} ?`)) return;
    try {
      await adminAPI.deleteStockAlert?.(entry.id);
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      addToast('Alerte supprimée', 'success');
    } catch { addToast('Erreur', 'error'); }
  };

  if (loading) return <div style={{ padding: 40 }}><Loader text="Chargement des alertes stock..." /></div>;

  return (
    <div style={{ padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow">Marketing</div>
        <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Alertes stock <span style={{ color: 'var(--text-3)', fontSize: '0.55em', fontWeight: 600 }}>({entries.length})</span>
        </h1>
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📦</p>
          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Aucune alerte</p>
          <p style={{ color: 'var(--text-3)' }}>La liste des alertes stock est vide.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nom', 'Email', 'Téléphone', 'Produit', 'Date', 'Notifié', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '14px 20px', background: 'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 700, color: 'var(--text)' }}>{entry.name || '—'}</p>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>{entry.email}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>{entry.phone || '—'}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)' }}>
                      {entry.productName || entry.product?.name || '—'}
                      {entry.product?.brand && <span style={{ display:'block', fontSize:12, color:'var(--text-3)' }}>{entry.product.brand}</span>}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-3)', fontSize: 13 }}>{formatDate(entry.createdAt)}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {entry.notified ? (
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 12, letterSpacing: '0.04em', background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.28)' }}>Notifié</span>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 12, letterSpacing: '0.04em', background: 'rgba(250,204,21,0.12)', color: '#EAB308', border: '1px solid rgba(250,204,21,0.28)' }}>En attente</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        {!entry.notified && (
                          <button type="button" onClick={() => handleNotified(entry)}
                            className="admin-table-btn" style={{ fontSize: 13, color: '#22C55E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>
                            ✓ Notifié
                          </button>
                        )}
                        <button type="button" onClick={() => handleDelete(entry)}
                          className="admin-table-btn-danger" style={{ fontSize: 13, color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 800 }}>
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
