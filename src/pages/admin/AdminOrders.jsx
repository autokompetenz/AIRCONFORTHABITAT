import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { formatEuro, formatDate, STATUS_LABELS } from '../../utils/helpers';
import { Loader } from '../../components/UI';
import { useToastStore } from '../../store';

const ORDER_STATUS_FILTERS = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusCounts, setStatusCounts] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();

  const fetch = async (status) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.orders({ status: status || undefined });
      setOrders(data.orders);
      setStatusCounts(data.statusCounts || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const countFor = (id) => Array.isArray(statusCounts) ? statusCounts.find(s => s.status === id)?._count?.status || 0 : 0;
  const tabs = [{ id:'', label:'Toutes' }, ...ORDER_STATUS_FILTERS.map(id => ({ id, label: STATUS_LABELS[id] || id }))];

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Supprimer définitivement cette commande ? Cette action est irréversible.')) return;
    try {
      await adminAPI.deleteOrder(id);
      addToast('Commande supprimée', 'success');
      fetch(activeTab);
    } catch (err) {
      addToast(err.response?.data?.error || 'Suppression impossible', 'error');
    }
  };

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:28 }}>
        <div className="section-eyebrow">Gestion</div>
        <h1 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>Commandes</h1>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
        {tabs.map(({ id, label }) => (
          <button key={id} type="button" onClick={() => { setActiveTab(id); fetch(id); }}
            style={{ padding:'9px 16px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'all 0.2s', border:`1px solid ${activeTab===id ? 'var(--primary)' : 'var(--border)'}`, background: activeTab===id ? 'var(--primary-bg)' : 'var(--bg-card)', color: activeTab===id ? 'var(--primary)' : 'var(--text-2)', boxShadow: activeTab===id ? 'none' : 'var(--shadow-sm)' }}>
            {label}
            {id && countFor(id) > 0 && <span style={{ marginLeft:8, background: activeTab===id ? 'rgba(46,134,193,0.2)' : 'var(--bg-card2)', padding:'2px 7px', borderRadius:8, fontSize:11, border: activeTab===id ? '1px solid var(--primary-border)' : '1px solid var(--border)' }}>{countFor(id)}</span>}
          </button>
        ))}
      </div>

      {loading ? <Loader text="Chargement..." /> : (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['N° Commande','Client','Date','Montant','Statut','Action'].map(h => (
                    <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', padding:'14px 20px', background:'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding:'14px 20px' }}>
                      <span style={{ fontFamily:'monospace', color:'var(--primary)', fontSize:13, fontWeight:800, background:'var(--primary-bg)', padding:'4px 10px', borderRadius:6, border:'1px solid var(--primary-border)' }}>{order.orderNumber}</span>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <p style={{ fontSize:14, color:'var(--text)', fontWeight:700 }}>{order.customerName}</p>
                      <p style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>{order.customerEmail}</p>
                    </td>
                    <td style={{ padding:'14px 20px', color:'var(--text-2)', fontSize:13 }}>{formatDate(order.createdAt)}</td>
                    <td style={{ padding:'14px 20px', fontWeight:800, color:'var(--text)', fontSize:16 }}>{formatEuro(order.totalAmount || 0)}</td>
                    <td style={{ padding:'14px 20px' }}>
                      <span className={`badge badge-${order.status}`}><span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} /> {STATUS_LABELS[order.status] || order.status}</span>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <Link to={`/admin/orders/${order.id}`} className="btn-primary" style={{ fontSize:12, padding:'10px 18px' }}>Gérer →</Link>
                        <button onClick={e => handleDelete(e, order.id)} style={{ background:'none', border:'1px solid rgba(239,68,68,0.3)', borderRadius:6, color:'#DC2626', fontSize:13, fontWeight:700, padding:'10px 12px', cursor:'pointer', fontFamily:"'Inter',sans-serif", transition:'background 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                          onMouseOut={e => e.currentTarget.style.background = 'none'}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} style={{ padding:'48px', textAlign:'center', color:'var(--text-3)' }}>Aucune commande trouvée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
