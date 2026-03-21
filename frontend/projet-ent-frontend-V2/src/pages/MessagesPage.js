import React, { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Trash2, RefreshCw, Mail, Inbox, AlertCircle, X, Check } from 'lucide-react';

const s = {
  wrap:        { display: 'flex', gap: '1.2rem', height: 'calc(100vh - 130px)' },
  left:        { width: 340, display: 'flex', flexDirection: 'column', gap: '0.8rem' },
  list:        { background: '#fff', borderRadius: 16, border: '1px solid #e8edf6', display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  listHeader:  { padding: '1rem 1.2rem', borderBottom: '1px solid #e8edf6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  listTitle:   { fontWeight: 700, fontSize: '0.9rem', color: '#0f2d57', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  tabs:        { display: 'flex', gap: 4, padding: '0 1rem', background: '#f8fafd', borderBottom: '1px solid #e8edf6' },
  tab:         { padding: '0.55rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, color: '#7a8bb0', borderBottom: '2px solid transparent', transition: 'all 0.15s' },
  tabActive:   { color: '#1a4b8c', borderBottom: '2px solid #1a4b8c' },
  threads:     { flex: 1, overflowY: 'auto' },
  thread:      { padding: '0.85rem 1.1rem', cursor: 'pointer', borderBottom: '1px solid #f4f7fb', transition: 'background 0.15s' },
  threadTop:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 },
  threadFrom:  { fontWeight: 600, fontSize: '0.87rem', color: '#1e2a3a' },
  threadDate:  { fontSize: '0.72rem', color: '#9aaac8' },
  threadSubj:  { fontSize: '0.83rem', color: '#4a5878', marginBottom: 2 },
  threadPrev:  { fontSize: '0.78rem', color: '#9aaac8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  unread:      { width: 7, height: 7, borderRadius: '50%', background: '#1a4b8c', display: 'inline-block', marginRight: 5 },
  composeBtn:  { padding: '0.65rem 1.2rem', background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 3px 10px rgba(26,75,140,0.2)' },
  detail:      { flex: 1, background: '#fff', borderRadius: 16, border: '1px solid #e8edf6', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  detailHead:  { padding: '1.2rem 1.5rem', borderBottom: '1px solid #e8edf6' },
  detailSubj:  { fontSize: '1.05rem', fontWeight: 800, color: '#0f2d57', marginBottom: 5 },
  detailMeta:  { display: 'flex', gap: '1.2rem', fontSize: '0.8rem', color: '#9aaac8', flexWrap: 'wrap' },
  detailBody:  { flex: 1, padding: '1.5rem', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.92rem', color: '#2d3a52' },
  replyBar:    { padding: '1rem 1.5rem', borderTop: '1px solid #e8edf6', display: 'flex', gap: '0.75rem' },
  replyInput:  { flex: 1, padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6', fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'inherit' },
  sendBtn:     { padding: '0.7rem 1.1rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#1a4b8c,#2e7bd4)', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 3px 10px rgba(26,75,140,0.2)' },
  empty:       { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aaac8', flexDirection: 'column', gap: '0.75rem' },
  modal:       { position: 'fixed', inset: 0, background: 'rgba(9,20,40,0.55)', backdropFilter: 'blur(5px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modalBox:    { background: '#fff', borderRadius: 20, width: 520, maxWidth: '100%', padding: '1.8rem', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' },
  modalTitle:  { fontSize: '1.1rem', fontWeight: 800, color: '#0f2d57', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  formGroup:   { marginBottom: '1rem' },
  label:       { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#7a8bb0', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' },
  select:      { width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6', fontSize: '0.92rem', background: '#fafbff', outline: 'none', boxSizing: 'border-box' },
  input:       { width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box', background: '#fafbff' },
  textarea:    { width: '100%', padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e8edf6', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box', background: '#fafbff', minHeight: 140, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 },
  modalBtns:   { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.2rem' },
  cancelBtn:   { padding: '0.65rem 1.2rem', background: '#f4f7fb', color: '#4a5878', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 },
  toast:       { position: 'fixed', bottom: 20, right: 20, background: '#2d8c4e', color: '#fff', padding: '0.75rem 1.2rem', borderRadius: 12, fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 300 },
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [tab,        setTab]        = useState('inbox');
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [showCompose,setShowCompose]= useState(false);
  const [users,      setUsers]      = useState([]);
  const [reply,      setReply]      = useState('');
  const [toast,      setToast]      = useState(null);
  const [form,       setForm]       = useState({ receiver: '', subject: '', body: '' });
  const [sending,    setSending]    = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { loadMessages(); }, [tab]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = tab === 'inbox'
        ? await messageService.getInbox()
        : await messageService.getSent();
      setMessages(data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.is_read && tab === 'inbox') {
      try {
        await messageService.markRead(msg.id);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch {}
    }
  };

  const openCompose = async () => {
    setForm({ receiver: '', subject: '', body: '' });
    setShowCompose(true);
    try {
      const u = await messageService.getUsers();
      setUsers(u || []);
    } catch { setUsers([]); }
  };

  const handleSend = async () => {
    if (!form.receiver || !form.subject || !form.body) {
      notify('Remplissez tous les champs.');
      return;
    }
    try {
      setSending(true);
      await messageService.sendMessage(form.receiver, form.subject, form.body);
      setShowCompose(false);
      notify('Message envoyé !');
      if (tab === 'sent') loadMessages();
    } catch {
      notify('Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    try {
      setSending(true);
      await messageService.sendMessage(
        selected.sender === user?.username ? selected.receiver : selected.sender,
        `Re: ${selected.subject}`,
        reply
      );
      setReply('');
      notify('Réponse envoyée !');
    } catch {
      notify('Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await messageService.deleteMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selected?.id === id) setSelected(null);
      notify('Message supprimé.');
    } catch {
      notify('Erreur suppression.');
    }
  };

  const unreadCount = messages.filter(m => !m.is_read && tab === 'inbox').length;

  return (
    <div style={s.wrap}>
      {toast && (
        <div style={s.toast}><Check size={16} />{toast}</div>
      )}

      {/* Colonne gauche */}
      <div style={s.left}>
        <button style={s.composeBtn} onClick={openCompose}>
          <Send size={15} />Nouveau message
        </button>
        <div style={s.list}>
          <div style={s.listHeader}>
            <div style={s.listTitle}>
              <Mail size={16} />
              Messagerie
              {unreadCount > 0 && (
                <span style={{ background: '#1a4b8c', color: '#fff', borderRadius: 20, padding: '0.1rem 0.5rem', fontSize: '0.72rem', fontWeight: 700 }}>{unreadCount}</span>
              )}
            </div>
            <RefreshCw size={15} color="#9aaac8" style={{ cursor: 'pointer' }} onClick={loadMessages} />
          </div>
          <div style={s.tabs}>
            {[['inbox', 'Reçus'], ['sent', 'Envoyés']].map(([key, label]) => (
              <button key={key} style={{ ...s.tab, ...(tab === key ? s.tabActive : {}) }} onClick={() => { setTab(key); setSelected(null); }}>
                {label}
              </button>
            ))}
          </div>
          <div style={s.threads}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9aaac8', fontSize: '0.85rem' }}>Chargement…</div>
            ) : messages.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9aaac8', fontSize: '0.85rem' }}>
                <Inbox size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div>Aucun message</div>
              </div>
            ) : messages.map(m => (
              <div key={m.id}
                style={{ ...s.thread, background: selected?.id === m.id ? '#f0f7ff' : 'transparent' }}
                onClick={() => openMessage(m)}
                onMouseEnter={e => { if (selected?.id !== m.id) e.currentTarget.style.background = '#f8fafd'; }}
                onMouseLeave={e => { if (selected?.id !== m.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={s.threadTop}>
                  <div style={s.threadFrom}>
                    {!m.is_read && tab === 'inbox' && <span style={s.unread} />}
                    {tab === 'inbox' ? m.sender : m.receiver}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={s.threadDate}>{formatDate(m.created_at)}</span>
                    <Trash2 size={12} color="#e53e3e" style={{ cursor: 'pointer', opacity: 0.6 }}
                      onClick={e => { e.stopPropagation(); handleDelete(m.id); }} />
                  </div>
                </div>
                <div style={{ ...s.threadSubj, fontWeight: !m.is_read && tab === 'inbox' ? 700 : 500 }}>{m.subject}</div>
                <div style={s.threadPrev}>{m.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Détail message */}
      <div style={s.detail}>
        {selected ? (
          <>
            <div style={s.detailHead}>
              <div style={s.detailSubj}>{selected.subject}</div>
              <div style={s.detailMeta}>
                <span>De : <strong>{selected.sender}</strong></span>
                <span>À : <strong>{selected.receiver}</strong></span>
                <span>{new Date(selected.created_at).toLocaleString('fr-FR')}</span>
              </div>
            </div>
            <div style={s.detailBody}>{selected.body}</div>
            {tab === 'inbox' && (
              <div style={s.replyBar}>
                <textarea
                  style={s.replyInput}
                  rows={2}
                  placeholder={`Répondre à ${selected.sender}…`}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                  onBlur={e => e.target.style.borderColor = '#e8edf6'}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleReply(); }}
                />
                <button style={s.sendBtn} onClick={handleReply} disabled={sending || !reply.trim()}>
                  <Send size={15} />Répondre
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        ) : (
          <div style={s.empty}>
            <Mail size={48} color="#d0daf5" />
            <div style={{ fontWeight: 600, color: '#7a8bb0' }}>Sélectionnez un message</div>
            <div style={{ fontSize: '0.82rem', color: '#bbc5dc' }}>ou composez-en un nouveau</div>
          </div>
        )}
      </div>

      {/* Modal nouveau message */}
      {showCompose && (
        <div style={s.modal} onClick={() => setShowCompose(false)}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitle}><Send size={18} />Nouveau message</h2>

            <div style={s.formGroup}>
              <label style={s.label}>Destinataire *</label>
              <select style={s.select} value={form.receiver} onChange={e => setForm({ ...form, receiver: e.target.value })}>
                <option value="">-- Choisir un destinataire --</option>
                {users.map(u => (
                  <option key={u.username} value={u.username}>
                    {u.full_name || u.username} ({u.role === 'teacher' || u.role === 'enseignant' ? 'Enseignant' : u.role === 'admin' ? 'Admin' : 'Étudiant'})
                  </option>
                ))}
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Sujet *</label>
              <input style={s.input} placeholder="Ex: Question sur le TP Docker" value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                onBlur={e => e.target.style.borderColor = '#e8edf6'} />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>Message *</label>
              <textarea style={s.textarea} placeholder="Votre message…" value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                onFocus={e => e.target.style.borderColor = '#2e7bd4'}
                onBlur={e => e.target.style.borderColor = '#e8edf6'} />
            </div>

            <div style={s.modalBtns}>
              <button style={s.cancelBtn} onClick={() => setShowCompose(false)}>
                <X size={14} style={{ display: 'inline', marginRight: 4 }} />Annuler
              </button>
              <button style={s.sendBtn} onClick={handleSend} disabled={sending}>
                <Send size={15} />{sending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
