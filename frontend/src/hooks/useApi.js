import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'

// Carrega dados de um GET e expõe os estados de carregamento e erro, além de recarregar().
// A flag `ativo` descarta respostas de requisições antigas (ex.: filtro trocado antes da resposta chegar).
export function useApi(caminho) {
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [versao, setVersao] = useState(0)

  useEffect(() => {
    let ativo = true
    api
      .get(caminho)
      .then((resposta) => {
        if (!ativo) return
        setDados(resposta)
        setErro(null)
      })
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [caminho, versao])

  const recarregar = useCallback(() => {
    setCarregando(true)
    setVersao((v) => v + 1)
  }, [])

  return { dados, carregando, erro, recarregar }
}
