import React from 'react';

export default function StatCard({ icon, label, value, sub, color = 'var(--est-blue)', accent }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius)', padding: '1.4rem 1.5rem',
      boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)',
      display: 'flex', alignItems: 'center', gap: '1.1rem',
      animation: 'fadeSlideUp 0.5s ease both',
      transition: 'all 0.2s', cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}
    >
      <div style={{
        width: 54, height: 54, borderRadius: 14, flexShrink: 0,
        background: accent || `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}
