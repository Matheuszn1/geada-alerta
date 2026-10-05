// Componentes para os estados de carregamento, erro e lista vazia.
export function Carregando({ texto = 'Carregando…' }) {
  return (
    <div className="estado" role="status">
      <span className="spinner" aria-hidden="true" /> {texto}
    </div>
  )
}

export function Erro({ mensagem, aoTentarNovamente }) {
  return (
    <div className="estado estado-erro" role="alert">
      <span>⚠ {mensagem}</span>
      {aoTentarNovamente && (
        <button className="btn btn-sec" onClick={aoTentarNovamente}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function Vazio({ children }) {
  return <div className="estado estado-vazio">{children}</div>
}
