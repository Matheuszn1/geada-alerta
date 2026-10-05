// Testes da regra de risco (sem banco de dados). Rodar com: npm test
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calcularRisco } from '../src/services/risco.service.js';

const MACA = -2.2;
const ventoForteNublado = { velocidadeVento: 20, coberturaNuvens: 90 };
const calmoCeuLimpo = { velocidadeVento: 3, coberturaNuvens: 10 };

describe('calcularRisco', () => {
  it('é CRITICO quando a mínima atinge a temperatura crítica', () => {
    assert.equal(calcularRisco({ temperaturaMin: -2.2, temperaturaCritica: MACA, ...ventoForteNublado }).nivel, 'CRITICO');
    assert.equal(calcularRisco({ temperaturaMin: -5, temperaturaCritica: MACA, ...ventoForteNublado }).nivel, 'CRITICO');
  });

  it('classifica pela margem até a temperatura crítica', () => {
    assert.equal(calcularRisco({ temperaturaMin: -1.0, temperaturaCritica: MACA, ...ventoForteNublado }).nivel, 'ALTO'); // margem 1.2
    assert.equal(calcularRisco({ temperaturaMin: 0.5, temperaturaCritica: MACA, ...ventoForteNublado }).nivel, 'MODERADO'); // margem 2.7
    assert.equal(calcularRisco({ temperaturaMin: 5, temperaturaCritica: MACA, ...ventoForteNublado }).nivel, 'BAIXO');
  });

  it('sobe um nível em noite de céu limpo e vento calmo (geada de radiação)', () => {
    const r = calcularRisco({ temperaturaMin: 0.5, temperaturaCritica: MACA, ...calmoCeuLimpo });
    assert.equal(r.nivel, 'ALTO');
    assert.equal(r.radiativa, true);
  });

  it('não passa de CRITICO', () => {
    assert.equal(calcularRisco({ temperaturaMin: -6, temperaturaCritica: MACA, ...calmoCeuLimpo }).nivel, 'CRITICO');
  });

  it('não aplica agravante sem dados de vento/nuvens (leitura manual)', () => {
    const r = calcularRisco({ temperaturaMin: 0.5, temperaturaCritica: MACA });
    assert.equal(r.nivel, 'MODERADO');
    assert.equal(r.radiativa, false);
  });

  it('rejeita entradas não numéricas', () => {
    assert.throws(() => calcularRisco({ temperaturaMin: undefined, temperaturaCritica: MACA }), TypeError);
  });
});
