import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, HelpCircle, ChevronRight, Mail, BookOpen, X } from 'lucide-react';
import { messageService, downloadService } from '../services/api';

const s = {
  bar:              { height: 64, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 2rem', gap: '1.2rem', borderBottom: '1px solid #e8edf6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 50 },
  breadcrumb:       { display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 },
  breadcrumbBase:   { fontSize: '0.82rem', color: '#7a8bb0', fontWeight: 500 },
  breadcrumbCurrent:{ fontSize: '1rem', fontWeight: 700, color: '#0f2d57' },
  search:           { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f4f7fb', borderRadius: 10, padding: '0.5rem 1rem', border: '1.5px solid #e8edf6', width: 260, transition: 'border-color 0.2s' },
  searchInput:      { border: 'none', background: 'none', outline: 'none', fontSize: '0.88rem', flex: 1, color: '#0f2d57' },
  date:             { color: '#9aaac8', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' },
  iconBtn:          { width: 38, height: 38, borderRadius: 10, border: '1.5px solid #e8edf6', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s', position: 'relative', color: '#7a8bb0' },
  badge:            { position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, background: '#e53e3e', borderRadius: 20, fontSize: '0.58rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '2px solid #fff', padding: '0 3px' },
  // Dropdown
  dropdown:         { position: 'absolute', top: 46, right: 0, width: 340, background: '#fff', borderRadius: 16, border: '1px solid #e8edf6', boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 200, overflow: 'hidden' },
  dropHead:         { padding: '0.9rem 1.2rem', borderBottom: '1px solid #f0f4fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dropTitle:        { fontSize: '0.88rem', fontWeight: 700, color: '#0f2d57' },
  dropClear:        { fontSize: '0.75rem', color: '#2e7bd4', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none' },
  notifItem:        { display: 'flex', gap: '0.8rem', padding: '0.85rem 1.2rem', borderBottom: '1px solid #f4f7fb', cursor: 'pointer', transition: 'background 0.15s', alignItems: 'flex-start' },
  notifIcon:        { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifTitle:       { fontSize: '0.85rem', fontWeight: 600, color: '#1e2a3a', marginBottom: 2 },
  notifSub:         { fontSize: '0.76rem', color: '#9aaac8' },
  notifDot:         { width: 7, height: 7, borderRadius: '50%', background: '#e53e3e', flexShrink: 0, marginTop: 6 },
  emptyNotif:       { padding: '2rem', textAlign: 'center', color: '#9aaac8', fontSize: '0.85rem' },
};

function formatAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000)    return 'À l\'instant';
  if (diff < 3600000)  return `Il y a ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)} h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export default function Topbar({ title, onNav }) {
  const [q,           setQ]           = useState('');
  const [focused,     setFocused]     = useState(false);
  const [showDrop,    setShowDrop]    = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [seenIds,     setSeenIds]     = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('seen_notifs') || '[]')); }
    catch { return new Set(); }
  });
  const dropRef  = useRef(null);
  const prevRef  = useRef({ msgCount: 0, courseCount: 0 });
  const now = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });

  // Polling toutes les 30s
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // Fermer le dropdown en cliquant ailleurs
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifs = async () => {
    const newNotifs = [];

    // Messages non lus
    try {
      const inbox = await messageService.getInbox();
      const unread = inbox.filter(m => !m.is_read);
      unread.forEach(m => {
        newNotifs.push({
          id:      `msg-${m.id}`,
          type:    'message',
          title:   `Nouveau message de ${m.sender}`,
          sub:     m.subject,
          time:    m.created_at,
          nav:     'messages',
          color:   '#1a4b8c',
          bg:      '#e3f2fd',
        });
      });
    } catch {}

    // Nouveaux cours (comparer avec la dernière fois)
    try {
      const courses = await downloadService.getAllCourses();
      const recent  = courses
        .filter(c => c.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      recent.forEach(c => {
        const age = Date.now() - new Date(c.created_at).getTime();
        if (age < 7 * 24 * 3600 * 1000) {  // cours des 7 derniers jours
          newNotifs.push({
            id:    `course-${c.id}`,
            type:  'course',
            title: `Nouveau cours disponible`,
            sub:   `${c.title || 'Sans titre'} — ${c.teacher || ''}`,
            time:  c.created_at,
            nav:   'courses',
            color: '#2d8c4e',
            bg:    '#e8f5e8',
          });
        }
      });
    } catch {}

    // Trier par date décroissante
    newNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));
    setNotifs(newNotifs);
  };

  const unread = notifs.filter(n => !seenIds.has(n.id)).length;

  const markAllSeen = () => {
    const ids = new Set(notifs.map(n => n.id));
    setSeenIds(ids);
    localStorage.setItem('seen_notifs', JSON.stringify([...ids]));
  };

  const handleNotifClick = (notif) => {
    // Marquer comme vu
    const updated = new Set([...seenIds, notif.id]);
    setSeenIds(updated);
    localStorage.setItem('seen_notifs', JSON.stringify([...updated]));
    setShowDrop(false);
    if (onNav && notif.nav) onNav(notif.nav);
  };

  return (
    <div style={s.bar}>
      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <span style={s.breadcrumbBase}>ENT</span>
        <ChevronRight size={14} color="#bbc5dc" />
        <span style={s.breadcrumbCurrent}>{title}</span>
      </div>

      {/* Recherche */}
      <div style={{ ...s.search, borderColor: focused ? '#2e7bd4' : '#e8edf6' }}>
        <Search size={15} color={focused ? '#2e7bd4' : '#bbc5dc'} />
        <input
          style={s.searchInput}
          placeholder="Rechercher…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>

      <div style={s.date}>{now}</div>

      {/* Bouton notifications */}
      <div style={{ position: 'relative' }} ref={dropRef}>
        <button
          style={s.iconBtn}
          onClick={() => { setShowDrop(v => !v); if (!showDrop) markAllSeen(); }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f4f7fb'; e.currentTarget.style.color = '#1a4b8c'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7a8bb0'; }}
        >
          <Bell size={17} />
          {unread > 0 && (
            <span style={s.badge}>{unread > 9 ? '9+' : unread}</span>
          )}
        </button>

        {/* Dropdown notifications */}
        {showDrop && (
          <div style={s.dropdown}>
            <div style={s.dropHead}>
              <span style={s.dropTitle}>Notifications {notifs.length > 0 && `(${notifs.length})`}</span>
              <button style={s.dropClear} onClick={markAllSeen}>Tout marquer lu</button>
            </div>

            {notifs.length === 0 ? (
              <div style={s.emptyNotif}>
                <Bell size={28} style={{ opacity: 0.2, marginBottom: 8 }} />
                <div>Aucune notification</div>
              </div>
            ) : (
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifs.map(n => {
                  const isNew = !seenIds.has(n.id);
                  const Icon  = n.type === 'message' ? Mail : BookOpen;
                  return (
                    <div
                      key={n.id}
                      style={{ ...s.notifItem, background: isNew ? '#fafbff' : '#fff' }}
                      onClick={() => handleNotifClick(n)}
                      onMouseEnter={e => e.currentTarget.style.background = '#f4f7fb'}
                      onMouseLeave={e => e.currentTarget.style.background = isNew ? '#fafbff' : '#fff'}
                    >
                      <div style={{ ...s.notifIcon, background: n.bg, color: n.color }}>
                        <Icon size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={s.notifTitle}>{n.title}</div>
                        <div style={s.notifSub}>{n.sub}</div>
                        <div style={{ ...s.notifSub, marginTop: 3 }}>{formatAgo(n.time)}</div>
                      </div>
                      {isNew && <div style={s.notifDot} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Aide */}
      <button
        style={s.iconBtn}
        onMouseEnter={e => { e.currentTarget.style.background = '#f4f7fb'; e.currentTarget.style.color = '#1a4b8c'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7a8bb0'; }}
      >
        <HelpCircle size={17} />
      </button>
    </div>
  );
}
