import React, { useState } from 'react';

const COURSES_DATA = [
  { id:1, code:'INF301', name:'Architecture des Systèmes Distribués', teacher:'Prof. Mourad Benhassine', semester:'S3', dept:'Informatique', files:8, students:145, desc:"Étude des architectures microservices, conteneurisation avec Docker et orchestration Kubernetes.", color:'var(--est-blue)', tags:['Docker','Kubernetes','Microservices'] },
  { id:2, code:'INF302', name:'Développement Web Full Stack', teacher:'Prof. Khadija Alaoui', semester:'S3', dept:'Informatique', files:14, students:132, desc:"React, Node.js, bases de données relationnelles et NoSQL. Projets pratiques en équipes.", color:'var(--est-green)', tags:['React','Node.js','MongoDB'] },
  { id:3, code:'INF303', name:'Bases de Données Avancées', teacher:'Prof. Youssef Kadiri', semester:'S3', dept:'Informatique', files:6, students:98, desc:"Cassandra, PostgreSQL, optimisation des requêtes, transactions et cohérence des données.", color:'var(--est-gold)', tags:['Cassandra','SQL','NoSQL'] },
  { id:4, code:'INF304', name:'Réseaux & Cybersécurité', teacher:'Prof. Laila Nasser', semester:'S3', dept:'Réseaux', files:10, students:120, desc:"Protocoles réseau, VPN, pare-feu, OAuth2, JWT, gestion des certificats SSL/TLS.", color:'#8b5cf6', tags:['OAuth2','JWT','SSL'] },
  { id:5, code:'MAT301', name:'Mathématiques Appliquées', teacher:'Prof. Hassan Berrada', semester:'S3', dept:'Mathématiques', files:5, students:210, desc:"Statistiques, probabilités, algèbre linéaire et applications à l'informatique.", color:'#e53e3e', tags:['Stats','Probabilités','Algèbre'] },
  { id:6, code:'ANG301', name:'Anglais Technique', teacher:'Prof. Samira Fahim', semester:'S3', dept:'Langues', files:4, students:240, desc:"Communication professionnelle en anglais, rédaction de rapports techniques et présentations.", color:'#0d9488', tags:['Communication','Rédaction'] },
];

const FILES_DATA = [
  { name:'Cours_Ch1_Docker.pdf', size:'2.4 MB', date:'01/03/2025', type:'pdf' },
  { name:'TP1_Microservices.zip', size:'1.1 MB', date:'05/03/2025', type:'zip' },
  { name:'Slides_Ch2.pptx', size:'4.8 MB', date:'08/03/2025', type:'pptx' },
  { name:'Exercices_Ch1.pdf', size:'0.8 MB', date:'10/03/2025', type:'pdf' },
];

const FILE_COLORS = { pdf: '#e53e3e', zip: '#d69e2e', pptx: '#dd6b20', docx: '#2b6cb0' };

const s = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.3rem' },
  card: {
    background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
    cursor: 'pointer', transition: 'all 0.22s',
    animation: 'fadeSlideUp 0.4s ease both',
  },
  cardTop: { height: 6 },
  cardBody: { padding: '1.3rem 1.4rem' },
  courseCode: { fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 },
  courseName: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 6 },
  teacher: { fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 },
  desc: { fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 },
  tags: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  tag: { fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 6 },
  meta: { display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: 12 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--text-muted)' },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(15,29,61,0.55)',
    backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '2rem',
    animation: 'fadeIn 0.2s ease',
  },
  modalBox: {
    background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 560,
    boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'fadeSlideUp 0.25s ease both',
  },
  modalHead: { padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalClose: { width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fileRow: { display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background 0.15s' },
  fileIcon: { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  fileName: { flex: 1, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' },
  fileMeta: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  dlBtn: { padding: '0.4rem 0.8rem', borderRadius: 8, border: 'none', background: 'var(--est-blue-pale)', color: 'var(--est-blue)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' },
};

export default function CoursesPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  const filtered = COURSES_DATA.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.code.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div style={s.topBar}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Semestre 3 · {COURSES_DATA.length} modules</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Cliquez sur un cours pour accéder aux fichiers</div>
        </div>
        <input placeholder="🔍 Filtrer les cours..." value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: '0.9rem', outline: 'none', width: 220 }} />
      </div>

      <div style={s.grid}>
        {filtered.map((c, i) => (
          <div key={c.id} style={{...s.card, animationDelay: `${i*0.07}s`}}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
            onClick={() => setSelected(c)}>
            <div style={{...s.cardTop, background: c.color}} />
            <div style={s.cardBody}>
              <div style={{...s.courseCode, color: c.color}}>{c.code} · {c.dept}</div>
              <div style={s.courseName}>{c.name}</div>
              <div style={s.teacher}>👨‍🏫 {c.teacher}</div>
              <div style={s.desc}>{c.desc}</div>
              <div style={s.tags}>
                {c.tags.map(t => (
                  <span key={t} style={{...s.tag, background: `${c.color}15`, color: c.color}}>{t}</span>
                ))}
              </div>
              <div style={s.meta}>
                <div style={s.metaItem}>📁 {c.files} fichiers</div>
                <div style={s.metaItem}>👥 {c.students} étudiants</div>
                <div style={s.metaItem}>📅 {c.semester}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div style={s.modal} onClick={() => setSelected(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={{...s.modalHead, borderBottom: '1px solid var(--border-light)'}}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: selected.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{selected.code}</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{selected.name}</div>
              </div>
              <button style={s.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: '1rem 0' }}>
              <div style={{ padding: '0 1.5rem 0.8rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fichiers du cours</div>
              {FILES_DATA.map((f, i) => {
                const ext = f.name.split('.').pop();
                return (
                  <div key={i} style={s.fileRow}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-primary)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div style={{...s.fileIcon, background: `${FILE_COLORS[ext]||'#888'}18`, color: FILE_COLORS[ext]||'#888'}}>
                      {ext==='pdf'?'📄':ext==='zip'?'🗜️':ext==='pptx'?'📊':'📝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.fileName}>{f.name}</div>
                      <div style={s.fileMeta}>{f.size} · {f.date}</div>
                    </div>
                    <button style={s.dlBtn}>⬇ Télécharger</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
