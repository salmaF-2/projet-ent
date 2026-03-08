import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import HomePage from './HomePage';
import CoursesPage from './CoursesPage';
import NotesPage from './NotesPage';
import MessagesPage from './MessagesPage';
import CalendarPage from './CalendarPage';
import AIPage from './AIPage';

const PAGE_TITLES = {
  home: '🏠 Tableau de bord',
  courses: '📚 Mes Cours',
  notes: '📊 Notes & Résultats',
  calendar: '📅 Emploi du temps',
  messages: '✉️ Messagerie',
  exams: '📋 Examens',
  ai: '🤖 Assistant IA',
  upload: '📤 Déposer des Fichiers',
  users: '👥 Gestion des Utilisateurs',
  roles: '🔐 Rôles & Accès',
  stats: '📈 Statistiques',
  config: '⚙️ Configuration',
};

const s = {
  layout: { display: 'flex', minHeight: '100vh' },
  main: { marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  content: { flex: 1, padding: '1.5rem 2rem', animation: 'fadeIn 0.3s ease' },
};

function PlaceholderPage({ title }) {
  return (
    <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: '3rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
      <div style={{ fontSize: 56, marginBottom: '1rem' }}>{title.split(' ')[0]}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--est-blue-dark)', marginBottom: 8 }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ce module sera disponible en production avec les microservices déployés.</div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('home');

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage user={user} />;
      case 'courses': return <CoursesPage />;
      case 'notes': return <NotesPage />;
      case 'calendar': return <CalendarPage />;
      case 'messages': return <MessagesPage />;
      case 'ai': return <AIPage user={user} />;
      default: return <PlaceholderPage title={PAGE_TITLES[page] || page} />;
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
