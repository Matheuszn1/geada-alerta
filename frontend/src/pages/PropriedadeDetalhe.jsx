import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Carregando, Erro, Vazio } from '../components/Estado.jsx'
import { FormPropriedade } from '../components/FormPropriedade.jsx'
import { GraficoTemperatura } from '../components/GraficoTemperatura.jsx'
import { NivelBadge } from '../components/NivelBadge.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { agoraLocalInput, dataHora, graus } from '../utils/formato.js'

export function PropriedadeDetalhe() {
  const { id } = useParams()
  const navegar = useNavigate()
  const propriedade = useApi(`/propriedades/${id}`)
  const leituras = useApi(`/propriedades/${id}/leituras`)
  const culturas = useApi('/culturas')

  const [editando, setEditando] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  const [atualizando, setAtualizando] = useState(false)
  const [novoPlantio, setNovoPlantio] = useState({ culturaId: '', areaHectares: '' })
  const [leitura, setLeitura] = useState({ dataHora: agoraLocalInput(), temperatura: '' })

  function recarregarTudo() {
    propriedade.recarregar()
    leituras.recarregar()
  }

  // Executa uma ação da API mostrando sucesso/erro e recarregando os dados da tela
  async function executar(acao, sucesso) {
    setErroAcao(null)
    setMensagem(null)
    try {
      const resultado = await acao()
      setMensagem(typeof sucesso === 'function' ? sucesso(resultado) : sucesso)
      recarregarTudo()
      return true
    } catch (e) {
      setErroAcao(e.message)
      return false
    }
  }

  async function atualizarPrevisao() {
    setAtualizando(true)
    await executar(
      () => api.post(`/propriedades/${id}/atualizar-previsao`),
      (r) => `Previsão atualizada: ${r.leiturasSalvas} leituras horárias, ${r.alertasGerados} alerta(s) gerado(s).`,
    )
    setAtualizando(false)
  }

  async function excluirPropriedade() {
    if (!window.confirm('Excluir esta propriedade, seus plantios, leituras e alertas?')) return
    try {
      await api.delete(`/propriedades/${id}`)
      navegar('/propriedades')
    } catch (e) {
      setErroAcao(e.message)
    }
  }

  async function adicionarPlantio(e) {
    e.preventDefault()
    const ok = await executar(() => api.post('/plantios', { ...novoPlantio, propriedadeId: id }), 'Cultura adicionada.')
    if (ok) setNovoPlantio({ culturaId: '', areaHectares: '' })
  }

  async function registrarLeitura(e) {
    e.preventDefault()
    const corpo = { temperatura: leitura.temperatura, dataHora: new Date(leitura.dataHora).toISOString() }
    const ok = await executar(
      () => api.post(`/propriedades/${id}/leituras`, corpo),
      (r) => `Leitura registrada. Alertas recalculados: ${r.alertasGerados}.`,
    )
    if (ok) setLeitura({ dataHora: agoraLocalInput(), temperatura: '' })
  }

  if (propriedade.carregando && !propriedade.dados) return <Carregando />
  if (propriedade.erro) return <Erro mensagem={propriedade.erro} aoTentarNovamente={propriedade.recarregar} />

  const p = propriedade.dados
  const alertas = p.plantios
    .flatMap((pl) => pl.alertas.map((a) => ({ ...a, cultura: pl.cultura })))
    .sort((a, b) => new Date(a.dataReferencia) - new Date(b.dataReferencia))
  const culturasDisponiveis = culturas.dados?.filter((c) => !p.plantios.some((pl) => pl.culturaId === c.id)) ?? []

  return (
    <>
      <Link to="/propriedades" className="voltar">
        ← Propriedades
      </Link>
      <header className="cabecalho">
        <div>
          <h1>
            {p.nome} <NivelBadge nivel={p.riscoAtual} />
          </h1>
          <p className="sub">
            {p.municipio} · {p.altitude ? `${p.altitude} m` : 'altitude n/d'} · {p.latitude}, {p.longitude} · Produtor:{' '}
            {p.produtor.nome}
          </p>
        </div>
        <div className="acoes">
          <button className="btn" onClick={atualizarPrevisao} disabled={atualizando}>
            {atualizando ? 'Consultando Open-Meteo…' : '↻ Atualizar previsão'}
          </button>
          <button className="btn btn-sec" onClick={() => setEditando(!editando)}>
            ✎ Editar
          </button>
          <button className="btn btn-perigo" onClick={excluirPropriedade}>
            Excluir
          </button>
        </div>
      </header>

      {mensagem && <div className="estado estado-ok">{mensagem}</div>}
      {erroAcao && <Erro mensagem={erroAcao} />}

      {editando && (
        <section className="painel">
          <h2>Editar propriedade</h2>
          <FormPropriedade
            inicial={p}
            textoBotao="Salvar alterações"
            aoCancelar={() => setEditando(false)}
            aoSalvar={async (form) => {
              await api.put(`/propriedades/${id}`, form)
              setEditando(false)
              recarregarTudo()
            }}
          />
        </section>
      )}

      <section className="painel">
        <h2>Temperatura — últimas 48 h e próximos 3 dias</h2>
        {leituras.carregando && !leituras.dados ? (
          <Carregando />
        ) : leituras.erro ? (
          <Erro mensagem={leituras.erro} />
        ) : leituras.dados.length === 0 ? (
          <Vazio>Sem leituras ainda. Clique em “Atualizar previsão” para buscar dados da Open-Meteo.</Vazio>
        ) : (
          <GraficoTemperatura leituras={leituras.dados} culturas={p.plantios.map((pl) => pl.cultura)} />
        )}
      </section>

      <div className="grade-2">
        <section className="painel">
          <h2>Alertas</h2>
          {alertas.length === 0 ? (
            <Vazio>Nenhum alerta para os próximos dias. 🌤</Vazio>
          ) : (
            <ul className="lista-alertas">
              {alertas.map((a) => (
                <li key={a.id} className={a.lido ? 'lido' : ''}>
                  <NivelBadge nivel={a.nivel} />
                  <div>
                    <strong>{a.cultura.nome}</strong>
                    <small>
                      mínima {graus(a.temperaturaMin)} em {dataHora(a.dataReferencia)} (crítica {a.cultura.temperaturaCritica} °C)
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="painel">
          <h2>Culturas plantadas</h2>
          {p.plantios.length === 0 ? (
            <Vazio>Nenhuma cultura cadastrada nesta propriedade.</Vazio>
          ) : (
            <ul className="lista-simples">
              {p.plantios.map((pl) => (
                <li key={pl.id}>
                  <span>
                    <strong>{pl.cultura.nome}</strong> · {pl.areaHectares} ha · crítica {pl.cultura.temperaturaCritica} °C (
                    {pl.cultura.estagioSensivel})
                  </span>
                  <button
                    className="btn-icone perigo"
                    title="Remover cultura"
                    onClick={() => window.confirm(`Remover ${pl.cultura.nome}?`) && executar(() => api.delete(`/plantios/${pl.id}`), 'Cultura removida.')}
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form className="formulario linha-form" onSubmit={adicionarPlantio}>
            <select
              required
              value={novoPlantio.culturaId}
              onChange={(e) => setNovoPlantio({ ...novoPlantio, culturaId: e.target.value })}
              aria-label="Cultura"
            >
              <option value="">Adicionar cultura…</option>
              {culturasDisponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <input
              required
              type="number"
              step="0.1"
              min="0.1"
              placeholder="Área (ha)"
              value={novoPlantio.areaHectares}
              onChange={(e) => setNovoPlantio({ ...novoPlantio, areaHectares: e.target.value })}
              aria-label="Área em hectares"
            />
            <button className="btn">Adicionar</button>
          </form>

          <h2 className="mt">Registrar leitura do termômetro</h2>
          <form className="formulario linha-form" onSubmit={registrarLeitura}>
            <input
              required
              type="datetime-local"
              value={leitura.dataHora}
              onChange={(e) => setLeitura({ ...leitura, dataHora: e.target.value })}
              aria-label="Data e hora"
            />
            <input
              required
              type="number"
              step="0.1"
              placeholder="°C"
              value={leitura.temperatura}
              onChange={(e) => setLeitura({ ...leitura, temperatura: e.target.value })}
              aria-label="Temperatura em °C"
            />
            <button className="btn">Registrar</button>
          </form>
        </section>
      </div>
    </>
  )
}
