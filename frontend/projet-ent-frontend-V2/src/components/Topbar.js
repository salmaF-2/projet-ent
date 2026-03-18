import React, { useState } from 'react';
import { Search, Bell, HelpCircle, ChevronRight } from 'lucide-react';

const s = {
  bar: { height: 64, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '1.2rem', borderBottom: '1px solid #e8edf6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 },
  breadcrumbBase: { fontSize: '0.82rem', color: '#7a8bb0', fontWeight: 500 },
  breadcrumbCurrent: { fontSize: '1rem', fontWeight: 700, color: '#0f2d57' },
  search: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f4f7fb', borderRadius: 10, padding: '0.5rem 1rem', border: '1.5px solid #e8edf6', width: 260, transition: 'border-color 0.2s' },
  searchInput: { border: 'none', background: 'none', outline: 'none', fontSize: '0.88rem', flex: 1, color: '#0f2d57' },
  iconBtn: { width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e8edf6', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', position: 'relative', color: '#7a8bb0' },
  badge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#e53e3e', borderRadius: '50%', fontSize: '0.58rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '2px solid #fff' },
  date: { color: '#9aaac8', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' },
};

export default function Topbar({ title }) {
  const [q,       setQ]       = useState('');
  const [focused, setFocused] = useState(false);
  const now = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });

  return (
    <div style={s.bar}>
      <div style={s.breadcrumb}>
        <span style={s.breadcrumbBase}>ENT</span>
        <ChevronRight size={14} color="#bbc5dc" />
        <span style={s.breadcrumbCurrent}>{title}</span>
      </div>
      <div style={{ ...s.search, borderColor: focused ? '#2e7bd4' : '#e8edf6' }}>
        <Search size={15} color={focused ? '#2e7bd4' : '#bbc5dc'} />
        <input style={s.searchInput} placeholder="Rechercher…" value={q} onChange={e => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      </div>
      <div style={s.date}>{now}</div>
      <button style={s.iconBtn}
        onMouseEnter={e => { e.currentTarget.style.background = '#f4f7fb'; e.currentTarget.style.color = '#1a4b8c'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7a8bb0'; }}>
        <Bell size={17} /><span style={s.badge}>3</span>
      </button>
      <button style={s.iconBtn}
        onMouseEnter={e => { e.currentTarget.style.background = '#f4f7fb'; e.currentTarget.style.color = '#1a4b8c'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7a8bb0'; }}>
        <HelpCircle size={17} />
      </button>
    </div>
  );
}

