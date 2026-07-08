import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { formatEuro, formatDate, getInitials } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.customers().then(r => { const list = r.data.customers || []; setCustomers(list); setFiltered(list); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(customers); return; }
    setFiltered(customers.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    ));
  }, [search, customers]);

  if (loading) return <div style={{ padding: 40 }}><Loader text="Chargement des clients..." /></div>;

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:32 }}>
        <div className="section-eyebrow">CRM</div>
        <h1 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
          Clients <span style={{ color:'var(--text-3)', fontSize:'0.55em', fontWeight:600 }}>({customers.length})</span>
        </h1>
      </div>

      <div style={{ marginBottom:24 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email, téléphone..."
          className="input-luxury" style={{ width: '100%', maxWidth: 400, fontSize: 14, padding: '12px 18px', borderRadius: 10 }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 24px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12 }}>
          <p style={{ fontSize:48, marginBottom:16 }}>👥</p>
          <p style={{ fontWeight:700, color:'var(--text)', marginBottom:8 }}>{search ? 'Aucun résultat' : 'Aucun client'}</p>
          <p style={{ color:'var(--text-3)' }}>{search ? 'Essayez d\'autres termes de recherche.' : 'Les clients apparaîtront après la première commande.'}</p>
        </div>
      ) : (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Client','Contact','Commandes','Total dépensé','Inscrit le'].map(h => (
                    <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', padding:'14px 20px', background:'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(customer => (
                  <tr key={customer.id} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding:'14px 20px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#2E86C1,#00B4D8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>
                          {getInitials(customer.name)}
                        </div>
                        <p style={{ fontWeight:800, color:'var(--text)', fontSize:15 }}>{customer.name}</p>
                      </div>
                    </td>
                    <td style={{ padding:'14px 20px' }}>
                      <p style={{ fontWeight:600, color:'var(--text)' }}>{customer.email}</p>
                      {customer.phone && <p style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>{customer.phone}</p>}
                    </td>
                    <td style={{ padding:'14px 20px', color:'var(--text-2)', fontWeight:700, fontSize:16 }}>{customer._count?.orders || 0}</td>
                    <td style={{ padding:'14px 20px', fontWeight:800, color:'var(--primary)', fontSize:16 }}>{formatEuro(customer.totalSpent || 0)}</td>
                    <td style={{ padding:'14px 20px', color:'var(--text-3)', fontSize:13 }}>{customer.createdAt ? formatDate(customer.createdAt) : '—'}</td>
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
