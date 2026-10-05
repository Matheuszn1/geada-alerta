import { prisma } from '../lib/prisma.js';
import { culturaSchema, idParam } from '../validators/schemas.js';

export async function listar(req, res, next) {
  try {
    const culturas = await prisma.cultura.findMany({ orderBy: { nome: 'asc' } });
    res.json(culturas);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const cultura = await prisma.cultura.findUnique({ where: { id } });
    if (!cultura) return res.status(404).json({ erro: 'Cultura não encontrada' });
    res.json(cultura);
  } catch (erro) {
    next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const dados = culturaSchema.parse(req.body);
    const cultura = await prisma.cultura.create({ data: dados });
    res.status(201).json(cultura);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const dados = culturaSchema.partial().parse(req.body);
    const cultura = await prisma.cultura.update({ where: { id }, data: dados });
    res.json(cultura);
  } catch (erro) {
    next(erro);
  }
}

export async function remover(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    // Se a cultura estiver em algum plantio, o banco recusa (P2003 -> 409).
    await prisma.cultura.delete({ where: { id } });
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}
