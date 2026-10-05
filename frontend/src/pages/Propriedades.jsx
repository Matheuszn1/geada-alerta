import { Link } from 'react-router-dom'
import { Carregando, Erro, Vazio } from '../components/Estado.jsx'
import { FormPropriedade } from '../components/FormPropriedade.jsx'
import { NivelBadge } from '../components/NivelBadge.jsx'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'

export function Propriedades() {
  const { dados, carregando, erro, recarregar } = useApi('/propriedades')

  async function criar(form) {
    await api.post('/propriedades', form)
    recarregar()
  }

  return (
    <>
      <header className="cabecalho">
        <h1>Propriedades</h1>
      </header>

      <div className="grade-crud">
        <section className="painel">
          <h2>Nova propriedade</h2>
          <FormPropriedade aoSalvar={criar} />
        </section>

        <section>
          {carregando && !dados ? (
            <Carregando />
          ) : erro ? (
            <Erro mensagem={erro} aoTentarNovamente={recarregar} />
          ) : dados.length === 0 ? (
            <Vazio>Nenhuma propriedade cadastrada.</Vazio>
          ) : (
            <ul className="cartoes-propriedade">
              {dados.map((p) => (
                <li key={p.id}>
                  <Link to={`/propriedades/${p.id}`} className={`cartao-propriedade borda-${p.riscoAtual.toLowerCase()}`}>
                    <div className="topo">
                      <strong>{p.nome}</strong>
                      <NivelBadge nivel={p.riscoAtual} />
                    </div>
                    <span>
                      {p.municipio}
                      {p.altitude ? ` · ${p.altitude} m` : ''}
                    </span>
                    <span className="sub">Produtor: {p.produtor.nome}</span>
                    <span className="sub">
                      Culturas: {p.plantios.length ? p.plantios.map((pl) => pl.cultura.nome).join(', ') : 'nenhuma'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
