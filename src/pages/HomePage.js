import React from 'react';
import StatCard from '../components/StatCard';

const COURSES = [
  { code: 'INF301', name: 'Architecture des Systèmes', teacher: 'Prof. Mourad', progress: 68, color: '#1a4b8c' },
  { code: 'INF302', name: 'Développement Web', teacher: 'Prof. Khadija', progress: 82, color: '#2d8c4e' },
  { code: 'INF303', name: 'Base de Données', teacher: 'Prof. Youssef', progress: 45, color: '#c8a830' },
  { code: 'INF304', name: 'Réseaux & Sécurité', teacher: 'Prof. Laila', progress: 91, color: '#2e7bd4' },
];

const EVENTS = [
  { date: '10 Mar', title: 'Examen INF301', type: 'exam', color: '#e53e3e' },
  { date: '12 Mar', title: 'TP Développement Web', type: 'tp', color: '#2d8c4e' },
  { date: '15 Mar', title: 'Rendu Projet BD', type: 'project', color: '#c8a830' },
  { date: '18 Mar', title: 'Cours Réseaux – Ch.5', type: 'course', color: '#1a4b8c' },
];

const s = {
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.2rem', marginBottom: '1.8rem' },
  grid12: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.4rem' },
  card: { background: '#fff', borderRadius: 'var(--radius)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' },
  cardTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  courseItem: { marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' },
  courseHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  courseName: { fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' },
  courseCode: { fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 1 },
  coursePct: { fontSize: '0.85rem', fontWeight: 700 },
  progressBg: { height: 6, borderRadius: 10, background: 'var(--border-light)', overflow: 'hidden' },
  eventItem: { display: 'flex', gap: '1rem', padding: '0.7rem 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' },
  eventDate: { minWidth: 52, textAlign: 'center', borderRadius: 8, padding: '0.3rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 },
  eventTitle: { fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' },
  welcome: { marginBottom: '1.8rem', animation: 'fadeSlideUp 0.5s ease both' },
  wTitle: { fontSize: '1.7rem', fontWeight: 800, color: 'var(--est-blue-dark)', marginBottom: 4 },
  wSub: { color: 'var(--text-secondary)', fontSize: '0.93rem' },
};

export default function HomePage({ user }) {
  return (
    <div>
      <div style={s.welcome}>
        <div style={s.wTitle}>Bonjour, {user.name.split(' ')[0]} 👋</div>
        <div style={s.wSub}>Bienvenue sur votre Espace Numérique de Travail – EST Salé</div>
      </div>

      <div style={s.grid2}>
        <StatCard icon="📚" label="Cours actifs" value="8" sub="Semestre 3" color="var(--est-blue)" />
        <StatCard icon="✅" label="Devoirs rendus" value="12" sub="Sur 15 au total" color="var(--est-green)" />
        <StatCard icon="⭐" label="Moyenne générale" value="14.2" sub="/20 ce semestre" color="var(--est-gold)" />
        <StatCard icon="📅" label="Prochains examens" value="3" sub="Dans 7 jours" color="#e53e3e" />
      </div>

      <div style={s.grid12}>
        <div style={s.card}>
          <div style={s.cardTitle}>📖 Progression des cours</div>
          {COURSES.map(c => (
            <div key={c.code} style={c === COURSES[COURSES.length-1] ? {...s.courseItem, borderBottom: 'none', marginBottom: 0, paddingBottom: 0} : s.courseItem}>
              <div style={s.courseHeader}>
                <div>
                  <div style={s.courseName}>{c.name}</div>
                  <div style={s.courseCode}>{c.code} · {c.teacher}</div>
                </div>
                <div style={{...s.coursePct, color: c.color}}>{c.progress}%</div>
              </div>
              <div style={s.progressBg}>
                <div style={{ width: `${c.progress}%`, height: '100%', background: c.color, borderRadius: 10, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={s.cardTitle}>📅 Événements à venir</div>
          {EVENTS.map((ev, i) => (
            <div key={i} style={s.eventItem}>
              <div style={{...s.eventDate, background: `${ev.color}18`, color: ev.color}}>{ev.date}</div>
              <div>
                <div style={s.eventTitle}>{ev.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{ev.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
