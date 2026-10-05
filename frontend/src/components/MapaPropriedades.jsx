import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { COR_NIVEL, ROTULO_NIVEL } from '../utils/formato.js'

const CENTRO_SERRA = [-28.05, -50.0]

export function MapaPropriedades({ propriedades, altura = 360 }) {
  return (
    <MapContainer center={CENTRO_SERRA} zoom={8} style={{ height: altura }} className="mapa" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {propriedades.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.latitude, p.longitude]}
          radius={12}
          pathOptions={{ color: '#fff', weight: 2, fillColor: COR_NIVEL[p.riscoAtual], fillOpacity: 0.9 }}
        >
          <Popup>
            <strong>{p.nome}</strong>
            <br />
            {p.municipio} · {p.altitude ? `${p.altitude} m` : 'altitude n/d'}
            <br />
            Risco atual: <strong style={{ color: COR_NIVEL[p.riscoAtual] }}>{ROTULO_NIVEL[p.riscoAtual]}</strong>
            <br />
            <Link to={`/propriedades/${p.id}`}>Ver detalhes →</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
