// Cenário de demonstração: simula uma frente fria na próxima madrugada nas propriedades do seed.
// Rodar com: npm run db:demo (na raiz). Não depende de internet.
// Para voltar aos dados reais, clique em "Atualizar previsões" no painel (a Open-Meteo sobrescreve estas leituras).
import { prisma } from '../src/lib/prisma.js';
import { gerarAlertas } from '../src/services/alerta.service.js';

// mínima da madrugada, vento (km/h) e nuvens (%) por propriedade — escolhidos para gerar os três níveis de alerta
const CENARIO = {
  'Pomar Boa Vista': { minima: -3.0, vento: 3, nuvens: 5 }, // céu limpo e calmo em São Joaquim → CRÍTICO
  'Sítio Coxilha Rica': { minima: 1.5, vento: 4, nuvens: 10 }, // geada de radiação em Lages → CRÍTICO/ALTO
  'Vinícola Morro Grande': { minima: 0.5, vento: 15, nuvens: 60 }, // vento e nuvens em Urubici → MODERADO
};

// Curva típica de madrugada: esfria até as 06h e esquenta depois do nascer do sol
const VARIACAO_POR_HORA = [6, 5, 4, 3, 2, 1.2, 0, 0.8, 3];

function proximaMadrugada() {
  const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  return new Date(`${amanha}T00:00:00-03:00`);
}

async function main() {
  const inicio = proximaMadrugada();

  for (const [nome, clima] of Object.entries(CENARIO)) {
    const propriedade = await prisma.propriedade.findFirst({ where: { nome } });
    if (!propriedade) {
      console.warn(`⚠ Propriedade "${nome}" não encontrada — rode o seed antes (npm run db:seed).`);
      continue;
    }

    for (const [hora, delta] of VARIACAO_POR_HORA.entries()) {
      const dataHora = new Date(inicio.getTime() + hora * 60 * 60 * 1000);
      const dados = {
        temperatura: clima.minima + delta,
        velocidadeVento: clima.vento,
        coberturaNuvens: clima.nuvens,
        umidade: 90,
        fonte: 'MANUAL',
      };
      await prisma.leituraClima.upsert({
        where: { propriedadeId_dataHora_tipo: { propriedadeId: propriedade.id, dataHora, tipo: 'PREVISTA' } },
        update: dados,
        create: { ...dados, dataHora, tipo: 'PREVISTA', propriedadeId: propriedade.id },
      });
    }

    const alertas = await gerarAlertas(propriedade.id);
    console.log(`❄  ${nome}: mínima ${clima.minima} °C → ${alertas.map((a) => a.nivel).join(', ') || 'sem alertas'}`);
  }

  console.log(`\nCenário de frente fria criado para a madrugada de ${inicio.toLocaleDateString('pt-BR')}. Abra o painel.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
