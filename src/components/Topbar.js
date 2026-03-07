import React, { useState } from 'react';

const s = {
  bar: {
    height: 64, background: '#fff', display: 'flex', alignItems: 'center',
    padding: '0 2rem', gap: '1.5rem',
    borderBottom: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 50,
  },
  title: { flex: 1, fontSize: '1.1rem', fontWeight: 700, color: 'var(--est-blue-dark)' },
  search: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'var(--bg-primary)', borderRadius: 10,
    padding: '0.5rem 1rem', border: '1.5px solid var(--border)',
    width: 280,
  },
  searchInput: { border: 'none', background: 'none', outline: 'none', fontSize: '0.9rem', flex: 1, color: 'var(--text-primary)' },
  notifBtn: {
    width: 40, height: 40, borderRadius: 10, border: '1.5px solid var(--border)',
    background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 18, position: 'relative', flexShrink: 0,
    transition: 'all 0.15s',
  },
  badge: {
    position: 'absolute', top: -4, right: -4, width: 16, height: 16,
    background: '#e53e3e', borderRadius: '50%', fontSize: '0.6rem',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, border: '2px solid #fff',
  },
  date: { color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 500 },
};

export default function Topbar({ title }) {
  const [q, setQ] = useState('');
  const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={s.bar}>
      <div style={s.title}>{title}</div>
      <div style={s.search}>
        <span>🔍</span>
        <input style={s.searchInput} placeholder="Rechercher cours, fichiers..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div style={s.date}>{now}</div>
      <button style={s.notifBtn}
        onMouseEnter={e => e.currentTarget.style.background='var(--bg-primary)'}
        onMouseLeave={e => e.currentTarget.style.background='#fff'}>
        🔔<span style={s.badge}>3</span>
      </button>
      <button style={s.notifBtn}
        onMouseEnter={e => e.currentTarget.style.background='var(--bg-primary)'}
        onMouseLeave={e => e.currentTarget.style.background='#fff'}>
        ❓
      </button>
    </div>
  );
}
