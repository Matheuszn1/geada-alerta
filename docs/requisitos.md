# Requisitos — GeadaAlerta

## 1. Problema

A Serra Catarinense (Lages, São Joaquim, Urubici…) registra as temperaturas mais baixas do Brasil. Geadas tardias,
na época da floração e da brotação (agosto a outubro), destroem safras de maçã, uva e pêssego. Pequenos produtores
costumam acompanhar a previsão "de olho" em aplicativos genéricos, que não dizem **se a temperatura prevista é
perigosa para a cultura que eles têm no campo**.

## 2. Proposta

Um sistema web em que o produtor cadastra suas propriedades (com coordenadas) e as culturas plantadas. O sistema
busca a previsão horária na API pública **Open-Meteo**, cruza a temperatura mínima de cada noite com a
**temperatura crítica** de cada cultura e gera **alertas classificados por nível de risco**.

## 3. Atores

| Ator | Descrição |
|---|---|
| Produtor / técnico | Cadastra propriedades, culturas e leituras; consulta o painel e os alertas. |
| Open-Meteo (sistema externo) | Fornece a previsão horária de temperatura, vento e nebulosidade. |

## 4. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | CRUD de **produtores** (nome, e-mail único, telefone). | Alta |
| RF02 | CRUD de **propriedades** (nome, município, latitude, longitude, altitude), vinculadas a um produtor. | Alta |
| RF03 | CRUD de **culturas** com temperatura crítica e estágio sensível. | Alta |
| RF04 | Vincular culturas a propriedades (**plantio**) com área em hectares; uma cultura por propriedade. | Alta |
| RF05 | Buscar a previsão horária de 3 dias na Open-Meteo para uma propriedade e salvar as leituras. | Alta |
| RF06 | Gerar **alertas** (Moderado, Alto, Crítico) por plantio e por noite, a partir da mínima prevista. | Alta |
| RF07 | Registrar **leitura manual** de temperatura (termômetro da propriedade) e recalcular alertas. | Média |
| RF08 | Painel com contagem de alertas por nível, mapa das propriedades colorido pelo risco e próximos alertas. | Alta |
| RF09 | Listar alertas com filtros (nível, lido/não lido) e marcar como lido. | Média |
| RF10 | Gráfico de temperatura (prevista e observada) com as linhas de temperatura crítica das culturas. | Média |

## 5. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | Backend em Node.js 22–24 + Express, com nodemon no desenvolvimento. |
| RNF02 | PostgreSQL 16 provisionado via Docker Compose; acesso via Prisma ORM. |
| RNF03 | API RESTful com status HTTP corretos (200, 201, 204, 400, 404, 409, 500, 502). |
| RNF04 | Toda entrada da API é validada (zod) antes de chegar ao banco. |
| RNF05 | Interface responsiva (desktop e celular), com estados de carregamento, erro e lista vazia. |
| RNF06 | Rodar localmente com poucos comandos, documentados no README. |
| RNF07 | Falhas da API externa não derrubam o sistema (timeout de 10 s e erro 502 tratado). |

## 6. Regras de negócio

- **RN01 — Margem até a temperatura crítica:** `margem = mínima prevista − temperatura crítica da cultura`.
  - margem ≤ 0 °C → **CRÍTICO**
  - margem ≤ 1,5 °C → **ALTO**
  - margem ≤ 3 °C → **MODERADO**
  - acima disso → **BAIXO** (não gera alerta)
- **RN02 — Geada de radiação:** com vento < 7 km/h **e** nuvens < 30 %, o nível sobe um degrau (no máximo até
  CRÍTICO), pois a superfície das plantas fica de 2 a 4 °C mais fria que o ar medido a 2 m.
- **RN03:** O risco de cada noite é definido pela **menor temperatura do dia** (fuso America/Sao_Paulo).
- **RN04:** Ao atualizar a previsão, alertas atuais **não lidos** são recalculados; os **lidos** são preservados.
- **RN07 — Alerta atual:** um alerta é considerado atual até 12 h depois do horário da mínima (cobre a madrugada
  que acabou de passar). Painel, mapa, lista e geração de alertas usam essa mesma regra; o restante fica no histórico.
- **RN05:** Uma cultura em uso em algum plantio não pode ser excluída (resposta 409).
- **RN06:** Excluir um produtor ou uma propriedade exclui em cascata as propriedades, os plantios, as leituras e os alertas.

## 7. Histórias de usuário (backlog do Kanban)

1. Como produtor, quero cadastrar minha propriedade com localização para receber previsões específicas dela.
2. Como produtor, quero informar o que plantei para que o alerta considere a sensibilidade da minha cultura.
3. Como produtor, quero ver no painel quais propriedades estão em risco nos próximos dias.
4. Como produtor, quero registrar a temperatura do meu termômetro para comparar com a previsão.
5. Como técnico agrícola, quero ajustar a temperatura crítica das culturas conforme o estágio da safra.

## 8. Fora do escopo (1ª entrega)

- Autenticação de usuários e perfis de acesso.
- Envio de notificações (WhatsApp/e-mail/SMS) — candidato à 2ª parte do trabalho.
- Agendamento automático da atualização da previsão (hoje é sob demanda).
- Histórico de perdas de safra e relatórios.
