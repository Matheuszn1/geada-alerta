// Integração com a API pública Open-Meteo (gratuita, sem chave de acesso).
// Docs: https://open-meteo.com/en/docs
import { prisma } from '../lib/prisma.js';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const VARIAVEIS = ['temperature_2m', 'relative_humidity_2m', 'wind_speed_10m', 'cloud_cover'];

export class ErroServicoExterno extends Error {
  constructor(message) {
    super(message);
    this.status = 502;
  }
}

export async function buscarPrevisao({ latitude, longitude, dias = 3 }) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: VARIAVEIS.join(','),
    forecast_days: String(dias),
    timezone: 'GMT', // horários em UTC; a conversão para o fuso local fica a cargo do frontend
  });

  let resposta;
  try {
    resposta = await fetch(`${OPEN_METEO_URL}?${params}`, { signal: AbortSignal.timeout(10_000) });
  } catch (erro) {
    throw new ErroServicoExterno(`Não foi possível contatar a Open-Meteo: ${erro.message}`);
  }
  if (!resposta.ok) {
    throw new ErroServicoExterno(`Open-Meteo respondeu com status ${resposta.status}`);
  }

  const { hourly } = await resposta.json();
  return hourly.time.map((hora, i) => ({
    dataHora: new Date(`${hora}:00Z`),
    temperatura: hourly.temperature_2m[i],
    umidade: hourly.relative_humidity_2m[i],
    velocidadeVento: hourly.wind_speed_10m[i],
    coberturaNuvens: hourly.cloud_cover[i],
  })).filter((l) => l.temperatura != null);
}

// Busca a previsão e grava (ou atualiza) as leituras PREVISTAS da propriedade.
export async function sincronizarPrevisao(propriedade) {
  const leituras = await buscarPrevisao(propriedade);

  await prisma.$transaction(
    leituras.map((l) =>
      prisma.leituraClima.upsert({
        where: {
          propriedadeId_dataHora_tipo: { propriedadeId: propriedade.id, dataHora: l.dataHora, tipo: 'PREVISTA' },
        },
        update: { ...l, fonte: 'OPEN_METEO' },
        create: { ...l, fonte: 'OPEN_METEO', tipo: 'PREVISTA', propriedadeId: propriedade.id },
      }),
    ),
  );

  return leituras.length;
}
