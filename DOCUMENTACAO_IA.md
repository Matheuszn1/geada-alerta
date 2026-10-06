# Documentação do uso de IA — GeadaAlerta

## Ferramenta utilizada

| Item | Valor |
|---|---|
| Agente | **Claude Code** (app desktop Claude, modelo Claude Opus 5.5), da Anthropic |
| Modo de uso | Agente autônomo com acesso ao terminal do Windows: instala programas, cria arquivos, roda comandos e testes. Cada ação sensível (instalação como administrador, exclusão de arquivos) precisou da aprovação do grupo. |
| Papel do grupo | Definir o problema, escolher o tema, aprovar as ações, **revisar o código gerado** e validar o funcionamento. |

## Critérios de aceitação adotados para o código gerado

Um trecho de código gerado pela IA só foi aceito quando:

1. **Executou de fato** no ambiente do grupo: build do frontend, testes do backend, chamada real à API.
2. **Respeitou as restrições do enunciado:** Node 22–24, PostgreSQL 15–16 via Docker, Express + nodemon, Prisma.
3. **Separou responsabilidades:** rota → controller → service, sem regra de negócio dentro de rota ou componente visual.
4. **Tratou erros explicitamente:** `try/catch` nos controllers, status HTTP corretos e mensagens legíveis no frontend.
5. **Não expôs segredos:** `.env` fora do Git, API externa sem chave.
6. **Passou no linter e nos testes** (`npm run lint` no frontend, `npm test` no backend).
7. **Foi entendido pelo grupo:** cada membro sabe explicar o que o trecho faz. Veja o checklist no final.

---

## Tabela de interações

| Problema / Requisito | Prompts utilizados | Refinamento (iterações) | Decisão de engenharia |
|---|---|---|---|
| **Entender o enunciado e planejar** | "leia este PDF sobre meu trabalho da faculdade, e me diga os passoa que eu tenho que tomar, para deixar pronto para voce continuar e fazer a parte bruta, e eu somente ir administrando, se possivel VOCE realizar tudo, incluindo instalações/atualizações de programas,etc, realizar todo o trabalho, teria como?" | A IA não conseguiu ler o PDF direto (faltava o `poppler`). Ela instalou a biblioteca `pdf-parse` em uma pasta temporária e extraiu o texto. Depois listou as ferramentas da máquina e encontrou **Node 26 instalado, acima do limite de 24.x do enunciado**, e Docker e GitHub CLI ausentes. | O diagnóstico do ambiente veio antes de qualquer código. A versão do Node era um "requisito crítico" do enunciado e teria quebrado a apresentação. |
| **Escolha do tema** | "de ideias de projeto não genericos" | A IA sugeriu 7 temas com entidades, diferencial e potencial para a 2ª parte. O grupo escolheu o GeadaAlerta. | Tema regional (Serra Catarinense), com regra de negócio real (risco de geada por cultura) e integração com API externa. Isso evita um CRUD genérico e atende ao critério "Criatividade e Escopo". |
| **Preparar o ambiente (Node, Docker, GitHub CLI)** | "de inicio ao GeadaAlerta, pode ir iniciando todas as operações que vou dando as permissões e conectando o que for necessario" | **1ª tentativa:** instalar o Node 24 com o gerenciador de versões `fnm`. **Problema:** a política de execução de scripts do PowerShell (padrão do Windows) impediria o fnm de ativar o Node 24 nos terminais. A IA não alterou essa configuração de segurança. **2ª tentativa:** substituir o Node 26 pelo Node 24 LTS via `winget`. Funcionou (v24.19.0). O WSL2 falhou no `winget` por falta de privilégio e foi instalado com uma janela de administrador (UAC). | O Node 24 LTS é a versão mais recente dentro do limite exigido. Ficou registrado em `.nvmrc` e em `engines` no `package.json` para avisar quem usar outra versão. |
| **Boilerplate do backend** (comandos do item 5 do enunciado) | Mesmo prompt acima. A IA executou os comandos do enunciado: `npm init -y`, `npm install express pg @prisma/client`, `npm install --save-dev nodemon prisma`, `npx prisma init`. | **(a)** A tag `latest` do Prisma no npm apontava para **8.0.0-rc.20** (versão de teste); a IA fixou a **7.10.0 estável**. **(b)** O `prisma init` do Prisma 7 criou pastas de "skills" para várias IAs (`.claude`, `.windsurf`, `.agents`), que não fazem parte do sistema; foram ignoradas no `.gitignore`. **(c)** O Prisma 7 gera o client em **TypeScript** e exige *driver adapter* (`@prisma/adapter-pg`). A IA testou e confirmou que o Node 24 executa o `.ts` gerado nativamente, então o backend foi para ESM sem etapa de build. | Versão estável em vez de RC, porque a aplicação precisa rodar ao vivo. Não adicionar TypeScript nem compilador para manter o projeto simples para a dupla. |
| **Docker Compose do PostgreSQL** | Mesmo prompt (equivalente ao "PROMPT 1" do enunciado). | Funcionou de primeira. Foram adicionados `healthcheck` (para o `docker compose up --wait` só retornar com o banco pronto), fuso horário e a **porta 5433** no host. | PostgreSQL **16** (máximo permitido) em imagem `alpine`, que é menor. A porta 5433 evita conflito com algum Postgres instalado na máquina de um membro do grupo ou do professor. O volume nomeado garante que os dados persistem. |
| **Modelagem do banco** (`schema.prisma`) | Mesmo prompt (equivalente ao "PROMPT 2"). | Funcionou de primeira (`prisma format` e `prisma generate` sem erros). | Seis entidades: `Plantio` resolve o N:N Propriedade↔Cultura com dados próprios (área). Chaves únicas compostas impedem duplicidade e permitem o *upsert* da previsão. `onDelete: Cascade` em Produtor→Propriedade→Plantio. Uma cultura em uso não pode ser apagada (409). |
| **Regra de risco de geada** | Mesmo prompt. | A IA propôs a regra por **margem até a temperatura crítica**, com agravante de **geada de radiação** (céu limpo e vento < 7 km/h). Ela escreveu 6 testes unitários. **1ª execução:** o script `node --test test/` falhou (o Node 24 não aceita a pasta como argumento). Foi corrigido para `node --test test/*.test.js` e os 6 testes passaram. | Função pura, separada do banco, para poder ser testada e explicada. As temperaturas críticas do seed são **aproximadas** e estão marcadas como tal no código e na interface. |
| **API REST (CRUD + ações)** | Mesmo prompt (equivalente ao "PROMPT 3"). | Funcionou ao carregar o app. Validação com **zod** em todas as entradas. Um middleware central converte erros: zod → 400, Prisma `P2002` → 409, `P2025` → 404, `P2003` → 409, Open-Meteo fora do ar → 502. | Os controllers têm `try/catch` em todos os métodos, como o enunciado pede, e repassam o erro para um único tratador. Isso evita repetir o mapeamento de status em cada rota. |
| **Integração com a Open-Meteo** | Mesmo prompt. | Antes de escrever o código, a IA chamou a API real para confirmar o formato da resposta (unidades: °C, km/h e %; horários em UTC com `timezone=GMT`). | API gratuita e sem chave, portanto sem segredo no repositório. Timeout de 10 s para a apresentação não travar sem internet. |
| **Frontend** | Mesmo prompt (equivalente ao "PROMPT 4"). | O build passou de primeira. O **linter (oxlint)** apontou `setState` síncrono dentro de `useEffect` no hook `useApi`. Analisando o aviso, encontrou-se um bug real: se o filtro mudasse rápido, **uma resposta antiga poderia sobrescrever a nova** (condição de corrida). O hook foi reescrito com uma flag que descarta respostas obsoletas. | React + Vite. O proxy do Vite para `/api` evita CORS e URLs fixas. Os estados de carregamento, erro e vazio estão em todas as telas. O mapa usa OpenStreetMap (gratuito) e o gráfico desenha as linhas de temperatura crítica para o risco ficar visual na apresentação. |
| **Banco real e migration** | "iniciei o docker, agora de continuidade" | A migration `init` foi criada e o seed carregado. A IA testou a API com o banco real: 72 leituras da Open-Meteo por propriedade, níveis de risco conferidos à mão (alho a -4,5 °C → CRÍTICO; maçã a -1,0 °C → ALTO) e respostas 400/404/409. O texto do alerta dizia "mínima **prevista**" mesmo quando vinha do termômetro; passou a dizer "registrada no termômetro". | Testar os casos de erro, e não só o "caminho feliz", antes de aprovar. |
| **Bug: API subindo na porta do frontend** | "voltei" (retomada dos testes no navegador) | O painel mostrava "Erro 502". O log revelou `API rodando em http://localhost:5173`: o ambiente que sobe os servidores define a variável genérica `PORT=5173`, e o backend também lia `PORT`. A variável foi trocada por `API_PORT`. Além disso, a tela exibia só "Erro 502", e o cliente HTTP passou a traduzir 502/503/504 para "Não foi possível conectar ao servidor". | Variável de ambiente com nome próprio do projeto evita colisão com ferramentas e plataformas que definem `PORT`. Mensagens de erro precisam fazer sentido para o usuário. |
| **Bug: painel dizia 0 alertas e a lista mostrava 4** | Mesmo prompt. | Três consultas usavam regras de tempo diferentes: o painel contava alertas das últimas 12 h, a lista não filtrava e a geração usava "desde a meia-noite". A regra foi centralizada em `filtroAlertaAtual()` no `alerta.service.js` e usada em todos os pontos. A lista ganhou o filtro "Próximos dias / Histórico". O cartão "alertas baixo" (sempre 0, porque BAIXO não gera alerta) virou "propriedades sem risco". | **Uma regra de negócio, um lugar no código.** A duplicação da constante foi a causa do bug. |
| **Bug: leitura manual invisível no gráfico** | Mesmo prompt. | O ponto observado usava a cor fixa `#0f172a` (quase preta), que some no **modo escuro**. Passou a usar a variável de tema `var(--texto)`, e o tooltip foi protegido contra valores nulos. | Cores sempre via variáveis de tema, nunca fixas, para funcionar nos dois temas. |
| **Documentação** | Mesmo prompt. | O diagrama ER em Mermaid foi corrigido: atributos separados por `;` não são aceitos e passaram para uma linha cada. | README com passo a passo para rodar do zero, requisitos (RF/RNF/RN), arquitetura com as decisões e este documento. |

> **Como continuar preenchendo:** para cada nova funcionalidade ou bug, adicione uma linha com o **texto exato** do
> prompt, o que deu errado ou precisou de ajuste e **por que** o grupo aprovou o resultado.

---

## Prompts principais (texto exato enviado à IA)

1. *"leia este PDF sobre meu trabalho da faculdade, e me diga os passoa que eu tenho que tomar, para deixar pronto para voce continuar e fazer a parte bruta, e eu somente ir administrando, se possivel VOCE realizar tudo, incluindo instalações/atualizações de programas,etc, realizar todo o trabalho, teria como?"*
2. *"de ideias de projeto não genericos"*
3. *"de inicio ao GeadaAlerta, pode ir iniciando todas as operações que vou dando as permissões e conectando o que for necessario"*
4. *"iniciei o docker, agora de continuidade"*
5. *"voltei"* (retomada: testes da interface no navegador)

---

## Postura crítica: pontos revisados e limitações conhecidas

- **Temperaturas críticas** das culturas são referências aproximadas da literatura e deveriam ser validadas com um agrônomo ou com a Epagri.
- A **temperatura a 2 m** (fornecida pela previsão) não é a temperatura da folha. O agravante radiativo é uma
  aproximação simples, não um modelo físico.
- A atualização da previsão é **sob demanda** (botão), não agendada.
- Não há **autenticação**: qualquer pessoa com acesso à aplicação vê todos os produtores (aceitável para uma demonstração local).

## Checklist de revisão humana (preencher pelo grupo)

- [ ] Li e entendi `risco.service.js` e sei explicar a regra com um exemplo numérico
- [ ] Sei explicar o fluxo "Atualizar previsão": controller → `clima.service` → `alerta.service` → banco
- [ ] Sei explicar por que existe a tabela `Plantio`
- [ ] Rodei o projeto do zero seguindo o README em **cada** máquina da dupla
- [ ] Testei os erros: cadastrar e-mail repetido (409), excluir cultura em uso (409), backend desligado (mensagem na tela)
