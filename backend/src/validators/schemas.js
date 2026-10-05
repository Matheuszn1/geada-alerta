// Validação das entradas da API com zod: o controller só recebe dados já limpos e tipados.
import { z } from 'zod';

export const idParam = z.coerce.number().int().positive({ message: 'id inválido' });

export const produtorSchema = z.object({
  nome: z.string().trim().min(2, 'nome deve ter ao menos 2 caracteres'),
  email: z.email('e-mail inválido').trim().toLowerCase(),
  telefone: z.string().trim().max(20).optional().nullable(),
});

export const propriedadeSchema = z.object({
  nome: z.string().trim().min(2),
  municipio: z.string().trim().min(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  altitude: z.coerce.number().int().min(0).max(9000).optional().nullable(),
  produtorId: idParam,
});

export const culturaSchema = z.object({
  nome: z.string().trim().min(2),
  temperaturaCritica: z.coerce.number().min(-15).max(15),
  estagioSensivel: z.string().trim().min(2),
  descricao: z.string().trim().optional().nullable(),
});

export const plantioSchema = z.object({
  areaHectares: z.coerce.number().positive('área deve ser maior que zero'),
  dataPlantio: z.coerce.date().optional().nullable(),
  propriedadeId: idParam,
  culturaId: idParam,
});

export const leituraManualSchema = z.object({
  dataHora: z.coerce.date(),
  temperatura: z.coerce.number().min(-30).max(50),
  umidade: z.coerce.number().min(0).max(100).optional().nullable(),
  velocidadeVento: z.coerce.number().min(0).max(300).optional().nullable(),
  coberturaNuvens: z.coerce.number().min(0).max(100).optional().nullable(),
});

export const filtroAlertasSchema = z.object({
  nivel: z.enum(['BAIXO', 'MODERADO', 'ALTO', 'CRITICO']).optional(),
  lido: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  propriedadeId: idParam.optional(),
});
