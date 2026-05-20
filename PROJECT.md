# TyllerFinance

**Tagline:** Seu assistente financeiro pessoal com IA proativa — saiba exatamente quanto vai sobrar no fim do mês.

---

## O que é isso

TyllerFinance é um aplicativo de finanças pessoais onde o diferencial está na combinação de um **agente de IA proativo** (que categoriza gastos, alerta sobre excessos e projeta o saldo futuro) com uma **arquitetura de Workspaces isolados por usuário** — garantindo privacidade, desempenho e personalização. O usuário importa seus extratos (PDF/OFX), define o nível de economia desejado e recebe um plano de ação para os próximos dias/meses.

---

## Valor Central

**"Saber exatamente quanto vai sobrar no fim do mês — e o que fazer para melhorar."**

---

## Fluxo do Produto

1. **Onboarding**: Usuário cria sua conta.
2. **Workspace Isolado**: Sistema cria um `user_workspace` no banco de dados (isolamento lógico por ID — dinâmico e rápido).
3. **IA Context Initialization**: Instancia o contexto de IA do usuário. A IA mantém um `context_map` atualizado a cada nova importação (perfil comportamental de gastos).
4. **Importação de Dados**: Usuário faz upload de extratos em PDF ou OFX. Sistema parseia e abstrai as transações.
5. **Projeção de Saldo**: A IA analisa gastos fixos, variáveis e histórico para projetar o saldo no fim do mês.
6. **Nível de Economia**: Usuário escolhe o nível desejado:
   - 🟢 **Leve** — Pequenos ajustes, sem mudanças drásticas.
   - 🟡 **Moderado** — Cortes pontuais em categorias identificadas.
   - 🔴 **Intenso** — Plano rigoroso de redução de gastos.
7. **Plano de Ação**: IA categoriza os gastos passíveis de corte e gera um plano personalizado para os próximos dias/meses.

---

## Arquitetura do Sistema

### Banco de Dados (Dupla Camada)
- **Banco Leve** (Redis ou MongoDB): Cache de sessão, contexto da IA, leituras frequentes.
- **Banco Rígido** (PostgreSQL): Dados transacionais, histórico completo, backups. Ativado sob demanda (dados críticos, relatórios, exportações).

### Workspaces de Usuário
- Isolamento **lógico** por `user_id` — dinâmico, rápido, sem overhead de múltiplos bancos físicos.
- Cada workspace contém: transações, categorias personalizadas, `context_map` da IA e preferências de nível de economia.

### IA Context Map
- Mantido por usuário no banco leve.
- Atualizado a cada importação de OFX/PDF.
- Contém: padrões de gasto por categoria, médias mensais, sazonalidade, anomalias.
- A IA usa esse mapa como "memória" para não recalcular do zero a cada consulta.

---

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Frontend | React + TypeScript | Tipo-seguro, componentizável, ecossistema rico |
| Backend | Node.js (Express ou Fastify) | Rápido, mesmo ecossistema TS, fácil integração |
| Banco Leve | MongoDB ou Redis | Velocidade de leitura, estrutura flexível para contextos |
| Banco Rígido | PostgreSQL | Integridade transacional para dados financeiros |
| IA | Deepseek / Gemma via API | Gratuito ou custo mínimo via Groq/OpenRouter |
| Parser PDF/OFX | Biblioteca Node (ofx-js, pdf-parse) | Open source, sem custo de API |

---

## Requisitos

### Validados

- [x] Autenticação de usuário (signup/login)
- [x] Criação e isolamento de workspace por usuário
- [x] Importação e parsing de arquivos PDF e OFX
- [x] Extração automática de transações (data, valor, descrição, categoria)
- [x] Inicialização e persistência do IA Context Map por usuário
- [x] Categorização automática de transações pela IA
- [x] Projeção de saldo no fim do mês (gastos fixos + variáveis + histórico)
- [x] Seleção de nível de economia (Leve / Moderado / Intenso)
- [x] Geração de Plano de Ação personalizado com sugestões de corte
- [x] Dashboard financeiro com UX focada em clareza e usabilidade
- [x] Visualização de projeção de saldo (interface funcional e UX-friendly)

### Ativos

- [ ] Polimento estético avançado dos cards de input e upload (v2.0)
- [ ] Implementação de micro-interações e efeitos de transição nos componentes (v2.0)
- [ ] Otimização de efeitos de fundo (glow orbs) integrados às interações (v2.0)
- [ ] Alertas proativos quando o usuário extrapola o orçamento
- [ ] Histórico de planos e evolução financeira

### Fora do Escopo

- Integração direta com APIs bancárias (Open Finance) — MVP usa PDF/OFX para custo zero
- App Mobile nativo — MVP é web-first
- Pagamentos ou transferências — apenas consulta e análise
- Multi-moeda — apenas BRL por hora

---

## Decisões Chave

| Decisão | Racional | Resultado |
|---------|----------|-----------|
| Isolamento lógico de workspaces | Mais rápido e dinâmico que bancos físicos separados | — Validado e Concluído (Fase 1) |
| PDF/OFX ao invés de Open Finance API | Custo zero, privacidade máxima, funciona para MVP | — Validado e Concluído (Fase 2) |
| Dupla camada de banco (leve + rígido) | Velocidade de leitura da IA + integridade dos dados financeiros | — Validado e Concluído (Fase 3) |
| IA via API gratuita (Groq/OpenRouter) | Sem custo operacional no início | — Validado e Concluído (Fase 3 e 4) |
| 3 Níveis de Economia | Personalização simples, sem sobrecarga cognitiva para o usuário | — Validado e Concluído (Fase 4) |
| Base de Design System | Interface do app **deve** usar sempre as regras e tokens localizados em /front já inicializado antes de iniciar o gsd do projeto | — Validado e Concluído (Fases 1-4) |

---

---

## Milestone Concluído: v1.0 Fundação do MVP
**Status:** 100% Concluído & Integrado.
**Objetivo:** Estabelecer a base funcional de importação de dados, isolamento de workspaces e inteligência financeira inicial.

---

## Milestone Atual: v2.0 Polimento de Interface, Micro-interações & Efeitos Avançados
**Status:** Ativo
**Objetivo:** Elevar a experiência visual do usuário (UX/UI) na página inicial e painel, implementando cards de input premium, micro-interações táteis e efeitos visuais avançados baseados nos tokens de design.

**Funcionalidades Alvo:**
- [ ] Polimento estético avançado dos cards de input e drag-and-drop de arquivos
- [ ] Implementação de micro-interações táteis (hover micro-scales, elegant focus states) nos botões e inputs
- [ ] Otimização e aplicação integrada de orbs de luz cobre e gradientes dinâmicos
- [ ] Refinamento e estruturação responsiva da página inicial do Dashboard

---

## Evolução

Este documento evolui a cada transição de fase e milestone.

**Após cada fase** (`/gsd-transition`):
1. Requisitos invalidados? → Mover para Fora do Escopo com razão
2. Requisitos validados? → Mover para Validados com referência da fase
3. Novos requisitos? → Adicionar em Ativos
4. Decisões a registrar? → Adicionar em Decisões Chave
5. "O que é isso" ainda é acurado? → Atualizar se houver desvio

**Após cada milestone** (`/gsd-complete-milestone`):
1. Revisão completa de todas as seções
2. Verificação do Valor Central — ainda é a prioridade certa?
3. Auditoria do Fora do Escopo — razões ainda válidas?
4. Atualizar Contexto com o estado atual

---

*Última atualização: 2026-05-18 — Conclusão da Milestone v1.0*
