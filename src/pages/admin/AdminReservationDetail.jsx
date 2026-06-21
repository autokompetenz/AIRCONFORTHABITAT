import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatEuro, formatDate, timeAgo } from '../../utils/helpers';
import { Loader } from '../../components/UI';

const STATUS_LABELS = { pending:'En attente', deposit_confirmed:'Acompte confirmé', preparing:'En préparation', ready:'Prêt(e)', delivered:'Remis(e)', cancelled:'Annulée' };

export default function AdminReservationDetail() {
  const { id } = useParams();
  const { addToast } = useToastStore();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    adminAPI.reservationById(id)
      .then(r => { setReservation(r.data.reservation); setNewStatus(r.data.reservation.status); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminAPI.updateReservation(id, { status: newStatus, comment });
      addToast(data.message || 'Mise à jour effectuée', 'success');
      setComment('');
      load();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette réservation ? Cette action est irréversible.')) return;
    try {
      await adminAPI.deleteReservation(id);
      addToast('Réservation supprimée', 'success');
      window.location.href = '/admin/reservations';
    } catch (err) {
      addToast(err.response?.data?.error || 'Suppression impossible', 'error');
    }
  };

  if (loading) return <div style={{ padding:40 }}><Loader /></div>;
  if (!reservation)  return <div style={{ padding:40, color:'var(--text-3)', fontSize:16 }}>Réservation introuvable.</div>;

  const InfoRow = ({ label, value }) => (
    <div><p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:4 }}>{label}</p><p style={{ fontSize:15, color:'var(--text)', fontWeight:500 }}>{value || '—'}</p></div>
  );

  const cardStyle = { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:24, boxShadow:'var(--shadow-sm)' };

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32, flexWrap:'wrap' }}>
        <div>
          <div className="section-eyebrow">Réservation</div>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(26px,3.5vw,40px)', color:'var(--primary)', letterSpacing:'-0.02em' }}>
            {reservation.reservationNumber}
          </h1>
        </div>
        <span className={'badge badge-' + reservation.status}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'currentColor', display:'inline-block' }} />
          {STATUS_LABELS[reservation.status] || reservation.status}
        </span>
      </div>

      <div className="admin-order-grid">
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={cardStyle}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Informations client</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <InfoRow label="Nom" value={reservation.guestName} />
              <InfoRow label="Email" value={reservation.guestEmail} />
              <InfoRow label="Téléphone" value={reservation.guestPhone} />
              <InfoRow label="Réservé le" value={formatDate(reservation.createdAt)} />
              <InfoRow label="Paiement" value={reservation.paymentLabel || (reservation.paymentMethod === 'full' ? 'Intégral' : 'Acompte 50%')} />
              <InfoRow label="A un animal ?" value={reservation.hasPet === true ? 'Oui' : reservation.hasPet === false ? 'Non' : '—'} />
              <InfoRow label="Déjà perdu un animal ?" value={reservation.hasLostPet === true ? 'Oui' : reservation.hasLostPet === false ? 'Non' : '—'} />
            </div>
            {reservation.notes && (
              <div style={{ marginTop:16, padding:'12px 16px', background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:8 }}>
                <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--primary)', marginBottom:6 }}>Notes</p>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.6 }}>{reservation.notes}</p>
              </div>
            )}
          </div>

          {reservation.puppy && (
            <div style={cardStyle}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:18 }}>Chiot réservé</p>
              <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                <img src={reservation.puppy.imageUrl || ''} alt={reservation.puppy.name}
                  style={{ width:96, height:68, objectFit:'cover', borderRadius:8, flexShrink:0, border:'1px solid var(--border)' }} />
                <div style={{ flex:1, minWidth:160 }}>
                  <p style={{ fontWeight:700, color:'var(--text)', fontSize:16 }}>{reservation.puppy.name}</p>
                  <p style={{ fontSize:13, color:'var(--text-3)', marginTop:3 }}>{reservation.puppy.breed}</p>
                </div>
                <p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:20, color:'var(--primary)', flexShrink:0 }}>{formatEuro(reservation.puppy.price)}</p>
              </div>
              <div style={{ display:'flex', gap:24, marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
                {reservation.discountAmount > 0 && <div><p style={{ fontSize:11, color:'var(--text-3)' }}>{'Réduction'}</p><p style={{ fontWeight:700, color:'#22C55E', fontSize:16 }}>-{formatEuro(reservation.discountAmount)}</p></div>}
                <div><p style={{ fontSize:11, color:'var(--text-3)' }}>{'Acompte'}</p><p style={{ fontWeight:700, color:'var(--text)', fontSize:16 }}>{formatEuro(reservation.depositAmount || 0)}</p></div>
                {reservation.balanceAmount > 0 && <div><p style={{ fontSize:11, color:'var(--text-3)' }}>{'Solde'}</p><p style={{ fontWeight:700, color:'var(--text)', fontSize:16 }}>{formatEuro(reservation.balanceAmount)}</p></div>}
                <div><p style={{ fontSize:11, color:'var(--text-3)' }}>{'Total'}</p><p style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:22, color:'var(--primary)' }}>{formatEuro(reservation.totalPrice || reservation.puppy?.price)}</p></div>
              </div>
            </div>
          )}

          {reservation.tracking?.length > 0 && (
            <div style={cardStyle}>
              <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--primary)', marginBottom:20 }}>Historique</p>
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {reservation.tracking.map(event => (
                  <div key={event.id} className="timeline-item">
                    <div className="timeline-dot"><div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)' }} /></div>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                      <div>
                        <span className={'badge badge-' + event.status}>{event.status}</span>
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
                  <input type="radio" name="status" value={val} checked={newStatus===val} onChange={() => setNewStatus(val)} style={{ accentColor:'#C9762E', width:16, height:16 }} />
                  <span style={{ fontSize:14, color:'var(--text)', fontWeight: newStatus===val ? 700 : 500 }}>{label}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:8 }}>
                Message au client
              </label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                placeholder="Ex : Votre chiot est prêt..." className="input-luxury" style={{ resize:'none', fontSize:14 }} />
            </div>

            <button type="submit" disabled={saving} className="btn-primary" style={{ width:'100%', justifyContent:'center', padding:14, fontSize:14 }}>
              {saving ? '⏳...' : '✉ Mettre à jour'}
            </button>
          </form>

          <div style={{ marginTop:20, padding:20, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:12 }}>
            <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', color:'#DC2626', marginBottom:12 }}>Zone dangereuse</p>
            <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:14, lineHeight:1.5 }}>
              Supprimer définitivement cette réservation. Cette action est irréversible.
            </p>
            <button onClick={handleDelete} className="btn-ghost" style={{ color:'#DC2626', borderColor:'rgba(239,68,68,0.3)', fontSize:13 }}>
              🗑 Supprimer la réservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
