import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Carregando, Erro, Vazio } from '../components/Estado.jsx'
import { MapaPropriedades } from '../components/MapaPropriedades.jsx'
import { NivelBadge } from '../components/NivelBadge.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { graus, dataHora } from '../utils/formato.js'

const CARTAO_NIVEL = { CRITICO: 'alertas críticos', ALTO: 'alertas de risco alto', MODERADO: 'alertas moderados' }

export function Painel() {
  const resumo = useApi('/dashboard')
  const propriedades = useApi('/propriedades')
  const alertas = useApi('/alertas?lido=false')
  const [atualizando, setAtualizando] = useState(null)
  const [erroAtualizacao, setErroAtualizacao] = useState(null)

  async function atualizarTodas() {
    setErroAtualizacao(null)
    try {
      for (const [i, p] of propriedades.dados.entries()) {
        setAtualizando(`${i + 1}/${propriedades.dados.length} · ${p.nome}`)
        await api.post(`/propriedades/${p.id}/atualizar-previsao`)
      }
    } catch (e) {
      setErroAtualizacao(e.message)
    } finally {
      setAtualizando(null)
      resumo.recarregar()
      propriedades.recarregar()
      alertas.recarregar()
    }
  }

  if (resumo.carregando && !resumo.dados) return <Carregando />
  if (resumo.erro) return <Erro mensagem={resumo.erro} aoTentarNovamente={resumo.recarregar} />

  const r = resumo.dados

  return (
    <>
      <header className="cabecalho">
        <div>
          <h1>Painel de risco</h1>
          <p className="sub">
            {r.produtores} produtores · {r.propriedades} propriedades · {r.plantios} plantios monitorados
          </p>
        </div>
        <button className="btn" onClick={atualizarTodas} disabled={!!atualizando || !propriedades.dados?.length}>
          {atualizando ? `Atualizando ${atualizando}…` : '↻ Atualizar previsões'}
        </button>
      </header>
      {erroAtualizacao && <Erro mensagem={erroAtualizacao} />}

      <section className="cards-nivel">
        {['CRITICO', 'ALTO', 'MODERADO'].map((nivel) => (
          <div key={nivel} className={`card-nivel card-${nivel.toLowerCase()}`}>
            <span className="numero">{r.alertasPorNivel[nivel]}</span>
            <span>{CARTAO_NIVEL[nivel]}</span>
          </div>
        ))}
        {/* Risco BAIXO não gera alerta: o 4º cartão mostra quantas propriedades estão tranquilas */}
        <div className="card-nivel card-baixo">
          <span className="numero">
            {r.propriedadesSemRisco}/{r.propriedades}
          </span>
          <span>propriedades sem risco</span>
        </div>
      </section>

      <div className="grade-2">
        <section className="painel">
          <h2>Mapa das propriedades</h2>
          {propriedades.carregando && !propriedades.dados ? (
            <Carregando />
          ) : propriedades.erro ? (
            <Erro mensagem={propriedades.erro} />
          ) : (
            <MapaPropriedades propriedades={propriedades.dados} />
          )}
        </section>

        <section className="painel">
          <h2>Próximos alertas ({r.alertasNaoLidos} não lidos)</h2>
          {alertas.carregando && !alertas.dados ? (
            <Carregando />
          ) : alertas.erro ? (
            <Erro mensagem={alertas.erro} />
          ) : alertas.dados.length === 0 ? (
            <Vazio>Nenhum alerta pendente. Clique em “Atualizar previsões” para consultar a Open-Meteo.</Vazio>
          ) : (
            <ul className="lista-alertas">
              {alertas.dados.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <NivelBadge nivel={a.nivel} />
                  <div>
                    <strong>
                      {a.plantio.cultura.nome} — {a.plantio.propriedade.nome}
                    </strong>
                    <small>
                      mínima {graus(a.temperaturaMin)} em {dataHora(a.dataReferencia)}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/alertas" className="link-mais">
            Ver todos os alertas →
          </Link>
        </section>
      </div>
    </>
  )
}
