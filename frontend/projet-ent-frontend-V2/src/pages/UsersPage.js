import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, UserPlus, Search, Edit2, Trash2, X, Check,
  AlertCircle, GraduationCap, Shield, BookOpen, Eye, EyeOff, Lock,
} from 'lucide-react';

const ROLE_CFG = {
  admin:      { label: 'Admin',      icon: Shield,        bg: '#ffebee', color: '#c62828' },
  teacher:    { label: 'Enseignant', icon: BookOpen,      bg: '#e8f5e8', color: '#2d8c4e' },
  enseignant: { label: 'Enseignant', icon: BookOpen,      bg: '#e8f5e8', color: '#2d8c4e' },
  student:    { label: 'Étudiant',   icon: GraduationCap, bg: '#e3f2fd', color: '#1a4b8c' },
  etudiant:   { label: 'Étudiant',   icon: GraduationCap, bg: '#e3f2fd', color: '#1a4b8c' },
};

const s = {
  container: { padding: '1rem' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title:     { fontSize: '1.4rem', fontWeight: 700, color: '#0f2d57', display: 'flex', alignItems: 'center', gap: '0.6rem' },
  addBtn:    {
    padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)',
    color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(26,75,140,0.25)',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
  statCard:  {
    background: '#fff', padding: '1.2rem 1.4rem', borderRadius: 14,
    border: '1px solid #e8edf6', display: 'flex', alignItems: 'center', gap: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  statIcon:  { width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statVal:   { fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.1 },
  statLabel: { fontSize: '0.82rem', color: '#9aaac8', marginTop: 2 },
  controls:  { display: 'flex', gap: '1rem', marginBottom: '1.2rem', alignItems: 'center', flexWrap: 'wrap' },
  searchBox: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#fff', padding: '0.5rem 1rem', borderRadius: 10,
    border: '1.5px solid #e8edf6', flex: 1, maxWidth: 360,
  },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1, background: 'none' },
  filters:   { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  filterBtn: {
    padding: '0.45rem 1rem', borderRadius: 20, border: '1px solid #e8edf6',
    background: '#fff', cursor: 'pointer', fontSize: '0.85rem',
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    transition: 'all 0.18s', fontWeight: 500,
  },
  filterActive: { background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)', color: '#fff', borderColor: 'transparent' },
  tableWrap: { background: '#fff', borderRadius: 16, border: '1px solid #e8edf6', overflow: 'auto', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  table:     { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th:        {
    padding: '0.9rem 1.1rem', textAlign: 'left', background: '#f8fafd',
    borderBottom: '1.5px solid #e8edf6', fontWeight: 700,
    fontSize: '0.82rem', color: '#7a8bb0', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  td:        { padding: '0.85rem 1.1rem', borderBottom: '1px solid #f4f7fb' },
  userInfo:  { display: 'flex', alignItems: 'center', gap: '0.7rem' },
  avatarSm:  {
    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
    background: 'linear-gradient(135deg,#2d8c4e,#1a4b8c)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, color: '#fff',
  },
  roleBadge: {
    padding: '0.2rem 0.7rem', borderRadius: 20, fontSize: '0.8rem',
    display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600,
  },
  actions:   { display: 'flex', gap: '0.5rem' },
  actionBtn: {
    padding: '0.35rem 0.75rem', border: 'none', borderRadius: 7,
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: '0.3rem',
  },
  modal:     {
    position: 'fixed', inset: 0, background: 'rgba(9,20,40,0.55)',
    backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '1rem',
  },
  modalBox:  {
    background: '#fff', borderRadius: 20, padding: '2rem',
    width: 500, maxWidth: '100%', maxHeight: '90vh', overflow: 'auto',
    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
  },
  modalTitle: {
    fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem',
    color: '#0f2d57', display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  formGroup: { marginBottom: '1rem' },
  label:     {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    color: '#7a8bb0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  input:     {
    width: '100%', padding: '0.72rem 1rem', borderRadius: 10,
    border: '1.5px solid #e8edf6', fontSize: '0.92rem', outline: 'none',
    boxSizing: 'border-box', background: '#fafbff', transition: 'border-color 0.2s',
  },
  inputWrap: { position: 'relative' },
  inputWithIcon: {
    width: '100%', padding: '0.72rem 2.8rem 0.72rem 1rem', borderRadius: 10,
    border: '1.5px solid #e8edf6', fontSize: '0.92rem', outline: 'none',
    boxSizing: 'border-box', background: '#fafbff', transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#bbc5dc', padding: 4,
  },
  pwdNote: { fontSize: '0.75rem', color: '#9aaac8', marginTop: 4 },
  select:    {
    width: '100%', padding: '0.72rem 1rem', borderRadius: 10,
    border: '1.5px solid #e8edf6', fontSize: '0.92rem',
    background: '#fafbff', outline: 'none', boxSizing: 'border-box',
  },
  modalActions: { display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  saveBtn:   {
    padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)',
    color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  cancelBtn: {
    padding: '0.65rem 1.2rem', background: '#f4f7fb', color: '#4a5878',
    border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: '0.4rem',
  },
  alert:     {
    padding: '0.85rem 1rem', borderRadius: 10, marginBottom: '1rem',
    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 500,
  },
  loading:   { textAlign: 'center', padding: '3rem', color: '#9aaac8' },
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users,     setUsers]     = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [stats,     setStats]     = useState(null);
  const [toast,     setToast]     = useState({ show: false, type: '', text: '' });
  const [showPwd,   setShowPwd]   = useState(false);
  const [form, setForm] = useState({
    username: '', email: '', full_name: '', role: 'student', password: '',
  });

  useEffect(() => { fetchUsers(); fetchStats(); }, []);
  useEffect(() => { applyFilter(); }, [filter, search, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data || []);
    } catch {
      notify('error', 'Impossible de charger les utilisateurs (port 8004).');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch {}
  };

  const applyFilter = () => {
    let list = users;
    if (filter !== 'all') {
      const aliases = {
        enseignant: ['teacher', 'enseignant'],
        etudiant:   ['student', 'etudiant'],
        admin:      ['admin'],
      };
      const accepted = aliases[filter] || [filter];
      list = list.filter(u => accepted.includes(u.role));
    }
    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter(u =>
        (u.username  || '').toLowerCase().includes(t) ||
        (u.email     || '').toLowerCase().includes(t) ||
        (u.full_name || '').toLowerCase().includes(t)
      );
    }
    setFiltered(list);
  };

  // Gère detail string OU tableau d'objets Pydantic {type, loc, msg, ...}
  const notify = (type, text) => {
    let safeText = 'Erreur inconnue.';
    if (typeof text === 'string') {
      safeText = text;
    } else if (Array.isArray(text)) {
      safeText = text.map(e => e.msg || JSON.stringify(e)).join(' | ');
    } else if (text && typeof text === 'object') {
      safeText = text.msg || JSON.stringify(text);
    }
    setToast({ show: true, type, text: safeText });
    setTimeout(() => setToast({ show: false, type: '', text: '' }), 4500);
  };

  const openAdd = () => {
    setEditing(null);
    setShowPwd(false);
    setForm({ username: '', email: '', full_name: '', role: 'student', password: '' });
    setShowModal(true);
  };

  const openEdit = u => {
    setEditing(u);
    setShowPwd(false);
    setForm({ username: u.username, email: u.email, full_name: u.full_name || '', role: u.role, password: '' });
    setShowModal(true);
  };

  const handleDelete = async (id, uname) => {
    if (!window.confirm(`Supprimer l'utilisateur "${uname}" ?\nIl sera supprimé de Keycloak ET de la base de données.`)) return;
    try {
      await adminService.deleteUser(id);
      await fetchUsers(); await fetchStats();
      notify('success', `Utilisateur "${uname}" supprimé.`);
    } catch {
      notify('error', 'Erreur lors de la suppression.');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validation password à la création
    if (!editing && (!form.password || form.password.length < 6)) {
      notify('error', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    try {
      if (editing) {
        // Pour la mise à jour : envoyer password seulement si renseigné
        const updateData = {
          email:     form.email,
          full_name: form.full_name,
          role:      form.role,
        };
        if (form.password && form.password.length >= 6) {
          updateData.password = form.password;
        }
        await adminService.updateUser(editing.user_id || editing.id, updateData);
      } else {
        await adminService.createUser(form);
      }
      setShowModal(false);
      await fetchUsers(); await fetchStats();
      notify('success', editing ? 'Utilisateur mis à jour.' : 'Utilisateur créé avec succès.');
    } catch (err) {
      const detail = err.response?.data?.detail;
      let errorMsg = 'Erreur lors de la sauvegarde.';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map(e => e.msg || JSON.stringify(e)).join(' | ');
      } else if (detail && typeof detail === 'object') {
        errorMsg = detail.msg || JSON.stringify(detail);
      }
      notify('error', errorMsg);
    }
  };

  const getRoleCfg  = role  => ROLE_CFG[role] || ROLE_CFG.etudiant;
  const getInitials = uname => (uname || 'U').slice(0, 2).toUpperCase();

  const total     = stats?.total_users ?? stats?.total ?? users.length;
  const nbStudent = ((stats?.by_role?.student  ?? 0) + (stats?.by_role?.etudiant   ?? 0)) || users.filter(u => ['student','etudiant'].includes(u.role)).length;
  const nbTeacher = ((stats?.by_role?.teacher  ?? 0) + (stats?.by_role?.enseignant ?? 0)) || users.filter(u => ['teacher','enseignant'].includes(u.role)).length;
  const nbAdmin   = stats?.by_role?.admin ?? users.filter(u => u.role === 'admin').length;

  if (loading) return (
    <div style={s.loading}>
      <Users size={32} style={{ marginBottom: 12 }} />
      <div>Chargement des utilisateurs…</div>
    </div>
  );

  return (
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.title}><Users size={26} />Gestion des Utilisateurs</div>
        <button style={s.addBtn} onClick={openAdd}>
          <UserPlus size={17} />Ajouter
        </button>
      </div>

      {/* Toast */}
      {toast.show && (
        <div style={{
          ...s.alert,
          ...(toast.type === 'success'
            ? { background: '#e8f5e8', color: '#2d8c4e', border: '1px solid #c3e6cd' }
            : { background: '#ffebee', color: '#c62828', border: '1px solid #fecaca' }),
        }}>
          {toast.type === 'success' ? <Check size={17} /> : <AlertCircle size={17} />}
          {toast.text}
        </div>
      )}

      {/* Stats */}
      <div style={s.statsGrid}>
        {[
          { label: 'Total',        val: total,     icon: Users,         color: '#1a4b8c', bg: '#e3f2fd' },
          { label: 'Étudiants',   val: nbStudent, icon: GraduationCap, color: '#2e7bd4', bg: '#dbeafe' },
          { label: 'Enseignants', val: nbTeacher, icon: BookOpen,      color: '#2d8c4e', bg: '#e8f5e8' },
          { label: 'Admins',      val: nbAdmin,   icon: Shield,        color: '#c62828', bg: '#ffebee' },
        ].map(st => {
          const Icon = st.icon;
          return (
            <div key={st.label} style={s.statCard}>
              <div style={{ ...s.statIcon, background: st.bg, color: st.color }}><Icon size={22} /></div>
              <div>
                <div style={{ ...s.statVal, color: st.color }}>{st.val}</div>
                <div style={s.statLabel}>{st.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contrôles */}
      <div style={s.controls}>
        <div style={s.searchBox}>
          <Search size={16} color="#bbc5dc" />
          <input
            style={s.searchInput}
            placeholder="Rechercher un utilisateur…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <X size={14} color="#bbc5dc" style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <div style={s.filters}>
          {[
            { key: 'all',        label: 'Tous',        icon: Users },
            { key: 'etudiant',   label: 'Étudiants',   icon: GraduationCap },
            { key: 'enseignant', label: 'Enseignants',  icon: BookOpen },
            { key: 'admin',      label: 'Admins',       icon: Shield },
          ].map(f => {
            const Icon   = f.icon;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                style={{ ...s.filterBtn, ...(active ? s.filterActive : {}) }}
                onClick={() => setFilter(f.key)}
              >
                <Icon size={13} />{f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Utilisateur</th>
              <th style={s.th}>Email</th>
              <th style={s.th}>Nom complet</th>
              <th style={s.th}>Rôle</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#9aaac8', padding: '2rem' }}>
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : filtered.map(u => {
              const cfg      = getRoleCfg(u.role);
              const RoleIcon = cfg.icon;
              const userId   = u.user_id || u.id;
              return (
                <tr
                  key={userId}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={s.td}>
                    <div style={s.userInfo}>
                      <div style={s.avatarSm}>{getInitials(u.username)}</div>
                      <span style={{ fontWeight: 600, color: '#1e2a3a', fontSize: '0.9rem' }}>{u.username}</span>
                    </div>
                  </td>
                  <td style={s.td}><span style={{ color: '#7a8bb0', fontSize: '0.88rem' }}>{u.email}</span></td>
                  <td style={s.td}><span style={{ color: '#4a5878', fontSize: '0.88rem' }}>{u.full_name || '—'}</span></td>
                  <td style={s.td}>
                    <span style={{ ...s.roleBadge, background: cfg.bg, color: cfg.color }}>
                      <RoleIcon size={11} />{cfg.label}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button
                        style={{ ...s.actionBtn, background: '#e3f2fd', color: '#1a4b8c' }}
                        onClick={() => openEdit(u)}
                      >
                        <Edit2 size={13} />Modifier
                      </button>
                      {userId !== me?.sub && (
                        <button
                          style={{ ...s.actionBtn, background: '#ffebee', color: '#c62828' }}
                          onClick={() => handleDelete(userId, u.username)}
                          onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                          onMouseLeave={e => e.currentTarget.style.background = '#ffebee'}
                        >
                          <Trash2 size={13} />Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={s.modal} onClick={() => setShowModal(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}>
              {editing
                ? <><Edit2 size={20} />Modifier l'utilisateur</>
                : <><UserPlus size={20} />Ajouter un utilisateur</>
              }
            </h2>
            <form onSubmit={handleSubmit}>

              {/* Username */}
              <div style={s.formGroup}>
                <label style={s.label}>Nom d'utilisateur *</label>
                <input
                  style={{ ...s.input, ...(editing ? { background: '#f4f7fb', color: '#9aaac8' } : {}) }}
                  placeholder="ex: ali.hassan"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  disabled={!!editing}
                  required
                  onFocus={e => { if (!editing) e.target.style.borderColor = '#2e7bd4'; }}
                  onBlur={e => e.target.style.borderColor = '#e8edf6'}
                />
              </div>

              {/* Email */}
              <div style={s.formGroup}>
                <label style={s.label}>Email *</label>
                <input
                  style={s.input}
                  type="email"
                  placeholder="ali@est-sale.ma"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                  onBlur={e => e.target.style.borderColor = '#e8edf6'}
                />
              </div>

              {/* Nom complet */}
              <div style={s.formGroup}>
                <label style={s.label}>Nom complet *</label>
                <input
                  style={s.input}
                  placeholder="Ali Hassan"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  required
                  onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                  onBlur={e => e.target.style.borderColor = '#e8edf6'}
                />
              </div>

              {/* Rôle */}
              <div style={s.formGroup}>
                <label style={s.label}>Rôle *</label>
                <select
                  style={s.select}
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                >
                  <option value="student">Étudiant</option>
                  <option value="teacher">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>

              {/* Mot de passe */}
              <div style={s.formGroup}>
                <label style={s.label}>
                  <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {editing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                </label>
                <div style={s.inputWrap}>
                  <input
                    style={s.inputWithIcon}
                    type={showPwd ? 'text' : 'password'}
                    placeholder={editing ? 'Laisser vide pour ne pas changer' : 'Min. 6 caractères'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required={!editing}
                    minLength={form.password ? 6 : undefined}
                    onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                    onBlur={e => e.target.style.borderColor = '#e8edf6'}
                  />
                  <button
                    type="button"
                    style={s.eyeBtn}
                    onClick={() => setShowPwd(v => !v)}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {!editing && (
                  <div style={s.pwdNote}>
                    Ce mot de passe sera enregistré dans Keycloak. L'utilisateur pourra s'en servir pour se connecter.
                  </div>
                )}
                {editing && (
                  <div style={s.pwdNote}>
                    Renseignez uniquement si vous souhaitez changer le mot de passe Keycloak.
                  </div>
                )}
              </div>

              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowModal(false)}>
                  <X size={15} />Annuler
                </button>
                <button type="submit" style={s.saveBtn}>
                  <Check size={15} />{editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

