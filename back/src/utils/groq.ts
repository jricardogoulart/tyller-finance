import dotenv from 'dotenv';

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

// Local categorizer regex mock for absolute resiliency
export function localCategorizeMock(description: string, amount: number): string {
  const desc = description.toUpperCase();
  
  // If amount is positive, categorize as Receita
  if (amount > 0) return 'Receita';
  
  if (/UBER|99APP|GRALHA|POSTO|SHELL|IPIRANGA|GASOL|METRO|AUTOPASS|REDPASS|ESTACIONAMENTO|PEDAGIO/.test(desc)) return 'Transporte';
  if (/IFOOD|MCDONALD|BURGER|RESTAURANTE|SUPERMERCADO|REGINA|MERCEARIA|CARREFOUR|MERCADO|PADARIA|CAFE|ATACADAO|BAR|PIZZA/.test(desc)) return 'Alimentação';
  if (/ALUGUEL|CONDOMINIO|LIGHT|ELETRO|SABESP|INTERNET|NET|CLARO|VIVO|FIBRA|ENEL|GAS/.test(desc)) return 'Moradia';
  if (/DRG|DROGASIL|PAGUE MENOS|FARMACIA|MEDICO|CONSULTA|UNIMED|HAPVIDA|LABORA|HOSPITAL|EXAME|ODONTO/.test(desc)) return 'Saúde';
  if (/NETFLIX|SPOTIFY|STEAM|CINEMA|SHOW|HOTEL|DECOLAR|INGRESSO|PLAYSTATION|NINTENDO|VIAGEM/.test(desc)) return 'Lazer';
  if (/FACULDADE|CURSO|LIVRARIA|UDEMY|ALURA|SCHOOL|COLEGIO|IDIOMAS/.test(desc)) return 'Educação';
  if (/TARIFA|IOF|MANUTENCAO|BANCO|JUROS|ANUIDADE|SERVICO/.test(desc)) return 'Serviços';
  
  return 'Outros';
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

/**
 * Categorize a batch of transactions using Groq API, falling back to local regex categorizer.
 */
export async function categorizeTransactionsBatch(transactions: TransactionItem[]): Promise<Record<string, string>> {
  if (transactions.length === 0) return {};

  if (!GROQ_API_KEY) {
    console.warn('[TyllerFinance AI] GROQ_API_KEY missing. Falling back to high-fidelity local Regex categorizer.');
    const result: Record<string, string> = {};
    for (const t of transactions) {
      result[t.id] = localCategorizeMock(t.description, Number(t.amount));
    }
    return result;
  }

  try {
    const promptSystem = `Você é o motor de categorização financeira do TyllerFinance.
Receba um array JSON de transações brasileiras contendo ID, descrição e valor (em reais).
Retorne um objeto JSON onde cada chave é o ID da transação e o valor é uma das categorias oficiais listadas:
["Moradia", "Alimentação", "Transporte", "Saúde", "Lazer", "Educação", "Serviços", "Receita", "Outros"]

Regras Estritas:
1. Ignore o sinal do valor; valores positivos geralmente são "Receita".
2. Se a descrição contiver "UBER", "99APP", "POSTO", classifique como "Transporte".
3. Se contiver "IFOOD", "MCDONALDS", "SUPERMERCADO", classifique como "Alimentação".
4. Retorne APENAS o JSON mapeado {"ID": "CATEGORIA"}, sem nenhuma introdução, explicação ou tags markdown de código. Responda estritamente em formato JSON puro.`;

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
          { role: 'user', content: JSON.stringify(transactions.map(t => ({ id: t.id, description: anonymizePII(t.description), amount: t.amount }))) }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    }, 5000);

    if (!response.ok) {
      throw new Error(`Groq API returned HTTP ${response.status}`);
    }

    const data: any = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Groq API returned an empty completion content.');
    }

    const result = JSON.parse(rawContent.trim());
    return result;
  } catch (error) {
    console.error('[TyllerFinance AI] Groq batch categorization failed. Falling back to local Regex:', error);
    const result: Record<string, string> = {};
    for (const t of transactions) {
      result[t.id] = localCategorizeMock(t.description, Number(t.amount));
    }
    return result;
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
      totalExpenses += exp;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + exp;
      
      const cleanDesc = t.description.toUpperCase().trim().slice(0, 15);
      descriptionCounts[cleanDesc] = (descriptionCounts[cleanDesc] || 0) + 1;
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
      mockRecurrences.push(`Transações frequentes detectadas para "${desc}" (${count} vezes).`);
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
    const summaryText = `Histórico de Transações do Workspace:
Gasto Total: R$ ${totalExpenses.toFixed(2)} dividido em ${monthCount} meses.
Gastos por Categoria: ${JSON.stringify(categoryTotals)}
Transações mais frequentes: ${JSON.stringify(Object.fromEntries(Object.entries(descriptionCounts).filter(([_, count]) => count >= 2)))}
Lista crua (amostra de descrição e data): ${JSON.stringify(transactions.slice(0, 20).map(t => ({ desc: t.description, date: t.date, amt: t.amount })))}`;

    const promptSystem = `Você é o analisador comportamental do TyllerFinance.
Sua tarefa é analisar o sumário de transações de despesas fornecido pelo usuário e gerar um perfil analítico de gastos.
Retorne um objeto JSON puro contendo exatamente:
1. "average_spend": Número decimal indicando a média mensal de despesas totais.
2. "top_category": String contendo a categoria com maior despesa acumulada.
3. "recurrence_patterns": Um array de strings (máximo 4 itens) detalhando assinaturas frequentes (Netflix, Uber, iFood) ou hábitos consolidados de despesas identificados nas descrições. Responda estritamente em português brasileiro (ex: "Frequência alta de gastos em iFood detectada").

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
    return {
      average_spend: Number(result.average_spend) || Number(averageSpend.toFixed(2)),
      top_category: result.top_category || topCategory,
      recurrence_patterns: result.recurrence_patterns || mockRecurrences,
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

export async function generateAIActionPlan(
  economyLevel: string,
  contextMap: any
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

  const reductionPercent = economyLevel === 'leve' ? '10%' : economyLevel === 'moderado' ? '25%' : '50%';

  // Local fallback markdown generator
  const localPlanMock = `### ✦ Plano de Ação Estratégico: Economia ${economyLevel.toUpperCase()}

Ao adotar a meta **${economyLevel.toUpperCase()}**, seu objetivo é cortar **${reductionPercent}** nas despesas supérfluas. Se mantiver esse foco, seu saldo final no fim do mês melhorará de forma substancial.

#### 🎯 Sugestões Práticas de Cortes:
1. **${topCategory === 'Alimentação' ? '🍔 Alimentação' : '🏷️ Despesas Gerais'}**: Reduza em ${reductionPercent} os gastos supérfluos nesta área substituindo marcas e minimizando pedidos de delivery não planejados.
2. **🚗 Mobilidade**: Substitua corridas individuais de aplicativos por transporte coletivo ou planeje trajetos combinados para economizar em combustível e estacionamento.
3. **📺 Assinaturas**: Revise mensalidades ativas de serviços e cancele planos redundantes que não foram utilizados nas últimas duas semanas.

*Lembre-se: Saber exatamente quanto vai sobrar no fim do mês coloca o controle financeiro de volta em suas mãos.*`;

  if (!GROQ_API_KEY) {
    return localPlanMock;
  }

  try {
    const promptSystem = `Você é o Assistente Estratégico de IA do TyllerFinance.
Sua tarefa é gerar um plano de ação tático de cortes em português brasileiro.
Retorne um markdown elegante contendo:
- Resumo em 1 frase sobre o impacto da meta selecionada no saldo final do mês.
- 3 a 4 sugestões de cortes extremamente práticas (ex: dicas de mobilidade, alimentação, lazer e serviços) adaptadas aos dados reais do usuário fornecidos.
- Um tom encorajador, minimalista e focado no Core Value: "Saber exatamente quanto vai sobrar no fim do mês - e o que fazer para melhorar".

Restrição Estrita: Responda APENAS com o conteúdo do markdown limpo, sem cabeçalhos adicionais ou tags explicativas de markdown de código (como \`\`\`markdown).`;

    const summaryUser = `Meta desejada: Economia ${economyLevel.toUpperCase()} (corte de ${reductionPercent}).
Histórico do Usuário:
- Média Mensal de Gastos: R$ ${averageSpend.toFixed(2)}
- Categoria Principal: ${topCategory}
- Hábitos e recorrências identificados: ${JSON.stringify(recurrencePatterns)}`;

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

