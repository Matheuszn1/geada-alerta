// Dados iniciais para demonstração. Rodar com: npm run prisma:seed
// Temperaturas críticas: valores de referência aproximados (≈10% de dano no estágio sensível),
// usados para fins acadêmicos — em produção devem ser validados com um agrônomo / Epagri.
import { prisma } from '../src/lib/prisma.js';

const culturas = [
  { nome: 'Maçã', temperaturaCritica: -2.2, estagioSensivel: 'floração plena', descricao: 'Principal cultura de São Joaquim e região.' },
  { nome: 'Uva', temperaturaCritica: -1.1, estagioSensivel: 'brotação', descricao: 'Vinhos de altitude da Serra Catarinense.' },
  { nome: 'Pêssego', temperaturaCritica: -3.3, estagioSensivel: 'floração plena' },
  { nome: 'Alho', temperaturaCritica: -4.0, estagioSensivel: 'desenvolvimento vegetativo' },
  { nome: 'Tomate', temperaturaCritica: 0.0, estagioSensivel: 'todo o ciclo', descricao: 'Muito sensível; dano já perto de 0 °C.' },
  { nome: 'Alface', temperaturaCritica: -1.0, estagioSensivel: 'pré-colheita' },
];

async function main() {
  for (const c of culturas) {
    await prisma.cultura.upsert({ where: { nome: c.nome }, update: c, create: c });
  }
  const porNome = Object.fromEntries((await prisma.cultura.findMany()).map((c) => [c.nome, c.id]));

  const produtor = await prisma.produtor.upsert({
    where: { email: 'joao.serrano@exemplo.com' },
    update: {},
    create: { nome: 'João Serrano', email: 'joao.serrano@exemplo.com', telefone: '(49) 99999-0001' },
  });
  const produtora = await prisma.produtor.upsert({
    where: { email: 'ana.coxilha@exemplo.com' },
    update: {},
    create: { nome: 'Ana Coxilha', email: 'ana.coxilha@exemplo.com', telefone: '(49) 99999-0002' },
  });

  const propriedades = [
    { nome: 'Pomar Boa Vista', municipio: 'São Joaquim', latitude: -28.2939, longitude: -49.9317, altitude: 1353, produtorId: produtor.id, plantios: [['Maçã', 12], ['Uva', 4]] },
    { nome: 'Sítio Coxilha Rica', municipio: 'Lages', latitude: -27.8161, longitude: -50.3259, altitude: 916, produtorId: produtora.id, plantios: [['Alho', 3], ['Alface', 0.5], ['Tomate', 1]] },
    { nome: 'Vinícola Morro Grande', municipio: 'Urubici', latitude: -28.015, longitude: -49.5917, altitude: 915, produtorId: produtora.id, plantios: [['Uva', 8], ['Pêssego', 2]] },
  ];

  for (const { plantios, ...dados } of propriedades) {
    const existente = await prisma.propriedade.findFirst({ where: { nome: dados.nome } });
    const propriedade = existente ?? (await prisma.propriedade.create({ data: dados }));
    for (const [cultura, area] of plantios) {
      await prisma.plantio.upsert({
        where: { propriedadeId_culturaId: { propriedadeId: propriedade.id, culturaId: porNome[cultura] } },
        update: {},
        create: { propriedadeId: propriedade.id, culturaId: porNome[cultura], areaHectares: area },
      });
    }
  }

  console.log('🌱 Seed concluído: culturas, 2 produtores e 3 propriedades da Serra Catarinense.');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
