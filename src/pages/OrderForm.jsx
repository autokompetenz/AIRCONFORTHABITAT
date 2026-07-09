import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore, useToastStore, useLangStore } from '../store';
import { formatEuro } from '../utils/helpers';
import { t } from '../utils/i18n';
import { orderAPI } from '../services/api';
import { useBreakpoint } from '../hooks';
import { ShoppingCart, ChevronLeft } from 'lucide-react';

export default function OrderForm() {
  const { items, clearCart } = useCartStore();
  const { addToast } = useToastStore();
  const { lang } = useLangStore();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const l = lang || 'fr';
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const [ordering, setOrdering] = useState(false);
  const [smsOk, setSmsOk] = useState(false);

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', padding: isMobile ? '40px 4%' : '60px 5%', textAlign: 'center' }}>
        <ShoppingCart size={48} color="#ccc" strokeWidth={1.5} style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
          {l === 'fr' ? 'Votre panier est vide' : l === 'nl' ? 'Uw winkelwagen is leeg' : 'Your cart is empty'}
        </h2>
        <p style={{ fontSize: 14, color: '#999', marginBottom: 24 }}>
          {l === 'fr' ? 'Ajoutez des produits avant de commander.' : l === 'nl' ? 'Voeg producten toe voordat u bestelt.' : 'Add products before ordering.'}
        </p>
        <button onClick={() => navigate('/catalog')} className="btn-primary" style={{ padding: '12px 32px', fontSize: 13 }}>
          {t('nav_products', l)} →
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setOrdering(true);
    try {
      const lastName = fd.get('nom') || '';
      const firstName = fd.get('prenom') || '';
      const res = await orderAPI.create({
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        customerName: `${firstName} ${lastName}`.trim(),
        customerEmail: fd.get('email'),
        customerPhone: fd.get('telephone'),
        customerAddress: [
          fd.get('numero_voie'),
          fd.get('lieu_dit'),
          fd.get('complement'),
          fd.get('code_postal'),
          fd.get('ville'),
          fd.get('pays'),
        ].filter(Boolean).join(', '),
        notes: JSON.stringify({
          nom: lastName,
          prenom: firstName,
          dateNaissance: fd.get('date_naissance'),
          societe: fd.get('societe'),
          pays: fd.get('pays'),
          codePostal: fd.get('code_postal'),
          ville: fd.get('ville'),
          numeroVoie: fd.get('numero_voie'),
          lieuDit: fd.get('lieu_dit'),
          complement: fd.get('complement'),
          smsOffres: smsOk,
        }),
      });
      clearCart();
      addToast(t('order_confirm', l), 'success');
      navigate(`/track/${res.data.orderNumber}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erreur lors de la commande', 'error');
    } finally { setOrdering(false); }
  };

  const inputStyle = {
    width: '100%', border: '1px solid var(--border)', padding: '10px 14px',
    fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none',
    background: '#fff', color: '#1A1A1A',
  };

  const labelStyle = {
    fontSize: 12, fontWeight: 700, color: '#666', marginBottom: 4, display: 'block',
    letterSpacing: '0.02em',
  };

  const sectionTitle = {
    fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14,
    letterSpacing: '0.1em', textTransform: 'uppercase',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', background: '#fff' }}
    >
      <div style={{ background: '#F5F5F5', borderBottom: '1px solid var(--border)', padding: isMobile ? '20px 4% 16px' : '28px 5% 20px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6, color: '#999', fontSize: 12, padding: 0,
            fontFamily: 'Inter, sans-serif', marginBottom: 8,
          }}>
            <ChevronLeft size={16} strokeWidth={1.5} />
            {l === 'fr' ? 'Retour' : l === 'nl' ? 'Terug' : 'Back'}
          </button>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(22px,4vw,32px)', color: '#1A1A1A', marginBottom: 4 }}>
            {l === 'fr' ? 'Commander' : l === 'nl' ? 'Bestellen' : 'Order'}
          </h1>
          <p style={{ fontSize: 13, color: '#999' }}>
            {items.reduce((s, i) => s + i.quantity, 0)} {l === 'fr' ? 'article(s)' : l === 'nl' ? 'artikel(en)' : 'item(s)'} · {formatEuro(total)}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '24px 4% 80px' : '40px 5%' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <p style={sectionTitle}>{l === 'fr' ? 'Identité' : l === 'nl' ? 'Identiteit' : 'Identity'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Nom *' : l === 'nl' ? 'Achternaam *' : 'Last name *'}</label>
                <input name="nom" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Prénom *' : l === 'nl' ? 'Voornaam *' : 'First name *'}</label>
                <input name="prenom" required style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Date de naissance *' : l === 'nl' ? 'Geboortedatum *' : 'Date of birth *'}</label>
                <input name="date_naissance" type="date" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Téléphone *' : l === 'nl' ? 'Telefoon *' : 'Phone *'}</label>
                <input name="telephone" type="tel" required style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{l === 'fr' ? 'Email *' : l === 'nl' ? 'E-mail *' : 'Email *'}</label>
              <input name="email" type="email" required style={inputStyle} />
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <p style={sectionTitle}>{l === 'fr' ? 'Adresse de livraison' : l === 'nl' ? 'Bezorgadres' : 'Delivery address'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Pays *' : l === 'nl' ? 'Land *' : 'Country *'}</label>
                <select name="pays" required style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', background: '#fff' }}>
                  <option value="">—</option>
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Suisse">Suisse</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Code postal *' : l === 'nl' ? 'Postcode *' : 'Postal code *'}</label>
                <input name="code_postal" required style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{l === 'fr' ? 'Ville *' : l === 'nl' ? 'Stad *' : 'City *'}</label>
              <input name="ville" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{l === 'fr' ? 'N° + voie *' : l === 'nl' ? 'Nr + straat *' : 'Street number + name *'}</label>
              <input name="numero_voie" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Lieu-dit' : l === 'nl' ? 'Plaatsnaam' : 'Place name'}</label>
                <input name="lieu_dit" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{l === 'fr' ? 'Complément adresse' : l === 'nl' ? 'Adresaanvulling' : 'Address complement'}</label>
                <input name="complement" style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 16 }}>
            <p style={sectionTitle}>{l === 'fr' ? 'Société (optionnel)' : l === 'nl' ? 'Bedrijf (optioneel)' : 'Company (optional)'}</p>
            <div>
              <label style={labelStyle}>{l === 'fr' ? 'Nom de société' : l === 'nl' ? 'Bedrijfsnaam' : 'Company name'}</label>
              <input name="societe" style={inputStyle} />
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={smsOk} onChange={e => setSmsOk(e.target.checked)}
                style={{ marginTop: 2, width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }} />
              <span style={{ fontSize: 13, color: '#666', lineHeight: 1.4, fontWeight: 500 }}>
                {l === 'fr' ? 'Je souhaite recevoir par sms les offres commerciales de AIRCONFORTHABITAT (sur produit et service)' :
                  l === 'nl' ? 'Ik wil via sms commerciële aanbiedingen ontvangen van AIRCONFORTHABITAT (over producten en diensten)' :
                  'I wish to receive by sms commercial offers from AIRCONFORTHABITAT (on products and services)'}
              </span>
            </label>
          </div>

          <div style={{ border: '1px solid var(--border)', padding: isMobile ? 16 : 24, marginBottom: 24, background: '#F5F5F5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{l === 'fr' ? 'Récapitulatif' : l === 'nl' ? 'Samenvatting' : 'Summary'}</span>
              <span style={{ fontWeight: 900, fontSize: 22, color: 'var(--primary)', letterSpacing: '-0.02em' }}>{formatEuro(total)}</span>
            </div>
            {items.map((item, i) => (
              <div key={item.id || i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', padding: '4px 0' }}>
                <span>{item.quantity}x {item.name}</span>
                <span style={{ fontWeight: 600 }}>{formatEuro(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <button type="submit" disabled={ordering} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, gap: 10 }}>
            {ordering ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                {l === 'fr' ? 'Traitement...' : l === 'nl' ? 'Verwerken...' : 'Processing...'}
              </span>
            ) : (
              <><ShoppingCart size={18} strokeWidth={2} /> {l === 'fr' ? 'Confirmer la commande' : l === 'nl' ? 'Bevestig bestelling' : 'Confirm order'}</>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}