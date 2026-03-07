import React, { useState } from 'react';

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    background: 'linear-gradient(135deg, #0f2d57 0%, #1a4b8c 45%, #2d8c4e 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  bgDeco: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 60% 60% at 80% 20%, rgba(46,123,212,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 50% at 10% 80%, rgba(45,140,78,0.15) 0%, transparent 60%)',
  },
  left: {
    flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
    alignItems: 'center', padding: '3rem',
    animation: 'fadeSlideUp 0.7s ease both',
  },
  logoArea: { textAlign: 'center', marginBottom: '2.5rem' },
  logoBox: {
    width: 120, height: 120, borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)', border: '3px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.5rem', fontSize: 48,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  uniName: { color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4, marginBottom: 4 },
  uniSub: { color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', fontWeight: 300 },
  tagline: {
    color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: '3rem',
    textAlign: 'center', maxWidth: 300, lineHeight: 1.8,
    borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem',
  },
  right: {
    width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: '3rem', background: '#fff',
    boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
    animation: 'fadeSlideUp 0.8s 0.1s ease both',
  },
  formHead: { marginBottom: '2.5rem' },
  formTitle: { fontSize: '1.8rem', fontWeight: 800, color: 'var(--est-blue-dark)', marginBottom: 6 },
  formSub: { color: 'var(--text-secondary)', fontSize: '0.92rem' },
  tabs: { display: 'flex', gap: 4, background: '#f0f4fb', borderRadius: 10, padding: 4, marginBottom: '2rem' },
  tab: {
    flex: 1, padding: '0.55rem', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s',
    background: 'transparent', color: 'var(--text-secondary)',
  },
  tabActive: {
    background: '#fff', color: 'var(--est-blue)',
    boxShadow: '0 2px 8px rgba(26,75,140,0.12)',
  },
  field: { marginBottom: '1.2rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.03em', textTransform: 'uppercase' },
  input: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
    border: '1.5px solid var(--border)', fontSize: '0.95rem',
    outline: 'none', transition: 'all 0.2s', background: '#fafbff',
  },
  btn: {
    width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, var(--est-blue) 0%, var(--est-blue-mid) 100%)',
    color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    marginTop: '0.5rem', transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(26,75,140,0.3)',
    letterSpacing: '0.02em',
  },
  forgotRow: { textAlign: 'right', marginTop: '0.5rem' },
  forgot: { color: 'var(--est-blue-light)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 },
  divider: { textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '1.2rem 0', position: 'relative' },
  newUser: {
    textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem',
    color: 'var(--text-secondary)',
  },
  newUserLink: { color: 'var(--est-green)', fontWeight: 700, cursor: 'pointer' },
  error: { background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.87rem', color: '#c0392b', marginBottom: '1rem' },
};

const DEMO_USERS = {
  etudiant: { role: 'Étudiant', name: 'Ahmed Benali', avatar: '🎓' },
  enseignant: { role: 'Enseignant', name: 'Prof. Khadija Alaoui', avatar: '👩‍🏫' },
  admin: { role: 'Administrateur', name: 'Admin EST', avatar: '⚙️' },
};

export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('etudiant');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 900));
    if (password === 'est2024') {
      onLogin({ ...DEMO_USERS[tab], username, tab });
    } else {
      setError('Identifiants incorrects. (Mot de passe : est2024)');
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.bgDeco} />
      <div style={styles.left}>
        <div style={styles.logoArea}>
          <div style={styles.logoBox}>🎓</div>
          <div style={styles.uniName}>École Supérieure de Technologie<br />de Salé</div>
          <div style={styles.uniSub}>Université Mohammed V – Rabat</div>
        </div>
        <div style={styles.tagline}>
          Espace Numérique de Travail<br />
          Plateforme pédagogique augmentée par l'IA<br />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Propulsé par Ollama & Llama 3</span>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formHead}>
          <div style={styles.formTitle}>Connexion ENT</div>
          <div style={styles.formSub}>Accédez à votre espace numérique de travail</div>
        </div>

        <div style={styles.tabs}>
          {[['etudiant','🎓 Étudiant'],['enseignant','👩‍🏫 Enseignant'],['admin','⚙️ Admin']].map(([k,label]) => (
            <button key={k} style={{...styles.tab, ...(tab===k ? styles.tabActive : {})}} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>Identifiant</label>
            <input style={styles.input} placeholder={`${tab}@est-sale.ma`} value={username} onChange={e => setUsername(e.target.value)}
              onFocus={e => e.target.style.borderColor='var(--est-blue-light)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input type="password" style={styles.input} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
              onFocus={e => e.target.style.borderColor='var(--est-blue-light)'}
              onBlur={e => e.target.style.borderColor='var(--border)'}
            />
          </div>
          <div style={styles.forgotRow}><span style={styles.forgot}>Mot de passe oublié ?</span></div>
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? '⏳ Connexion...' : '→ Se connecter'}
          </button>
        </form>

        <div style={styles.newUser}>
          Nouveau à l'université ? <span style={styles.newUserLink}>Valider votre compte</span>
        </div>
      </div>
    </div>
  );
}
