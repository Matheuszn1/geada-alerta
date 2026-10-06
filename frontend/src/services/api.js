// Cliente HTTP único do frontend. Usa a Fetch API e transforma respostas de erro em exceções legíveis.
const BASE = '/api'

export class ErroApi extends Error {
  constructor(mensagem, status, detalhes) {
    super(mensagem)
    this.status = status
    this.detalhes = detalhes
  }
}

async function requisicao(caminho, { method = 'GET', body } = {}) {
  let resposta
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ErroApi('Não foi possível conectar ao servidor. O backend está rodando?', 0)
  }

  if (resposta.status === 204) return null
  const dados = await resposta.json().catch(() => null)

  // 502/503/504 sem corpo JSON: o proxy do Vite não alcançou o backend (API desligada ou reiniciando)
  if (!dados && resposta.status >= 502 && resposta.status <= 504) {
    throw new ErroApi('Não foi possível conectar ao servidor. O backend está rodando?', resposta.status)
  }

  if (!resposta.ok) {
    const detalhes = dados?.detalhes?.map((d) => `${d.campo}: ${d.mensagem}`).join('; ')
    throw new ErroApi(detalhes ? `${dados.erro} — ${detalhes}` : dados?.erro ?? `Erro ${resposta.status}`, resposta.status, dados?.detalhes)
  }
  return dados
}

export const api = {
  get: (caminho) => requisicao(caminho),
  post: (caminho, body) => requisicao(caminho, { method: 'POST', body: body ?? {} }),
  put: (caminho, body) => requisicao(caminho, { method: 'PUT', body }),
  patch: (caminho, body) => requisicao(caminho, { method: 'PATCH', body: body ?? {} }),
  delete: (caminho) => requisicao(caminho, { method: 'DELETE' }),
}
