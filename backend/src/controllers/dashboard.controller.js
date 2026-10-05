import { prisma } from '../lib/prisma.js';

// GET /dashboard — números resumidos para a tela inicial
export async function resumo(req, res, next) {
  try {
    const agora = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const [produtores, propriedades, plantios, porNivel, naoLidos] = await Promise.all([
      prisma.produtor.count(),
      prisma.propriedade.count(),
      prisma.plantio.count(),
      prisma.alerta.groupBy({ by: ['nivel'], where: { dataReferencia: { gte: agora } }, _count: { _all: true } }),
      prisma.alerta.count({ where: { lido: false, dataReferencia: { gte: agora } } }),
    ]);

    const alertasPorNivel = { BAIXO: 0, MODERADO: 0, ALTO: 0, CRITICO: 0 };
    for (const linha of porNivel) alertasPorNivel[linha.nivel] = linha._count._all;

    res.json({ produtores, propriedades, plantios, alertasPorNivel, alertasNaoLidos: naoLidos });
  } catch (erro) {
    next(erro);
  }
}
