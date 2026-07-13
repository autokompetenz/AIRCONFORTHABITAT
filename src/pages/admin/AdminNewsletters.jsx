import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatDate } from '../../utils/helpers';
import { Loader } from '../../components/UI';

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:28, marginBottom:22, boxShadow:'var(--shadow-sm)' }}>
      <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:'var(--primary)', marginBottom:20 }}>{title}</p>
      {children}
    </div>
  );
}

function formatEuro(amount) {
  if (!amount && amount !== 0) return '—';
  return '€' + new Intl.NumberFormat('en-US').format(Math.round(amount));
}

export default function AdminNewsletters() {
  const [tab, setTab] = useState('compose');
  const [newsletters, setNewsletters] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { addToast } = useToastStore();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [product, setProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [detailNewsletter, setDetailNewsletter] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [nlRes, custRes] = await Promise.all([
        adminAPI.newsletters(),
        adminAPI.customers(),
      ]);
      setNewsletters(nlRes.data.newsletters || []);
      setCustomers(custRes.data.customers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomProduct = async () => {
    try {
      const { data } = await adminAPI.randomProduct();
      setProduct(data.product);
      if (!data.product) addToast('Aucun produit disponible', 'info');
    } catch {
      addToast('Erreur lors de la sélection du produit', 'error');
    }
  };

  const toggleCustomer = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredCustomers = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q);
  });

  const handleSend = async () => {
    if (!title.trim() || !subject.trim() || !body.trim()) {
      addToast('Titre, sujet et message requis', 'error');
      return;
    }
    if (!sendToAll && selectedIds.length === 0) {
      addToast('Sélectionnez au moins un destinataire', 'error');
      return;
    }
    setSending(true);
    try {
      const { data } = await adminAPI.sendNewsletter({
        title: title.trim(),
        subject: subject.trim(),
        body: body.trim(),
        sendToAll,
        recipientIds: sendToAll ? undefined : selectedIds,
        product: product || undefined,
      });
      addToast(`Newsletter envoyée à ${data.sentCount} client(s)`, 'success');
      setTitle('');
      setSubject('');
      setBody('');
      setProduct(null);
      setSelectedIds([]);
      setSendToAll(true);
      load();
      setTab('history');
    } catch (e) {
      addToast(e.response?.data?.error || 'Erreur lors de l\'envoi', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette newsletter ?')) return;
    try {
      await adminAPI.deleteNewsletter(id);
      setNewsletters(prev => prev.filter(n => n.id !== id));
      addToast('Newsletter supprimée', 'success');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const loadDetail = async (id) => {
    try {
      const { data } = await adminAPI.newsletterById(id);
      setDetailNewsletter(data.newsletter);
    } catch {
      addToast('Erreur lors du chargement', 'error');
    }
  };

  if (loading) return <div style={{ padding:40 }}><Loader text="Chargement des newsletters..." /></div>;

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:36 }}>
        <div className="section-eyebrow">Communication</div>
        <h1 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
          Newsletters
        </h1>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:4, width:'fit-content' }}>
        {[['compose','Nouvelle newsletter'],['history','Historique']].map(([id,label]) => (
          <button key={id} type="button" onClick={() => { setTab(id); setDetailNewsletter(null); }}
            style={{
              padding:'12px 24px', borderRadius:8, fontSize:14, fontWeight:700,
              fontFamily:"'Inter',sans-serif", cursor:'pointer', border:'none',
              background: tab === id ? 'var(--primary)' : 'transparent',
              color: tab === id ? '#fff' : 'var(--text-2)',
              transition:'all 0.2s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'compose' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:22, maxWidth:860 }}>
          <Section title="Contenu">
            <div style={{ display:'grid', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:10 }}>Titre de la newsletter</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Promotion été 2026"
                  className="input-luxury" style={{ width:'100%', fontSize:15, borderRadius:10, padding:'14px 18px' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:10 }}>Sujet de l'email</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Ex: Découvrez nos climatiseurs au meilleur prix"
                  className="input-luxury" style={{ width:'100%', fontSize:15, borderRadius:10, padding:'14px 18px' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:10 }}>Message</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={8}
                  placeholder="Bonjour, nous avons le plaisir de vous informer que..."
                  className="input-luxury" style={{ width:'100%', fontSize:15, borderRadius:10, padding:'14px 18px', resize:'none', lineHeight:1.6 }} />
              </div>
            </div>
          </Section>

          <Section title="Produit recommandé">
            <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:16, lineHeight:1.5 }}>
              Ajoutez un produit au hasard parmi notre catalogue pour le proposer à vos clients dans l'email.
            </p>
            {product ? (
              <div style={{ display:'flex', gap:16, alignItems:'center', padding:16, background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:10 }}>
                {product.image && <img src={product.image} alt="" style={{ width:80, height:60, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }} />}
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800, color:'var(--text)', fontSize:15 }}>{product.name}</p>
                  <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{product.brand} · {product.model}</p>
                  <p style={{ fontWeight:800, color:'var(--primary)', fontSize:17, marginTop:4 }}>
                    {product.salePrice ? <>{formatEuro(product.salePrice)} <span style={{ fontSize:12, color:'var(--text-3)', textDecoration:'line-through' }}>{formatEuro(product.price)}</span></> : formatEuro(product.price)}
                  </p>
                </div>
                <button type="button" onClick={() => setProduct(null)}
                  style={{ background:'rgba(239,68,68,0.08)', color:'#EF4444', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 16px', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
                  Retirer
                </button>
              </div>
            ) : (
              <button type="button" onClick={handleRandomProduct}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 20px', background:'var(--primary-bg)', border:'2px dashed var(--border)', borderRadius:12, cursor:'pointer', fontSize:14, color:'var(--text-2)', fontWeight:600, fontFamily:"'Inter',sans-serif", transition:'all 0.25s' }}>
                <span style={{ fontSize:22 }}>🎲</span> Ajouter un produit au hasard
              </button>
            )}
          </Section>

          <Section title={`Destinataires ${sendToAll ? `(${customers.length} clients)` : `(${selectedIds.length} sélectionnés)`}`}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', padding:'12px 16px', borderRadius:10, background:'var(--bg-card2)', border:'1px solid var(--border)' }}>
                <input type="checkbox" checked={sendToAll} onChange={e => { setSendToAll(e.target.checked); setSelectedIds([]); }}
                  style={{ accentColor:'#2E86C1', width:20, height:20 }} />
                <span style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>Envoyer à tous les clients ayant déjà commandé</span>
              </label>
            </div>
            {!sendToAll && (
              <>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un client..."
                  className="input-luxury" style={{ width:'100%', maxWidth:400, fontSize:14, padding:'12px 18px', borderRadius:10, marginBottom:16 }} />
                <div style={{ maxHeight:320, overflowY:'auto', border:'1px solid var(--border)', borderRadius:10 }}>
                  {filteredCustomers.map(c => (
                    <label key={c.id}
                      style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid var(--border)', cursor:'pointer', background: selectedIds.includes(c.id) ? 'var(--primary-bg)' : 'transparent', transition:'background 0.15s' }}
                      onMouseOver={e => { if (!selectedIds.includes(c.id)) e.currentTarget.style.background = 'var(--bg-card2)'; }}
                      onMouseOut={e => { if (!selectedIds.includes(c.id)) e.currentTarget.style.background = 'transparent'; }}>
                      <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleCustomer(c.id)}
                        style={{ accentColor:'#2E86C1', width:18, height:18, flexShrink:0 }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{c.name}</p>
                        <p style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>{c.email} · {c._count?.orders || 0} commande(s)</p>
                      </div>
                    </label>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <p style={{ padding:20, textAlign:'center', color:'var(--text-3)', fontSize:13 }}>Aucun client trouvé</p>
                  )}
                </div>
              </>
            )}
          </Section>

          <div style={{ display:'flex', gap:16 }}>
            <button type="button" onClick={handleSend} disabled={sending}
              className="btn-primary" style={{ fontSize:15, padding:'18px 36px', borderRadius:10 }}>
              {sending ? 'Envoi en cours...' : `Envoyer à ${sendToAll ? customers.length : selectedIds.length} client(s)`}
            </button>
          </div>
        </div>
      )}

      {tab === 'history' && !detailNewsletter && (
        newsletters.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12 }}>
            <p style={{ fontSize:48, marginBottom:16 }}>📰</p>
            <p style={{ fontWeight:700, color:'var(--text)', marginBottom:8 }}>Aucune newsletter envoyée</p>
            <p style={{ color:'var(--text-3)', marginBottom:24 }}>Créez votre première newsletter pour contacter vos clients.</p>
          </div>
        ) : (
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['Titre','Sujet','Destinataires','Produit','Date','Actions'].map(h => (
                      <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', padding:'14px 20px', background:'var(--bg-card2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {newsletters.map(nl => (
                    <tr key={nl.id} style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding:'14px 20px', fontWeight:800, color:'var(--text)', fontSize:15 }}>{nl.title}</td>
                      <td style={{ padding:'14px 20px', color:'var(--text-2)', fontSize:13, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{nl.subject}</td>
                      <td style={{ padding:'14px 20px' }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{nl.recipientCount}</span>
                        <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:4 }}>client(s)</span>
                      </td>
                      <td style={{ padding:'14px 20px' }}>
                        {nl.productName ? (
                          <span style={{ fontSize:12, fontWeight:700, color:'var(--primary)', background:'var(--primary-bg)', padding:'4px 10px', borderRadius:6, border:'1px solid var(--primary-border)' }}>
                            {nl.productName}
                          </span>
                        ) : (
                          <span style={{ fontSize:12, color:'var(--text-3)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding:'14px 20px', color:'var(--text-2)', fontSize:13 }}>{formatDate(nl.sentAt || nl.createdAt)}</td>
                      <td style={{ padding:'14px 20px' }}>
                        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                          <button type="button" onClick={() => loadDetail(nl.id)}
                            style={{ fontSize:13, color:'var(--primary)', background:'none', border:'none', cursor:'pointer', fontWeight:800, fontFamily:"'Inter',sans-serif" }}>
                            Détails
                          </button>
                          <button type="button" onClick={() => handleDelete(nl.id)}
                            style={{ fontSize:13, color:'#991B1B', background:'none', border:'none', cursor:'pointer', fontWeight:800, fontFamily:"'Inter',sans-serif" }}>
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
        )
      )}

      {tab === 'history' && detailNewsletter && (
        <div>
          <button type="button" onClick={() => setDetailNewsletter(null)}
            style={{ fontSize:14, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', fontWeight:600, marginBottom:20, fontFamily:"'Inter',sans-serif" }}>
            ← Retour à l'historique
          </button>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22, marginBottom:22 }}>
            <Section title="Informations">
              <div style={{ display:'grid', gap:12 }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>Titre</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{detailNewsletter.title}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>Sujet</div>
                  <div style={{ fontSize:14, color:'var(--text)' }}>{detailNewsletter.subject}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>Envoyée le</div>
                  <div style={{ fontSize:14, color:'var(--text)' }}>{formatDate(detailNewsletter.sentAt || detailNewsletter.createdAt)}</div>
                </div>
                {detailNewsletter.productName && (
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>Produit recommandé</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--primary)' }}>{detailNewsletter.productName} — {detailNewsletter.productBrand}</div>
                  </div>
                )}
              </div>
            </Section>
            <Section title="Message">
              <div style={{ fontSize:14, color:'var(--text)', lineHeight:1.7, whiteSpace:'pre-wrap', background:'var(--bg-card2)', padding:16, borderRadius:8, border:'1px solid var(--border)' }}>
                {detailNewsletter.body}
              </div>
            </Section>
          </div>
          <Section title={`Destinataires (${detailNewsletter.recipients?.length || 0})`}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['Nom','Email','Statut','Envoyé le'].map(h => (
                      <th key={h} style={{ textAlign:'left', fontSize:11, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', padding:'10px 16px', background:'var(--bg-card2)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(detailNewsletter.recipients || []).map(r => (
                    <tr key={r.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'10px 16px', fontWeight:700, color:'var(--text)' }}>{r.customerName}</td>
                      <td style={{ padding:'10px 16px', color:'var(--text-2)' }}>{r.email}</td>
                      <td style={{ padding:'10px 16px' }}>
                        <span style={{ fontSize:11, fontWeight:800, padding:'4px 10px', borderRadius:12, background: r.status === 'sent' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: r.status === 'sent' ? '#22C55E' : '#EF4444', border: `1px solid ${r.status === 'sent' ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.25)'}` }}>
                          {r.status === 'sent' ? 'Envoyé' : 'Échoué'}
                        </span>
                      </td>
                      <td style={{ padding:'10px 16px', color:'var(--text-3)' }}>{formatDate(r.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
