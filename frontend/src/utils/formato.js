const FUSO = 'America/Sao_Paulo'

export const NIVEIS = ['BAIXO', 'MODERADO', 'ALTO', 'CRITICO']

export const ROTULO_NIVEL = {
  BAIXO: 'Baixo',
  MODERADO: 'Moderado',
  ALTO: 'Alto',
  CRITICO: 'Crítico',
}

export const COR_NIVEL = {
  BAIXO: '#16a34a',
  MODERADO: '#ca8a04',
  ALTO: '#ea580c',
  CRITICO: '#dc2626',
}

export const dataHora = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export const diaSemana = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, weekday: 'short', day: '2-digit', month: '2-digit' })

export const graus = (valor) => (valor == null ? '—' : `${Number(valor).toFixed(1)} °C`)

// Valor para <input type="datetime-local"> no horário local
export function agoraLocalInput() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
