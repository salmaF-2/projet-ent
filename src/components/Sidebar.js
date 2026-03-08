import React from 'react';

const NAV_ITEMS = {
  etudiant: [
    { icon: '🏠', label: 'Accueil', key: 'home' },
    { icon: '📚', label: 'Mes Cours', key: 'courses' },
    { icon: '📝', label: 'Notes & Résultats', key: 'notes' },
    { icon: '📅', label: 'Emploi du temps', key: 'calendar' },
    { icon: '✉️', label: 'Messagerie', key: 'messages' },
    { icon: '📋', label: 'Examens', key: 'exams' },
    { icon: '🤖', label: 'Assistant IA', key: 'ai' },
  ],
  enseignant: [
    { icon: '🏠', label: 'Accueil', key: 'home' },
    { icon: '📖', label: 'Mes Cours', key: 'courses' },
    { icon: '📤', label: 'Déposer Fichiers', key: 'upload' },
    { icon: '✏️', label: 'Devoirs & Examens', key: 'exams' },
    { icon: '📊', label: 'Résultats', key: 'notes' },
    { icon: '✉️', label: 'Messagerie', key: 'messages' },
    { icon: '🤖', label: 'Assistant IA', key: 'ai' },
  ],
  admin: [
    { icon: '🏠', label: 'Tableau de bord', key: 'home' },
    { icon: '👥', label: 'Utilisateurs', key: 'users' },
    { icon: '📚', label: 'Cours', key: 'courses' },
    { icon: '🔐', label: 'Rôles & Accès', key: 'roles' },
    { icon: '📊', label: 'Statistiques', key: 'stats' },
    { icon: '⚙️', label: 'Configuration', key: 'config' },
    { icon: '🤖', label: 'Assistant IA', key: 'ai' },
  ],
};

const s = {
  sidebar: {
    width: 260, minHeight: '100vh', background: 'var(--bg-sidebar)',
    display: 'flex', flexDirection: 'column',
    boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
  },
  brand: {
    padding: '1.5rem 1.4rem 1.2rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', gap: '0.85rem',
  },
  brandIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: 'linear-gradient(135deg, var(--est-blue-light), var(--est-green))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, flexShrink: 0,
  },
  brandText: { color: '#fff' },
  brandName: { fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.3 },
  brandSub: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 400 },
  userCard: {
    margin: '1rem 1rem',
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 12, padding: '0.85rem 1rem',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  avatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--est-green), var(--est-blue-light))',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { color: '#fff', fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' },
  navSection: { padding: '0.5rem 0.8rem', flex: 1, overflowY: 'auto' },
  navLabel: { color: 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.8rem 0.6rem 0.4rem' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.7rem 0.8rem', borderRadius: 10, cursor: 'pointer',
    transition: 'all 0.18s', color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem', fontWeight: 500, marginBottom: 2,
    border: 'none', background: 'none', width: '100%', textAlign: 'left',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, rgba(46,123,212,0.35), rgba(45,140,78,0.2))',
    color: '#fff', borderLeft: '3px solid var(--est-blue-light)',
  },
  navIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  footer: {
    padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  logoutBtn: {
    width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)',
    fontSize: '0.87rem', cursor: 'pointer', transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
};

export default function Sidebar({ user, activePage, onNav, onLogout }) {
  const items = NAV_ITEMS[user.tab] || NAV_ITEMS.etudiant;
  return (
    <div style={s.sidebar}>
      <div style={s.brand}>
        <img src="/EST-Sale-–-Ecole-Superieure-de-Technologie-de-Sale.png" alt="EST" style={{width:50,height:50,objectFit:"contain",borderRadius:8,background:"#fff",padding:8}} />
        <div style={s.brandText}>
          <div style={s.brandName}>ENT – EST Salé</div>
          <div style={s.brandSub}>Univ. Mohammed V Rabat</div>
        </div>
      </div>
      <div style={s.userCard}>
        <div style={s.avatar}>{user.avatar}</div>
        <div style={s.userInfo}>
          <div style={s.userName}>{user.name}</div>
          <div style={s.userRole}>{user.role}</div>
        </div>
      </div>
      <nav style={s.navSection}>
        <div style={s.navLabel}>Navigation</div>
        {items.map(item => (
          <button key={item.key} style={{...s.navItem, ...(activePage===item.key ? s.navItemActive : {})}}
            onClick={() => onNav(item.key)}>
            <span style={s.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div style={s.footer}>
        <button style={s.logoutBtn} onClick={onLogout}
          onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.05)'}>
          🚪 Se déconnecter
        </button>
      </div>
    </div>
  );
}
