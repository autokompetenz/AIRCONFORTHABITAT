import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import { PRODUCT_TYPES, getProductTypeLabel } from '../utils/helpers';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { lang } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();
  const l = lang || 'fr';

  const type = searchParams.get('type') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (type !== 'all') params.type = type;
      if (search) params.search = search;
      if (sort) params.sort = sort;
      const { data } = await productAPI.getAll(params);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [type, search, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
    if (isMobile) setDrawerOpen(false);
  };

  const resetAll = () => { setSearchParams({}); setDrawerOpen(false); };

  const SortSelect = () => (
    <select value={sort} onChange={e => setFilter('sort', e.target.value)}
      style={{
        border: '1px solid var(--border)', padding: '8px 12px',
        fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none',
        cursor: 'pointer', background: '#fff', color: '#666',
      }}>
      <option value="">{t('sort_by', l)}</option>
      <option value="price_asc">{t('sort_price_asc', l)}</option>
      <option value="price_desc">{t('sort_price_desc', l)}</option>
      <option value="newest">{t('sort_newest', l)}</option>
    </select>
  );

  const FilterSidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ border: '1px solid var(--border)', padding: '10px 12px' }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 8 }}>
          {t('product_type', l)}
        </p>
        {[
          { id: 'all', label: t('all_types', l) },
          ...PRODUCT_TYPES.map(tp => ({ id: tp, label: getProductTypeLabel(tp, l) })),
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setFilter('type', id === 'all' ? '' : id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 0', background: 'none', border: 'none',
              color: type === id ? 'var(--primary)' : '#999', fontWeight: type === id ? 700 : 400,
              fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
              borderLeft: `2px solid ${type === id ? 'var(--primary)' : 'transparent'}`,
              paddingLeft: 8,
            }}>
            {label}
          </button>
        ))}
      </div>

      {(type !== 'all' || search || sort) && (
        <button onClick={resetAll} style={{
          width: '100%', padding: '8px', border: '1px solid var(--primary-border)',
          background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}>
          ✕ {t('reset', l)}
        </button>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh', background: '#fff' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ background: '#F5F5F5', borderBottom: '1px solid var(--border)', padding: isMobile ? '28px 4% 24px' : '40px 5% 32px' }}
      >
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            style={{ fontWeight: 900, fontSize: 'clamp(24px,4vw,40px)', color: '#1A1A1A', marginBottom: 8 }}
          >
            {l === 'fr' ? 'Nos produits' : l === 'nl' ? 'Onze producten' : 'Our products'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            style={{ fontSize: 14, color: '#999', maxWidth: 500 }}
          >
            {l === 'fr' ? 'Découvrez notre sélection de climatiseurs et ventilateurs pour votre confort.' :
              l === 'nl' ? 'Ontdek onze selectie airconditioners en ventilatoren voor uw comfort.' :
              'Discover our selection of air conditioners and fans for your comfort.'}
          </motion.p>
        </div>
      </motion.div>

      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} />
      )}

      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 200,
          width: '80vw', maxWidth: 300, background: '#fff',
          padding: '20px 16px', overflowY: 'auto',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1A1A1A' }}>{t('filters', l)}</span>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4 }}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
          <FilterSidebar />
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? '16px 4%' : '32px 5%' }}>
        {isMobile && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={() => setDrawerOpen(true)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                border: '1px solid var(--border)', padding: '9px 12px',
                background: '#fff', color: '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}>
              <SlidersHorizontal size={14} strokeWidth={1.5} /> {t('filters', l)}
            </button>
            <SortSelect />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '200px 1fr' : '220px 1fr', gap: isMobile ? 0 : 28 }}>
          {!isMobile && (
            <div style={{ position: 'sticky', top: 88, alignSelf: 'start' }}>
              <FilterSidebar />
              <div style={{ marginTop: 10 }}><SortSelect /></div>
            </div>
          )}

          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}
            >
              <p style={{ fontSize: 13, color: '#999' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{total}</span> {t('found', l)}
              </p>
              {!isMobile && (type !== 'all' || search || sort) && (
                <button onClick={resetAll} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  ✕ {t('reset', l)}
                </button>
              )}
            </motion.div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}
              ><Loader /></motion.div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                style={{ textAlign: 'center', padding: '60px 0' }}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Search size={36} color="#ccc" strokeWidth={1.5} style={{ marginBottom: 12 }} />
                </motion.div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A', marginBottom: 8 }}>{t('no_results', l)}</h3>
                <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
                  {l === 'fr' ? 'Essayez un autre type ou modifiez votre recherche.' : l === 'nl' ? 'Probeer een ander type of wijzig uw zoekopdracht.' : 'Try another type or change your search.'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetAll} className="btn-primary" style={{ fontSize: 12 }}
                >{t('reset', l)}</motion.button>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
                <AnimatePresence>
                  {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
