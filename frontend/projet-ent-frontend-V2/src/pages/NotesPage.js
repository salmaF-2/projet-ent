import React from 'react';

const NOTES = [
  { module: 'Architecture des Systèmes', code:'INF301', cc:15.5, tp:16, exam:14, coeff:3 },
  { module: 'Développement Web Full Stack', code:'INF302', cc:17, tp:18, exam:16.5, coeff:3 },
  { module: 'Bases de Données Avancées', code:'INF303', cc:12, tp:13.5, exam:11, coeff:2.5 },
  { module: 'Réseaux & Cybersécurité', code:'INF304', cc:14, tp:15, exam:13.5, coeff:2.5 },
  { module: 'Mathématiques Appliquées', code:'MAT301', cc:13, tp:null, exam:12, coeff:2 },
  { module: 'Anglais Technique', code:'ANG301', cc:16, tp:null, exam:15.5, coeff:1 },
];

function avg(row) {
  if (row.tp !== null) return ((row.cc * 0.25) + (row.tp * 0.25) + (row.exam * 0.5)).toFixed(2);
  return ((row.cc * 0.3) + (row.exam * 0.7)).toFixed(2);
}

const getColor = v => v >= 16 ? '#2d8c4e' : v >= 12 ? '#c8a830' : '#e53e3e';

export default function NotesPage() {
  const totalCoeff = NOTES.reduce((a, r) => a + r.coeff, 0);
  const moyenne = (NOTES.reduce((a, r) => a + parseFloat(avg(r)) * r.coeff, 0) / totalCoeff).toFixed(2);

  return (
    <div>
      <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Moyenne générale', value: `${moyenne}/20`, color: getColor(parseFloat(moyenne)) },
          { label: 'Crédits validés', value: '22/30', color: 'var(--est-blue)' },
          { label: 'Rang de promotion', value: '12/132', color: 'var(--est-green)' },
          { label: 'Statut', value: '✅ Admis', color: 'var(--est-green)' },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 'var(--radius)', padding: '1.3rem 1.4rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: '1rem' }}>📊 Relevé de notes – Semestre 3</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-primary)' }}>
              {['Code','Module','CC','TP','Examen','Moyenne','Coeff','Résultat'].map(h => (
                <th key={h} style={{ padding: '0.9rem 1.2rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTES.map((row, i) => {
              const a = parseFloat(avg(row));
              return (
                <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-primary)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '1rem 1.2rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--est-blue)' }}>{row.code}</td>
                  <td style={{ padding: '1rem 1.2rem', fontWeight: 600, fontSize: '0.9rem' }}>{row.module}</td>
                  <td style={{ padding: '1rem 1.2rem', color: getColor(row.cc) }}>{row.cc}</td>
                  <td style={{ padding: '1rem 1.2rem', color: row.tp ? getColor(row.tp) : 'var(--text-muted)' }}>{row.tp ?? '–'}</td>
                  <td style={{ padding: '1rem 1.2rem', color: getColor(row.exam) }}>{row.exam}</td>
                  <td style={{ padding: '1rem 1.2rem', fontWeight: 800, color: getColor(a), fontSize: '1rem' }}>{avg(row)}</td>
                  <td style={{ padding: '1rem 1.2rem', color: 'var(--text-muted)' }}>{row.coeff}</td>
                  <td style={{ padding: '1rem 1.2rem' }}>
                    <span style={{ padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: a >= 10 ? 'var(--est-green-pale)' : '#fff0f0', color: a >= 10 ? 'var(--est-green-dark)' : '#c0392b' }}>
                      {a >= 10 ? '✅ Validé' : '❌ Non validé'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
