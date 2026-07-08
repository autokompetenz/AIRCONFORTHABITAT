import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { formatEuro, getProductTypeLabel, PRODUCT_STATUS_LABELS } from '../../utils/helpers';
import { Loader } from '../../components/UI';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { addToast } = useToastStore();
  const location = useLocation();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setLoadError(false);
    adminAPI.products()
      .then(r => { const list = Array.isArray(r.data?.products) ? r.data.products : []; setProducts(list); setFiltered(list); setLoading(false); })
      .catch(() => { setProducts([]); setFiltered([]); setLoadError(true); setLoading(false); });
  };

  useEffect(load, []);

  useEffect(() => {
    if (location.state?.successMessage) {
      addToast(location.state.successMessage, 'success');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) { setFiltered(products); return; }
    setFiltered(products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q) ||
      p.model?.toLowerCase().includes(q)
    ));
  }, [search, products]);

  const handleToggle = async (product) => {
    try {
      const { data } = await adminAPI.toggleProduct(product.id);
      setProducts(prev => prev.map(p => p.id === product.id ? data.product : p));
      addToast(data.message || 'Statut mis à jour', 'success');
    } catch { addToast('Erreur', 'error'); }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Supprimer définitivement ${product.name} ? Cette action est irréversible.`)) return;
    try {
      await adminAPI.deleteProduct(product.id);
      setProducts(prev => prev.filter(p => p.id !== product.id));
      addToast('Produit supprimé', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Suppression impossible', 'error');
    }
  };

  const statusStyle = (status) => {
    const map = {
      available: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', border: 'rgba(34,197,94,0.28)' },
      out_of_stock: { bg: 'rgba(250,204,21,0.12)', color: '#EAB308', border: 'rgba(250,204,21,0.28)' },
      discontinued: { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.25)' },
    };
    const s = map[status] || map.discontinued;
    return { background: s.bg, color: s.color, border: `1px solid ${s.border}` };
  };

  if (loading) return <div style={{ padding: 40 }}><Loader text="Chargement des produits..." /></div>;

  return (
    <div style={{ padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
        <div>
          <div className="section-eyebrow">Inventaire</div>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            Produits <span style={{ color: 'var(--text-3)', fontSize: '0.55em', fontWeight: 600 }}>({products.length})</span>
          </h1>
        </div>
        <Link to="/admin/products/new" className="btn-primary" style={{ fontSize: 14, padding: '14px 24px', alignSelf: 'flex-end' }}>
          + Ajouter un produit
        </Link>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, marque, type, modèle..."
          className="input-luxury" style={{ width: '100%', maxWidth: 400, fontSize: 14, padding: '12px 18px', borderRadius: 10 }} />
      </div>

      {loadError && (
        <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <p style={{ color: '#EF4444', fontWeight: 600, marginBottom: 12 }}>Impossible de charger les produits.</p>
          <button type="button" className="btn-ghost" onClick={load}>Réessayer</button>
        </div>
      )}

      {filtered.length === 0 && !loadError ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>❄</p>
          <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{search ? 'Aucun résultat' : 'Aucun produit'}</p>
          <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>{search ? 'Essayez d\'autres termes de recherche.' : 'Ajoutez votre premier produit au catalogue.'}</p>
          {!search && <Link to="/admin/products/new" className="btn-primary">+ Ajouter un produit</Link>}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Image', 'Nom', 'Type', 'Marque', 'Prix', 'Stock', 'Statut', 'Actif', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)', padding: '14px 20px', background: 'var(--bg-card2)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s var(--ease)' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 20px' }}>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" style={{ width: 88, height: 64, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                      ) : (
                        <div style={{ width: 88, height: 64, borderRadius: 10, background: 'var(--bg-card2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>❄</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <p style={{ fontWeight: 800, color: 'var(--text)', fontSize: 16 }}>{product.name}</p>
                        {product.featured && (
                          <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--primary-bg)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.1em' }}>★ En vedette</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>{getProductTypeLabel(product.type)}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text-2)', fontSize: 14, fontWeight: 600 }}>{product.brand}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--primary)', fontSize: 17, letterSpacing: '-0.01em' }}>{formatEuro(product.price)}</td>
                    <td style={{ padding: '14px 20px', color: 'var(--text)', fontWeight: 700 }}>{product.stock ?? '—'}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 12, letterSpacing: '0.04em', ...statusStyle(product.status) }}>
                        {PRODUCT_STATUS_LABELS[product.status] || product.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 12, letterSpacing: '0.04em', background: product.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)', color: product.isActive ? '#22C55E' : '#EF4444', border: `1px solid ${product.isActive ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.25)'}` }}>
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Link to={`/admin/products/${product.id}/edit`} className="admin-table-btn" style={{ fontSize: 13, color: 'var(--primary)', textDecoration: 'none', fontWeight: 800 }}>
                          Modifier
                        </Link>
                        <button type="button" onClick={() => handleToggle(product)}
                          className="admin-table-btn" style={{ fontSize: 13, color: product.isActive ? '#DC2626' : '#22C55E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 700 }}>
                          {product.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                        <button type="button" onClick={() => handleDelete(product)}
                          className="admin-table-btn-danger" style={{ fontSize: 13, color: '#991B1B', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 800 }}>
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
