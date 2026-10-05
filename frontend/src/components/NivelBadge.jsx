import { ROTULO_NIVEL } from '../utils/formato.js'

export function NivelBadge({ nivel }) {
  return <span className={`badge badge-${nivel.toLowerCase()}`}>{ROTULO_NIVEL[nivel]}</span>
}
