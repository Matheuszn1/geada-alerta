import { prisma } from '../lib/prisma.js';
import { idParam, plantioSchema } from '../validators/schemas.js';

const incluir = { cultura: true, propriedade: { select: { id: true, nome: true } } };

export async function listar(req, res, next) {
  try {
    const propriedadeId = req.query.propriedadeId ? idParam.parse(req.query.propriedadeId) : undefined;
    const plantios = await prisma.plantio.findMany({
      where: { propriedadeId },
      include: incluir,
      orderBy: { id: 'asc' },
    });
    res.json(plantios);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const plantio = await prisma.plantio.findUnique({ where: { id }, include: incluir });
    if (!plantio) return res.status(404).json({ erro: 'Plantio não encontrado' });
    res.json(plantio);
  } catch (erro) {
    next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const dados = plantioSchema.parse(req.body);
    const plantio = await prisma.plantio.create({ data: dados, include: incluir });
    res.status(201).json(plantio);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const dados = plantioSchema.partial().parse(req.body);
    const plantio = await prisma.plantio.update({ where: { id }, data: dados, include: incluir });
    res.json(plantio);
  } catch (erro) {
    next(erro);
  }
}

export async function remover(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    await prisma.plantio.delete({ where: { id } });
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}
