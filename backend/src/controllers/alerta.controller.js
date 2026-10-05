import { prisma } from '../lib/prisma.js';
import { NIVEIS } from '../services/risco.service.js';
import { filtroAlertasSchema, idParam } from '../validators/schemas.js';

const incluir = {
  plantio: {
    include: {
      cultura: { select: { id: true, nome: true, temperaturaCritica: true } },
      propriedade: { select: { id: true, nome: true, municipio: true } },
    },
  },
};

// GET /alertas?nivel=ALTO&lido=false&propriedadeId=1
export async function listar(req, res, next) {
  try {
    const { nivel, lido, propriedadeId } = filtroAlertasSchema.parse(req.query);
    const alertas = await prisma.alerta.findMany({
      where: { nivel, lido, plantio: propriedadeId ? { propriedadeId } : undefined },
      include: incluir,
      orderBy: [{ dataReferencia: 'asc' }],
    });
    // Mais graves primeiro; dentro do mesmo nível, o mais próximo no tempo.
    alertas.sort((a, b) => NIVEIS.indexOf(b.nivel) - NIVEIS.indexOf(a.nivel) || a.dataReferencia - b.dataReferencia);
    res.json(alertas);
  } catch (erro) {
    next(erro);
  }
}

// PATCH /alertas/:id/lido
export async function marcarComoLido(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const alerta = await prisma.alerta.update({ where: { id }, data: { lido: true }, include: incluir });
    res.json(alerta);
  } catch (erro) {
    next(erro);
  }
}

export async function remover(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    await prisma.alerta.delete({ where: { id } });
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}
