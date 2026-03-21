import React, { useState, useEffect } from 'react';
import { downloadService } from '../services/api';
import { BookOpen, Download, Search, FileText, User, Clock, X, Filter, AlertCircle } from 'lucide-react';

const FILE_INFO = {
  pdf:  { icon: '📄', color: '#e53e3e', bg: '#ffebee' },
  ppt:  { icon: '📊', color: '#dd6b20', bg: '#fff3e0' },
  pptx: { icon: '📊', color: '#dd6b20', bg: '#fff3e0' },
  zip:  { icon: '🗜️', color: '#d69e2e', bg: '#fef3c7' },
  rar:  { icon: '🗜️', color: '#d69e2e', bg: '#fef3c7' },
  doc:  { icon: '📝', color: '#2b6cb0', bg: '#e3f2fd' },
  docx: { icon: '📝', color: '#2b6cb0', bg: '#e3f2fd' },
  mp4:  { icon: '🎬', color: '#7c3aed', bg: '#ede9fe' },
  txt:  { icon: '📃', color: '#059669', bg: '#d1fae5' },
};

const STRIPE_COLORS = [
  'linear-gradient(90deg,#1a4b8c,#2e7bd4)',
  'linear-gradient(90deg,#2d8c4e,#4ade80)',
  'linear-gradient(90deg,#c8a830,#f5d87a)',
  'linear-gradient(90deg,#e05c2a,#fb923c)',
  'linear-gradient(90deg,#7c3aed,#a78bfa)',
  'linear-gradient(90deg,#0d9488,#5eead4)',
];

const s = {
  container:   { padding: '1rem' },
  topBar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title:       { fontSize: '1.4rem', fontWeight: 700, color: '#0f2d57' },
  sub:         { fontSize: '0.83rem', color: '#9aaac8', marginTop: 2 },
  searchBox:   { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.55rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6', width: 280 },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1, background: 'none' },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard:    { background: '#fff', borderRadius: 14, padding: '1.1rem 1.3rem', border: '1px solid #e8edf6', display: 'flex', alignItems: 'center', gap: '0.9rem' },
  statIcon:    { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem' },
  card:        { background: '#fff', borderRadius: 16, border: '1px solid #e8edf6', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.22s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  cardBody:    { padding: '1.2rem 1.4rem' },
  cardTitle:   { fontSize: '1rem', fontWeight: 700, color: '#1e2a3a', marginBottom: 6, lineHeight: 1.35 },
  cardTeacher: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#7a8bb0', marginBottom: 8 },
  cardDesc:    { fontSize: '0.83rem', color: '#9aaac8', lineHeight: 1.6, marginBottom: 12 },
  cardMeta:    { display: 'flex', gap: '1rem', borderTop: '1px solid #f0f4fb', paddingTop: 12, fontSize: '0.79rem', color: '#bbc5dc' },
  modal:       { position: 'fixed', inset: 0, background: 'rgba(9,20,40,0.55)', backdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  modalBox:    { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' },
  modalHead:   { padding: '1.4rem 1.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f0f4fb' },
  modalTitle:  { fontSize: '1.1rem', fontWeight: 800, color: '#0f2d57' },
  modalSub:    { fontSize: '0.82rem', color: '#9aaac8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 },
  closeBtn:    { width: 32, height: 32, borderRadius: 9, border: '1px solid #e8edf6', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a8bb0' },
  fileItem:    { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.6rem', transition: 'background 0.15s' },
  fileIcon:    { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  dlBtn:       { padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#e3f2fd', color: '#1a4b8c', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'background 0.15s', whiteSpace: 'nowrap' },
  loading:     { textAlign: 'center', padding: '4rem', color: '#9aaac8' },
  empty:       { textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 16, border: '1px dashed #d0daf5' },
  noFile:      { padding: '1.5rem', textAlign: 'center', color: '#9aaac8', fontSize: '0.88rem' },
  errorBox:    { background: '#ffebee', border: '1px solid #fecaca', borderRadius: 12, padding: '1.5rem', textAlign: 'center', color: '#c62828', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' },
  retryBtn:    { padding: '0.6rem 1.4rem', background: '#1a4b8c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' },
};

export default function CoursesPage() {
  const [courses,     setCourses]     = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [search,      setSearch]      = useState('');
  const [selected,    setSelected]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error,       setError]       = useState(null);

  useEffect(() => { loadCourses(); }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(!term ? courses : courses.filter(c =>
      c.title.toLowerCase().includes(term) ||
      (c.teacher || '').toLowerCase().includes(term)
    ));
  }, [search, courses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await downloadService.getAllCourses();

      // Normaliser les champs selon ce que retourne ms-download
      const normalized = data.map(c => ({
        ...c,
        id:      c.id          || c.course_id,
        teacher: c.teacher     || c.teacher_name || 'Enseignant non renseigné',
        title:   c.title       || 'Sans titre',
        description: c.description || '',
      }));

      setCourses(normalized);
      setFiltered(normalized);
    } catch (err) {
      console.error('Erreur chargement cours:', err);
      setError('Impossible de charger les cours. Vérifiez que ms-download est actif (port 8003).');
      setCourses([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (courseId, fileName) => {
    if (!courseId) { alert('ID du cours manquant.'); return; }
    try {
      setDownloading(true);
      const data = await downloadService.getDownloadLink(courseId);
      const link = document.createElement('a');
      link.href     = data.download_url;
      link.target   = '_blank';
      link.download = fileName || data.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erreur téléchargement:', err);
      alert('Erreur lors du téléchargement. Vérifiez que ms-download est actif (port 8003).');
    } finally {
      setDownloading(false);
    }
  };

  const getFileInfo = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    return FILE_INFO[ext] || { icon: '📁', color: '#718096', bg: '#edf2f7' };
  };

  // ── Chargement ──
  if (loading) return (
    <div style={s.loading}>
      <Clock size={36} style={{ marginBottom: 14 }} />
      <div style={{ fontWeight: 600, color: '#4a5878' }}>Chargement des cours…</div>
      <div style={{ fontSize: '0.82rem', marginTop: 6 }}>Connexion à ms-download (port 8003)</div>
    </div>
  );

  // ── Erreur service ──
  if (error) return (
    <div style={{ padding: '1rem' }}>
      <div style={s.errorBox}>
        <AlertCircle size={40} />
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>Service indisponible</div>
        <div style={{ fontSize: '0.88rem', maxWidth: 380, lineHeight: 1.6 }}>{error}</div>
        <button style={s.retryBtn} onClick={loadCourses}>Réessayer</button>
      </div>
    </div>
  );

  return (
    <div style={s.container}>

      {/* Header */}
      <div style={s.topBar}>
        <div>
          <div style={s.title}>Mes Cours</div>
          <div style={s.sub}>{courses.length} cours disponibles</div>
        </div>
        <div style={s.searchBox}>
          <Search size={16} color="#bbc5dc" />
          <input
            style={s.searchInput}
            placeholder="Filtrer les cours…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <X size={14} color="#bbc5dc" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
          )}
        </div>
      </div>

      {/* Stats réelles */}
      <div style={s.statsRow}>
        {[
          { icon: BookOpen, label: 'Cours disponibles', value: courses.length,                              color: '#1a4b8c', bg: '#e3f2fd' },
          { icon: FileText, label: 'Fichiers joints',   value: courses.filter(c => c.file_name).length,    color: '#2d8c4e', bg: '#e8f5e8' },
          { icon: User,     label: 'Enseignants',       value: [...new Set(courses.map(c => c.teacher))].length, color: '#c8a830', bg: '#fef3c7' },
        ].map(st => {
          const Icon = st.icon;
          return (
            <div key={st.label} style={s.statCard}>
              <div style={{ ...s.statIcon, background: st.bg, color: st.color }}><Icon size={22} /></div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: st.color }}>{st.value}</div>
                <div style={{ fontSize: '0.82rem', color: '#9aaac8' }}>{st.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aucun cours */}
      {courses.length === 0 ? (
        <div style={s.empty}>
          <BookOpen size={48} color="#d0daf5" style={{ marginBottom: 14 }} />
          <div style={{ fontWeight: 700, color: '#7a8bb0', marginBottom: 6 }}>Aucun cours disponible</div>
          <div style={{ fontSize: '0.85rem', color: '#bbc5dc' }}>
            Les enseignants n'ont pas encore déposé de cours.
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <Filter size={40} color="#d0daf5" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 600, color: '#7a8bb0' }}>Aucun cours correspond à votre recherche</div>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((c, i) => (
            <div
              key={c.id || i}
              style={s.card}
              onClick={() => setSelected(c)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none';             e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
            >
              <div style={{ height: 4, background: STRIPE_COLORS[i % STRIPE_COLORS.length] }} />
              <div style={s.cardBody}>
                <div style={s.cardTitle}>{c.title}</div>
                <div style={s.cardTeacher}><User size={13} />{c.teacher}</div>
                {c.description && (
                  <div style={s.cardDesc}>{c.description}</div>
                )}
                <div style={s.cardMeta}>
                  <span>
                    <FileText size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                    {c.file_name || 'Fichier disponible'}
                  </span>
                  {c.created_at && (
                    <span>
                      <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal fichier */}
      {selected && (
        <div style={s.modal} onClick={() => setSelected(null)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>

            <div style={s.modalHead}>
              <div>
                <div style={s.modalTitle}>{selected.title}</div>
                <div style={s.modalSub}>
                  <User size={13} />{selected.teacher}
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div>
              <div style={{ padding: '0.9rem 1.6rem 0.5rem', fontSize: '0.76rem', fontWeight: 700, color: '#bbc5dc', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Fichier disponible
              </div>

              {selected.file_name ? (
                <div
                  style={s.fileItem}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafd'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    ...s.fileIcon,
                    background: getFileInfo(selected.file_name).bg,
                    color:      getFileInfo(selected.file_name).color,
                  }}>
                    {getFileInfo(selected.file_name).icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1e2a3a' }}>
                      {selected.file_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#bbc5dc', marginTop: 2 }}>
                      {selected.file_size
                        ? `${(selected.file_size / 1024 / 1024).toFixed(2)} MB`
                        : 'Taille non disponible'
                      }
                      {selected.created_at && ` · Déposé le ${new Date(selected.created_at).toLocaleDateString('fr-FR')}`}
                    </div>
                  </div>
                  <button
                    style={s.dlBtn}
                    onClick={e => { e.stopPropagation(); handleDownload(selected.id, selected.file_name); }}
                    disabled={downloading}
                    onMouseEnter={e => e.currentTarget.style.background = '#bbdefb'}
                    onMouseLeave={e => e.currentTarget.style.background = '#e3f2fd'}
                  >
                    <Download size={14} />
                    {downloading ? 'Téléchargement…' : 'Télécharger'}
                  </button>
                </div>
              ) : (
                <div style={s.noFile}>
                  Aucun fichier disponible pour ce cours.
                </div>
              )}

              {selected.description && (
                <div style={{ padding: '0.8rem 1.6rem 1.2rem', fontSize: '0.85rem', color: '#7a8bb0', lineHeight: 1.6, borderTop: '1px solid #f0f4fb' }}>
                  {selected.description}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
