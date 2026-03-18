import React, { useState, useRef, useEffect } from 'react';
import { uploadService } from '../services/api';
import { Upload, BookOpen, Trash2, CheckCircle, AlertCircle, FileText, X, Plus, Clock } from 'lucide-react';

const s = {
  container: { padding: '1rem' },
  title:     { fontSize: '1.4rem', fontWeight: 700, color: '#0f2d57', marginBottom: '1.5rem' },
  twoCol:    { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' },
  card:      { background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #e8edf6', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#0f2d57', marginBottom: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  dropZone:  { border: '2px dashed #d0daf5', borderRadius: 14, padding: '2.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: '#fafbff', marginBottom: '1.3rem' },
  dropIcon:  { width: 60, height: 60, borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#1a4b8c' },
  dropTitle: { fontSize: '1rem', fontWeight: 600, color: '#1e2a3a', marginBottom: 4 },
  dropSub:   { fontSize: '0.83rem', color: '#9aaac8' },
  filePreview: { display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '0.9rem 1rem', background: '#f0f7ff', borderRadius: 10, marginBottom: '1.3rem', border: '1px solid #d0daf5' },
  formGroup: { marginBottom: '1rem' },
  label:     { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#4a5878', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' },
  input:     { width: '100%', padding: '0.72rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6', fontSize: '0.92rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', background: '#fafbff' },
  textarea:  { width: '100%', padding: '0.72rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6', fontSize: '0.92rem', outline: 'none', resize: 'vertical', minHeight: 90, boxSizing: 'border-box', background: '#fafbff' },
  submitBtn: { background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', justifyContent: 'center', transition: 'opacity 0.2s', boxShadow: '0 4px 16px rgba(26,75,140,0.25)' },
  alert:     { padding: '0.9rem 1.1rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 500 },
  courseCard:   { border: '1px solid #e8edf6', borderRadius: 14, overflow: 'hidden', marginBottom: '0.8rem', transition: 'all 0.18s' },
  courseHeader: { display: 'flex', alignItems: 'center', gap: '0.9rem', padding: '1rem 1.2rem', borderBottom: '1px solid #f0f4fb' },
  courseIcon:   { width: 40, height: 40, borderRadius: 11, background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a4b8c', flexShrink: 0 },
  courseFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1.2rem', background: '#fafbff' },
  deleteBtn:    { padding: '0.4rem 0.8rem', border: 'none', background: '#ffebee', color: '#c62828', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'background 0.15s' },
  empty:        { textAlign: 'center', padding: '2.5rem 1rem', color: '#bbc5dc', border: '2px dashed #e8edf6', borderRadius: 14 },
};

export default function UploadPage() {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [file,        setFile]        = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [msg,         setMsg]         = useState({ type: '', text: '' });
  const [courses,     setCourses]     = useState([]);
  const fileRef = useRef(null);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const data = await uploadService.getTeacherCourses();
      setCourses(data || []);
    } catch {
      setCourses([]);
    }
  };

  const handleFileSelect = e => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!title || !file) {
      setMsg({ type: 'error', text: 'Veuillez renseigner le titre et choisir un fichier.' });
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('file', file);
    try {
      await uploadService.uploadCourse(fd);
      setMsg({ type: 'success', text: 'Cours publié avec succès !' });
      setTitle(''); setDescription(''); setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      loadCourses();
    } catch (err) {
      const detail = err.response?.data?.detail || "Erreur lors de l'upload. Vérifiez le serveur.";
      setMsg({ type: 'error', text: detail });
    } finally {
      setUploading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    try {
      await uploadService.deleteCourse(id);
      loadCourses();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div style={s.container}>
      <div style={s.title}>Déposer un cours</div>

      {msg.text && (
        <div style={{ ...s.alert, ...(msg.type === 'success' ? { background: '#e8f5e8', color: '#2d8c4e', border: '1px solid #c3e6cd' } : { background: '#ffebee', color: '#c62828', border: '1px solid #fecaca' }) }}>
          {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      <div style={s.twoCol}>
        {/* ── Formulaire ── */}
        <div style={s.card}>
          <div style={s.cardTitle}><Upload size={18} color="#1a4b8c" />Nouveau cours</div>

          <div
            style={s.dropZone}
            onClick={() => fileRef.current?.click()}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2e7bd4'; e.currentTarget.style.background = '#f0f7ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#d0daf5'; e.currentTarget.style.background = '#fafbff'; }}
          >
            <input type="file" ref={fileRef} onChange={handleFileSelect} style={{ display: 'none' }} />
            <div style={s.dropIcon}><Upload size={28} /></div>
            <div style={s.dropTitle}>{file ? file.name : 'Glissez ou cliquez pour choisir'}</div>
            <div style={s.dropSub}>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, PPT, ZIP — max 100 MB'}</div>
          </div>

          {file && (
            <div style={s.filePreview}>
              <FileText size={22} color="#1a4b8c" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e2a3a' }}>{file.name}</div>
                <div style={{ fontSize: '0.76rem', color: '#9aaac8' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aaac8' }}>
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleUpload}>
            <div style={s.formGroup}>
              <label style={s.label}>Titre *</label>
              <input style={s.input} value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ex : Architecture des microservices"
                onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                onBlur={e => e.target.style.borderColor = '#e8edf6'}
                required />
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Décrivez le contenu du cours…"
                onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                onBlur={e => e.target.style.borderColor = '#e8edf6'} />
            </div>
            <button type="submit" style={{ ...s.submitBtn, opacity: uploading ? 0.7 : 1 }} disabled={uploading}>
              {uploading ? <><Clock size={18} />Publication…</> : <><Plus size={18} />Publier le cours</>}
            </button>
          </form>
        </div>

        {/* ── Liste des cours ── */}
        <div style={s.card}>
          <div style={s.cardTitle}><BookOpen size={18} color="#1a4b8c" />Mes cours publiés ({courses.length})</div>

          {courses.length === 0 ? (
            <div style={s.empty}>
              <BookOpen size={36} style={{ marginBottom: 10 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Aucun cours déposé</div>
              <div style={{ fontSize: '0.83rem' }}>Déposez votre premier cours via le formulaire.</div>
            </div>
          ) : (
            courses.map(c => (
              <div key={c.course_id || c.id}
                style={s.courseCard}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={s.courseHeader}>
                  <div style={s.courseIcon}><BookOpen size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#1e2a3a', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9aaac8', marginTop: 2 }}>{c.file_name || 'Fichier joint'}</div>
                  </div>
                </div>
                {c.description && (
                  <div style={{ padding: '0.7rem 1.2rem', fontSize: '0.83rem', color: '#7a8bb0', borderBottom: '1px solid #f0f4fb' }}>
                    {c.description}
                  </div>
                )}
                <div style={s.courseFooter}>
                  <div style={{ fontSize: '0.76rem', color: '#bbc5dc', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />Publié récemment
                  </div>
                  <button style={s.deleteBtn}
                    onClick={() => handleDelete(c.course_id || c.id)}
                    onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffebee'}>
                    <Trash2 size={13} />Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

