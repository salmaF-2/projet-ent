import React from 'react';
import {
  Home, BookOpen, GraduationCap, Calendar, Mail, FileText,
  Bot, Upload, Users, Shield, BarChart3, Settings, LogOut, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = {
  etudiant: [
    { icon: Home,          label: 'Accueil',          key: 'home' },
    { icon: BookOpen,      label: 'Mes Cours',         key: 'courses' },
    { icon: GraduationCap, label: 'Notes & Résultats', key: 'notes' },
    { icon: Calendar,      label: 'Emploi du temps',   key: 'calendar' },
    { icon: Mail,          label: 'Messagerie',         key: 'messages' },
    { icon: FileText,      label: 'Examens',            key: 'exams' },
    { icon: Bot,           label: 'Assistant IA',       key: 'ai' },
  ],
  enseignant: [
    { icon: Home,          label: 'Accueil',            key: 'home' },
    { icon: BookOpen,      label: 'Mes Cours',           key: 'courses' },
    { icon: Upload,        label: 'Déposer Fichiers',    key: 'upload' },
    { icon: FileText,      label: 'Devoirs & Examens',   key: 'exams' },
    { icon: GraduationCap, label: 'Résultats',           key: 'notes' },
    { icon: Mail,          label: 'Messagerie',           key: 'messages' },
    { icon: Bot,           label: 'Assistant IA',         key: 'ai' },
  ],
  admin: [
    { icon: Home,      label: 'Tableau de bord',  key: 'home' },
    { icon: Users,     label: 'Utilisateurs',      key: 'users' },
    { icon: BookOpen,  label: 'Cours',             key: 'courses' },
    { icon: Shield,    label: 'Rôles & Accès',     key: 'roles' },
    { icon: BarChart3, label: 'Statistiques',      key: 'stats' },
    { icon: Settings,  label: 'Configuration',     key: 'config' },
    { icon: Bot,       label: 'Assistant IA',      key: 'ai' },
  ],
};

const ROLE_LABELS = {
  etudiant:   'Étudiant',
  enseignant: 'Enseignant',
  admin:      'Administrateur',
};

const ROLE_COLORS = {
  etudiant:   { bg: 'rgba(46,123,212,0.2)',  text: '#7ec8f7' },
  enseignant: { bg: 'rgba(45,140,78,0.2)',   text: '#7edba2' },
  admin:      { bg: 'rgba(220,38,38,0.18)',  text: '#fca5a5' },
};

const s = {
  sidebar: {
    width: 280, minHeight: '100vh',
    background: 'linear-gradient(180deg, #061427 0%, #0d2448 60%, #0f2d57 100%)',
    display: 'flex', flexDirection: 'column',
    boxShadow: '4px 0 32px rgba(0,0,0,0.25)',
    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
  },
  brand: {
    padding: '1.6rem 1.4rem 1.3rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', gap: '0.9rem',
  },
  brandLogo: {
    width: 46, height: 46, borderRadius: 12, background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 7, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  brandLogoImg: { width: '100%', height: '100%', objectFit: 'contain' },
  brandText: { color: '#fff' },
  brandName: { fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.25 },
  brandSub:  { fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', marginTop: 2 },
  userCard: {
    margin: '1rem 1rem 0.5rem',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '0.9rem 1rem',
    display: 'flex', alignItems: 'center', gap: '0.8rem',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
    background: 'linear-gradient(135deg, #2d8c4e 0%, #1a4b8c 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.9rem', color: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    color: '#fff', fontSize: '0.88rem', fontWeight: 600,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  rolePill: {
    display: 'inline-block', fontSize: '0.68rem', fontWeight: 600,
    padding: '0.1rem 0.55rem', borderRadius: 20, marginTop: 4,
  },
  navSection: { padding: '0.5rem 0.9rem', flex: 1, overflowY: 'auto' },
  navLabel: {
    color: 'rgba(255,255,255,0.25)', fontSize: '0.66rem', fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    padding: '0.9rem 0.5rem 0.4rem',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.65rem 0.9rem', borderRadius: 10, cursor: 'pointer',
    transition: 'all 0.15s', color: 'rgba(255,255,255,0.5)',
    fontSize: '0.87rem', fontWeight: 500, marginBottom: 1,
    border: 'none', background: 'none', width: '100%', textAlign: 'left',
  },
  // FIX: utiliser boxShadow inset au lieu de borderLeft pour éviter le conflit React
  navItemActive: {
    background: 'rgba(46,123,212,0.22)',
    color: '#fff',
    boxShadow: 'inset 2.5px 0 0 #4a9eff',
  },
  footer: { padding: '1rem 1rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.07)' },
  logoutBtn: {
    width: '100%', padding: '0.65rem', borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)',
    fontSize: '0.87rem', cursor: 'pointer', transition: 'all 0.18s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  },
};

export default function Sidebar({ user, activePage, onNav, onLogout }) {
  const role  = user?.role || 'etudiant';
  const items = NAV_ITEMS[role] || NAV_ITEMS.etudiant;
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.etudiant;

  const getInitials = () => {
    const src = user?.name || user?.username || 'U';
    return src.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div style={s.sidebar}>
      {/* Logo + nom ENT */}
      <div style={s.brand}>
        <div style={s.brandLogo}>
          <img
            src="logo.png"
            alt="EST"
            style={s.brandLogoImg}
          />
        </div>
        <div style={s.brandText}>
          <div style={s.brandName}>ENT – EST Salé</div>
          <div style={s.brandSub}>Université Mohammed V · Rabat</div>
        </div>
      </div>

      {/* Carte utilisateur */}
      <div style={s.userCard}>
        <div style={s.avatar}>{getInitials()}</div>
        <div style={s.userInfo}>
          <div style={s.userName}>{user?.name || user?.username}</div>
          <div style={{ ...s.rolePill, background: roleColor.bg, color: roleColor.text }}>
            {ROLE_LABELS[role] || role}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={s.navSection}>
        <div style={s.navLabel}>Navigation</div>
        {items.map(item => {
          const Icon     = item.icon;
          const isActive = activePage === item.key;
          return (
            <button
              key={item.key}
              style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}
              onClick={() => onNav(item.key)}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                }
              }}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.6} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
            </button>
          );
        })}
      </nav>

      {/* Déconnexion */}
      <div style={s.footer}>
        <button
          style={s.logoutBtn}
          onClick={onLogout}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(220,38,38,0.15)';
            e.currentTarget.style.color = '#fca5a5';
            e.currentTarget.style.borderColor = 'rgba(220,38,38,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          }}
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

