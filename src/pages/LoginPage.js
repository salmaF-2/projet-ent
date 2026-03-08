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
  logoArea: { textAlign: 'center', marginBottom: '2rem' },
  logoBox: {
    width: 180, height: 180, borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 1.5rem', overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    padding: 16,
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(1.1)' },
  uniName: { color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4, marginBottom: 4 },
  uniSub: { color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', fontWeight: 300 },
  tagline: {
    color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: '2.5rem',
    textAlign: 'center', maxWidth: 300, lineHeight: 1.8,
    borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem',
  },

  /* RIGHT PANEL */
  right: {
    width: 500, display: 'flex', flexDirection: 'column',
    background: '#fff', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
    animation: 'fadeSlideUp 0.8s 0.1s ease both',
    overflowY: 'auto',
  },

  /* TABS top (Authentification / Besoin d'aide) */
  topTabs: {
    display: 'flex', borderBottom: '2px solid #e8f0fb',
  },
  topTab: {
    flex: 1, padding: '1.1rem', border: 'none', background: '#f4f7fc',
    fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
    color: 'var(--text-secondary, #4a5878)', transition: 'all 0.2s',
    letterSpacing: '0.02em',
  },
  topTabActive: {
    background: '#fff', color: '#1a4b8c',
    borderBottom: '2px solid #1a4b8c', marginBottom: -2,
  },

  /* AUTH FORM */
  formWrap: { padding: '2rem 2.5rem', flex: 1 },
  formHead: { marginBottom: '1.8rem' },
  formTitle: { fontSize: '1.7rem', fontWeight: 800, color: '#0f2d57', marginBottom: 4 },
  formSub: { color: '#4a5878', fontSize: '0.9rem' },
  tabs: { display: 'flex', gap: 4, background: '#f0f4fb', borderRadius: 10, padding: 4, marginBottom: '1.8rem' },
  tab: {
    flex: 1, padding: '0.55rem', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
    background: 'transparent', color: '#4a5878',
  },
  tabActive: { background: '#fff', color: '#1a4b8c', boxShadow: '0 2px 8px rgba(26,75,140,0.12)' },
  field: { marginBottom: '1.2rem' },
  label: { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#4a5878', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' },
  input: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
    border: '1.5px solid #d4dff0', fontSize: '0.95rem',
    outline: 'none', transition: 'all 0.2s', background: '#fafbff',
  },
  btn: {
    width: '100%', padding: '0.9rem', borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #1a4b8c 0%, #1e5ba8 100%)',
    color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
    marginTop: '0.5rem', transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(26,75,140,0.3)', letterSpacing: '0.02em',
  },
  forgotRow: { textAlign: 'right', marginTop: '0.5rem' },
  forgot: { color: '#2e7bd4', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 },
  newUser: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#4a5878' },
  newUserLink: { color: '#2d8c4e', fontWeight: 700, cursor: 'pointer' },
  error: { background: '#fff0f0', border: '1.5px solid #ffb3b3', borderRadius: 8, padding: '0.7rem 1rem', fontSize: '0.87rem', color: '#c0392b', marginBottom: '1rem' },

  /* AIDE / AI SECTION */
  aideWrap: { padding: '2rem 2.5rem', flex: 1, display: 'flex', flexDirection: 'column' },
  aideHeader: {
    background: 'linear-gradient(135deg, #1a4b8c, #2d8c4e)',
    borderRadius: 14, padding: '1.3rem 1.5rem', marginBottom: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  aideAvatar: {
    width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
    border: '2px solid rgba(255,255,255,0.25)', flexShrink: 0,
  },
  aideTitle: { color: '#fff', fontWeight: 800, fontSize: '1.05rem' },
  aideSub: { color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', marginTop: 3 },
  badgeRow: { display: 'flex', gap: 6, marginTop: 6 },
  badge: { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '0.18rem 0.6rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 },

  chatBox: {
    flex: 1, background: '#f4f7fc', borderRadius: 12,
    padding: '1rem', overflowY: 'auto', marginBottom: '1rem',
    minHeight: 280, maxHeight: 340, display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  msgUser: {
    alignSelf: 'flex-end', background: 'linear-gradient(135deg, #1a4b8c, #2e7bd4)',
    color: '#fff', padding: '0.65rem 1rem', borderRadius: '12px 12px 4px 12px',
    fontSize: '0.87rem', maxWidth: '80%', lineHeight: 1.6,
  },
  msgAI: {
    alignSelf: 'flex-start', background: '#fff', border: '1px solid #d4dff0',
    color: '#0f1f3d', padding: '0.65rem 1rem', borderRadius: '12px 12px 12px 4px',
    fontSize: '0.87rem', maxWidth: '85%', lineHeight: 1.6,
    boxShadow: '0 2px 8px rgba(26,75,140,0.06)',
  },
  inputRow: { display: 'flex', gap: '0.6rem' },
  chatInput: {
    flex: 1, padding: '0.7rem 1rem', borderRadius: 10,
    border: '1.5px solid #d4dff0', fontSize: '0.9rem', outline: 'none',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #1a4b8c, #2e7bd4)',
    color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  suggestions: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  suggBtn: {
    padding: '0.6rem 1rem', borderRadius: 9, border: '1.5px solid #d4dff0',
    background: '#fff', cursor: 'pointer', fontSize: '0.83rem', color: '#4a5878',
    textAlign: 'left', fontWeight: 500, transition: 'all 0.15s',
  },
  typing: { display: 'flex', gap: 4, padding: '0.3rem 0', alignItems: 'center' },
  typingDot: { width: 7, height: 7, borderRadius: '50%', background: '#1a4b8c', animation: 'pulse 1.2s ease infinite' },
};

const DEMO_USERS = {
  etudiant: { role: 'Étudiant', name: 'Ahmed Benali', avatar: '🎓' },
  enseignant: { role: 'Enseignant', name: 'Prof. Khadija Alaoui', avatar: '👩‍🏫' },
  admin: { role: 'Administrateur', name: 'Admin EST', avatar: '⚙️' },
};

const SUGGESTIONS_AIDE = [
  '💡 Comment accéder à mes cours ?',
  '📅 Où voir mon emploi du temps ?',
  '🔑 Mot de passe oublié, que faire ?',
  '🤖 Comment utiliser l\'assistant IA ?',
];

const AI_REPLIES = {
  'cours': "Pour accéder à vos cours, connectez-vous avec vos identifiants puis cliquez sur **Mes Cours** dans le menu latéral. Vous y trouverez tous vos modules avec les fichiers associés.",
  'emploi': "Votre emploi du temps est disponible dans la section **📅 Emploi du temps** après connexion. Il affiche la grille hebdomadaire de vos cours, TP et TD.",
  'mot de passe': "Si vous avez oublié votre mot de passe, cliquez sur **Mot de passe oublié ?** sur la page de connexion. Un email de réinitialisation vous sera envoyé sur votre adresse universitaire.",
  'ia': "L'assistant IA de l'ENT est propulsé par **Ollama + Llama 3** déployé en cloud privé à l'EST Salé. Après connexion, accédez-y via **🤖 Assistant IA** pour poser vos questions pédagogiques.",
};

function getAIReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('cours')) return AI_REPLIES.cours;
  if (lower.includes('emploi') || lower.includes('temps') || lower.includes('horaire')) return AI_REPLIES.emploi;
  if (lower.includes('mot de passe') || lower.includes('password') || lower.includes('oublié')) return AI_REPLIES['mot de passe'];
  if (lower.includes('ia') || lower.includes('assistant') || lower.includes('ollama')) return AI_REPLIES.ia;
  return `Je suis l'assistant IA de l'ENT EST Salé (Ollama + Llama 3). Posez-moi vos questions sur la plateforme, vos cours ou la scolarité. Je suis là pour vous aider ! 😊`;
}

export default function LoginPage({ onLogin }) {
  const [mainTab, setMainTab] = useState('auth'); // 'auth' | 'aide'
  const [roleTab, setRoleTab] = useState('etudiant');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Chat aide state
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Bonjour ! Je suis l\'assistant IA de l\'ENT EST Salé, propulsé par **Ollama + Llama 3**. Comment puis-je vous aider ?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 900));
    if (password === 'est2024') {
      onLogin({ ...DEMO_USERS[roleTab], username, tab: roleTab });
    } else {
      setError('Identifiants incorrects. (Mot de passe : est2024)');
    }
    setLoading(false);
  };

  const sendChat = async (text) => {
    const msg = (text || chatInput).trim();
    if (!msg) return;
    setChatInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 500));
    setMessages(m => [...m, { role: 'ai', text: getAIReply(msg) }]);
    setAiLoading(false);
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.bgDeco} />

      {/* LEFT */}
      <div style={styles.left}>
        <div style={styles.logoArea}>
          <div style={styles.logoBox}>
            <img src="/EST-Sale-–-Ecole-Superieure-de-Technologie-de-Sale.png" alt="Logo EST Salé" style={styles.logoImg} />
          </div>
          <div style={styles.uniName}>École Supérieure de Technologie<br />de Salé</div>
          <div style={styles.uniSub}>Université Mohammed V – Rabat</div>
        </div>
        <div style={styles.tagline}>
          Espace Numérique de Travail<br />
          Plateforme pédagogique augmentée par l'IA<br />
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.72rem' }}>Propulsé par Ollama & Llama 3</span>
        </div>
      </div>

      {/* RIGHT */}
      <div style={styles.right}>
        {/* Top tabs */}
        <div style={styles.topTabs}>
          <button style={{...styles.topTab, ...(mainTab==='auth' ? styles.topTabActive : {})}} onClick={() => setMainTab('auth')}>
            🔐 AUTHENTIFICATION
          </button>
          <button style={{...styles.topTab, ...(mainTab==='aide' ? styles.topTabActive : {})}} onClick={() => setMainTab('aide')}>
            🤖 BESOIN D'AIDE ?
          </button>
        </div>

        {/* AUTH */}
        {mainTab === 'auth' && (
          <div style={styles.formWrap}>
            <div style={styles.formHead}>
              <div style={styles.formTitle}>Connexion ENT</div>
              <div style={styles.formSub}>Accédez à votre espace numérique de travail</div>
            </div>

            <div style={styles.tabs}>
              {[['etudiant','🎓 Étudiant'],['enseignant','👩‍🏫 Enseignant'],['admin','⚙️ Admin']].map(([k,label]) => (
                <button key={k} style={{...styles.tab, ...(roleTab===k ? styles.tabActive : {})}} onClick={() => setRoleTab(k)}>{label}</button>
              ))}
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div style={styles.field}>
                <label style={styles.label}>Identifiant</label>
                <input style={styles.input} placeholder={`${roleTab}@est-sale.ma`} value={username} onChange={e => setUsername(e.target.value)}
                  onFocus={e => e.target.style.borderColor='#2e7bd4'}
                  onBlur={e => e.target.style.borderColor='#d4dff0'} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Mot de passe</label>
                <input type="password" style={styles.input} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={e => e.target.style.borderColor='#2e7bd4'}
                  onBlur={e => e.target.style.borderColor='#d4dff0'} />
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
        )}

        {/* AIDE + AI */}
        {mainTab === 'aide' && (
          <div style={styles.aideWrap}>
            <div style={styles.aideHeader}>
              <div style={styles.aideAvatar}>🤖</div>
              <div>
                <div style={styles.aideTitle}>Assistant IA – ENT EST Salé</div>
                <div style={styles.aideSub}>Posez vos questions sur la plateforme</div>
                <div style={styles.badgeRow}>
                  <span style={styles.badge}>🦙 Llama 3</span>
                  <span style={styles.badge}>🔒 Cloud Privé Ollama</span>
                  <span style={styles.badge}>✅ En ligne</span>
                </div>
              </div>
            </div>

            {messages.length === 1 && (
              <div style={styles.suggestions}>
                {SUGGESTIONS_AIDE.map((s, i) => (
                  <button key={i} style={styles.suggBtn} onClick={() => sendChat(s)}
                    onMouseEnter={e => { e.currentTarget.style.background='#ddeeff'; e.currentTarget.style.borderColor='#2e7bd4'; e.currentTarget.style.color='#1a4b8c'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#d4dff0'; e.currentTarget.style.color='#4a5878'; }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div style={styles.chatBox}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === 'user' ? styles.msgUser : styles.msgAI}>
                  {m.role === 'ai' && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a4b8c', display: 'block', marginBottom: 3 }}>🤖 Assistant IA</span>}
                  <span style={{ whiteSpace: 'pre-line' }}>{m.text}</span>
                </div>
              ))}
              {aiLoading && (
                <div style={styles.msgAI}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a4b8c', display: 'block', marginBottom: 4 }}>🤖 Assistant IA</span>
                  <div style={styles.typing}>
                    {[0,1,2].map(i => <div key={i} style={{...styles.typingDot, animationDelay:`${i*0.2}s`}} />)}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.inputRow}>
              <input style={styles.chatInput} placeholder="Posez votre question..." value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && sendChat()}
                onFocus={e => e.target.style.borderColor='#2e7bd4'}
                onBlur={e => e.target.style.borderColor='#d4dff0'} />
              <button style={styles.sendBtn} onClick={() => sendChat()}>➤</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
