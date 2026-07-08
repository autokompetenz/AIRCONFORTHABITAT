import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore, useToastStore } from '../../store';
import { adminAPI } from '../../services/api';

export default function AdminLogin() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data } = await adminAPI.login(code.trim());
      login(data.token);
      addToast('Connecté avec succès', 'success');
      navigate('/admin');
    } catch (err) {
      addToast(err.response?.data?.error || 'Code incorrect', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 40, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12, filter: 'drop-shadow(0 4px 12px rgba(46,134,193,0.3))' }}>❄</div>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 24, color: 'var(--text)' }}>AIRCONFORTHABITAT</h1>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--primary)', marginTop: 4 }}>Administration</p>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 8 }}>Entrez le code d'accès pour administrer le site.</p>
        </div>
        <div style={{ marginBottom: 20 }}>
          <input type="password" value={code} onChange={e => setCode(e.target.value)}
            placeholder="Code d'accès" className="input-luxury"
            style={{ fontSize: 18, textAlign: 'center', letterSpacing: '0.2em' }} />
        </div>
        <button type="submit" disabled={loading || !code.trim()} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 15 }}>
          {loading ? '⏳...' : '→ Se connecter'}
        </button>
      </form>
    </div>
  );
}
