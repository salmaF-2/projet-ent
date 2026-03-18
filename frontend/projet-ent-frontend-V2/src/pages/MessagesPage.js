import React, { useState } from 'react';

const THREADS = [
  { id:1, from:'Prof. Mourad Benhassine', subject:'TP Docker – Consignes complémentaires', preview:'Bonjour, suite au TP de la semaine dernière, voici les consignes supplémentaires...', date:'Hier', unread:true, avatar:'👨‍🏫' },
  { id:2, from:'Administration EST', subject:'Calendrier des examens S3', preview:'Le calendrier officiel des examens du semestre 3 est désormais disponible...', date:'02/03', unread:true, avatar:'🏫' },
  { id:3, from:'Prof. Khadija Alaoui', subject:'Correction Projet React', preview:'Votre projet React a été évalué. Très bon travail sur la partie composants...', date:'28/02', unread:false, avatar:'👩‍🏫' },
  { id:4, from:'Service Scolarité', subject:'Votre relevé de notes', preview:'Votre relevé de notes du semestre 2 est disponible dans votre espace ENT...', date:'25/02', unread:false, avatar:'📋' },
  { id:5, from:'Prof. Youssef Kadiri', subject:'Ressources BD NoSQL', preview:'Je vous partage les liens vers les ressources complémentaires sur Cassandra...', date:'20/02', unread:false, avatar:'👨‍💼' },
];

const DETAIL = {
  1: { body: `Bonjour à tous,

Suite au TP Docker de la semaine dernière, je vous transmets des consignes complémentaires :

1. **Vérifiez** que vos conteneurs redémarrent bien après un crash (--restart=always)
2. **Testez** la communication entre vos microservices avec curl ou Postman
3. **Documentez** vos Dockerfiles dans un fichier README.md

La correction sera mise en ligne vendredi sur Moodle.

Cordialement,
Prof. Mourad Benhassine` }
};

const s = {
  wrap: { display: 'flex', gap: '1.2rem', height: 'calc(100vh - 130px)' },
  list: { width: 340, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  listHeader: { padding: '1.1rem 1.3rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontWeight: 700, fontSize: '0.95rem' },
  composeBtn: { padding: '0.4rem 0.85rem', borderRadius: 8, border: 'none', background: 'var(--est-blue)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' },
  threads: { flex: 1, overflowY: 'auto' },
  thread: { padding: '0.95rem 1.2rem', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', transition: 'background 0.15s' },
  threadActive: { background: 'var(--est-blue-pale)' },
  threadTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
  threadFrom: { fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' },
  threadDate: { fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 },
  threadSubject: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 },
  threadPreview: { fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  unreadDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--est-blue)', display: 'inline-block', marginRight: 6 },
  detail: { flex: 1, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  detailHeader: { padding: '1.3rem 1.5rem', borderBottom: '1px solid var(--border-light)' },
  detailSubject: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 },
  detailMeta: { display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' },
  detailBody: { flex: 1, padding: '1.5rem', overflowY: 'auto', whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: '0.92rem', color: 'var(--text-primary)' },
  replyBar: { padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '0.75rem' },
  replyInput: { flex: 1, padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: '0.9rem', outline: 'none' },
  replyBtn: { padding: '0.7rem 1.2rem', borderRadius: 10, border: 'none', background: 'var(--est-blue)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  empty: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' },
};

export default function MessagesPage() {
  const [selected, setSelected] = useState(null);
  const [threads, setThreads] = useState(THREADS);
  const [reply, setReply] = useState('');

  const select = (t) => {
    setSelected(t);
    setThreads(prev => prev.map(p => p.id === t.id ? { ...p, unread: false } : p));
  };

  return (
    <div style={s.wrap}>
      <div style={s.list}>
        <div style={s.listHeader}>
          <div style={s.listTitle}>✉️ Messagerie ({threads.filter(t=>t.unread).length} non lus)</div>
          <button style={s.composeBtn}>✏️ Nouveau</button>
        </div>
        <div style={s.threads}>
          {threads.map(t => (
            <div key={t.id} style={{...s.thread, ...(selected?.id===t.id ? s.threadActive : {})}}
              onClick={() => select(t)}
              onMouseEnter={e => { if (selected?.id!==t.id) e.currentTarget.style.background='var(--bg-primary)'; }}
              onMouseLeave={e => { if (selected?.id!==t.id) e.currentTarget.style.background=''; }}>
              <div style={s.threadTop}>
                <div style={s.threadFrom}>
                  {t.unread && <span style={s.unreadDot} />}{t.avatar} {t.from}
                </div>
                <div style={s.threadDate}>{t.date}</div>
              </div>
              <div style={{...s.threadSubject, fontWeight: t.unread ? 700 : 500}}>{t.subject}</div>
              <div style={s.threadPreview}>{t.preview}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.detail}>
        {selected ? (<>
          <div style={s.detailHeader}>
            <div style={s.detailSubject}>{selected.subject}</div>
            <div style={s.detailMeta}>
              <span>De : {selected.avatar} {selected.from}</span>
              <span>📅 {selected.date}</span>
            </div>
          </div>
          <div style={s.detailBody}>{DETAIL[selected.id]?.body || selected.preview + '\n\nContenu complet du message ici...'}</div>
          <div style={s.replyBar}>
            <input style={s.replyInput} placeholder="Répondre..." value={reply} onChange={e => setReply(e.target.value)}
              onFocus={e => e.target.style.borderColor='var(--est-blue-light)'}
              onBlur={e => e.target.style.borderColor='var(--border)'} />
            <button style={s.replyBtn}>Envoyer ↗</button>
          </div>
        </>) : (
          <div style={s.empty}>
            <span style={{ fontSize: 40 }}>✉️</span>
            <span>Sélectionnez un message pour le lire</span>
          </div>
        )}
      </div>
    </div>
  );
}
