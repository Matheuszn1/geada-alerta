import { prisma } from '../lib/prisma.js';
import { idParam, produtorSchema } from '../validators/schemas.js';

export async function listar(req, res, next) {
  try {
    const produtores = await prisma.produtor.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { propriedades: true } } },
    });
    res.json(produtores);
  } catch (erro) {
    next(erro);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const produtor = await prisma.produtor.findUnique({
      where: { id },
      include: { propriedades: true },
    });
    if (!produtor) return res.status(404).json({ erro: 'Produtor não encontrado' });
    res.json(produtor);
  } catch (erro) {
    next(erro);
  }
}

export async function criar(req, res, next) {
  try {
    const dados = produtorSchema.parse(req.body);
    const produtor = await prisma.produtor.create({ data: dados });
    res.status(201).json(produtor);
  } catch (erro) {
    next(erro);
  }
}

export async function atualizar(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    const dados = produtorSchema.partial().parse(req.body);
    const produtor = await prisma.produtor.update({ where: { id }, data: dados });
    res.json(produtor);
  } catch (erro) {
    next(erro);
  }
}

export async function remover(req, res, next) {
  try {
    const id = idParam.parse(req.params.id);
    await prisma.produtor.delete({ where: { id } });
    res.status(204).end();
  } catch (erro) {
    next(erro);
  }
}
