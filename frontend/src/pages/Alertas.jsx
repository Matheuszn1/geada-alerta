import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Carregando, Erro, Vazio } from '../components/Estado.jsx'
import { NivelBadge } from '../components/NivelBadge.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { NIVEIS, ROTULO_NIVEL } from '../utils/formato.js'

export function Alertas() {
  const [nivel, setNivel] = useState('')
  const [lido, setLido] = useState('false')
  const filtros = new URLSearchParams(Object.entries({ nivel, lido }).filter(([, v]) => v))
  const { dados, carregando, erro, recarregar } = useApi(`/alertas?${filtros}`)
  const [erroAcao, setErroAcao] = useState(null)

  async function marcarLido(id) {
    try {
      await api.patch(`/alertas/${id}/lido`)
      recarregar()
    } catch (e) {
      setErroAcao(e.message)
    }
  }

  return (
    <>
      <header className="cabecalho">
        <h1>Alertas de geada</h1>
        <div className="filtros">
          <select value={nivel} onChange={(e) => setNivel(e.target.value)} aria-label="Filtrar por nível">
            <option value="">Todos os níveis</option>
            {NIVEIS.map((n) => (
              <option key={n} value={n}>
                {ROTULO_NIVEL[n]}
              </option>
            ))}
          </select>
          <select value={lido} onChange={(e) => setLido(e.target.value)} aria-label="Filtrar por leitura">
            <option value="false">Não lidos</option>
            <option value="true">Lidos</option>
            <option value="">Todos</option>
          </select>
        </div>
      </header>
      {erroAcao && <Erro mensagem={erroAcao} />}

      {carregando && !dados ? (
        <Carregando />
      ) : erro ? (
        <Erro mensagem={erro} aoTentarNovamente={recarregar} />
      ) : dados.length === 0 ? (
        <Vazio>Nenhum alerta com esses filtros.</Vazio>
      ) : (
        <ul className="cartoes-alerta">
          {dados.map((a) => (
            <li key={a.id} className={`cartao-alerta borda-${a.nivel.toLowerCase()} ${a.lido ? 'lido' : ''}`}>
              <div className="topo">
                <NivelBadge nivel={a.nivel} />
                <Link to={`/propriedades/${a.plantio.propriedade.id}`}>
                  {a.plantio.propriedade.nome} · {a.plantio.propriedade.municipio}
                </Link>
              </div>
              <p>{a.mensagem}</p>
              <div className="rodape">
                <small>
                  Cultura: {a.plantio.cultura.nome} (crítica {a.plantio.cultura.temperaturaCritica} °C)
                </small>
                {!a.lido && (
                  <button className="btn btn-sec" onClick={() => marcarLido(a.id)}>
                    ✓ Marcar como lido
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
