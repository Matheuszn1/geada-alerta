import { prisma } from '../lib/prisma.js';
import { filtroAlertaAtual } from '../services/alerta.service.js';

// GET /dashboard — números resumidos para a tela inicial
export async function resumo(req, res, next) {
  try {
    const atual = filtroAlertaAtual();
    const [produtores, propriedades, plantios, porNivel, naoLidos, propriedadesEmRisco] = await Promise.all([
      prisma.produtor.count(),
      prisma.propriedade.count(),
      prisma.plantio.count(),
      prisma.alerta.groupBy({ by: ['nivel'], where: atual, _count: { _all: true } }),
      prisma.alerta.count({ where: { ...atual, lido: false } }),
      prisma.propriedade.count({ where: { plantios: { some: { alertas: { some: atual } } } } }),
    ]);

    const alertasPorNivel = { BAIXO: 0, MODERADO: 0, ALTO: 0, CRITICO: 0 };
    for (const linha of porNivel) alertasPorNivel[linha.nivel] = linha._count._all;

    res.json({
      produtores,
      propriedades,
      plantios,
      alertasPorNivel,
      alertasNaoLidos: naoLidos,
      propriedadesSemRisco: propriedades - propriedadesEmRisco,
    });
  } catch (erro) {
    next(erro);
  }
}
