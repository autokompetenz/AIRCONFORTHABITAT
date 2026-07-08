import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToastStore } from '../../store';
import { useBreakpoint } from '../../hooks';
import { PRODUCT_TYPES } from '../../utils/helpers';

const EMPTY = {
  name:'', type:'climatiseur_fixe', brand:'Daikin', model:'',
  description:'', technicalDescription:'',
  price:'', salePrice:'',
  btu:'', surface:'', noiseLevel:'', energyClass:'A++', cop:'', seer:'', scop:'',
  color:'', weight:'', dimensions:'', warranty:'',
  stock:'', status:'available',
  featured:false, isActive:true,
};

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function Section({ title, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:28, marginBottom:22, boxShadow:'var(--shadow-sm)' }}>
      <p style={{ fontSize:11, fontWeight:800, letterSpacing:'0.28em', textTransform:'uppercase', color:'var(--primary)', marginBottom:20 }}>{title}</p>
      {children}
    </div>
  );
}

function Field({ label, field, type='text', placeholder, opts, rows, value, onChange }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:10 }}>{label}</label>
      {opts ? (
        <select name={field} value={value} onChange={onChange} className="input-luxury" style={{ fontSize:15, borderRadius:10, padding:'14px 18px' }}>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : rows ? (
        <textarea name={field} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
          className="input-luxury" style={{ resize:'none', fontSize:15, borderRadius:10, padding:'14px 18px', lineHeight:1.6 }} />
      ) : (
        <input name={field} type={type} value={value} onChange={onChange} placeholder={placeholder}
          className="input-luxury" style={{ fontSize:15, borderRadius:10, padding:'14px 18px' }} />
      )}
    </div>
  );
}

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
  const { isMobile } = useBreakpoint();
  const isEdit = !!id && id !== 'new';
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => () => { previews.forEach(p => { if (!p.isExisting && p.url?.startsWith('blob:')) URL.revokeObjectURL(p.url); }); }, [previews]);

  useEffect(() => {
    if (isEdit) {
      adminAPI.getProductById(id).then(r => {
        const c = r.data.product;
        setForm({ ...EMPTY, ...c, price: String(c.price || ''), salePrice: String(c.salePrice || ''), stock: String(c.stock ?? '') });
        const existing = [];
        (c.images || []).forEach((url, idx) => {
          existing.push({ url, id: `existing-${idx + 1}`, isExisting: true });
        });
        setExistingImages(existing);
      });
    }
  }, [id, isEdit]);

  const set = (field) => (e) => {
    const { type, value, checked } = e.target;
    setForm(prev => ({ ...prev, [field]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? '' : Number(value)) : value }));
  };

  const handleImageChange = (e) => {
    if (!e.target?.files) return;
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      files.forEach(file => { const url = URL.createObjectURL(file); setPreviews(prev => [...prev, { file, url, id: crypto.randomUUID(), isExisting: false }]); });
    }
    e.target.value = '';
  };

  const removeImage = (imageId) => {
    const previewToRemove = previews.find(p => p.id === imageId);
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.url);
      setImageFiles(prev => prev.filter(file => file !== previewToRemove.file));
      setPreviews(prev => prev.filter(p => p.id !== imageId));
      return;
    }
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      const payload = { ...form, slug: slugify(form.name) };
      Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') formData.append(k, v); });
      imageFiles.forEach(file => formData.append('images', file));
      existingImages.forEach(img => formData.append('existingImages', img.url));
      if (isEdit) { await adminAPI.updateProduct(id, formData); navigate('/admin/products', { replace: true, state: { successMessage: 'Produit mis à jour' } }); }
      else { await adminAPI.createProduct(formData); navigate('/admin/products', { replace: true, state: { successMessage: 'Produit créé' } }); }
    } catch (err) { addToast(err.response?.data?.error || err.message || 'Erreur', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding:'clamp(24px,5vw,48px) clamp(16px,4vw,44px) 60px', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ marginBottom:32 }}>
        <div className="section-eyebrow">{isEdit ? 'Modifier' : 'Ajouter'}</div>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,44px)', color:'var(--text)', letterSpacing:'-0.02em' }}>
          {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 860 }}>
        <Section title="Informations principales">
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16, marginBottom:16 }}>
            <Field label="Nom *" field="name" placeholder="Climatiseur Inverter 9000 BTU" value={form.name} onChange={set("name")} />
            <Field label="Type *" field="type" opts={PRODUCT_TYPES} value={form.type} onChange={set("type")} />
            <Field label="Marque *" field="brand" placeholder="Daikin, Mitsubishi, Dyson..." value={form.brand} onChange={set("brand")} />
            <Field label="Modèle" field="model" placeholder="FTXM-R" value={form.model} onChange={set("model")} />
          </div>
          <Field label="Description" field="description" rows={4} placeholder="Description détaillée du produit..." value={form.description} onChange={set("description")} />
          <div style={{ marginTop: 16 }} />
          <Field label="Description technique" field="technicalDescription" rows={3} placeholder="Caractéristiques techniques (séparées par •)" value={form.technicalDescription} onChange={set("technicalDescription")} />
        </Section>

        <Section title="Prix">
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16 }}>
            <Field label="Prix (€) *" field="price" type="number" placeholder="999" value={form.price} onChange={set("price")} />
            <Field label="Prix soldé (€)" field="salePrice" type="number" placeholder="799" value={form.salePrice} onChange={set("salePrice")} />
          </div>
        </Section>



        <Section title="Images">
          <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display:'none' }} id="images-input" />
          <label htmlFor="images-input"
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:'16px 20px', background:'var(--primary-bg)', border:'2px dashed var(--border-2)', borderRadius:12, cursor:'pointer', fontSize:14, color:'var(--text-2)', fontWeight:600, transition:'all 0.25s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor='var(--primary)'; e.currentTarget.style.background='var(--bg-card2)'; e.currentTarget.style.color='var(--text)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.background='var(--primary-bg)'; e.currentTarget.style.color='var(--text-2)'; }}>
            📷 {previews.length + existingImages.length > 0 ? `${previews.length + existingImages.length} image(s)` : 'Choisir des images'}
          </label>
        </Section>

        {(previews.length > 0 || existingImages.length > 0) && (
          <div style={{ marginBottom:24 }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:12 }}>Aperçu ({previews.length + existingImages.length})</p>
            <div className={isMobile ? 'admin-img-grid' : ''} style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
              {[...existingImages, ...previews].map((img, index) => (
                <div key={img.id} style={{ position:'relative', borderRadius:12, overflow:'hidden', aspectRatio:'4/3' }}>
                  <img src={img.url} alt={`Aperçu ${index + 1}`} style={{ width:'100%', height:'100%', objectFit:'cover', border:'1px solid var(--border)' }} />
                  <button type="button" onClick={() => removeImage(img.id)}
                    style={{ position:'absolute', top:4, right:4, background:'rgba(0,0,0,0.8)', color:'#fff', border:'none', borderRadius:'50%', width: isMobile ? 32 : 24, height: isMobile ? 32 : 24, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize: isMobile ? 12 : 10 }}>
                    ✕
                  </button>
                  {index === 0 && <span style={{ position:'absolute', bottom:4, left:4, fontSize:9, fontWeight:800, background:'var(--primary)', color:'#fff', padding:'2px 6px', borderRadius:3 }}>Principale</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <Section title="Options">
          <div className={isMobile ? 'admin-flex-wrap' : ''} style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
            {[['featured','Produit mis en avant (★ En vedette)'],['isActive','Actif (visible en catalogue)']].map(([f,l]) => (
              <label key={f} style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', padding:'12px 16px', borderRadius:10, background:'var(--bg-card2)', border:'1px solid var(--border)' }}>
                <input type="checkbox" checked={Boolean(form[f])} onChange={set(f)} style={{ accentColor:'#2E86C1', width:20, height:20 }} />
                <span style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{l}</span>
              </label>
            ))}
          </div>
        </Section>

        <div style={{ display:'flex', gap:16, marginTop:8 }}>
          <button type="submit" disabled={saving} className="btn-primary" style={{ fontSize:15, padding:'18px 36px', borderRadius:10 }}>
            {saving ? 'Enregistrement...' : isEdit ? '✓ Mettre à jour' : '+ Créer le produit'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-ghost" style={{ fontSize:15, padding:'18px 36px', borderRadius:10 }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
