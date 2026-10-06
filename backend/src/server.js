import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

// API_PORT (e não PORT): ferramentas como o Vite, previews e plataformas de hospedagem costumam
// definir PORT para outro processo, o que faria a API disputar a porta do frontend.
const PORT = Number(process.env.API_PORT ?? 3333);

const server = app.listen(PORT, () => {
  console.log(`🌡️  GeadaAlerta API rodando em http://localhost:${PORT}/api`);
});

// Encerra o pool de conexões do banco ao parar o servidor (Ctrl+C ou reinício do nodemon)
async function encerrar() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
