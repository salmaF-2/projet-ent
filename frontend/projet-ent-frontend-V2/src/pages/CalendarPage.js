import React, { useState } from 'react';

const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const HOURS = ['08:00','09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];
const SCHEDULE = [
  { day:0, start:0, duration:2, subject:'Architecture Systèmes – CM', room:'Amphi A', color:'var(--est-blue)', teacher:'Prof. Mourad' },
  { day:0, start:3, duration:2, subject:'Développement Web – TP', room:'Salle 204', color:'var(--est-green)', teacher:'Prof. Khadija' },
  { day:1, start:1, duration:1, subject:'Base de Données – TD', room:'Salle 101', color:'var(--est-gold)', teacher:'Prof. Youssef' },
  { day:1, start:5, duration:2, subject:'Réseaux – TP', room:'Labo Réseaux', color:'#8b5cf6', teacher:'Prof. Laila' },
  { day:2, start:0, duration:3, subject:'Développement Web – CM', room:'Amphi B', color:'var(--est-green)', teacher:'Prof. Khadija' },
  { day:3, start:2, duration:2, subject:'Mathématiques – CM', room:'Amphi A', color:'#e53e3e', teacher:'Prof. Hassan' },
  { day:3, start:5, duration:1, subject:'Anglais Technique', room:'Salle 305', color:'#0d9488', teacher:'Prof. Samira' },
  { day:4, start:0, duration:2, subject:'Architecture Systèmes – TP', room:'Labo Info', color:'var(--est-blue)', teacher:'Prof. Mourad' },
  { day:4, start:4, duration:1, subject:'Réseaux – CM', room:'Amphi A', color:'#8b5cf6', teacher:'Prof. Laila' },
];

const s = {
  grid: { display: 'grid', gridTemplateColumns: '60px repeat(6, 1fr)', gap: 0, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', overflow: 'hidden' },
  dayHeader: { padding: '0.8rem 0.5rem', textAlign: 'center', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  timeCell: { padding: '0.7rem 0.5rem', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-muted)', borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-primary)', fontWeight: 500 },
  dayCol: { position: 'relative', borderRight: '1px solid var(--border-light)' },
  emptySlot: { height: 64, borderBottom: '1px solid var(--border-light)' },
  event: { position: 'absolute', left: 4, right: 4, borderRadius: 8, padding: '0.35rem 0.5rem', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.15s' },
  eventName: { fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.25 },
  eventMeta: { fontSize: '0.7rem', opacity: 0.85, marginTop: 2 },
};

export default function CalendarPage() {
  const [week, setWeek] = useState('10–15 Mars 2025');
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.3rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>📅 Emploi du temps – {week}</div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>← Semaine préc.</button>
          <button style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>Semaine suiv. →</button>
        </div>
      </div>

      <div style={s.grid}>
        <div style={s.dayHeader} />
        {DAYS.slice(0,6).map(d => <div key={d} style={s.dayHeader}>{d}</div>)}

        {HOURS.map((h, hi) => (
          <React.Fragment key={h}>
            <div style={s.timeCell}>{h}</div>
            {[0,1,2,3,4,5].map(di => {
              const evs = SCHEDULE.filter(e => e.day === di && e.start === hi);
              return (
                <div key={di} style={{...s.dayCol, height: 64, borderBottom: '1px solid var(--border-light)', position: 'relative'}}>
                  {evs.map((ev, ei) => (
                    <div key={ei} style={{...s.event, top: 4, height: ev.duration * 64 - 8, background: `${ev.color.includes('var') ? '' : ev.color}`, backgroundColor: ev.color.includes('var') ? ev.color : ev.color, opacity: 0.92, color: '#fff'}}
                      onMouseEnter={e => { e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.zIndex=10; e.currentTarget.style.opacity=1; }}
                      onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.zIndex=1; e.currentTarget.style.opacity=0.92; }}>
                      <div style={s.eventName}>{ev.subject}</div>
                      <div style={s.eventMeta}>📍 {ev.room}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
