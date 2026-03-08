import React, { useState, useRef, useEffect } from 'react';

const SUGGESTIONS = [
  "Expliquer les microservices en architecture logicielle",
  "Comment fonctionne l'authentification JWT ?",
  "Résumer le cours sur Docker et Kubernetes",
  "Quels sont mes prochains examens ?",
];

const SYSTEM_INFO = `Tu es l'assistant IA de l'ENT de l'EST Salé (École Supérieure de Technologie de Salé, Université Mohammed V Rabat). Tu aides les étudiants et enseignants avec leurs cours, questions pédagogiques, et informations sur l'ENT. Tu réponds toujours en français sauf si on te parle dans une autre langue. Tu es alimenté par Ollama avec Llama 3, déployé en cloud privé sur l'infrastructure de l'EST.`;

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 130px)', background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', overflow: 'hidden' },
  header: { padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, var(--est-blue-dark), var(--est-blue))' },
  aiAvatar: { width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px solid rgba(255,255,255,0.25)' },
  aiName: { color: '#fff', fontWeight: 700, fontSize: '1rem' },
  aiSub: { color: 'rgba(255,255,255,0.65)', fontSize: '0.78rem' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#4ade80', marginLeft: 'auto', flexShrink: 0, boxShadow: '0 0 6px #4ade80' },
  messages: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  welcomeBox: { textAlign: 'center', padding: '2rem 1rem' },
  welcomeIcon: { fontSize: 52, marginBottom: '1rem' },
  welcomeTitle: { fontSize: '1.3rem', fontWeight: 800, color: 'var(--est-blue-dark)', marginBottom: 6 },
  welcomeSub: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480, margin: '0 auto' },
  suggBtn: { padding: '0.65rem 1.1rem', borderRadius: 10, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: '0.87rem', color: 'var(--text-secondary)', textAlign: 'left', transition: 'all 0.18s', fontWeight: 500 },
  msgWrap: { display: 'flex', gap: '0.75rem', maxWidth: '80%' },
  msgAvatar: { width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  msgBubble: { padding: '0.8rem 1.1rem', borderRadius: 14, fontSize: '0.9rem', lineHeight: 1.7, flex: 1 },
  inputArea: { padding: '1rem 1.2rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' },
  textArea: { flex: 1, padding: '0.75rem 1rem', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '0.92rem', resize: 'none', outline: 'none', fontFamily: 'var(--font-main)', lineHeight: 1.6, maxHeight: 120 },
  sendBtn: { width: 46, height: 46, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, var(--est-blue), var(--est-blue-light))', color: '#fff', fontSize: 20, cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  typing: { display: 'flex', gap: 4, padding: '0.5rem 0.3rem', alignItems: 'center' },
  typingDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--est-blue-light)', animation: 'pulse 1.2s ease infinite' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '0.2rem 0.7rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.2)' },
};

const DEMO_REPLIES = {
  "microservices": "Les **microservices** sont une approche architecturale où une application est décomposée en petits services indépendants, chacun responsable d'une fonctionnalité précise.\n\nDans le cas de l'ENT EST Salé, l'architecture comprend :\n• 🔐 **Service d'authentification** (Keycloak + JWT)\n• 📚 **Service de gestion des cours** (FastAPI + Cassandra)\n• 📁 **Service de fichiers** (MinIO)\n• 🤖 **Service IA** (Ollama + Llama 3)\n\nChaque service communique via des **API REST** et est conteneurisé avec **Docker**, orchestré par **Kubernetes**.",
  "jwt": "**JWT (JSON Web Token)** est un standard ouvert (RFC 7519) pour transmettre des informations de manière sécurisée.\n\nStructure d'un JWT :\n```\nHeader.Payload.Signature\n```\n• **Header** : algorithme de signature (ex: HS256)\n• **Payload** : données (userId, rôle, expiration)\n• **Signature** : vérification d'intégrité\n\nDans l'ENT, Keycloak génère les tokens JWT lors de l'authentification OAuth2. Chaque microservice vérifie le token pour autoriser les accès.",
  "docker": "**Docker** permet de conteneuriser chaque microservice dans un environnement isolé et reproductible.\n\n**Commandes essentielles :**\n```bash\ndocker build -t mon-service .\ndocker run -p 8080:8080 mon-service\ndocker-compose up -d\n```\n\n**Kubernetes** orchestre ensuite ces conteneurs pour :\n• ♻️ Redémarrage automatique\n• ⚖️ Load balancing\n• 📈 Scaling horizontal\n\nL'ENT de l'EST Salé est déployé sur des VMs **VMware ESXi** avec Ubuntu 24.10.",
};

function getReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('microservice') || lower.includes('architecture')) return DEMO_REPLIES.microservices;
  if (lower.includes('jwt') || lower.includes('authentification') || lower.includes('oauth')) return DEMO_REPLIES.jwt;
  if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('container')) return DEMO_REPLIES.docker;
  return `Merci pour votre question sur **"${msg.slice(0,50)}..."**.\n\nJe suis l'assistant IA de l'ENT EST Salé, propulsé par **Ollama + Llama 3** en cloud privé. En production, je serai connecté directement à la base de données des cours pour vous donner des réponses précises sur votre programme, vos notes et l'emploi du temps.\n\nPour l'instant, essayez de me poser des questions sur les **microservices**, **JWT/OAuth2**, ou **Docker/Kubernetes** !`;
}

export default function AIPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 600));
    setMessages(m => [...m, { role: 'ai', text: getReply(msg) }]);
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.aiAvatar}>🤖</div>
        <div>
          <div style={s.aiName}>Assistant IA – ENT EST Salé</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 3 }}>
            <div style={s.badge}>🦙 Llama 3</div>
            <div style={s.badge}>🔒 Cloud Privé</div>
          </div>
        </div>
        <div style={s.dot} />
      </div>

      <div style={s.messages}>
        {messages.length === 0 && (
          <div style={s.welcomeBox}>
            <div style={s.welcomeIcon}>🤖</div>
            <div style={s.welcomeTitle}>Bonjour {user.name.split(' ')[0]} !</div>
            <div style={s.welcomeSub}>Comment puis-je vous aider aujourd'hui ?</div>
            <div style={s.suggestions}>
              {SUGGESTIONS.map((s2, i) => (
                <button key={i} style={s.suggBtn} onClick={() => send(s2)}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--est-blue-pale)'; e.currentTarget.style.borderColor='var(--est-blue-light)'; e.currentTarget.style.color='var(--est-blue)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                  💡 {s2}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{...s.msgWrap, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', maxWidth: '80%'}}>
              <div style={{...s.msgAvatar, background: m.role === 'user' ? 'var(--est-green-pale)' : 'var(--est-blue-pale)'}}>
                {m.role === 'user' ? user.avatar : '🤖'}
              </div>
              <div style={{...s.msgBubble, background: m.role === 'user' ? 'linear-gradient(135deg, var(--est-blue), var(--est-blue-light))' : 'var(--bg-primary)', color: m.role === 'user' ? '#fff' : 'var(--text-primary)', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', whiteSpace: 'pre-line' }}>
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{...s.msgAvatar, background: 'var(--est-blue-pale)'}}>🤖</div>
            <div style={{...s.msgBubble, background: 'var(--bg-primary)', borderRadius: '14px 14px 14px 4px'}}>
              <div style={s.typing}>
                {[0,1,2].map(i => <div key={i} style={{...s.typingDot, animationDelay: `${i*0.2}s`}} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={s.inputArea}>
        <textarea style={s.textArea} placeholder="Posez votre question... (Entrée pour envoyer, Shift+Entrée pour aller à la ligne)"
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} rows={1}
          onFocus={e => e.target.style.borderColor='var(--est-blue-light)'}
          onBlur={e => e.target.style.borderColor='var(--border)'} />
        <button style={{...s.sendBtn, opacity: !input.trim() ? 0.5 : 1}} onClick={() => send()} disabled={!input.trim()}>➤</button>
      </div>
    </div>
  );
}
