// Regra de negócio central do GeadaAlerta: classificar o risco de geada para uma cultura.
//
// Entrada: a temperatura mínima prevista (a 2 m do solo, como fornecem as estações e a Open-Meteo)
// e a temperatura crítica da cultura no estágio sensível.
//
// Por que existe o "agravante radiativo": em noites de céu limpo e vento fraco (geada de radiação,
// a mais comum na Serra Catarinense) a superfície das plantas perde calor e fica de 2 a 4 °C mais
// fria que o ar medido a 2 m. Nessas condições o nível de risco sobe um degrau.

export const NIVEIS = ['BAIXO', 'MODERADO', 'ALTO', 'CRITICO'];

export const LIMITES = {
  ALTO: 1.5, // margem (°C) até a temperatura crítica
  MODERADO: 3,
  VENTO_CALMO_KMH: 7,
  CEU_LIMPO_PCT: 30,
};

export function condicaoRadiativa({ velocidadeVento, coberturaNuvens } = {}) {
  if (velocidadeVento == null || coberturaNuvens == null) return false;
  return velocidadeVento < LIMITES.VENTO_CALMO_KMH && coberturaNuvens < LIMITES.CEU_LIMPO_PCT;
}

export function calcularRisco({ temperaturaMin, temperaturaCritica, velocidadeVento, coberturaNuvens }) {
  if (!Number.isFinite(temperaturaMin) || !Number.isFinite(temperaturaCritica)) {
    throw new TypeError('temperaturaMin e temperaturaCritica devem ser números');
  }

  const margem = temperaturaMin - temperaturaCritica;
  let indice;
  if (margem <= 0) indice = 3;
  else if (margem <= LIMITES.ALTO) indice = 2;
  else if (margem <= LIMITES.MODERADO) indice = 1;
  else indice = 0;

  const radiativa = condicaoRadiativa({ velocidadeVento, coberturaNuvens });
  if (radiativa && indice < 3) indice += 1;

  return {
    nivel: NIVEIS[indice],
    margem: Number(margem.toFixed(1)),
    radiativa,
  };
}

export function montarMensagem({ cultura, propriedade, temperaturaMin, nivel, radiativa, data, tipo = 'PREVISTA' }) {
  const dia = data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const origem = tipo === 'OBSERVADA' ? 'registrada no termômetro' : 'prevista';
  const extra = radiativa ? ' Céu limpo e vento calmo favorecem geada de radiação.' : '';
  return `Risco ${nivel} para ${cultura} em ${propriedade}: mínima de ${temperaturaMin.toFixed(1)} °C ${origem} para ${dia} às ${hora}.${extra}`;
}
