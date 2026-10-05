import { Router } from 'express';
import * as alertas from '../controllers/alerta.controller.js';
import * as culturas from '../controllers/cultura.controller.js';
import * as dashboard from '../controllers/dashboard.controller.js';
import * as plantios from '../controllers/plantio.controller.js';
import * as produtores from '../controllers/produtor.controller.js';
import * as propriedades from '../controllers/propriedade.controller.js';

// Rotas REST padrão (GET lista, GET :id, POST, PUT :id, DELETE :id) para um controller
function crud(controller) {
  const router = Router();
  router.get('/', controller.listar);
  router.get('/:id', controller.buscarPorId);
  router.post('/', controller.criar);
  router.put('/:id', controller.atualizar);
  router.delete('/:id', controller.remover);
  return router;
}

const propriedadesRouter = crud(propriedades);
propriedadesRouter.get('/:id/leituras', propriedades.listarLeituras);
propriedadesRouter.post('/:id/leituras', propriedades.registrarLeitura);
propriedadesRouter.post('/:id/atualizar-previsao', propriedades.atualizarPrevisao);

const alertasRouter = Router();
alertasRouter.get('/', alertas.listar);
alertasRouter.patch('/:id/lido', alertas.marcarComoLido);
alertasRouter.delete('/:id', alertas.remover);

export const rotas = Router();
rotas.get('/health', (req, res) => res.json({ status: 'ok', horario: new Date().toISOString() }));
rotas.get('/dashboard', dashboard.resumo);
rotas.use('/produtores', crud(produtores));
rotas.use('/propriedades', propriedadesRouter);
rotas.use('/culturas', crud(culturas));
rotas.use('/plantios', crud(plantios));
rotas.use('/alertas', alertasRouter);
