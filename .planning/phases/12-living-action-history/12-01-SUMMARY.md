---
phase: 12-living-action-history
plan: 12-01
subsystem: backend
tags:
  - postgresql
  - express
  - node
provides:
  - Tabela action_plans persistente no PostgreSQL com constraints de integridade.
  - Endpoint POST /api/ai/action-plans para salvar novos planos de ação com cálculo dinâmico de target_saving.
  - Endpoint GET /api/ai/action-plans/history para buscar histórico com cálculo dinâmico de economia real proporcional, score de aderência global e breakdown por categorias no período de vigência.
affects:
  - 12-02
tech-stack:
  added: []
  patterns:
    - Express Router com authMiddleware.
    - PostgreSQL raw queries parametrizadas com cálculo matemático no NodeJS.
key-files:
  created: []
  modified:
    - back/src/db.ts
    - back/src/routes/ai.ts
key-decisions:
  - Realizar o cálculo de economia e aderência proporcional de forma reativa a cada requisição de histórico (GET), atualizando as colunas do banco de forma persistente.
duration: 15min
completed: 2026-05-20
---

# Phase 12: Backend: Armazenar histórico de planos gerados e calcular aderência Summary

**Implementação do schema de banco e dos endpoints REST para gerenciar o histórico de planos e calcular de forma automatizada o nível de economia e aderência baseados no Context Map.**

## Performance
- **Duration:** 15min
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- **Schema PostgreSQL:** Criação da tabela `action_plans` vinculada por workspace com suporte a target/actual savings e pontuação de aderência.
- **POST /api/ai/action-plans:** Implementado endpoint de salvamento vinculando planos otimizados ao workspace_id e calculando o target_saving com base no economy_level (10% leve, 25% moderado, 50% intenso).
- **GET /api/ai/action-plans/history:** Endpoint robusto calculando dias de vigência (de 1 a 30), total despendido real (somatório de transações < 0), economia real proporcional contra o average_spend e score de aderência proporcionalizado. Inclui o breakdown dinâmico por categoria do período.

## Task Commits
1. **Task 1: Create action_plans table in PostgreSQL database schema** - `4f3f7a8`
2. **Task 2: Implement POST and GET endpoints for Action Plans inside back/src/routes/ai.ts** - `35cf852`

## Files Created/Modified
- `back/src/db.ts` - Adição da criação de schema da tabela `action_plans` na função `initDb()`.
- `back/src/routes/ai.ts` - Adição dos endpoints POST `/action-plans` e GET `/action-plans/history`.

## Next Phase Readiness
Pronto para a integração do frontend (12-02) utilizando as rotas robustas fornecidas pelo backend.
