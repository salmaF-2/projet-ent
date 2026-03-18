import React from 'react';
import {
  BookOpen, CheckCircle, Star, Calendar, Upload, Users,
  BarChart3, FileText, TrendingUp, Clock, ArrowRight,
  GraduationCap, Shield, Settings,
} from 'lucide-react';

/* ─── STAT CARD ────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, color = '#1a4b8c' }) {
  return (
    <div
      style={{
        background: '#fff', borderRadius: 16, padding: '1.4rem 1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf6',
        display: 'flex', alignItems: 'center', gap: '1.1rem',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
    >
      <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {Icon && <Icon size={24} strokeWidth={1.8} />}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.87rem', fontWeight: 600, color: '#2d3a52', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.76rem', color: '#9aaac8', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── SHARED STYLES ─────────────────────────────────────── */
const s = {
  welcome: { marginBottom: '1.8rem' },
  wTitle:  { fontSize: '1.65rem', fontWeight: 800, color: '#0f2d57', marginBottom: 4 },
  wSub:    { color: '#7a8bb0', fontSize: '0.92rem' },
  stats4:  { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '1.8rem' },
  stats3:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem', marginBottom: '1.8rem' },
  twoCol:  { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.4rem' },
  card:    { background: '#fff', borderRadius: 16, padding: '1.4rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e8edf6' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0f2d57', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
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
};

/* ─── STUDENT DASHBOARD ─────────────────────────────────── */
const STUDENT_COURSES = [
  { code: 'INF301', name: 'Architecture Distribuée',  teacher: 'Prof. Mourad', progress: 68, color: '#1a4b8c' },
  { code: 'INF302', name: 'Développement Web',        teacher: 'Prof. Khadija', progress: 82, color: '#2d8c4e' },
  { code: 'INF303', name: 'Bases de Données',         teacher: 'Prof. Youssef', progress: 45, color: '#c8a830' },
  { code: 'INF304', name: 'Réseaux & Sécurité',       teacher: 'Prof. Laila',   progress: 91, color: '#e05c2a' },
];

const EVENTS = [
  { date: '20 Mar', title: 'Examen INF301',         type: 'Examen',  color: '#e53e3e' },
  { date: '22 Mar', title: 'TP Développement Web',  type: 'TP',      color: '#2d8c4e' },
  { date: '25 Mar', title: 'Rendu Projet BD',        type: 'Projet',  color: '#c8a830' },
  { date: '28 Mar', title: 'Cours Réseaux – Ch.5',  type: 'Cours',   color: '#1a4b8c' },
];

function StudentDashboard({ user, onNav }) {
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Étudiant';
  return (
    <div>
      <div style={s.welcome}>
        <div style={s.wTitle}>Bonjour, {firstName} 👋</div>
        <div style={s.wSub}>Bienvenue sur votre espace numérique – EST Salé · Étudiant</div>
      </div>

      <div style={s.stats4}>
        <StatCard icon={BookOpen}    label="Cours actifs"       value="8"    sub="Semestre 3"        color="#1a4b8c" />
        <StatCard icon={CheckCircle} label="Devoirs rendus"     value="12"   sub="Sur 15 au total"   color="#2d8c4e" />
        <StatCard icon={Star}        label="Moyenne générale"   value="14.2" sub="/20 ce semestre"   color="#c8a830" />
        <StatCard icon={Calendar}    label="Prochains examens"  value="3"    sub="Dans 7 jours"      color="#e53e3e" />
      </div>

      <div style={s.twoCol}>
        {/* Progression */}
        <div style={s.card}>
          <div style={s.cardTitle}><BookOpen size={18} color="#1a4b8c" />Progression des cours</div>
          {STUDENT_COURSES.map((c, i) => (
            <div key={c.code} style={i === STUDENT_COURSES.length - 1
              ? { ...s.courseItem, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }
              : s.courseItem}>
              <div style={s.courseRow}>
                <div>
                  <div style={s.courseName}>{c.name}</div>
                  <div style={s.courseCode}>{c.code} · {c.teacher}</div>
                </div>
                <div style={{ ...s.coursePct, color: c.color }}>{c.progress}%</div>
              </div>
              <div style={s.progressBg}>
                <div style={{ width: `${c.progress}%`, height: '100%', background: c.color, borderRadius: 10, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
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
const TEACHER_COURSES = [
  { code: 'INF301', name: 'Architecture Distribuée', students: 145, files: 8,  lastUpdate: '02/03/2025' },
  { code: 'INF304', name: 'Réseaux & Sécurité',      students: 120, files: 10, lastUpdate: '07/03/2025' },
  { code: 'INF305', name: 'Cloud Computing',          students: 98,  files: 6,  lastUpdate: '09/03/2025' },
];

function TeacherDashboard({ user, onNav }) {
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Enseignant';
  return (
    <div>
      <div style={s.welcome}>
        <div style={s.wTitle}>Bonjour, {firstName} 👋</div>
        <div style={s.wSub}>Gérez vos cours et ressources pédagogiques – Espace Enseignant</div>
      </div>

      <div style={s.stats3}>
        <StatCard icon={BookOpen}      label="Cours publiés"      value={TEACHER_COURSES.length} sub="Actifs ce semestre"   color="#1a4b8c" />
        <StatCard icon={GraduationCap} label="Étudiants inscrits" value="363"                    sub="Tous cours confondus" color="#2d8c4e" />
        <StatCard icon={FileText}      label="Fichiers déposés"   value="24"                     sub="PDF, PPT, ZIP"        color="#c8a830" />
      </div>

      <div style={s.twoCol}>
        {/* Liste cours */}
        <div style={s.card}>
          <div style={s.cardTitle}><BookOpen size={18} color="#1a4b8c" />Mes cours publiés</div>
          {TEACHER_COURSES.map(c => (
            <div
              key={c.code}
              style={{ border: '1px solid #e8edf6', borderRadius: 14, padding: '1rem 1.2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.18s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a4b8c' }}>
                <BookOpen size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1e2a3a', fontSize: '0.92rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#9aaac8', marginTop: 3 }}>
                  {c.code} · {c.students} étudiants · {c.files} fichiers
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#bbc5dc' }}>Mis à jour le {c.lastUpdate}</div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div style={s.card}>
          <div style={s.cardTitle}><TrendingUp size={18} color="#1a4b8c" />Actions rapides</div>
          <button onClick={() => onNav('upload')} style={{ ...s.quickBtn, background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Upload size={18} />Déposer un nouveau cours
          </button>
          <button onClick={() => onNav('courses')} style={{ ...s.quickBtn, background: '#f0f7ff', color: '#1a4b8c', border: '1px solid #d0daf5' }}>
            <BookOpen size={18} />Voir tous les cours
          </button>
          <button onClick={() => onNav('ai')} style={{ ...s.quickBtn, background: '#f0fff4', color: '#2d8c4e', border: '1px solid #c3e6cd' }}>
            <Star size={18} />Assistant IA pédagogique
          </button>
          <div style={{ marginTop: '1.2rem', padding: '1rem', background: '#fffbea', borderRadius: 12, border: '1px solid #f5d87a' }}>
            <div style={{ fontWeight: 700, color: '#92660d', fontSize: '0.88rem', marginBottom: 4 }}>💡 Astuce</div>
            <div style={{ fontSize: '0.82rem', color: '#b07a18', lineHeight: 1.6 }}>
              Déposez vos cours en PDF ou ZIP. Les étudiants peuvent les télécharger directement depuis leur espace.
            </div>
          </div>
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
  const firstName = user?.name?.split(' ')[0] || user?.username || 'Admin';
  return (
    <div>
      <div style={s.welcome}>
        <div style={s.wTitle}>Tableau de bord Admin 🛡️</div>
        <div style={s.wSub}>Bonjour {firstName} – Gestion de la plateforme ENT EST Salé</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '1.8rem' }}>
        {[
          { label: 'Total utilisateurs', icon: Users,        color: '#1a4b8c' },
          { label: 'Étudiants',          icon: GraduationCap, color: '#2e7bd4' },
          { label: 'Enseignants',        icon: BookOpen,      color: '#2d8c4e' },
          { label: 'Administrateurs',    icon: Shield,        color: '#e53e3e' },
        ].map(st => {
          const Icon = st.icon;
          return (
            <div key={st.label} style={s.adminCard}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${st.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.color }}>
                  <Icon size={24} />
                </div>
              </div>
              <div style={{ ...s.adminVal, color: st.color }}>—</div>
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
        </div>

        {/* Activité */}
        <div style={s.card}>
          <div style={s.cardTitle}><Clock size={18} color="#1a4b8c" />Activité récente</div>
          {[
            { action: 'Nouvel étudiant créé',         time: 'Il y a 2h',  color: '#2d8c4e' },
            { action: 'Cours INF301 mis à jour',       time: 'Il y a 4h',  color: '#1a4b8c' },
            { action: 'Enseignant modifié',            time: 'Hier',       color: '#c8a830' },
            { action: 'Backup base de données',        time: 'Hier 23:00', color: '#7c3aed' },
            { action: 'Connexion admin enregistrée',   time: "Aujourd'hui",color: '#e53e3e' },
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
    <div style={{ textAlign: 'center', padding: '3rem', color: '#9aaac8' }}>
      Chargement...
    </div>
  );

  const role = user.role || 'etudiant';
  if (role === 'admin')      return <AdminDashboard   user={user} onNav={onNav} />;
  if (role === 'enseignant') return <TeacherDashboard user={user} onNav={onNav} />;
  return <StudentDashboard user={user} onNav={onNav} />;
}

