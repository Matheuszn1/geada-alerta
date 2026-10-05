import { prisma } from '../lib/prisma.js';
import { calcularRisco, montarMensagem } from './risco.service.js';

const FUSO = 'America/Sao_Paulo';
const diaLocal = (data) => data.toLocaleDateString('en-CA', { timeZone: FUSO }); // AAAA-MM-DD

// Para cada dia, a leitura com a menor temperatura (é ela que define o risco da noite).
export function minimasPorDia(leituras) {
  const porDia = new Map();
  for (const leitura of leituras) {
    const dia = diaLocal(leitura.dataHora);
    const atual = porDia.get(dia);
    if (!atual || leitura.temperatura < atual.temperatura) porDia.set(dia, leitura);
  }
  return [...porDia.values()].sort((a, b) => a.dataHora - b.dataHora);
}

// Recalcula os alertas futuros de uma propriedade a partir das leituras já gravadas.
export async function gerarAlertas(propriedadeId) {
  const inicioHoje = new Date(`${diaLocal(new Date())}T00:00:00-03:00`);

  const propriedade = await prisma.propriedade.findUniqueOrThrow({
    where: { id: propriedadeId },
    include: { plantios: { include: { cultura: true } } },
  });
  const leituras = await prisma.leituraClima.findMany({
    where: { propriedadeId, dataHora: { gte: inicioHoje } },
    orderBy: { dataHora: 'asc' },
  });

  const minimas = minimasPorDia(leituras);
  const plantioIds = propriedade.plantios.map((p) => p.id);
  const operacoes = [
    // Alertas futuros ainda não lidos são recriados; os já lidos são preservados pelo upsert.
    prisma.alerta.deleteMany({ where: { plantioId: { in: plantioIds }, dataReferencia: { gte: inicioHoje }, lido: false } }),
  ];
  const gerados = [];

  for (const plantio of propriedade.plantios) {
    for (const minima of minimas) {
      const risco = calcularRisco({
        temperaturaMin: minima.temperatura,
        temperaturaCritica: plantio.cultura.temperaturaCritica,
        velocidadeVento: minima.velocidadeVento,
        coberturaNuvens: minima.coberturaNuvens,
      });
      if (risco.nivel === 'BAIXO') continue;

      const dados = {
        temperaturaMin: minima.temperatura,
        nivel: risco.nivel,
        mensagem: montarMensagem({
          cultura: plantio.cultura.nome,
          propriedade: propriedade.nome,
          temperaturaMin: minima.temperatura,
          nivel: risco.nivel,
          radiativa: risco.radiativa,
          data: minima.dataHora,
        }),
      };
      gerados.push({ plantioId: plantio.id, ...dados });
      operacoes.push(
        prisma.alerta.upsert({
          where: { plantioId_dataReferencia: { plantioId: plantio.id, dataReferencia: minima.dataHora } },
          update: dados,
          create: { ...dados, plantioId: plantio.id, dataReferencia: minima.dataHora },
        }),
      );
    }
  }

  await prisma.$transaction(operacoes);
  return gerados;
}
