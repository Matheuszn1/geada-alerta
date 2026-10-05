import { prisma } from '../lib/prisma.js';
import { gerarAlertas } from '../services/alerta.service.js';
import { sincronizarPrevisao } from '../services/clima.service.js';
import { NIVEIS } from '../services/risco.service.js';
import { idParam, leituraManualSchema, propriedadeSchema } from '../validators/schemas.js';

const DOZE_HORAS = 12 * 60 * 60 * 1000;

// Maior nível entre os alertas ainda relevantes (das últimas 12 h em diante) da propriedade.
function riscoAtual(propriedade) {
  const niveis = propriedade.plantios.flatMap((p) => p.alertas.map((a) => NIVEIS.indexOf(a.nivel)));
  return niveis.length ? NIVEIS[Math.max(...niveis)] : 'BAIXO';
}

function incluirAlertasRecentes() {
  return {
    produtor: { select: { id: true, nome: true } },
    plantios: {
      include: {
        cultura: true,
        alertas: { where: { dataReferencia: { gte: new Date(Date.now() - DOZE_HORAS) } }, orderBy: { dataReferencia: 'asc' } },
      },
    },
  };
}

export async function listar(req, res, next) {
  try {
    const produtorId = req.query.produtorId ? idParam.parse(req.query.produtorId) : undefined;
    const propriedades = await prisma.propriedade.findMany({
      where: { produtorId },
      include: incluirAlertasRecentes(),
      orderBy: { nome: 'asc' },
    });
    res.json(propriedades.map((p) => ({ ...p, riscoAtual: riscoAtual(p) })));
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const propriedade = await prisma.propriedade.findUnique({ where: { id }, include: incluirAlertasRecentes() });
    if (!propriedade) return res.status(404).json({ erro: 'Propriedade não encontrada' });
    res.json({ ...propriedade, riscoAtual: riscoAtual(propriedade) });
  } catch (erro) {
    next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const dados = propriedadeSchema.parse(req.body);
    const propriedade = await prisma.propriedade.create({ data: dados });
    res.status(201).json(propriedade);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const dados = propriedadeSchema.partial().parse(req.body);
    const propriedade = await prisma.propriedade.update({ where: { id }, data: dados });
    res.json(propriedade);
  } catch (erro) {
    next(erro);
  }
}

export async function remover(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    await prisma.propriedade.delete({ where: { id } });
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}

// GET /propriedades/:id/leituras?desde=2026-10-01
export async function listarLeituras(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const desde = req.query.desde ? new Date(req.query.desde) : new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(desde.getTime())) return res.status(400).json({ erro: 'Parâmetro "desde" inválido' });

    const leituras = await prisma.leituraClima.findMany({
      where: { propriedadeId: id, dataHora: { gte: desde } },
      orderBy: { dataHora: 'asc' },
    });
    res.json(leituras);
  } catch (erro) {
    next(erro);
  }
}

// POST /propriedades/:id/leituras — leitura feita pelo produtor (termômetro da propriedade)
export async function registrarLeitura(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const dados = leituraManualSchema.parse(req.body);
    const leitura = await prisma.leituraClima.create({
      data: { ...dados, propriedadeId: id, fonte: 'MANUAL', tipo: 'OBSERVADA' },
    });
    const alertas = await gerarAlertas(id);
    res.status(201).json({ leitura, alertasGerados: alertas.length });
  } catch (erro) {
    next(erro);
  }
}

// POST /propriedades/:id/atualizar-previsao — busca a previsão na Open-Meteo e recalcula os alertas
export async function atualizarPrevisao(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const propriedade = await prisma.propriedade.findUnique({ where: { id } });
    if (!propriedade) return res.status(404).json({ erro: 'Propriedade não encontrada' });

    const leiturasSalvas = await sincronizarPrevisao(propriedade);
    const alertas = await gerarAlertas(id);
    res.json({ leiturasSalvas, alertasGerados: alertas.length, alertas });
  } catch (erro) {
    next(erro);
  }
}
