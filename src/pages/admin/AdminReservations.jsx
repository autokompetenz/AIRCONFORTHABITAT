import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatEuro, formatDate } from '../../utils/helpers';
import { Loader } from '../../components/UI';
import { useToastStore } from '../../store';

const STATUS_LABELS = { pending:'En attente', deposit_confirmed:'Acompte confirmé', preparing:'En préparation', ready:'Prêt(e)', delivered:'Remis(e)', cancelled:'Annulée' };

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const fetch = async (status) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.reservations({ status: status || undefined });
      setReservations(data.reservations);
      setStatusCounts(data.statusCounts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const countFor = (id) => Array.isArray(statusCounts) ? statusCounts.find(s => s.status === id)?._count?.status || 0 : 0;
  const tabs = [{ id:'', label:'Toutes' }, ...Object.entries(STATUS_LABELS).map(([id,label]) => ({ id, label }))];

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Supprimer définitivement cette réservation ? Cette action est irréversible.')) return;
    try {
      await adminAPI.deleteReservation(id);
      addToast('Réservation supprimée', 'success');
      fetch(activeTab);
    } catch (err) {
      addToast(err.response?.data?.error || 'Suppression impossible', 'error');
    }
  };

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:28 }}>
        <div className="section-eyebrow">Gestion</div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>Réservations</h1>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {tabs.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => { setActiveTab(id); fetch(id); }}
            style={{ padding:'9px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Outfit',sans-serif", transition:'all 0.2s', border:`1px solid ${activeTab===id ? 'var(--primary)' : 'var(--border)'}`, background: activeTab===id ? 'var(--primary-bg)' : 'var(--bg-card)', color: activeTab===id ? 'var(--primary)' : 'var(--text-2)', boxShadow: activeTab===id ? 'none' : 'var(--shadow-sm)' }}>
            {label}
            {id && countFor(id) > 0 && <span style={{ marginLeft:8, background: activeTab===id ? 'rgba(201,118,46,0.2)' : 'var(--bg-card2)', padding:'2px 7px', borderRadius:8, fontSize:11, border: activeTab===id ? '1px solid var(--primary-border)' : '1px solid var(--border)' }}>{countFor(id)}</span>}
          </button>
        ))}
      </div>

      {loading ? <Loader text="Chargement..." /> : (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['N° Réservation','Client','Chiot','Date','Montant','Statut','Action'].map(h => (
                    <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', padding:'14px 20px', background:'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res.id} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding:'14px 20px' }}>
                      <span style={{ fontFamily:'monospace', color:'var(--primary)', fontSize:13, fontWeight:800, background:'var(--primary-bg)', padding:'4px 10px', borderRadius:6, border:'1px solid var(--primary-border)' }}>{res.number}</span>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <p style={{ fontSize:14, color:'var(--text)', fontWeight:700 }}>{res.guestName}</p>
                      <p style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>{res.guestEmail}</p>
                    </td>
                    <td style={{ padding:'14px 20px', fontWeight:600, color:'var(--text-2)' }}>{res.puppy?.name || '—'}</td>
                    <td style={{ padding:'14px 20px', color:'var(--text-2)', fontSize:13 }}>{formatDate(res.createdAt)}</td>
                    <td style={{ padding:'14px 20px', fontWeight:800, color:'var(--text)', fontSize:16 }}>{formatEuro(res.puppy?.price || 0)}</td>
                    <td style={{ padding:'14px 20px' }}>
                      <span className={`badge badge-${res.status}`}><span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} /> {STATUS_LABELS[res.status] || res.status}</span>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <Link to={`/admin/reservations/${res.id}`} className="btn-primary" style={{ fontSize:12, padding:'10px 18px' }}>Gérer →</Link>
                        <button onClick={e => handleDelete(e, res.id)} style={{ background:'none', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, color:'#DC2626', fontSize:13, fontWeight:700, padding:'10px 12px', cursor:'pointer', fontFamily:"'Outfit',sans-serif", transition:'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr><td colSpan={7} style={{ padding:'48px', textAlign:'center', color:'var(--text-3)' }}>Aucune réservation trouvée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
