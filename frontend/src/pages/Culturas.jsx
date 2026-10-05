import { CrudTabela } from '../components/CrudTabela.jsx'

const campos = [
  { nome: 'nome', rotulo: 'Nome', obrigatorio: true },
  { nome: 'temperaturaCritica', rotulo: 'Temperatura crítica (°C)', tipo: 'number', step: '0.1', obrigatorio: true },
  { nome: 'estagioSensivel', rotulo: 'Estágio sensível', obrigatorio: true, placeholder: 'ex.: floração' },
  { nome: 'descricao', rotulo: 'Descrição' },
]

const colunas = [
  { rotulo: 'Cultura', valor: (c) => c.nome },
  { rotulo: 'Crítica', valor: (c) => `${c.temperaturaCritica} °C` },
  { rotulo: 'Estágio sensível', valor: (c) => c.estagioSensivel },
  { rotulo: 'Descrição', valor: (c) => c.descricao ?? '—' },
]

export function Culturas() {
  return (
    <>
      <CrudTabela titulo="Culturas" singular="cultura" caminho="/culturas" campos={campos} colunas={colunas} />
      <p className="nota">
        Temperatura crítica: temperatura do ar a partir da qual o estágio sensível sofre dano por geada. Os valores iniciais são
        referências aproximadas e devem ser validados com um agrônomo.
      </p>
    </>
  )
}
