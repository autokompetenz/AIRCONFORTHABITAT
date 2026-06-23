import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { puppyAPI } from '../services/api';
import PuppyCard from '../components/PuppyCard';
import { Loader } from '../components/UI';
import { useLangStore } from '../store';
import { t } from '../utils/i18n';
import { useBreakpoint } from '../hooks';
import { BREEDS } from '../utils/helpers';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [puppies, setPuppies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { lang } = useLangStore();
  const { isMobile, isTablet } = useBreakpoint();
  const l = lang || 'fr';

  const breed = searchParams.get('breed') || 'all';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';

  const fetchPuppies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (breed !== 'all') params.breed = breed;
      if (search) params.search = search;
      if (sort) params.sort = sort;
      const { data } = await puppyAPI.getAll(params);
      setPuppies(data.puppies || []);
      setTotal(data.total || 0);
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  }, [breed, search, sort]);

  useEffect(() => { fetchPuppies(); }, [fetchPuppies]);

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
    if (isMobile) setDrawerOpen(false);
  };

  const resetAll = () => { setSearchParams({}); setDrawerOpen(false); };

  const SortSelect = () => (
    <select value={sort} onChange={e => setFilter('sort', e.target.value)}
      className="input-luxury"
      style={{ fontSize:13, padding:'9px 14px', width:'auto', cursor:'pointer' }}>
      <option value="">{t('sort_by', l)}</option>
      <option value="price_asc">{t('sort_price_asc', l)}</option>
      <option value="price_desc">{t('sort_price_desc', l)}</option>
      <option value="newest">{t('sort_newest', l)}</option>
    </select>
  );

  const FilterSidebar = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <input type="text" placeholder={t('search_ph', l)} value={search}
        onChange={e => setFilter('search', e.target.value)}
        className="input-luxury" style={{ fontSize:15, marginBottom:6 }} />

      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', boxShadow:'var(--shadow-sm)' }}>
        <p style={{ fontSize:10, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--primary)', padding:'14px 16px 8px' }}>
          {l==='fr'?'Races':l==='nl'?'Rassen':l==='en'?'Breeds':'Races'}
        </p>
        {[{ id:'all', label: t('all_breeds', l), count:total }, ...BREEDS.map(b => ({ id:b, label:b, count: puppies.filter(p => p.breed === b).length || 0 }))].map(({ id, label, count }) => (
          <button key={id} onClick={() => setFilter('breed', id === 'all' ? '' : id)}
            style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', background:breed===id?'var(--primary-bg)':'transparent', border:'none', borderLeft:`3px solid ${breed===id?'var(--primary)':'transparent'}`, color:breed===id?'var(--primary)':'var(--text-3)', fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:breed===id?700:400, cursor:'pointer', transition:'all 0.15s', textAlign:'left' }}
            onMouseOver={e=>{ if(breed!==id){ e.currentTarget.style.background='var(--bg-card2)'; e.currentTarget.style.color='var(--text)'; } }}
            onMouseOut={e=>{ if(breed!==id){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-3)'; } }}>
            <span>{label}</span>
            {count > 0 && <span style={{ fontSize:12, opacity:0.45 }}>{count}</span>}
          </button>
        ))}
      </div>

      {(breed !== 'all' || search || sort) && (
        <button onClick={resetAll} style={{ width:'100%', padding:'10px', background:'rgba(201,118,46,0.06)', border:'1px solid var(--primary-border)', borderRadius:8, color:'var(--primary)', fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:700, cursor:'pointer' }}>
          ✕ {t('reset', l)}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', paddingTop:72 }}>
      <div style={{ background:'var(--bg-card2)', borderBottom:'1px solid var(--border)', padding: isMobile ? '36px 4% 28px' : '52px 6% 36px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(30px,5vw,64px)', color:'var(--text)', letterSpacing:'-0.02em', marginBottom:10 }}>
            {l==='fr'?'Nos chiots':l==='nl'?'Onze puppy’s':l==='en'?'Our puppies':'Nos chiots'}
          </h1>
          <p style={{ fontSize:16, color:'var(--text-3)', maxWidth:560 }}>
            {l==='fr'?'Découvrez nos chiots disponibles, tous élevés avec amour à Oupeye.':l==='nl'?'Ontdek onze beschikbare puppy’s, allemaal met liefde gefokt in Oupeye.':l==='en'?'Discover our available puppies, all raised with love in Oupeye.':'Découvrez nos chiots disponibles, tous élevés avec amour à Oupeye.'}
          </p>
        </div>
      </div>

      {isMobile && drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:199, backdropFilter:'blur(4px)' }} />
      )}

      {isMobile && (
        <div style={{ position:'fixed', top:0, left:0, bottom:0, zIndex:200, width:'80vw', maxWidth:320, background:'var(--bg-card)', boxShadow:'var(--shadow-xl)', padding:'24px 16px', overflowY:'auto', transform:drawerOpen?'translateX(0)':'translateX(-100%)', transition:'transform 0.3s var(--ease)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <span style={{ fontWeight:800, fontSize:17, color:'var(--text)' }}>{t('filters', l)}</span>
            <button onClick={() => setDrawerOpen(false)} style={{ background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:8, width:44, height:44, cursor:'pointer', fontSize:18, color:'var(--text-2)', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          <FilterSidebar />
        </div>
      )}

      <div style={{ maxWidth:1400, margin:'0 auto', padding: isMobile ? '20px 4%' : '40px 6%' }}>
        {isMobile && (
          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            <button onClick={() => setDrawerOpen(true)}
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', color:'var(--text)', fontFamily:"'Outfit',sans-serif", fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'var(--shadow-sm)' }}>
              ☰ {t('filters', l)} {breed !== 'all' && `à ${breed}`}
            </button>
            <SortSelect />
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '200px 1fr' : '240px 1fr', gap: isMobile ? 0 : 36 }}>
          {!isMobile && (
            <div style={{ position:'sticky', top:88, alignSelf:'start' }}>
              <FilterSidebar />
              <div style={{ marginTop:12 }}><SortSelect /></div>
            </div>
          )}

          <div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <p style={{ fontSize:14, color:'var(--text-3)' }}>
                <span style={{ color:'var(--primary)', fontWeight:700 }}>{total}</span> {t('found', l)}
              </p>
              {!isMobile && (breed!=='all'||search||sort) && (
                <button onClick={resetAll} style={{ fontSize:13, color:'var(--primary)', background:'none', border:'none', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:600, textDecoration:'underline' }}>
                  {t('reset', l)}
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><Loader /></div>
            ) : puppies.length === 0 ? (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ fontSize:64, marginBottom:16 }}>🔍</div>
                <h3 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:24, color:'var(--text)', marginBottom:10 }}>{t('no_results', l)}</h3>
                <p style={{ fontSize:15, color:'var(--text-3)', marginBottom:24 }}>
                  {l==='fr'?'Essayez une autre race ou inscrivez-vous sur notre liste d’attente.':l==='nl'?'Probeer een ander ras of meld u aan op onze wachtlijst.':l==='en'?'Try another breed or sign up for our waitlist.':'Essayez une autre race ou inscrivez-vous sur notre liste d’attente.'}
                </p>
                <button onClick={resetAll} className="btn-primary">{t('reset', l)}</button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(270px,1fr))', gap: isMobile ? 14 : 22 }}>
                <AnimatePresence>
                  {puppies.map((p, i) => <PuppyCard key={p.id} puppy={p} index={i} />)}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
