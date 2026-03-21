import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/api';
import {
  LogIn, Bot, Send, Eye, EyeOff, User, Lock,
  Sparkles, AlertCircle, ChevronRight,
} from 'lucide-react';

const st = {
  wrap: {
    minHeight: '100vh',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* ── Côté gauche ── */
  left: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '3rem',
    backgroundImage: 'url(https://est.um5.ac.ma/wp-content/uploads/2026/02/slider-home-page-1200600-1-Copie.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  },
  leftOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(135deg, rgba(6,20,39,0.82) 0%, rgba(15,45,87,0.72) 100%)',
    zIndex: 1,
  },
  leftContent: {
    position: 'relative', zIndex: 2,
    textAlign: 'center', color: '#fff', maxWidth: 480,
    animation: 'fadeSlideUp 0.7s ease both',
  },
  logoRing: {
    width: 150, height: 150, borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    border: '2px solid rgba(255,255,255,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 2rem',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
    padding: 16,
  },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(1.05)' },
  uniName: {
    fontSize: '1.45rem', fontWeight: 800, lineHeight: 1.35,
    marginBottom: 6, textShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  uniSub: {
    fontSize: '0.97rem', fontWeight: 300, opacity: 0.88,
    textShadow: '0 1px 4px rgba(0,0,0,0.35)',
  },
  divider: {
    width: 48, height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
    margin: '1.8rem auto',
  },
  tagline: {
    fontSize: '0.88rem', lineHeight: 1.9, opacity: 0.85,
    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  pillRow: {
    display: 'flex', gap: 8, justifyContent: 'center', marginTop: '1.4rem', flexWrap: 'wrap',
  },
  pill: {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.22)',
    borderRadius: 20, padding: '0.22rem 0.75rem',
    fontSize: '0.72rem', color: 'rgba(255,255,255,0.88)', fontWeight: 600,
  },

  /* ── Côté droit ── */
  right: {
    width: 480,
    display: 'flex', flexDirection: 'column',
    background: '#fff',
    boxShadow: '-20px 0 80px rgba(0,0,0,0.18)',
    overflowY: 'auto',
    animation: 'fadeSlideUp 0.8s 0.1s ease both',
  },

  /* Tabs haut */
  topTabs: { display: 'flex', borderBottom: '1px solid #e8edf6' },
  topTab: {
    flex: 1, padding: '1rem',
    border: 'none', background: '#f8fafd',
    fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
    color: '#7a8bb0', transition: 'all 0.2s',
    letterSpacing: '0.04em', textTransform: 'uppercase',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
  },
  topTabActive: {
    background: '#fff', color: '#1a4b8c',
    borderBottom: '2px solid #1a4b8c', marginBottom: -1,
  },

  /* Formulaire */
  formWrap: { padding: '2.2rem 2.5rem', flex: 1 },
  formHead: { marginBottom: '2rem' },
  formTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#0f2d57', marginBottom: 6 },
  formSub:   { color: '#7a8bb0', fontSize: '0.88rem', lineHeight: 1.6 },

  field:  { marginBottom: '1.1rem' },
  label:  {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    fontSize: '0.78rem', fontWeight: 700, color: '#4a5878',
    marginBottom: 7, letterSpacing: '0.05em', textTransform: 'uppercase',
  },
  inputWrap: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    color: '#bbc5dc', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '0.78rem 1rem 0.78rem 2.8rem',
    borderRadius: 12, border: '1.5px solid #e8edf6',
    fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s',
    background: '#fafbff', boxSizing: 'border-box', color: '#0f2d57',
  },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#bbc5dc', padding: 4,
  },
  forgotRow: { textAlign: 'right', marginTop: 6 },
  forgot: { color: '#2e7bd4', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 },
  btn: {
    width: '100%', padding: '0.9rem', borderRadius: 12, border: 'none',
    background: 'linear-gradient(135deg, #0f2d57 0%, #1a4b8c 50%, #2e7bd4 100%)',
    color: '#fff', fontWeight: 700, fontSize: '0.97rem', cursor: 'pointer',
    marginTop: '1.2rem', transition: 'all 0.2s',
    boxShadow: '0 6px 20px rgba(26,75,140,0.32)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
    letterSpacing: '0.02em',
  },
  error: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#fff0f0', border: '1.5px solid #fecaca',
    borderRadius: 10, padding: '0.75rem 1rem',
    fontSize: '0.87rem', color: '#c0392b', marginBottom: '1.2rem',
  },
  newUser: { textAlign: 'center', marginTop: '1.6rem', fontSize: '0.87rem', color: '#7a8bb0' },
  newUserLink: { color: '#2d8c4e', fontWeight: 700, cursor: 'pointer', marginLeft: 4 },

  /* Chatbot aide */
  aideWrap: { padding: '2rem 2.2rem', flex: 1, display: 'flex', flexDirection: 'column' },
  aideHeader: {
    background: 'linear-gradient(135deg, #061427, #1a4b8c)',
    borderRadius: 16, padding: '1.2rem 1.4rem', marginBottom: '1.3rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
  },
  aideAvatar: {
    width: 48, height: 48, borderRadius: 14,
    background: 'rgba(255,255,255,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0, color: '#fff',
  },
  aideTitle: { color: '#fff', fontWeight: 800, fontSize: '1rem' },
  aideSub:   { color: 'rgba(255,255,255,0.6)', fontSize: '0.76rem', marginTop: 3 },
  badgeRow:  { display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap' },
  badge: {
    background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 20, padding: '0.15rem 0.6rem',
    fontSize: '0.67rem', color: 'rgba(255,255,255,0.88)', fontWeight: 600,
  },
  statusDot: { width: 8, height: 8, borderRadius: '50%', background: '#4ade80', marginLeft: 'auto', flexShrink: 0, boxShadow: '0 0 6px #4ade80' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
  suggBtn: {
    padding: '0.62rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6',
    background: '#fff', cursor: 'pointer', fontSize: '0.83rem', color: '#4a5878',
    textAlign: 'left', fontWeight: 500, transition: 'all 0.15s',
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  chatBox: {
    flex: 1, background: '#f8fafd', borderRadius: 14,
    padding: '1rem', overflowY: 'auto', marginBottom: '1rem',
    minHeight: 220, maxHeight: 320,
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
    border: '1px solid #e8edf6',
  },
  msgUser: {
    alignSelf: 'flex-end',
    background: 'linear-gradient(135deg, #1a4b8c, #2e7bd4)',
    color: '#fff', padding: '0.65rem 1rem',
    borderRadius: '14px 14px 4px 14px',
    fontSize: '0.87rem', maxWidth: '80%', lineHeight: 1.6,
  },
  msgAI: {
    alignSelf: 'flex-start', background: '#fff',
    border: '1px solid #e8edf6', color: '#0f1f3d',
    padding: '0.65rem 1rem', borderRadius: '14px 14px 14px 4px',
    fontSize: '0.87rem', maxWidth: '85%', lineHeight: 1.6,
    boxShadow: '0 2px 8px rgba(26,75,140,0.06)',
  },
  inputRow:  { display: 'flex', gap: '0.6rem' },
  chatInput: {
    flex: 1, padding: '0.7rem 1rem', borderRadius: 12,
    border: '1.5px solid #e8edf6', fontSize: '0.9rem', outline: 'none',
    background: '#fafbff', transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
    background: 'linear-gradient(135deg, #1a4b8c, #2e7bd4)',
    color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 3px 10px rgba(26,75,140,0.28)',
  },
  typing:    { display: 'flex', gap: 4, padding: '0.3rem 0', alignItems: 'center' },
  typingDot: { width: 7, height: 7, borderRadius: '50%', background: '#2e7bd4', animation: 'pulse 1.2s ease infinite' },
};

const SUGGESTIONS_AIDE = [
  { icon: '💡', text: 'Comment accéder à mes cours ?' },
  { icon: '📅', text: 'Où voir mon emploi du temps ?' },
  { icon: '🔑', text: 'Mot de passe oublié, que faire ?' },
  { icon: '🤖', text: "Comment utiliser l'assistant IA ?" },
];

export default function LoginPage() {
  const { login }    = useAuth();
  const [mainTab,    setMainTab]    = useState('auth');
  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [messages,   setMessages]   = useState([
    { role: 'ai', text: "Bonjour ! Je suis l'assistant IA de l'ENT EST Salé, propulsé par Ollama + Llama 3. Comment puis-je vous aider ?" }
  ]);
  const [chatInput,  setChatInput]  = useState('');
  const [aiLoading,  setAiLoading]  = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await login(username, password);
      if (!result.success) setError(result.error || 'Identifiants incorrects.');
    } catch {
      setError('Erreur de connexion au service d\'authentification.');
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async (text) => {
    const msg = text || chatInput;
    if (!msg.trim()) return;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setAiLoading(true);
    try {
      const response = await chatService.publicAsk(msg);
      setMessages(prev => [...prev, { role: 'ai', text: response.answer || 'Pas de réponse.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Désolé, le service IA est temporairement indisponible.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={st.wrap}>
      {/* ── Gauche ── */}
      <div style={st.left}>
        <div style={st.leftOverlay} />
        <div style={st.leftContent}>
          <div style={st.logoRing}>
            <img
              src="logo.png"
              alt="Logo EST Salé"
              style={st.logoImg}
            />
          </div>
          <div style={st.uniName}>
            École Supérieure de Technologie<br />de Salé
          </div>
          <div style={st.uniSub}>Université Mohammed V – Rabat</div>
          <div style={st.divider} />
          <div style={st.tagline}>
            Espace Numérique de Travail<br />
            Plateforme pédagogique augmentée par l'IA
          </div>
          
        </div>
      </div>

      {/* ── Droite ── */}
      <div style={st.right}>
        {/* Tabs */}
        <div style={st.topTabs}>
          <button
            style={{ ...st.topTab, ...(mainTab === 'auth' ? st.topTabActive : {}) }}
            onClick={() => setMainTab('auth')}
          >
            <LogIn size={15} />Connexion
          </button>
          <button
            style={{ ...st.topTab, ...(mainTab === 'aide' ? st.topTabActive : {}) }}
            onClick={() => setMainTab('aide')}
          >
            <Bot size={15} />Aide IA
          </button>
        </div>

        {/* ── Formulaire login ── */}
        {mainTab === 'auth' ? (
          <div style={st.formWrap}>
            <div style={st.formHead}>
              <div style={st.formTitle}>Connexion ENT</div>
              <div style={st.formSub}>
                Accédez à votre espace numérique de travail.<br />
                Utilisez votre identifiant institutionnel.
              </div>
            </div>

            {error && (
              <div style={st.error}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              {/* Username */}
              <div style={st.field}>
                <label style={st.label}>
                  <User size={13} />Identifiant
                </label>
                <div style={st.inputWrap}>
                  <span style={st.inputIcon}><User size={16} /></span>
                  <input
                    style={st.input}
                    placeholder="votre.identifiant"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                    onFocus={e => { e.target.style.borderColor = '#2e7bd4'; e.target.style.boxShadow = '0 0 0 3px rgba(46,123,212,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e8edf6'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={st.field}>
                <label style={st.label}>
                  <Lock size={13} />Mot de passe
                </label>
                <div style={st.inputWrap}>
                  <span style={st.inputIcon}><Lock size={16} /></span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    style={{ ...st.input, paddingRight: '3rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                    onFocus={e => { e.target.style.borderColor = '#2e7bd4'; e.target.style.boxShadow = '0 0 0 3px rgba(46,123,212,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e8edf6'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    style={st.eyeBtn}
                    onClick={() => setShowPwd(v => !v)}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={st.forgotRow}>
                <span style={st.forgot}>Mot de passe oublié ?</span>
              </div>

              <button
                style={{ ...st.btn, opacity: loading ? 0.75 : 1 }}
                type="submit"
                disabled={loading}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                {loading ? (
                  <><span style={{ animation: 'pulse 1s ease infinite' }}>⏳</span>Connexion en cours…</>
                ) : (
                  <><LogIn size={18} />Se connecter<ChevronRight size={16} /></>
                )}
              </button>
            </form>

            <div style={st.newUser}>
              Nouveau sur la plateforme ?
              <span style={st.newUserLink}>Contacter l'administration</span>
            </div>

            
          </div>
        ) : (
          /* ── Chatbot aide ── */
          <div style={st.aideWrap}>
            <div style={st.aideHeader}>
              <div style={st.aideAvatar}><Bot size={24} /></div>
              <div style={{ flex: 1 }}>
                <div style={st.aideTitle}>Assistant IA – ENT EST Salé</div>
                <div style={st.aideSub}>Posez vos questions sur la plateforme</div>
               
              </div>
              <div style={st.statusDot} />
            </div>

            {messages.length === 1 && (
              <div style={st.suggestions}>
                {SUGGESTIONS_AIDE.map((s, i) => (
                  <button
                    key={i}
                    style={st.suggBtn}
                    onClick={() => sendChat(s.text)}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#f0f7ff';
                      e.currentTarget.style.borderColor = '#2e7bd4';
                      e.currentTarget.style.color = '#1a4b8c';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#e8edf6';
                      e.currentTarget.style.color = '#4a5878';
                    }}
                  >
                    <span>{s.icon}</span>{s.text}
                  </button>
                ))}
              </div>
            )}

            <div style={st.chatBox}>
              {messages.map((m, i) => (
                <div key={i} style={m.role === 'user' ? st.msgUser : st.msgAI}>
                  {m.role === 'ai' && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a4b8c', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <Bot size={12} />Assistant IA
                    </span>
                  )}
                  <span style={{ whiteSpace: 'pre-line' }}>{m.text}</span>
                </div>
              ))}
              {aiLoading && (
                <div style={st.msgAI}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a4b8c', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Bot size={12} />Assistant IA
                  </span>
                  <div style={st.typing}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ ...st.typingDot, animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            <div style={st.inputRow}>
              <input
                style={st.chatInput}
                placeholder="Posez votre question…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                onBlur={e => e.target.style.borderColor = '#e8edf6'}
              />
              <button style={st.sendBtn} onClick={() => sendChat()} disabled={!chatInput.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
