# Roteiro da apresentação — 09/11/2026 (10 minutos)

Dividam as falas entre a dupla (**A** e **B**). Ensaiem pelo menos uma vez com cronômetro.

## Antes da aula (15 min antes)

- [ ] Notebook na tomada, **Docker Desktop aberto** e com a baleia verde
- [ ] Na pasta do projeto: `npm run db:up` e depois `npm run dev`
- [ ] Abas abertas no navegador:
  1. <http://localhost:5173> (painel)
  2. Repositório no GitHub (commits)
  3. Kanban no GitHub Projects
  4. `DOCUMENTACAO_IA.md` no GitHub
- [ ] Testar a internet da sala: o mapa e a Open-Meteo precisam dela. **Sem internet**, o `npm run db:demo` funciona
  igual; só o fundo do mapa não carrega.
- [ ] Zoom do navegador em 125% para a turma enxergar

## Roteiro

| Tempo | Quem | O que mostrar | O que falar |
|---|---|---|---|
| 0:00–1:00 | A | Painel aberto | **Problema:** a Serra Catarinense tem as temperaturas mais baixas do país, e geadas tardias na floração destroem maçã e uva. O produtor vê "vai fazer 1 °C" num app genérico, mas não sabe se **isso é perigoso para a cultura dele**. |
| 1:00–2:00 | A | `docs/arquitetura.md` (diagrama) | **Solução e stack:** React → API Express (Node 24) → PostgreSQL 16 no Docker via Prisma, mais a API pública Open-Meteo. Versões dentro dos limites do enunciado. |
| 2:00–3:00 | B | Kanban e lista de commits | **Gestão:** requisitos viraram issues no Kanban, cada uma ligada ao commit que a resolveu. Os commits seguem o padrão semântico (`feat:`, `fix:`, `docs:`). |
| 3:00–4:30 | B | Painel → **Atualizar previsões** → abrir *Pomar Boa Vista* | **Dados reais:** o sistema busca 72 previsões horárias por propriedade. O gráfico mostra a temperatura prevista e as linhas tracejadas das temperaturas críticas de cada cultura. |
| 4:30–6:00 | A | Explicar a regra com um exemplo | **Regra de risco:** maçã em floração tem crítica de -2,2 °C. Mínima prevista de 0,5 °C dá margem de 2,7 °C, ou seja, MODERADO. Com **céu limpo e vento calmo** (geada de radiação, a folha fica mais fria que o ar), sobe para ALTO. A regra é uma função pura com 6 testes automatizados (`npm test`). |
| 6:00–7:30 | B | Terminal: `npm run db:demo` → recarregar o painel | **Simulação de frente fria:** o painel fica vermelho, o mapa muda de cor e aparecem alertas nos três níveis. Abrir *Alertas*, filtrar por Crítico e marcar um como lido. |
| 7:30–8:00 | B | *Culturas* → tentar excluir "Maçã" | **Tratamento de erro:** o sistema recusa (409), porque a cultura está em uso. A mensagem aparece na tela. |
| 8:00–9:15 | A | `DOCUMENTACAO_IA.md` | **Uso da IA com postura crítica:** a IA gerou o código, e os testes no navegador revelaram **3 bugs**: a API subia na porta do frontend, o painel e a lista discordavam do número de alertas, e um ponto do gráfico sumia no modo escuro. Mostrar a linha de um deles na tabela e explicar a **decisão de engenharia** (ex.: "uma regra, um lugar no código"). |
| 9:15–10:00 | A+B | Issues "2a-parte" no Kanban | **Limitações e próximos passos:** temperaturas críticas aproximadas (validar com a Epagri), sem login, previsão sob demanda. Para a 2ª parte: notificações e atualização agendada. |

## Se algo der errado

| Problema | Saída rápida |
|---|---|
| Docker não sobe | Reiniciar o Docker Desktop; em último caso, apresentar com prints e o vídeo de backup |
| "Não foi possível conectar ao servidor" | O backend caiu: no terminal, `Ctrl+C` e `npm run dev` de novo |
| Sem internet | Pular o "Atualizar previsões" e usar direto o `npm run db:demo` |
| Banco vazio ou bagunçado | `npm run db:seed` e depois `npm run db:demo` |

> **Dica:** gravem a tela fazendo o roteiro completo um dia antes, como **vídeo de backup**.
