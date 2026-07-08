import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { useBreakpoint } from '../../hooks';
import { formatEuro, formatDate, timeAgo, STATUS_LABELS } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { addToast } = useToastStore();
  const { isMobile } = useBreakpoint();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [replyMsg, setReplyMsg] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const load = () => {
    adminAPI.orderById(id)
      .then(r => { setOrder(r.data.order); setNewStatus(r.data.order.status); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminAPI.updateOrder(id, { status: newStatus, comment });
      addToast(data.message || 'Mise à jour effectuée', 'success');
      setComment('');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await adminAPI.deleteOrder(id);
      addToast('Commande supprimée', 'success');
      window.location.href = '/admin/orders';
    } catch (err) {
      addToast(err.response?.data?.error || 'Suppression impossible', 'error');
    }
    setShowDeleteModal(false);
  };

  const handleReply = async () => {
    if (!replyMsg.trim()) return;
    setSendingReply(true);
    try {
      await adminAPI.replyToCustomer(id, { message: replyMsg.trim() });
      addToast('Message envoyé au client', 'success');
      setReplyMsg('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur d\'envoi', 'error');
    } finally { setSendingReply(false); }
  };

  if (loading) return <div style={{ padding:40 }}><Loader /></div>;
  if (!order)  return <div style={{ padding:40, color:'var(--text-3)', fontSize:16 }}>Commande introuvable.</div>;

  const InfoRow = ({ label, value }) => (
    <div><p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>{label}</p><p style={{ fontSize:15, color:'var(--text)', fontWeight:500 }}>{value || '—'}</p></div>
  );

  const cardStyle = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)' };

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32, flexWrap:'wrap' }}>
        <div>
          <div className="section-eyebrow">Commande</div>
          <h1 style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:'clamp(26px,3.5vw,40px)', color:'var(--primary)', letterSpacing:'-0.02em' }}>
            {order.orderNumber}
          </h1>
        </div>
        <span className={'badge badge-' + order.status}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="admin-order-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={cardStyle}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Informations client</p>
            <div className={isMobile ? 'admin-grid-2' : ''} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <InfoRow label="Nom" value={order.customerName} />
              <InfoRow label="Email" value={order.customerEmail} />
              <InfoRow label="Téléphone" value={order.customerPhone} />
              <InfoRow label="Adresse" value={order.customerAddress} />
              <InfoRow label="Date de commande" value={formatDate(order.createdAt)} />
            </div>
            {order.notes && (
              <div style={{ marginTop:16, padding:'12px 16px', background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:8 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--primary)', marginBottom:6 }}>Notes</p>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>{order.notes}</p>
              </div>
            )}
          </div>

          {order.items?.length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Articles commandés</p>
              {order.items.map((item, idx) => (
                <div key={item.id || idx} style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap', padding: idx > 0 ? '12px 0 0 0' : 0, borderTop: idx > 0 ? '1px solid var(--border)' : 'none', marginTop: idx > 0 ? 12 : 0 }}>
                  {item.product?.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width:80, height:60, objectFit:'cover', borderRadius:8, flexShrink:0, border:'1px solid var(--border)' }} />
                  ) : (
                    <div style={{ width:80, height:60, borderRadius:8, background:'var(--bg-card2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>❄</div>
                  )}
                  <div style={{ flex:1, minWidth:160 }}>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize:15 }}>{item.product?.name}</p>
                    <p style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>{item.product?.brand} — {item.product?.model}</p>
                    {item.quantity > 1 && <p style={{ fontSize:12, color:'var(--text-2)', marginTop:2 }}>Qty: {item.quantity}</p>}
                  </div>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:17, color:'var(--primary)', flexShrink:0 }}>{formatEuro(item.price)}</p>
                </div>
              ))}
              <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)', textAlign:'right' }}>
                <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:4 }}>Total</p>
                <p style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:24, color:'var(--primary)' }}>{formatEuro(order.totalAmount)}</p>
              </div>
            </div>
          )}

          {order.tracking?.length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:20 }}>Historique</p>
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {order.tracking.map(event => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-dot"><div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)' }} /></div>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                      <div>
                        <span className={'badge badge-' + event.status}>{STATUS_LABELS[event.status] || event.status}</span>
                        {event.comment && <p style={{ fontSize:13, color:'var(--text-2)', marginTop:8, lineHeight:1.6 }}>{event.comment}</p>}
                      </div>
                      <p style={{ fontSize:12, color:'var(--text-3)', flexShrink:0 }}>{timeAgo(event.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <form onSubmit={handleUpdate} style={{ ...cardStyle, position:'sticky', top:24 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:20 }}>Mettre à jour le statut</p>

            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:18 }}>
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <label key={val} style={{
                  display:'flex', alignItems:'center', gap:12, padding:'10px 12px',
                  borderRadius:8, cursor:'pointer',
                  border:'1px solid ' + (newStatus===val ? 'var(--primary)' : 'var(--border)'),
                  background: newStatus===val ? 'var(--primary-bg)' : 'var(--bg-card2)',
                  transition:'all 0.2s',
                }}>
                  <input type="radio" name="status" value={val} checked={newStatus===val} onChange={() => setNewStatus(val)} style={{ accentColor:'#2E86C1', width:16, height:16 }} />
                  <span style={{ fontSize:14, color:'var(--text)', fontWeight: newStatus===val ? 700 : 500 }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
                Message au client
              </label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                placeholder="Ex : Votre commande est en préparation..." className="input-luxury" style={{ resize:'none', fontSize:14 }} />
            </div>

            <button type="submit" disabled={saving} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:14 }}>
              {saving ? '⏳...' : '✉ Mettre à jour'}
            </button>
          </form>

          <div style={cardStyle}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Répondre au client</p>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <a href={`mailto:${order.customerEmail}?subject=${encodeURIComponent('AIRCONFORTHABITAT — Suivi commande ' + order.orderNumber)}`}
                style={{ flex:1, textAlign:'center', padding:'12px 14px', fontSize:13, fontWeight:700, color:'#fff', background:'var(--primary)', borderRadius:8, textDecoration:'none', fontFamily:"'Inter',sans-serif" }}>
                📧 Email
              </a>
              <a href={`tel:${order.customerPhone}`}
                style={{ flex:1, textAlign:'center', padding:'12px 14px', fontSize:13, fontWeight:700, color:'var(--text)', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:8, textDecoration:'none', fontFamily:"'Inter',sans-serif" }}>
                📞 Appeler
              </a>
            </div>
            <textarea value={replyMsg} onChange={e => setReplyMsg(e.target.value)} rows={4}
              placeholder="Écrivez un message au client..." className="input-luxury" style={{ resize:'none', fontSize:14, marginBottom:14 }} />
            <button onClick={handleReply} disabled={sendingReply || !replyMsg.trim()} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:14 }}>
              {sendingReply ? '⏳...' : '✉ Envoyer le message'}
            </button>
          </div>

          <div style={{ marginTop:20, padding:20, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'#DC2626', marginBottom:12 }}>Zone dangereuse</p>
            <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:14, lineHeight:1.5 }}>
              Supprimer définitivement cette commande. Cette action est irréversible.
            </p>
            <button onClick={() => setShowDeleteModal(true)} className="btn-ghost" style={{ color:'#DC2626', borderColor:'rgba(239,68,68,0.3)', fontSize:13 }}>
              🗑 Supprimer la commande
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:32, maxWidth:400, width:'90%', boxShadow:'var(--shadow-lg)' }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'#DC2626', marginBottom:12 }}>Confirmation</p>
            <p style={{ fontSize:15, color:'var(--text)', lineHeight:1.6, marginBottom:20 }}>
              Êtes-vous sûr de vouloir supprimer définitivement la commande <strong>{order.orderNumber}</strong> ? Cette action est irréversible.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button type="button" onClick={() => setShowDeleteModal(false)} className="btn-ghost" style={{ fontSize:14, padding:'12px 20px' }}>
                Annuler
              </button>
              <button type="button" onClick={handleDelete} className="btn-primary" style={{ fontSize:14, padding:'12px 20px', background:'#DC2626', borderColor:'#DC2626' }}>
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
