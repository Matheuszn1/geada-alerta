# ❄️ GeadaAlerta

**Monitoramento de risco de geada para produtores da Serra Catarinense.**

O produtor cadastra suas propriedades e o que plantou. O GeadaAlerta busca a previsão do tempo hora a hora
([Open-Meteo](https://open-meteo.com/)), compara a mínima de cada noite com a **temperatura crítica** de cada cultura
(maçã em floração, uva em brotação…) e gera alertas de risco **Moderado, Alto ou Crítico**, além de um painel com mapa.

> Trabalho de Laboratório de Programação — Ciência da Computação, UNIFACVEST (2026).
> Desenvolvido com auxílio de IA. Veja [DOCUMENTACAO_IA.md](DOCUMENTACAO_IA.md).

## Funcionalidades

- CRUD de produtores, propriedades, culturas e plantios
- Previsão de 3 dias por propriedade (temperatura, vento e nebulosidade) via Open-Meteo
- Motor de risco com agravante de **geada de radiação** (céu limpo e vento calmo)
- Registro manual de leituras do termômetro da propriedade
- Painel com contadores por nível, mapa colorido pelo risco e próximos alertas
- Gráfico de temperatura com as linhas de temperatura crítica das culturas

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 24 LTS, Express 5, nodemon, zod |
| Banco | PostgreSQL 16 (Docker Compose), Prisma ORM 7.10 |
| Frontend | React 19, Vite, React Router, Recharts, Leaflet (OpenStreetMap) |
| Gestão | GitHub Projects (Kanban), commits semânticos |

## Pré-requisitos

- **Node.js 22.x a 24.x** (`node -v`)
- **Docker Desktop** em execução (`docker -v`)
- Git

## Como rodar

```bash
# 1. Clonar e instalar as dependências (raiz, backend e frontend)
git clone <url-do-repositorio> geada-alerta
cd geada-alerta
npm run setup

# 2. Criar o arquivo de ambiente do backend
cp backend/.env.example backend/.env        # PowerShell: Copy-Item backend/.env.example backend/.env

# 3. Subir o PostgreSQL no Docker
npm run db:up

# 4. Criar as tabelas e carregar os dados de exemplo
npm run db:migrate
npm run db:seed

# 5. Rodar backend + frontend juntos
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:3333/api/health>

No painel, clique em **"↻ Atualizar previsões"** para buscar a previsão real das propriedades de exemplo.

### Outros comandos

| Comando | O que faz |
|---|---|
| `npm test` | Testes unitários da regra de risco |
| `npm run db:studio` | Abre o Prisma Studio para ver o banco |
| `npm run db:down` | Para o container do banco (os dados ficam no volume) |

## Estrutura

```
├── backend/
│   ├── prisma/            # schema.prisma, migrations e seed
│   ├── src/
│   │   ├── controllers/   # CRUD e ações (try/catch + status HTTP)
│   │   ├── routes/        # mapeamento das rotas REST
│   │   ├── services/      # regra de risco, alertas, Open-Meteo
│   │   ├── validators/    # schemas zod
│   │   ├── middlewares/   # tratamento central de erros
│   │   └── lib/           # instância do Prisma Client
│   └── test/              # testes (node:test)
├── frontend/src/
│   ├── pages/             # Painel, Propriedades, Alertas, Produtores, Culturas
│   ├── components/        # Mapa, Gráfico, CRUD genérico, estados
│   ├── hooks/             # useApi (loading/erro)
│   └── services/          # cliente HTTP (Fetch API)
├── docs/                  # requisitos, arquitetura, prints do Kanban
├── docker-compose.yml
├── DOCUMENTACAO_IA.md     # uso da IA (obrigatório)
└── README.md
```

Mais detalhes em [docs/requisitos.md](docs/requisitos.md) e [docs/arquitetura.md](docs/arquitetura.md).

## Solução de problemas

| Problema | Solução |
|---|---|
| `Can't reach database server at localhost:5433` | O Docker Desktop está aberto? Rode `npm run db:up`. |
| Porta 5433 ocupada | Mude `POSTGRES_PORT` em um `.env` na raiz e a porta da `DATABASE_URL` em `backend/.env`. |
| `Cannot find module '../generated/prisma/client.ts'` | Rode `npm run prisma:generate --prefix backend`. |
| Versão do Node fora do intervalo | Instale o Node 24 LTS (o projeto exige de 22 a 24). |
