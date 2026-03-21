import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/api';
import { Bot, Send, Trash2, Clock, AlertCircle, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  "Expliquer les microservices en architecture logicielle",
  "Comment fonctionne l'authentification JWT ?",
  "Résumer le cours sur Docker et Kubernetes",
  "Quels sont les avantages de Cassandra ?",
];

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', background: '#fff', borderRadius: 18, border: '1px solid #e8edf6', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  header: { padding: '1.1rem 1.5rem', borderBottom: '1px solid #e8edf6', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg,#061427 0%,#0d2448 100%)' },
  headerIcon: { width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '1px solid rgba(255,255,255,0.18)' },
  headerTitle: { color: '#fff', fontWeight: 700, fontSize: '0.97rem' },
  headerSub:   { color: 'rgba(255,255,255,0.55)', fontSize: '0.77rem', marginTop: 2 },
  statusDot:   { width: 8, height: 8, borderRadius: '50%', background: '#4ade80', marginLeft: 'auto', flexShrink: 0, boxShadow: '0 0 6px #4ade80' },
  clearBtn:    { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)', padding: '0.3rem 0.8rem', borderRadius: 20, fontSize: '0.77rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' },
  badge:       { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '0.18rem 0.65rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.18)', marginRight: '0.4rem' },
  msgs:        { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  welcomeBox:  { textAlign: 'center', padding: '2rem 1rem', maxWidth: 480, margin: '0 auto' },
  welcomeIcon: { width: 76, height: 76, borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#1a4b8c' },
  welcomeTitle:{ fontSize: '1.3rem', fontWeight: 800, color: '#0f2d57', marginBottom: 6 },
  welcomeSub:  { color: '#7a8bb0', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' },
  suggBtn:     { padding: '0.7rem 1rem', borderRadius: 11, border: '1.5px solid #e8edf6', background: '#fff', cursor: 'pointer', fontSize: '0.88rem', color: '#4a5878', textAlign: 'left', transition: 'all 0.18s', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' },
  msgRow:      { display: 'flex', gap: '0.7rem', maxWidth: '82%' },
  msgAvatar:   { width: 30, height: 30, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgBubble:   { padding: '0.8rem 1.1rem', borderRadius: 14, fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-line' },
  inputArea:   { padding: '1rem 1.3rem', borderTop: '1px solid #f0f4fb', display: 'flex', gap: '0.7rem', alignItems: 'flex-end', background: '#fff' },
  textarea:    { flex: 1, padding: '0.72rem 1rem', borderRadius: 12, border: '1.5px solid #e8edf6', fontSize: '0.92rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, maxHeight: 120, transition: 'border-color 0.2s', background: '#fafbff' },
  sendBtn:     { width: 44, height: 44, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)', color: '#fff', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s', boxShadow: '0 3px 10px rgba(26,75,140,0.28)' },
  typing:      { display: 'flex', gap: 4, padding: '0.4rem 0.2rem', alignItems: 'center' },
  dot:         { width: 6, height: 6, borderRadius: '50%', background: '#2e7bd4', animation: 'pulse 1.2s ease infinite' },
  errorBox:    { background: '#ffebee', color: '#c62828', padding: '0.6rem 1rem', borderRadius: 9, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
};

export default function AIPage({ user }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_history');
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length > 0)
      localStorage.setItem('chat_history', JSON.stringify(messages.slice(-50)));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setError(null);
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      // Essayer d'abord la route privée (avec token), sinon la route publique
      let response;
      try {
        response = await chatService.privateAsk(msg);
      } catch {
        response = await chatService.publicAsk(msg);
      }
      setMessages(m => [...m, {
        role: 'ai',
        text: response.answer || response.response || 'Pas de réponse.',
        model: response.model_used || response.model,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      setError('Service IA indisponible. Vérifiez que le microservice chatbot est actif (port 8005).');
      setMessages(m => [...m, { role: 'ai', error: true, text: 'Désolé, le service IA est momentanément indisponible.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clear = () => {
    if (window.confirm("Effacer l'historique de la conversation ?")) {
      setMessages([]); localStorage.removeItem('chat_history');
    }
  };

  const firstName = user?.name?.split(' ')[0] || user?.username || 'vous';
  const initials  = (user?.name || user?.username || 'U').slice(0, 2).toUpperCase();

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerIcon}><Bot size={22} /></div>
        <div>
          <div style={s.headerTitle}>Assistant IA – ENT EST Salé</div>
          <div>
            <span style={s.badge}>🦙 Llama 3</span>
            <span style={s.badge}>🔒 Ollama Privé</span>
          </div>
        </div>
        <div style={s.statusDot} />
        {messages.length > 0 && (
          <button style={s.clearBtn} onClick={clear}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
            <Trash2 size={13} />Effacer
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={s.msgs}>
        {messages.length === 0 ? (
          <div style={s.welcomeBox}>
            <div style={s.welcomeIcon}><Sparkles size={38} /></div>
            <div style={s.welcomeTitle}>Bonjour {firstName} !</div>
            <div style={s.welcomeSub}>
              Votre assistant IA est prêt. Posez vos questions sur les cours,
              l'architecture technique, ou demandez-moi d'expliquer un concept.
            </div>
            {SUGGESTIONS.map((sg, i) => (
              <button key={i} style={s.suggBtn} onClick={() => send(sg)}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.borderColor = '#2e7bd4'; e.currentTarget.style.color = '#1a4b8c'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8edf6'; e.currentTarget.style.color = '#4a5878'; }}>
                <Sparkles size={15} color="#2e7bd4" />{sg}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ ...s.msgRow, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ ...s.msgAvatar, background: m.role === 'user' ? '#1a4b8c' : '#e3f2fd', color: m.role === 'user' ? '#fff' : '#1a4b8c', fontSize: m.role === 'user' ? '0.7rem' : 'inherit', fontWeight: m.role === 'user' ? 700 : 'inherit' }}>
                  {m.role === 'user' ? initials : <Bot size={16} />}
                </div>
                <div style={{ ...s.msgBubble, background: m.role === 'user' ? 'linear-gradient(135deg,#1a4b8c,#2e7bd4)' : m.error ? '#ffebee' : '#f4f7fb', color: m.role === 'user' ? '#fff' : m.error ? '#c62828' : '#1e2a3a', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px' }}>
                  {m.text}
                  {m.time && (
                    <div style={{ fontSize: '0.68rem', marginTop: '0.5rem', opacity: 0.55, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} />{m.time} {m.model && `· ${m.model}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '0.7rem' }}>
            <div style={{ ...s.msgAvatar, background: '#e3f2fd', color: '#1a4b8c' }}><Bot size={16} /></div>
            <div style={{ ...s.msgBubble, background: '#f4f7fb', borderRadius: '14px 14px 14px 4px' }}>
              <div style={s.typing}>
                {[0,1,2].map(j => <div key={j} style={{ ...s.dot, animationDelay: `${j*0.2}s` }} />)}
              </div>
            </div>
          </div>
        )}

        {error && <div style={s.errorBox}><AlertCircle size={15} />{error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <textarea style={s.textarea}
          placeholder="Posez votre question… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1}
          onFocus={e => e.target.style.borderColor = '#2e7bd4'}
          onBlur={e => e.target.style.borderColor = '#e8edf6'} />
        <button style={{ ...s.sendBtn, opacity: !input.trim() ? 0.45 : 1 }} onClick={() => send()} disabled={!input.trim()}>
          <Send size={19} />
        </button>
      </div>
    </div>
  );
}

