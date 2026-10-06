import { prisma } from '../lib/prisma.js';
import { calcularRisco, montarMensagem } from './risco.service.js';

const FUSO = 'America/Sao_Paulo';
const diaLocal = (data) => data.toLocaleDateString('en-CA', { timeZone: FUSO }); // AAAA-MM-DD

// Um alerta é "atual" até 12 h depois do horário da mínima (cobre a madrugada que acabou de passar).
// Fonte única dessa regra: painel, mapa e lista de alertas usam o mesmo filtro.
const JANELA_ALERTA_ATUAL_MS = 12 * 60 * 60 * 1000;
const inicioJanelaAtual = () => new Date(Date.now() - JANELA_ALERTA_ATUAL_MS);
export const filtroAlertaAtual = () => ({ dataReferencia: { gte: inicioJanelaAtual() } });

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

// Recalcula os alertas atuais de uma propriedade a partir das leituras já gravadas.
// Usa a mesma janela do filtroAlertaAtual: assim todo alerta gerado aparece no painel.
export async function gerarAlertas(propriedadeId) {
  const inicio = inicioJanelaAtual();

  const propriedade = await prisma.propriedade.findUniqueOrThrow({
    where: { id: propriedadeId },
    include: { plantios: { include: { cultura: true } } },
  });
  const leituras = await prisma.leituraClima.findMany({
    where: { propriedadeId, dataHora: { gte: inicio } },
    orderBy: { dataHora: 'asc' },
  });

  const minimas = minimasPorDia(leituras);
  const plantioIds = propriedade.plantios.map((p) => p.id);
  const operacoes = [
    // Alertas atuais ainda não lidos são recriados; os já lidos são preservados pelo upsert.
    prisma.alerta.deleteMany({ where: { plantioId: { in: plantioIds }, dataReferencia: { gte: inicio }, lido: false } }),
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
          tipo: minima.tipo,
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
