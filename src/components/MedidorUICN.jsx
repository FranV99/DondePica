// Medidor de la categoría de la Lista Roja de la UICN: muestra la escala completa
// (de Preocupación menor a Extinta) y marca dónde está la especie.
const ESCALA = [
  { k: 'LC', label: 'Preocupación menor', color: '#60c659' },
  { k: 'NT', label: 'Casi amenazada', color: '#cce226' },
  { k: 'VU', label: 'Vulnerable', color: '#f9e814' },
  { k: 'EN', label: 'En peligro', color: '#fc7f3f' },
  { k: 'CR', label: 'En peligro crítico', color: '#d81e05' },
  { k: 'EW', label: 'Extinta en estado silvestre', color: '#542344' },
  { k: 'EX', label: 'Extinta', color: '#111111' },
]

export default function MedidorUICN({ cat, exotica = false, compacto = false }) {
  const idx = ESCALA.findIndex((e) => e.k === cat)
  const actual = ESCALA[idx]
  const sinDatos = idx < 0

  return (
    <div className={`medidor ${compacto ? 'compacto' : ''} ${sinDatos ? 'sin-datos' : ''}`}>
      <div className="medidor-barra" role="img" aria-label={actual ? `UICN: ${actual.label} (${cat})` : 'UICN: no evaluada'}>
        {ESCALA.map((e, i) => (
          <span
            key={e.k}
            className={`medidor-seg ${i === idx ? 'activo' : ''}`}
            style={{ '--c': e.color }}
            title={`${e.k}: ${e.label}`}
          >
            {e.k}
          </span>
        ))}
        {actual && <span className="medidor-aguja" style={{ left: `${((idx + 0.5) / ESCALA.length) * 100}%` }} />}
      </div>
      <div className="medidor-texto">
        {actual ? (
          <>
            <b style={{ color: idx >= 2 ? actual.color : undefined }}>{actual.label}</b>
            {!compacto && <span> · {idx >= 2 ? 'Amenazada' : idx === 1 ? 'Próxima a estar amenazada' : 'No amenazada'}</span>}
          </>
        ) : (
          <span>{exotica ? 'No se evalúa: especie exótica en España' : cat === 'DD' ? 'Datos insuficientes' : 'Sin evaluar'}</span>
        )}
      </div>
    </div>
  )
}
