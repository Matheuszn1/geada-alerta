import { NavLink, Route, Routes } from 'react-router-dom'
import { Alertas } from './pages/Alertas.jsx'
import { Culturas } from './pages/Culturas.jsx'
import { Painel } from './pages/Painel.jsx'
import { Produtores } from './pages/Produtores.jsx'
import { PropriedadeDetalhe } from './pages/PropriedadeDetalhe.jsx'
import { Propriedades } from './pages/Propriedades.jsx'

const menu = [
  { para: '/', rotulo: 'Painel', fim: true },
  { para: '/propriedades', rotulo: 'Propriedades' },
  { para: '/alertas', rotulo: 'Alertas' },
  { para: '/produtores', rotulo: 'Produtores' },
  { para: '/culturas', rotulo: 'Culturas' },
]

export default function App() {
  return (
    <div className="app">
      <nav className="barra">
        <NavLink to="/" className="marca">
          <img src="/favicon.svg" alt="" width="28" height="28" /> GeadaAlerta
        </NavLink>
        <ul>
          {menu.map((item) => (
            <li key={item.para}>
              <NavLink to={item.para} end={item.fim}>
                {item.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <main className="conteudo">
        <Routes>
          <Route path="/" element={<Painel />} />
          <Route path="/propriedades" element={<Propriedades />} />
          <Route path="/propriedades/:id" element={<PropriedadeDetalhe />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="/produtores" element={<Produtores />} />
          <Route path="/culturas" element={<Culturas />} />
          <Route path="*" element={<p>Página não encontrada.</p>} />
        </Routes>
      </main>

      <footer className="rodape-app">
        GeadaAlerta · dados meteorológicos:{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>{' '}
        · mapas © OpenStreetMap
      </footer>
    </div>
  )
}
