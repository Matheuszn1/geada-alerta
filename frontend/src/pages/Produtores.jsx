import { CrudTabela } from '../components/CrudTabela.jsx'

const campos = [
  { nome: 'nome', rotulo: 'Nome', obrigatorio: true },
  { nome: 'email', rotulo: 'E-mail', tipo: 'email', obrigatorio: true },
  { nome: 'telefone', rotulo: 'Telefone', placeholder: '(49) 99999-0000' },
]

const colunas = [
  { rotulo: 'Nome', valor: (p) => p.nome },
  { rotulo: 'E-mail', valor: (p) => p.email },
  { rotulo: 'Telefone', valor: (p) => p.telefone ?? '—' },
  { rotulo: 'Propriedades', valor: (p) => p._count?.propriedades ?? 0 },
]

export function Produtores() {
  return <CrudTabela titulo="Produtores" singular="produtor" caminho="/produtores" campos={campos} colunas={colunas} />
}
