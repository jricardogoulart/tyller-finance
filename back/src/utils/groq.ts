import dotenv from 'dotenv';
import {
  localCategorizeHeuristic,
  normalizeCategory,
  needsAICategorization,
  sanitizeMemo,
  getSuggestedIdentifier,
  VALID_CATEGORIES,
} from './TransactionClassifier';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

/**
 * Helper to fetch with an explicit timeout using AbortController.
 */
async function fetchWithTimeout(url: string, options: any, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/** @deprecated Use localCategorizeHeuristic — mantido para compatibilidade */
export function localCategorizeMock(description: string, amount: number): string {
  return localCategorizeHeuristic(description, amount);
}

/**
 * Anonymize PII (Personally Identifiable Information) in text.
 * Redacts CPF, Emails, and Brazilian Phone Numbers.
 */
export function anonymizePII(text: string): string {
  if (!text) return text;
  let sanitized = text;

  // Redact CPF (e.g., 123.456.789-00 or 12345678900)
  sanitized = sanitized.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[REDACTED_CPF]');

  // Redact Emails
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]');

  // Redact Phone numbers (e.g., (11) 91234-5678, 11 912345678)
  sanitized = sanitized.replace(/\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g, '[REDACTED_PHONE]');

  return sanitized;
}

interface TransactionItem {
  id: string;
  description: string;
  amount: number;
}

export interface CategorizeBatchContext {
  userRules?: Array<{ search_token: string; category: string }>;
}

function applyLocalPass(transactions: TransactionItem[]): {
  resolved: Record<string, string>;
  pending: TransactionItem[];
} {
  const resolved: Record<string, string> = {};
  const pending: TransactionItem[] = [];

  for (const t of transactions) {
    const category = normalizeCategory(localCategorizeHeuristic(t.description, Number(t.amount)));
    if (needsAICategorization(category)) {
      pending.push(t);
    } else {
      resolved[t.id] = category;
    }
  }

  return { resolved, pending };
}

function buildRulesHint(rules: Array<{ search_token: string; category: string }>): string {
  if (!rules.length) return '';
  const sample = rules.slice(0, 40).map((r) => `"${r.search_token}" → ${normalizeCategory(r.category)}`);
  return `\nRegras já aprendidas pelo usuário (priorize quando a descrição contiver o token):\n${sample.join('\n')}`;
}

/**
 * Cascata: heurística local → Groq só para incertos → fallback local.
 */
export async function categorizeTransactionsBatch(
  transactions: TransactionItem[],
  context: CategorizeBatchContext = {}
): Promise<Record<string, string>> {
  if (transactions.length === 0) return {};

  const { resolved, pending } = applyLocalPass(transactions);
  if (pending.length === 0) return resolved;

  const finalize = (aiMap: Record<string, string>) => {
    const out = { ...resolved };
    for (const t of pending) {
      const cat = normalizeCategory(aiMap[t.id]);
      out[t.id] = needsAICategorization(cat)
        ? normalizeCategory(localCategorizeHeuristic(t.description, Number(t.amount)))
        : cat;
    }
    return out;
  };

  if (!GROQ_API_KEY) {
    return finalize({});
  }

  try {
    const rulesHint = buildRulesHint(context.userRules || []);
    const promptSystem = `Você é o motor de categorização financeira do TyllerFinance.
Receba transações brasileiras (id, descrição, valor).
Retorne JSON {"ID": "CATEGORIA"} usando EXATAMENTE uma destas categorias:
${JSON.stringify([...VALID_CATEGORIES])}

Regras:
1. Valores positivos → preferir "Receita" se for crédito/salário/PIX recebido.
2. Use contexto brasileiro (Nubank, iFood, Uber, supermercados, concessionárias).
3. Prefira categoria específica; use "Outros" só se realmente ambíguo.
4. Sem markdown, sem texto extra — só JSON.${rulesHint}`;

    const response = await fetchWithTimeout(
      GROQ_ENDPOINT,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: promptSystem },
            {
              role: 'user',
              content: JSON.stringify(
                pending.map((t) => ({
                  id: t.id,
                  description: anonymizePII(t.description),
                  amount: t.amount,
                }))
              ),
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      },
      8000
    );

    if (!response.ok) {
      throw new Error(`Groq API returned HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Groq API returned an empty completion content.');
    }

    const parsed = JSON.parse(rawContent.trim());
    return finalize(parsed);
  } catch (error) {
    console.error('[TyllerFinance AI] Groq batch categorization failed. Using local heuristics:', error);
    return finalize({});
  }
}

/**
 * Generate Context Map summary profile using Groq API, falling back to aggregate mock.
 */
export async function generateContextMap(
  workspaceId: string,
  transactions: Array<{ amount: number; category: string; description: string; date: string }>
): Promise<{ average_spend: number; top_category: string; recurrence_patterns: string[] }> {
  
  if (transactions.length === 0) {
    return {
      average_spend: 0,
      top_category: 'Indefinido',
      recurrence_patterns: ['Sem transações registradas no momento.'],
    };
  }

  // Calculate aggregates locally first
  let totalExpenses = 0;
  const categoryTotals: Record<string, number> = {};
  const descriptionCounts: Record<string, number> = {};

  for (const t of transactions) {
    const amt = Number(t.amount);
    if (amt < 0) {
      const exp = Math.abs(amt);
      const cat = String(t.category || '').trim();
      if (cat === 'Receita') continue;
      totalExpenses += exp;
      categoryTotals[cat || 'Indefinido'] = (categoryTotals[cat || 'Indefinido'] || 0) + exp;
      
      const cleanDesc = sanitizeMemo(t.description);
      if (!cleanDesc) continue;
      const label = getSuggestedIdentifier(cleanDesc) || cleanDesc;
      descriptionCounts[label] = (descriptionCounts[label] || 0) + 1;
    }
  }

  // Determine top category
  let topCategory = 'Indefinido';
  let maxSpent = 0;
  for (const [cat, total] of Object.entries(categoryTotals)) {
    if (total > maxSpent) {
      maxSpent = total;
      topCategory = cat;
    }
  }

  // Group by month to calculate monthly average spend
  const uniqueMonths = new Set(
    transactions.map(t => {
      const dateStr = (t.date as any) instanceof Date ? (t.date as any).toISOString().split('T')[0] : String(t.date);
      return dateStr.slice(0, 7);
    })
  );
  const monthCount = Math.max(1, uniqueMonths.size);
  const averageSpend = totalExpenses / monthCount;

  // Local static recurrence patterns fallback
  const mockRecurrences: string[] = [];
  for (const [desc, count] of Object.entries(descriptionCounts)) {
    if (count >= 3) {
      mockRecurrences.push(`Gastos recorrentes com "${desc}" (${count} ocorrências).`);
    }
  }
  if (mockRecurrences.length === 0) {
    mockRecurrences.push('Sem assinaturas explícitas detectadas no momento.');
  }

  if (!GROQ_API_KEY) {
    console.warn('[TyllerFinance AI] GROQ_API_KEY missing. Using PostgreSQL stats for Context Map.');
    return {
      average_spend: Number(averageSpend.toFixed(2)),
      top_category: topCategory,
      recurrence_patterns: mockRecurrences,
    };
  }

  try {
    const sanitizedFrequency = Object.fromEntries(
      Object.entries(descriptionCounts).filter(([_, count]) => count >= 2)
    );
    const summaryText = `Histórico de Transações do Workspace:
Gasto Total: R$ ${totalExpenses.toFixed(2)} dividido em ${monthCount} meses.
Gastos por Categoria: ${JSON.stringify(categoryTotals)}
Transações mais frequentes (sanitizadas): ${JSON.stringify(sanitizedFrequency)}
Amostra agregada: ${JSON.stringify(
      transactions.slice(0, 20).map((t) => ({
        desc: anonymizePII(sanitizeMemo(t.description)),
        date: t.date,
        amt: t.amount,
      }))
    )}`;

    const promptSystem = `Você é o analisador comportamental do TyllerFinance.
Sua tarefa é analisar o sumário de transações de despesas fornecido pelo usuário e gerar um perfil analítico de gastos.
Retorne um objeto JSON puro contendo exatamente:
1. "average_spend": Número decimal indicando a média mensal de despesas totais.
2. "top_category": String contendo a categoria com maior despesa acumulada.
3. "recurrence_patterns": Um array de strings (máximo 4 itens) citando os lançamentos/estabelecimentos mais repetidos pelo nome (ex: "NUBANK", "IFOOD", "UBER") e a frequência observada. Use nomes legíveis, sem CPF. Responda em português brasileiro.

Retorne APENAS o JSON mapeado, sem nenhuma introdução ou formatação adicional de markdown.`;

    const response = await fetchWithTimeout(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: promptSystem },
          { role: 'user', content: summaryText }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }),
    }, 5000);

    if (!response.ok) {
      throw new Error(`Groq API returned HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Groq returned empty completion.');
    }

    const result = JSON.parse(rawContent.trim());
    const rawPatterns: unknown[] = Array.isArray(result.recurrence_patterns)
      ? result.recurrence_patterns
      : mockRecurrences;
    const recurrence_patterns = rawPatterns
      .slice(0, 4)
      .map((entry) => {
        if (typeof entry === 'string') {
          return anonymizePII(sanitizeMemo(entry) || entry);
        }
        if (entry && typeof entry === 'object') {
          const row = entry as Record<string, unknown>;
          const raw =
            row.label ?? row.name ?? row.merchant ?? row.description ?? row.pattern ?? row.text;
          if (typeof raw === 'string') {
            return anonymizePII(sanitizeMemo(raw) || raw);
          }
        }
        return '';
      })
      .filter((p) => p.length > 0);

    return {
      average_spend: Number(result.average_spend) || Number(averageSpend.toFixed(2)),
      top_category: result.top_category || topCategory,
      recurrence_patterns: recurrence_patterns.length ? recurrence_patterns : mockRecurrences,
    };
  } catch (error) {
    console.error('[TyllerFinance AI] generateContextMap failed. Using PostgreSQL stats fallback:', error);
    return {
      average_spend: Number(averageSpend.toFixed(2)),
      top_category: topCategory,
      recurrence_patterns: mockRecurrences,
    };
  }
}

export interface ActionPlanProjectionContext {
  currentBalance: number;
  dailyExpenseAverage: number;
  projectedEndBalance: number;
  estimatedSavings30d: number;
  reductionPercent: number;
  projectionPoints?: Array<{ date: string; balance: number }>;
}

export async function generateAIActionPlan(
  economyLevel: string,
  contextMap: any,
  projection?: ActionPlanProjectionContext
): Promise<string> {
  const averageSpend = Number(contextMap.average_spend) || 0;
  const topCategory = contextMap.top_category || 'Nenhuma';
  
  let recurrencePatterns: string[] = [];
  try {
    recurrencePatterns = typeof contextMap.recurrence_patterns === 'string'
      ? JSON.parse(contextMap.recurrence_patterns)
      : contextMap.recurrence_patterns;
  } catch {
    recurrencePatterns = [];
  }

  const reductionPercent =
    projection?.reductionPercent != null
      ? `${projection.reductionPercent}%`
      : economyLevel === 'leve'
        ? '10%'
        : economyLevel === 'moderado'
          ? '25%'
          : '50%';

  const balanceNow = projection?.currentBalance ?? 0;
  const balanceEnd = projection?.projectedEndBalance ?? balanceNow;
  const savings30d = projection?.estimatedSavings30d ?? 0;
  const dailyAvg = projection?.dailyExpenseAverage ?? 0;

  const localPlanMock = `### ✦ Plano de Ação: Economia ${economyLevel.toUpperCase()}

Com a meta **${economyLevel.toUpperCase()}** (corte de **${reductionPercent}**), a simulação de 30 dias indica:
- Saldo atual: **R$ ${balanceNow.toFixed(2)}**
- Saldo projetado (dia 30): **R$ ${balanceEnd.toFixed(2)}**
- Economia estimada no período: **R$ ${savings30d.toFixed(2)}**

#### 🎯 Sugestões Práticas de Cortes:
1. **${topCategory === 'Alimentação' ? '🍔 Alimentação' : '🏷️ Despesas Gerais'}**: Reduza em ${reductionPercent} os gastos supérfluos nesta área substituindo marcas e minimizando pedidos de delivery não planejados.
2. **🚗 Mobilidade**: Substitua corridas individuais de aplicativos por transporte coletivo ou planeje trajetos combinados para economizar em combustível e estacionamento.
3. **📺 Assinaturas**: Revise mensalidades ativas de serviços e cancele planos redundantes que não foram utilizados nas últimas duas semanas.

*Lembre-se: Saber exatamente quanto vai sobrar no fim do mês coloca o controle financeiro de volta em suas mãos.*`;

  if (!GROQ_API_KEY) {
    return localPlanMock;
  }

  try {
    const projectionSample = (projection?.projectionPoints || []).slice(0, 8);

    const promptSystem = `Você é o Assistente Estratégico de IA do TyllerFinance.
Gere um plano de ação tático em português brasileiro alinhado à simulação de fluxo de caixa de 30 dias.
O plano DEVE usar os valores numéricos da projeção (saldo atual, saldo projetado, economia estimada).
Retorne markdown com:
- Título ### com a meta de economia
- Parágrafo resumindo o impacto nos números da simulação (cite valores em R$)
- 3 a 4 sugestões práticas de cortes por categoria/hábito
- Tom encorajador e objetivo

Responda APENAS markdown limpo, sem blocos \`\`\`markdown.`;

    const summaryUser = `Meta: Economia ${economyLevel.toUpperCase()} (redução ${reductionPercent}).
Simulação Tendência de Fluxo de Caixa (30 dias):
- Saldo atual: R$ ${balanceNow.toFixed(2)}
- Gasto médio diário (base): R$ ${dailyAvg.toFixed(2)}
- Saldo projetado no dia 30: R$ ${balanceEnd.toFixed(2)}
- Economia estimada vs. sem meta: R$ ${savings30d.toFixed(2)}
- Amostra da curva projetada: ${JSON.stringify(projectionSample)}

Perfil de gastos:
- Média mensal histórica: R$ ${averageSpend.toFixed(2)}
- Categoria principal: ${topCategory}
- Recorrências: ${JSON.stringify(recurrencePatterns)}`;

    const response = await fetchWithTimeout(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: promptSystem },
          { role: 'user', content: summaryUser }
        ],
        temperature: 0.3,
      }),
    }, 5000);

    if (!response.ok) throw new Error('Groq returned error');
    
    const data: any = await response.json();
    return data.choices?.[0]?.message?.content || localPlanMock;
  } catch (error) {
    console.error('[TyllerFinance AI] generateAIActionPlan failed. Using local fallback:', error);
    return localPlanMock;
  }
}

const ACCURACY_FALLBACK = JSON.stringify({
  score: 0,
  metasCumpridas: [],
  desvios: [],
  instrucoesProximoPlano: ['Análise indisponível — gere um novo plano após importar mais extratos.'],
});

export async function generateAccuracyReport(
  planContent: string,
  realTransactions: Array<{ category: string; amount: number; date: string }>,
  periodStart: string,
  periodEnd: string
): Promise<string> {
  const categoryBreakdown: Record<string, number> = {};
  let totalSpent = 0;

  for (const tx of realTransactions) {
    const category = tx.category || 'Não Categorizado';
    const amount = Math.abs(Number(tx.amount));
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
    totalSpent += amount;
  }

  const categoryText =
    totalSpent > 0
      ? Object.entries(categoryBreakdown)
          .map(
            ([cat, val]) =>
              `- ${cat}: R$ ${val.toFixed(2)} (${((val / totalSpent) * 100).toFixed(1)}%)`
          )
          .join('\n')
      : '- Nenhum gasto registrado no período';

  const prompt = `Você é um analista financeiro especializado. Compare as metas do Plano de Ação com os gastos reais do período.

PLANO DE AÇÃO ORIGINAL:
${planContent}

GASTOS REAIS POR CATEGORIA (período: ${periodStart} a ${periodEnd}):
Total gasto: R$ ${totalSpent.toFixed(2)}
${categoryText}

Gere um relatório estruturado em JSON com:
1. "score": número de 0 a 100 representando a acurácia geral (100 = metas cumpridas perfeitamente)
2. "metasCumpridas": array de strings com metas que foram atingidas
3. "desvios": array de objetos {categoria: string, valorEsperado: number, valorReal: number, percentualDesvio: number}
4. "instrucoesProximoPlano": array de strings com recomendações específicas para o próximo plano

Retorne APENAS o JSON, sem texto adicional.`;

  if (!GROQ_API_KEY) {
    return ACCURACY_FALLBACK;
  }

  try {
    const response = await fetchWithTimeout(
      GROQ_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      },
      30000
    );

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data: any = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || ACCURACY_FALLBACK;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : raw;
  } catch (error) {
    console.error('[TyllerFinance AI] generateAccuracyReport failed:', error);
    return ACCURACY_FALLBACK;
  }
}

