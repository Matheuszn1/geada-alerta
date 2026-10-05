import { useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import { api } from '../services/api.js'
import { Carregando, Erro, Vazio } from './Estado.jsx'

// Tela de cadastro genérica: tabela + formulário de criar/editar + excluir.
// `campos`: [{ nome, rotulo, tipo, obrigatorio, step, placeholder }]
// `colunas`: [{ rotulo, valor: (item) => ReactNode }]
export function CrudTabela({ titulo, caminho, campos, colunas, singular }) {
  const { dados, carregando, erro, recarregar } = useApi(caminho)
  const vazio = Object.fromEntries(campos.map((c) => [c.nome, '']))
  const [form, setForm] = useState(vazio)
  const [editandoId, setEditandoId] = useState(null)
  const [erroForm, setErroForm] = useState(null)
  const [salvando, setSalvando] = useState(false)

  function editar(item) {
    setEditandoId(item.id)
    setForm(Object.fromEntries(campos.map((c) => [c.nome, item[c.nome] ?? ''])))
    setErroForm(null)
  }

  function cancelar() {
    setEditandoId(null)
    setForm(vazio)
    setErroForm(null)
  }

  async function salvar(e) {
    e.preventDefault()
    setSalvando(true)
    setErroForm(null)
    // Campos opcionais vazios vão como null, para não falhar na validação de número/e-mail
    const corpo = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]))
    try {
      if (editandoId) await api.put(`${caminho}/${editandoId}`, corpo)
      else await api.post(caminho, corpo)
      cancelar()
      recarregar()
    } catch (e) {
      setErroForm(e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(item) {
    if (!window.confirm(`Excluir ${singular} "${item.nome}"?`)) return
    try {
      await api.delete(`${caminho}/${item.id}`)
      if (editandoId === item.id) cancelar()
      recarregar()
    } catch (e) {
      setErroForm(e.message)
    }
  }

  return (
    <>
      <header className="cabecalho">
        <h1>{titulo}</h1>
      </header>

      <div className="grade-crud">
        <form className="painel formulario" onSubmit={salvar}>
          <h2>{editandoId ? `Editar ${singular}` : `Novo ${singular}`}</h2>
          {campos.map((c) => (
            <label key={c.nome}>
              {c.rotulo}
              {c.obrigatorio && ' *'}
              <input
                type={c.tipo ?? 'text'}
                step={c.step}
                required={c.obrigatorio}
                placeholder={c.placeholder}
                value={form[c.nome]}
                onChange={(e) => setForm({ ...form, [c.nome]: e.target.value })}
              />
            </label>
          ))}
          {erroForm && <Erro mensagem={erroForm} />}
          <div className="acoes">
            <button className="btn" disabled={salvando}>
              {salvando ? 'Salvando…' : editandoId ? 'Salvar alterações' : 'Cadastrar'}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-sec" onClick={cancelar}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <section className="painel">
          {carregando && !dados ? (
            <Carregando />
          ) : erro ? (
            <Erro mensagem={erro} aoTentarNovamente={recarregar} />
          ) : dados.length === 0 ? (
            <Vazio>Nenhum registro ainda.</Vazio>
          ) : (
            <div className="tabela-rolagem">
              <table>
                <thead>
                  <tr>
                    {colunas.map((c) => (
                      <th key={c.rotulo}>{c.rotulo}</th>
                    ))}
                    <th aria-label="Ações" />
                  </tr>
                </thead>
                <tbody>
                  {dados.map((item) => (
                    <tr key={item.id} className={editandoId === item.id ? 'selecionada' : ''}>
                      {colunas.map((c) => (
                        <td key={c.rotulo}>{c.valor(item)}</td>
                      ))}
                      <td className="acoes-linha">
                        <button className="btn-icone" onClick={() => editar(item)} title="Editar">
                          ✎
                        </button>
                        <button className="btn-icone perigo" onClick={() => excluir(item)} title="Excluir">
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
