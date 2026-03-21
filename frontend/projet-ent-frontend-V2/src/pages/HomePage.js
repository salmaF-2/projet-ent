import React, { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, Star, Calendar, Upload, Users,
  BarChart3, FileText, TrendingUp, Clock, ArrowRight,
  GraduationCap, Shield, Settings, AlertCircle,
} from 'lucide-react';
import { adminService, downloadService, uploadService } from '../services/api';

/* ─── STAT CARD ─────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color = '#1a4b8c' }) {
  return (
    <div
      style={{
        background: '#fff', borderRadius: 16, padding: '1.4rem 1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf6',
        display: 'flex', alignItems: 'center', gap: '1.1rem', transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {Icon && <Icon size={24} strokeWidth={1.8} />}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1.1 }}>
          {value === null || value === undefined ? '…' : value}
        </div>
        <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#2d3a52', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.76rem', color: '#9aaac8', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── SHARED STYLES ─────────────────────────────────────── */
const s = {
  welcome:    { marginBottom: '1.8rem' },
  wTitle:     { fontSize: '1.65rem', fontWeight: 800, color: '#0f2d57', marginBottom: 4 },
  wSub:       { color: '#7a8bb0', fontSize: '0.92rem' },
  stats4:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '1.8rem' },
  stats3:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '1.8rem' },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.4rem' },
  card:       { background: '#fff', borderRadius: 16, padding: '1.4rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf6' },
  cardTitle:  { fontSize: '0.95rem', fontWeight: 700, color: '#0f2d57', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  courseItem: { marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f0f4fb' },
  courseRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  courseName: { fontWeight: 600, fontSize: '0.9rem', color: '#1e2a3a' },
  courseCode: { fontSize: '0.74rem', color: '#9aaac8', fontWeight: 500, marginTop: 2 },
  coursePct:  { fontSize: '0.84rem', fontWeight: 700 },
  progressBg: { height: 5, borderRadius: 10, background: '#edf2fb', overflow: 'hidden' },
  eventRow:   { display: 'flex', gap: '0.9rem', padding: '0.65rem 0', borderBottom: '1px solid #f0f4fb', alignItems: 'center' },
  eventDate:  { minWidth: 48, textAlign: 'center', borderRadius: 9, padding: '0.3rem 0.5rem', fontSize: '0.72rem', fontWeight: 700 },
  eventTitle: { fontSize: '0.88rem', fontWeight: 600, color: '#1e2a3a' },
  eventType:  { fontSize: '0.73rem', color: '#9aaac8', marginTop: 2 },
  quickBtn:   {
    display: 'flex', alignItems: 'center', gap: '0.7rem',
    padding: '0.9rem 1.2rem', borderRadius: 12, border: 'none',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
    width: '100%', marginBottom: '0.6rem', transition: 'all 0.18s',
  },
  adminCard:  { background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #e8edf6', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  adminVal:   { fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1 },
  adminLabel: { fontSize: '0.85rem', color: '#9aaac8', marginTop: 4 },
  emptyBox:   { textAlign: 'center', padding: '2rem', color: '#9aaac8', background: '#f8fafd', borderRadius: 12, border: '1px dashed #d0daf5' },
};

const STRIPE_COLORS = ['#1a4b8c', '#2d8c4e', '#c8a830', '#e05c2a', '#7c3aed', '#0d9488'];

const EVENTS = [
  { date: '20 Mar', title: 'Examen INF301',        type: 'Examen', color: '#e53e3e' },
  { date: '22 Mar', title: 'TP Développement Web', type: 'TP',     color: '#2d8c4e' },
  { date: '25 Mar', title: 'Rendu Projet BD',       type: 'Projet', color: '#c8a830' },
  { date: '28 Mar', title: 'Cours Réseaux – Ch.5', type: 'Cours',  color: '#1a4b8c' },
];

/* ─── STUDENT DASHBOARD ─────────────────────────────────── */
function StudentDashboard({ user, onNav }) {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Étudiant';

  useEffect(() => {
    downloadService.getAllCourses()
      .then(data => setCourses(data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div>
      <div style={s.welcome}>
        <div style={s.wTitle}>Bonjour, {firstName} 👋</div>
        <div style={s.wSub}>Bienvenue sur votre espace numérique – EST Salé · Étudiant</div>
      </div>

      <div style={s.stats4}>
        <StatCard icon={BookOpen}    label="Cours disponibles"  value={loadingCourses ? '…' : courses.length} sub="Semestre en cours"  color="#1a4b8c" />
        <StatCard icon={CheckCircle} label="Devoirs rendus"     value="—"   sub="À venir"             color="#2d8c4e" />
        <StatCard icon={Star}        label="Moyenne générale"   value="—"   sub="À venir"             color="#c8a830" />
        <StatCard icon={Calendar}    label="Prochains examens"  value={EVENTS.filter(e => e.type === 'Examen').length} sub="Calendrier" color="#e53e3e" />
      </div>

      <div style={s.twoCol}>
        {/* Cours réels */}
        <div style={s.card}>
          <div style={s.cardTitle}><BookOpen size={18} color="#1a4b8c" />Cours disponibles</div>
          {loadingCourses ? (
            <div style={s.emptyBox}>Chargement des cours…</div>
          ) : courses.length === 0 ? (
            <div style={s.emptyBox}>Aucun cours déposé pour le moment.</div>
          ) : (
            courses.slice(0, 5).map((c, i) => {
              const color = STRIPE_COLORS[i % STRIPE_COLORS.length];
              return (
                <div key={c.id || i} style={i === Math.min(courses.length, 5) - 1
                  ? { ...s.courseItem, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }
                  : s.courseItem}>
                  <div style={s.courseRow}>
                    <div>
                      <div style={s.courseName}>{c.title || 'Sans titre'}</div>
                      <div style={s.courseCode}>
                        {c.teacher || c.teacher_name || 'Enseignant'}{c.file_name ? ` · ${c.file_name}` : ''}
                      </div>
                    </div>
                    <div style={{ ...s.coursePct, color }}>{c.file_name ? '📄' : '—'}</div>
                  </div>
                  <div style={s.progressBg}>
                    <div style={{ width: '100%', height: '100%', background: color, borderRadius: 10 }} />
                  </div>
                </div>
              );
            })
          )}
          {courses.length > 5 && (
            <button
              onClick={() => onNav('courses')}
              style={{ marginTop: '0.8rem', width: '100%', padding: '0.6rem', borderRadius: 10, border: '1.5px dashed #d0daf5', background: 'transparent', color: '#2e7bd4', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              Voir tous les {courses.length} cours <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Événements */}
        <div style={s.card}>
          <div style={s.cardTitle}><Calendar size={18} color="#1a4b8c" />Événements à venir</div>
          {EVENTS.map((ev, i) => (
            <div key={i} style={{ ...s.eventRow, ...(i === EVENTS.length - 1 ? { borderBottom: 'none' } : {}) }}>
              <div style={{ ...s.eventDate, background: `${ev.color}18`, color: ev.color }}>{ev.date}</div>
              <div>
                <div style={s.eventTitle}>{ev.title}</div>
                <div style={s.eventType}>{ev.type}</div>
              </div>
            </div>
          ))}
          <button
            onClick={() => onNav('courses')}
            style={{ marginTop: '1rem', width: '100%', padding: '0.65rem', borderRadius: 10, border: '1.5px dashed #d0daf5', background: 'transparent', color: '#2e7bd4', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            Accéder à mes cours <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TEACHER DASHBOARD ─────────────────────────────────── */
function TeacherDashboard({ user, onNav }) {
  const [allCourses,  setAllCourses]  = useState([]);
  const [loadCourses, setLoadCourses] = useState(true);
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Enseignant';

  useEffect(() => {
    downloadService.getAllCourses()
      .then(data => setAllCourses(data || []))
      .catch(() => setAllCourses([]))
      .finally(() => setLoadCourses(false));
  }, []);

  // Compter par type de cours (basé sur le champ title)
  const countByType = allCourses.reduce((acc, c) => {
    const type = (c.title || 'autre').toLowerCase().trim();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  // Mes cours = ceux uploadés par cet enseignant
  const myCourses = allCourses.filter(c =>
    (c.teacher || c.teacher_name || '').toLowerCase() === (user?.username || '').toLowerCase()
  );

  const totalFiles = allCourses.filter(c => c.file_name).length;

  const TYPE_COLORS = {
    tp:     '#1a4b8c',
    td:     '#2d8c4e',
    cours:  '#c8a830',
    exam:   '#e53e3e',
    projet: '#7c3aed',
    autre:  '#718096',
  };

  return (
    <div>
      <div style={s.welcome}>
        <div style={s.wTitle}>Bonjour, {firstName} 👋</div>
        <div style={s.wSub}>Gérez vos cours et ressources pédagogiques – Espace Enseignant</div>
      </div>

      {/* Stats principales */}
      <div style={s.stats3}>
        <StatCard icon={BookOpen}      label="Cours sur la plateforme" value={loadCourses ? '…' : allCourses.length}  sub="Tous enseignants"  color="#1a4b8c" />
        <StatCard icon={GraduationCap} label="Mes cours déposés"       value={loadCourses ? '…' : myCourses.length}   sub={`Par ${user?.username}`} color="#2d8c4e" />
        <StatCard icon={FileText}      label="Fichiers disponibles"    value={loadCourses ? '…' : totalFiles}          sub="PDF, PPT, ZIP…"   color="#c8a830" />
      </div>

      <div style={s.twoCol}>
        {/* Répartition par type */}
        <div style={s.card}>
          <div style={s.cardTitle}><BarChart3 size={18} color="#1a4b8c" />Répartition par type de cours</div>

          {loadCourses ? (
            <div style={s.emptyBox}>Chargement…</div>
          ) : Object.keys(countByType).length === 0 ? (
            <div style={s.emptyBox}>Aucun cours déposé pour le moment.</div>
          ) : (
            Object.entries(countByType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count], i) => {
                const color = TYPE_COLORS[type] || STRIPE_COLORS[i % STRIPE_COLORS.length];
                const pct   = Math.round((count / allCourses.length) * 100);
                return (
                  <div key={type} style={i === Object.keys(countByType).length - 1
                    ? { ...s.courseItem, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }
                    : s.courseItem}>
                    <div style={s.courseRow}>
                      <div>
                        <div style={{ ...s.courseName, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{type}</div>
                        <div style={s.courseCode}>{count} fichier{count > 1 ? 's' : ''} déposé{count > 1 ? 's' : ''}</div>
                      </div>
                      <div style={{ ...s.coursePct, color }}>{count}</div>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })
          )}

          {/* Liste des cours réels */}
          {allCourses.length > 0 && (
            <div style={{ marginTop: '1.2rem', padding: '1rem', background: '#f8fafd', borderRadius: 12, border: '1px solid #e8edf6' }}>
              <div style={{ fontWeight: 700, color: '#0f2d57', fontSize: '0.85rem', marginBottom: 8 }}>
                📋 Détail des cours
              </div>
              {allCourses.map((c, i) => (
                <div key={c.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', borderBottom: i < allCourses.length - 1 ? '1px solid #f0f4fb' : 'none', fontSize: '0.83rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${TYPE_COLORS[(c.title||'').toLowerCase()] || '#1a4b8c'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TYPE_COLORS[(c.title||'').toLowerCase()] || '#1a4b8c', flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {(c.title || '?').slice(0, 2)}
                  </div>
                  <span style={{ flex: 1, color: '#2d3a52', fontWeight: 500 }}>{c.file_name || 'Sans fichier'}</span>
                  <span style={{ color: '#9aaac8', fontSize: '0.76rem' }}>{c.teacher || c.teacher_name || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div style={s.card}>
          <div style={s.cardTitle}><TrendingUp size={18} color="#1a4b8c" />Actions rapides</div>
          <button onClick={() => onNav('upload')} style={{ ...s.quickBtn, background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Upload size={18} />Déposer un nouveau cours
          </button>
          <button onClick={() => onNav('courses')} style={{ ...s.quickBtn, background: '#f0f7ff', color: '#1a4b8c', border: '1px solid #d0daf5' }}>
            <BookOpen size={18} />Voir tous les cours ({loadCourses ? '…' : allCourses.length})
          </button>
          <button onClick={() => onNav('ai')} style={{ ...s.quickBtn, background: '#f0fff4', color: '#2d8c4e', border: '1px solid #c3e6cd' }}>
            <Star size={18} />Assistant IA pédagogique
          </button>

          {/* Résumé par type */}
          {!loadCourses && Object.keys(countByType).length > 0 && (
            <div style={{ marginTop: '1.2rem', padding: '1rem', background: '#f8fafd', borderRadius: 12, border: '1px solid #e8edf6' }}>
              <div style={{ fontWeight: 700, color: '#0f2d57', fontSize: '0.85rem', marginBottom: 8 }}>
                📊 Résumé
              </div>
              {Object.entries(countByType).map(([type, count]) => {
                const color = TYPE_COLORS[type] || '#718096';
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0', fontSize: '0.84rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                      <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#4a5878' }}>{type}</span>
                    </span>
                    <span style={{ fontWeight: 700, color }}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN DASHBOARD ───────────────────────────────────── */
const ADMIN_SHORTCUTS = [
  { icon: Users,     label: 'Gérer les utilisateurs', key: 'users',   color: '#1a4b8c', bg: '#e3f2fd' },
  { icon: BookOpen,  label: 'Consulter les cours',    key: 'courses', color: '#2d8c4e', bg: '#e8f5e8' },
  { icon: BarChart3, label: 'Voir les statistiques',  key: 'stats',   color: '#c8a830', bg: '#fef3c7' },
  { icon: Settings,  label: 'Configuration système',  key: 'config',  color: '#7c3aed', bg: '#ede9fe' },
];

function AdminDashboard({ user, onNav }) {
  const [stats,       setStats]       = useState(null);
  const [courses,     setCourses]     = useState([]);
  const [loadStats,   setLoadStats]   = useState(true);
  const [loadCourses, setLoadCourses] = useState(true);
  const [errorStats,  setErrorStats]  = useState(false);
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Admin';

  useEffect(() => {
    // Stats utilisateurs depuis ms-admin
    adminService.getStats()
      .then(data => setStats(data))
      .catch(() => setErrorStats(true))
      .finally(() => setLoadStats(false));

    // Cours depuis ms-download
    downloadService.getAllCourses()
      .then(data => setCourses(data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoadCourses(false));
  }, []);

  const total     = stats?.total_users ?? stats?.total ?? null;
  const nbStudent = stats
    ? (stats.by_role?.student ?? 0) + (stats.by_role?.etudiant ?? 0)
    : null;
  const nbTeacher = stats
    ? (stats.by_role?.teacher ?? 0) + (stats.by_role?.enseignant ?? 0)
    : null;
  const nbAdmin   = stats?.by_role?.admin ?? null;

  return (
    <div>
      <div style={s.welcome}>
        <div style={s.wTitle}>Tableau de bord Admin 🛡️</div>
        <div style={s.wSub}>Bonjour {firstName} – Gestion de la plateforme ENT EST Salé</div>
      </div>

      {/* Stats utilisateurs réelles */}
      {errorStats && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffebee', border: '1px solid #fecaca', borderRadius: 10, padding: '0.7rem 1rem', marginBottom: '1.2rem', fontSize: '0.85rem', color: '#c62828' }}>
          <AlertCircle size={16} />
          Impossible de charger les statistiques (ms-admin port 8004).
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '1.8rem' }}>
        {[
          { label: 'Total utilisateurs',  icon: Users,         color: '#1a4b8c', value: loadStats ? '…' : (total     ?? '—') },
          { label: 'Étudiants',           icon: GraduationCap, color: '#2e7bd4', value: loadStats ? '…' : (nbStudent ?? '—') },
          { label: 'Enseignants',         icon: BookOpen,      color: '#2d8c4e', value: loadStats ? '…' : (nbTeacher ?? '—') },
          { label: 'Cours déposés',       icon: FileText,      color: '#c8a830', value: loadCourses ? '…' : courses.length },
        ].map(st => {
          const Icon = st.icon;
          return (
            <div key={st.label} style={s.adminCard}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${st.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.color }}>
                  <Icon size={24} />
                </div>
              </div>
              <div style={{ ...s.adminVal, color: st.color }}>{st.value}</div>
              <div style={s.adminLabel}>{st.label}</div>
            </div>
          );
        })}
      </div>

      <div style={s.twoCol}>
        {/* Accès rapide */}
        <div style={s.card}>
          <div style={s.cardTitle}><BarChart3 size={18} color="#1a4b8c" />Accès rapide</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            {ADMIN_SHORTCUTS.map(sc => {
              const Icon = sc.icon;
              return (
                <button key={sc.key} onClick={() => onNav(sc.key)}
                  style={{ padding: '1.2rem', borderRadius: 14, border: `1.5px solid ${sc.bg}`, background: sc.bg, cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <Icon size={22} color={sc.color} />
                  <div style={{ fontSize: '0.87rem', fontWeight: 600, color: sc.color }}>{sc.label}</div>
                </button>
              );
            })}
          </div>

          {/* Résumé cours */}
          {courses.length > 0 && (
            <div style={{ marginTop: '1.2rem', padding: '1rem', background: '#f8fafd', borderRadius: 12, border: '1px solid #e8edf6' }}>
              <div style={{ fontWeight: 700, color: '#0f2d57', fontSize: '0.88rem', marginBottom: 8 }}>
                📚 Derniers cours déposés
              </div>
              {courses.slice(0, 3).map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', borderBottom: i < 2 ? '1px solid #f0f4fb' : 'none', fontSize: '0.83rem' }}>
                  <FileText size={13} color="#9aaac8" />
                  <span style={{ flex: 1, color: '#2d3a52', fontWeight: 500 }}>{c.title || 'Sans titre'}</span>
                  <span style={{ color: '#9aaac8', fontSize: '0.76rem' }}>{c.teacher || c.teacher_name || '—'}</span>
                </div>
              ))}
              {courses.length > 3 && (
                <button onClick={() => onNav('courses')} style={{ marginTop: '0.6rem', width: '100%', padding: '0.45rem', borderRadius: 8, border: '1px dashed #d0daf5', background: 'transparent', color: '#2e7bd4', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  Voir tous les {courses.length} cours →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div style={s.card}>
          <div style={s.cardTitle}><Clock size={18} color="#1a4b8c" />Activité récente</div>
          {[
            { action: 'Plateforme ENT active',           time: "Aujourd'hui",color: '#2d8c4e' },
            { action: `${loadStats ? '…' : (total ?? 0)} utilisateurs enregistrés`, time: 'Total',      color: '#1a4b8c' },
            { action: `${loadCourses ? '…' : courses.length} cours disponibles`, time: 'Plateforme', color: '#c8a830' },
            { action: `${loadStats ? '…' : (nbTeacher ?? 0)} enseignants actifs`, time: 'Inscrits',   color: '#2d8c4e' },
            { action: `${loadStats ? '…' : (nbStudent ?? 0)} étudiants inscrits`, time: 'Inscrits',   color: '#2e7bd4' },
          ].map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: i < 4 ? '1px solid #f0f4fb' : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: act.color, flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.87rem', color: '#2d3a52' }}>{act.action}</div>
              <div style={{ fontSize: '0.74rem', color: '#bbc5dc', whiteSpace: 'nowrap' }}>{act.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── EXPORT ─────────────────────────────────────────────── */
export default function HomePage({ user, onNav = () => {} }) {
  if (!user) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#9aaac8' }}>Chargement...</div>
  );

  const role = user.role || 'etudiant';
  if (role === 'admin')      return <AdminDashboard   user={user} onNav={onNav} />;
  if (role === 'enseignant') return <TeacherDashboard user={user} onNav={onNav} />;
  return <StudentDashboard user={user} onNav={onNav} />;
}
