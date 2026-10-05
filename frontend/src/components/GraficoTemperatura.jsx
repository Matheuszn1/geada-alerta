import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dataHora, diaSemana } from '../utils/formato.js'

// Temperatura prevista (linha) e observada (pontos) com linhas de referência nas temperaturas críticas das culturas.
export function GraficoTemperatura({ leituras, culturas }) {
  const pontos = leituras.map((l) => ({
    t: new Date(l.dataHora).getTime(),
    prevista: l.tipo === 'PREVISTA' ? l.temperatura : null,
    observada: l.tipo === 'OBSERVADA' ? l.temperatura : null,
  }))
  const temps = [...leituras.map((l) => l.temperatura), ...culturas.map((c) => c.temperaturaCritica)]
  const min = Math.floor(Math.min(...temps) - 1)
  const max = Math.ceil(Math.max(...temps) + 1)

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={pontos} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--borda)" />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={(t) => diaSemana(t)}
          tick={{ fontSize: 12 }}
          minTickGap={40}
        />
        <YAxis domain={[min, max]} unit="°" tick={{ fontSize: 12 }} />
        <Tooltip labelFormatter={(t) => dataHora(t)} formatter={(v, nome) => [`${v.toFixed(1)} °C`, nome]} />
        <Legend />
        <ReferenceLine y={0} stroke="#94a3b8" />
        {culturas.map((c) => (
          <ReferenceLine
            key={c.id}
            y={c.temperaturaCritica}
            stroke="#dc2626"
            strokeDasharray="6 4"
            label={{ value: `${c.nome} ${c.temperaturaCritica} °C`, position: 'insideBottomRight', fontSize: 11, fill: '#dc2626' }}
          />
        ))}
        <Line type="monotone" dataKey="prevista" name="Prevista (Open-Meteo)" stroke="#2563eb" dot={false} strokeWidth={2} connectNulls />
        <Line dataKey="observada" name="Observada (manual)" stroke="#0f172a" strokeWidth={0} dot={{ r: 5, fill: '#0f172a' }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
