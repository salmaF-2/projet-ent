import React, { useState } from 'react';
import Sidebar     from '../components/Sidebar';
import Topbar      from '../components/Topbar';
import HomePage    from './HomePage';
import CoursesPage from './CoursesPage';
import AIPage      from './AIPage';
import UsersPage   from './UsersPage';
import UploadPage  from './UploadPage';
import MessagesPage from './MessagesPage';
import { Construction } from 'lucide-react';

const PAGE_TITLES = {
  home:     'Tableau de bord',
  courses:  'Mes Cours',
  notes:    'Notes & Résultats',
  calendar: 'Emploi du temps',
  messages: 'Messagerie',
  exams:    'Examens',
  ai:       'Assistant IA',
  upload:   'Déposer des Fichiers',
  users:    'Gestion des Utilisateurs',
  roles:    'Rôles & Accès',
  stats:    'Statistiques',
  config:   'Configuration',
};

const s = {
  layout:  { display: 'flex', minHeight: '100vh', background: '#f4f7fb' },
  main:    { marginLeft: 280, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  content: { flex: 1, padding: '1.5rem 2rem' },
  ph: {
    background: '#fff', borderRadius: 16, padding: '4rem',
    textAlign: 'center', border: '1px solid #e8edf6',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  phIcon:  { width: 72, height: 72, borderRadius: 20, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#1a4b8c' },
  phTitle: { fontSize: '1.3rem', fontWeight: 700, color: '#0f2d57', marginBottom: 8 },
  phSub:   { color: '#7a8bb0', fontSize: '0.92rem', lineHeight: 1.7 },
};

function PlaceholderPage({ title }) {
  return (
    <div style={s.ph}>
      <div style={s.phIcon}><Construction size={36} /></div>
      <div style={s.phTitle}>{title}</div>
      <div style={s.phSub}>
        Ce module sera disponible prochainement.<br />
        Les microservices sont déployés et prêts.
      </div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'home':     return <HomePage    user={user} onNav={setPage} />;
      case 'courses':  return <CoursesPage user={user} />;
      case 'ai':       return <AIPage      user={user} />;
      case 'users':    return <UsersPage />;
      case 'upload':   return <UploadPage />;
      case 'messages': return <MessagesPage />;
      default:         return <PlaceholderPage title={PAGE_TITLES[page] || page} />;
    }
  };

  return (
    <div style={s.layout}>
      <Sidebar user={user} activePage={page} onNav={setPage} onLogout={onLogout} />
      <div style={s.main}>
        <Topbar title={PAGE_TITLES[page] || page} />
        <div style={s.content}>{renderPage()}</div>
      </div>
    </div>
  );
}
