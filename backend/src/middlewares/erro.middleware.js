import { ZodError } from 'zod';

// Traduz erros conhecidos (validação e Prisma) em respostas HTTP com status corretos.
// eslint-disable-next-line no-unused-vars
export function tratarErros(erro, req, res, next) {
  if (erro instanceof ZodError) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: erro.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
    });
  }

  switch (erro.code) {
    case 'P2002': // violação de @unique
      return res.status(409).json({ erro: 'Registro duplicado', campos: erro.meta?.target ?? erro.meta?.driverAdapterError?.cause?.constraint?.fields });
    case 'P2003': // violação de chave estrangeira
      return res.status(409).json({ erro: 'Operação viola um relacionamento (registro em uso ou referência inexistente)' });
    case 'P2025': // registro não encontrado em update/delete/findUniqueOrThrow
      return res.status(404).json({ erro: 'Registro não encontrado' });
  }

  if (erro.status) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não existe` });
}
