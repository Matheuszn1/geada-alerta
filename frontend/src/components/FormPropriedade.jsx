import { useState } from 'react'
import { useApi } from '../hooks/useApi.js'
import { Erro } from './Estado.jsx'

const VAZIO = { nome: '', municipio: '', latitude: '', longitude: '', altitude: '', produtorId: '' }

// Formulário de criar/editar propriedade. `aoSalvar(dados)` deve lançar erro em caso de falha.
export function FormPropriedade({ inicial, aoSalvar, aoCancelar, textoBotao = 'Cadastrar' }) {
  const produtores = useApi('/produtores')
  const [form, setForm] = useState(inicial ? { ...VAZIO, ...inicial, altitude: inicial.altitude ?? '' } : VAZIO)
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const campo = (nome) => ({ value: form[nome], onChange: (e) => setForm({ ...form, [nome]: e.target.value }) })

  async function enviar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      await aoSalvar({ ...form, altitude: form.altitude === '' ? null : form.altitude })
      if (!inicial) setForm(VAZIO)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <label>
        Nome *
        <input required {...campo('nome')} placeholder="Pomar Boa Vista" />
      </label>
      <label>
        Município *
        <input required {...campo('municipio')} placeholder="São Joaquim" />
      </label>
      <div className="linha-campos">
        <label>
          Latitude *
          <input required type="number" step="0.0001" {...campo('latitude')} placeholder="-28.2939" />
        </label>
        <label>
          Longitude *
          <input required type="number" step="0.0001" {...campo('longitude')} placeholder="-49.9317" />
        </label>
      </div>
      <label>
        Altitude (m)
        <input type="number" {...campo('altitude')} placeholder="1353" />
      </label>
      <label>
        Produtor *
        <select required {...campo('produtorId')}>
          <option value="">Selecione…</option>
          {produtores.dados?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>
      <small className="dica">Dica: no Google Maps, clique com o botão direito no local para copiar as coordenadas.</small>
      {erro && <Erro mensagem={erro} />}
      <div className="acoes">
        <button className="btn" disabled={salvando}>
          {salvando ? 'Salvando…' : textoBotao}
        </button>
        {aoCancelar && (
          <button type="button" className="btn btn-sec" onClick={aoCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
