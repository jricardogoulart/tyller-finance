export const VALID_CATEGORIES = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Serviços',
  'Receita',
  'Seguro',
  'Outros',
] as const;

const CATEGORY_ALIASES: Record<string, string> = {
  ALIMENTACAO: 'Alimentação',
  TRANSPORTE: 'Transporte',
  MORADIA: 'Moradia',
  SAUDE: 'Saúde',
  LAZER: 'Lazer',
  EDUCACAO: 'Educação',
  SERVICOS: 'Serviços',
  RECEITA: 'Receita',
  SEGURO: 'Seguro',
  OUTROS: 'Outros',
  TRABALHO: 'Serviços',
};

export function normalizeCategory(category: string | undefined | null): string {
  if (!category) return 'Outros';
  const trimmed = category.trim();
  if ((VALID_CATEGORIES as readonly string[]).includes(trimmed)) return trimmed;

  const folded = trimmed
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  if (CATEGORY_ALIASES[folded]) return CATEGORY_ALIASES[folded];

  const match = VALID_CATEGORIES.find(
    (c) =>
      c
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase() === folded
  );
  return match || 'Outros';
}

export function needsAICategorization(category?: string | null): boolean {
  if (!category) return true;
  return ['Outros', 'PENDENTE_CLASSIFICACAO', 'Não Categorizado', ''].includes(category);
}

const KNOWN_CATEGORY_FILTER = `category NOT IN ('Outros', 'PENDENTE_CLASSIFICACAO', 'Não Categorizado', '') AND category IS NOT NULL`;

/**
 * Busca categoria mais frequente já usada no workspace para o mesmo memo/identificador.
 */
export async function lookupHistoricalCategory(
  pool: { query: (sql: string, params: unknown[]) => Promise<{ rows: Array<{ category: string }> }> },
  workspaceId: string,
  cleanMemo: string,
  suggestedIdentifier?: string
): Promise<string | null> {
  if (!cleanMemo && !suggestedIdentifier) return null;

  const byMemo = await pool.query(
    `SELECT category, COUNT(*)::int AS cnt FROM transactions
     WHERE workspace_id = $1 AND clean_memo = $2 AND ${KNOWN_CATEGORY_FILTER}
     GROUP BY category ORDER BY cnt DESC LIMIT 1`,
    [workspaceId, cleanMemo]
  );
  if (byMemo.rows[0]?.category) {
    return normalizeCategory(byMemo.rows[0].category);
  }

  if (suggestedIdentifier) {
    const byToken = await pool.query(
      `SELECT category, COUNT(*)::int AS cnt FROM transactions
       WHERE workspace_id = $1 AND suggested_identifier = $2 AND ${KNOWN_CATEGORY_FILTER}
       GROUP BY category ORDER BY cnt DESC LIMIT 1`,
      [workspaceId, suggestedIdentifier]
    );
    if (byToken.rows[0]?.category) {
      return normalizeCategory(byToken.rows[0].category);
    }
  }

  return null;
}

export type TransactionType = 'DEBIT' | 'CREDIT' | 'ANY';

export interface ClassificationRule {
  id: string;
  search_token: string;
  category: string;
  subcategory: string;
  priority: number; // Menor número = Maior prioridade
  transaction_type: TransactionType;
}

export interface RawTransaction {
  memo: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
}

export interface ClassifiedTransaction {
  original_memo: string;
  clean_memo: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category: string;
  subcategory: string;
  rule_applied?: string;
  suggested_identifier?: string;
}

// Em produção, isso viria do banco de dados (ex: Postgres ou Redis)
const rulesDb: ClassificationRule[] = [
  {
    id: 'rule_1',
    search_token: 'IFOOD',
    category: 'Alimentação',
    subcategory: 'DELIVERY',
    priority: 10,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_2',
    search_token: 'UBER',
    category: 'Transporte',
    subcategory: 'APLICATIVO',
    priority: 10,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_3',
    search_token: 'POSTO',
    category: 'Transporte',
    subcategory: 'COMBUSTIVEL',
    priority: 20,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_4',
    search_token: 'AMAZON WEB SERVICES',
    category: 'Serviços',
    subcategory: 'INFRAESTRUTURA',
    priority: 10,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_5',
    search_token: 'AWS',
    category: 'Serviços',
    subcategory: 'INFRAESTRUTURA',
    priority: 15,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_6',
    search_token: 'ALURA',
    category: 'Educação',
    subcategory: 'CURSOS',
    priority: 10,
    transaction_type: 'ANY',
  },
];

export function calculateSimilarity(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0) return len2 === 0 ? 1.0 : 0.0;
  if (len2 === 0) return 0.0;

  const d: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    d[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,       // deletion
        d[i][j - 1] + 1,       // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = d[len1][len2];
  return 1.0 - distance / Math.max(len1, len2);
}

/** Prefixos operacionais de extrato — não são o nome do estabelecimento/instituição. */
const MEMO_OPERATION_PREFIXES = new Set([
  'PAGAMENTO',
  'PAGTO',
  'COMPRA',
  'DEBITO',
  'CREDITO',
  'TRANSFERENCIA',
  'TRANSF',
  'ENVIO',
  'RECEBIDO',
  'RECEBIMENTO',
  'TARIFA',
  'SAQUE',
  'DOC',
  'AUT',
  'TEF',
]);

/**
 * Remove apenas documentos e identificadores sensíveis (LGPD-02 / Fase 14).
 * Preserva nomes de pessoas, estabelecimentos e instituições para regras do usuário (Fase 11).
 */
const CNPJ_PATTERN = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;

/** Preserva CNPJ (público) enquanto remove outros identificadores numéricos longos. */
function maskCnpjTokens(text: string): { text: string; tokens: string[] } {
  const tokens: string[] = [];
  const masked = text.replace(CNPJ_PATTERN, (match) => {
    const id = tokens.length;
    tokens.push(match);
    return `__CNPJ_${id}__`;
  });
  return { text: masked, tokens };
}

function restoreCnpjTokens(text: string, tokens: string[]): string {
  let restored = text;
  tokens.forEach((cnpj, id) => {
    restored = restored.replace(`__CNPJ_${id}__`, cnpj);
  });
  return restored;
}

/**
 * Remove documentos pessoais (CPF, e-mail, telefone) e ruído bancário numérico.
 * CNPJ permanece. Nomes em PIX/TED/descrição são preservados (Fase 11 + LGPD-02).
 */
export function stripSensitiveDocuments(rawMemo: string): string {
  if (!rawMemo) return '';

  const { text: withCnpjMask, tokens: cnpjTokens } = maskCnpjTokens(rawMemo);
  let clean = withCnpjMask;

  clean = clean.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, ' ');
  clean = clean.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi, ' ');
  clean = clean.replace(/\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g, ' ');

  clean = clean.replace(/\b\d{2}\/\d{2}(?:\/\d{4})?\b/g, ' ');
  clean = clean.replace(/\b\d{1,2}V\b/gi, ' ');
  clean = clean.replace(/\bPARC(ELA)?\s*\d+\b/gi, ' ');

  clean = clean.replace(/\b(AUT|DOC|TED|PIX|TEF)[:\-]?\s*\d+\b/gi, ' ');
  clean = clean.replace(/\b\d{5,}\b/g, ' ');

  clean = restoreCnpjTokens(clean, cnpjTokens);
  return clean.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Normaliza memo para matching de regras: tira documentos, mantém nomes/instituições.
 */
export function sanitizeMemo(rawMemo: string): string {
  let clean = stripSensitiveDocuments(rawMemo);

  clean = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
  clean = clean.replace(/[^A-Z0-9\s]/g, ' ');
  clean = clean.replace(/\s{2,}/g, ' ').trim();

  return clean;
}

export function getSuggestedIdentifier(cleanMemo: string): string {
  const words = cleanMemo.split(' ').filter((w) => w.length > 0);
  if (words.length === 0) return cleanMemo;

  let start = 0;
  while (start < words.length && MEMO_OPERATION_PREFIXES.has(words[start])) {
    start += 1;
  }

  const significant = words.slice(start).filter((w) => w.length >= 2);
  if (significant.length === 0) {
    return words.slice(0, Math.min(3, words.length)).join(' ');
  }
  if (significant.length <= 4) {
    return significant.join(' ');
  }
  return significant.slice(0, 4).join(' ');
}

/** Rótulo seguro para UI/API: sem original_memo/CPF, com nome da instituição preservado. */
export function getPublicDescription(row: {
  description?: string | null;
  clean_memo?: string | null;
  suggested_identifier?: string | null;
}): string {
  const clean = row.clean_memo?.trim();
  if (clean) return clean;

  const desc = row.description?.trim();
  if (desc) {
    const stripped = stripSensitiveDocuments(desc);
    if (stripped) return sanitizeMemo(stripped) || stripped;
  }

  return row.suggested_identifier?.trim() || '';
}

/** Remove original_memo e normaliza description para consumo do frontend. */
export function toPublicTransactionRow<T extends Record<string, unknown>>(row: T) {
  const { original_memo: _omitted, ...rest } = row;
  const publicDescription = getPublicDescription(row as {
    description?: string | null;
    clean_memo?: string | null;
    suggested_identifier?: string | null;
  });

  return {
    ...rest,
    description: publicDescription,
    clean_memo: (row.clean_memo as string | undefined) ?? publicDescription,
    suggested_identifier: row.suggested_identifier ?? getSuggestedIdentifier(publicDescription),
  };
}

export function classifyTransaction(tx: RawTransaction, userRules: ClassificationRule[] = []): ClassifiedTransaction {
  const cleanMemo = sanitizeMemo(tx.memo);
  const sortedRules = [...rulesDb, ...userRules].sort((a, b) => a.priority - b.priority);

  // Pass 1: Match exato de substring (Alta precisão)
  for (const rule of sortedRules) {
    if (rule.transaction_type !== 'ANY' && rule.transaction_type !== tx.type) {
      continue;
    }

    const cleanToken = sanitizeMemo(rule.search_token);
    if (cleanToken && cleanMemo.includes(cleanToken)) {
      return buildClassified(tx, cleanMemo, normalizeCategory(rule.category), rule.subcategory, rule.id);
    }
  }

  // Pass 2: Fuzzy Matching tolerante via distância de Levenshtein (Fuzzy Threshold >= 0.85)
  // Ignora tokens de busca muito pequenos (menos de 4 caracteres) para evitar falso-positivos
  for (const rule of sortedRules) {
    if (rule.transaction_type !== 'ANY' && rule.transaction_type !== tx.type) {
      continue;
    }

    const token = sanitizeMemo(rule.search_token);
    if (!token || token.length < 4) {
      continue;
    }

    // 1. Similaridade direta
    let sim = calculateSimilarity(cleanMemo, token);
    if (sim >= 0.85) {
      return buildClassified(tx, cleanMemo, normalizeCategory(rule.category), rule.subcategory, rule.id);
    }

    // 2. Similaridade parcial de palavra
    const words = cleanMemo.split(' ').filter(w => w.length >= 4);
    for (const word of words) {
      if (calculateSimilarity(word, token) >= 0.85) {
        return buildClassified(tx, cleanMemo, normalizeCategory(rule.category), rule.subcategory, rule.id);
      }
    }
  }

  // Pass 3: heurística local (evita IA para casos óbvios)
  const heuristicCategory = normalizeCategory(
    localCategorizeHeuristic(cleanMemo, tx.amount, tx.type)
  );
  if (!needsAICategorization(heuristicCategory)) {
    return buildClassified(tx, cleanMemo, heuristicCategory, 'HEURISTIC', undefined, getSuggestedIdentifier(cleanMemo));
  }

  return buildClassified(
    tx,
    cleanMemo,
    'PENDENTE_CLASSIFICACAO',
    'PENDENTE_CLASSIFICACAO',
    undefined,
    getSuggestedIdentifier(cleanMemo)
  );
}

function buildClassified(
  tx: RawTransaction,
  cleanMemo: string,
  category: string,
  subcategory: string,
  ruleApplied?: string,
  suggestedIdentifier?: string
): ClassifiedTransaction {
  return {
    original_memo: tx.memo,
    clean_memo: cleanMemo,
    amount: tx.amount,
    type: tx.type,
    category,
    subcategory,
    rule_applied: ruleApplied,
    suggested_identifier: suggestedIdentifier ?? getSuggestedIdentifier(cleanMemo),
  };
}

/** Heurística local compartilhada com groq fallback */
export function localCategorizeHeuristic(
  description: string,
  amount: number,
  type: 'DEBIT' | 'CREDIT' = amount >= 0 ? 'CREDIT' : 'DEBIT'
): string {
  const desc = description.toUpperCase();

  if (type === 'CREDIT' || amount > 0) return 'Receita';

  if (/UBER|99APP|99 POP|GRALHA|POSTO|SHELL|IPIRANGA|GASOL|METRO|AUTOPASS|REDPASS|ESTACIONAMENTO|PEDAGIO|SEM PARAR|CONCESSIONARIA|MOBILIDADE/.test(desc)) {
    return 'Transporte';
  }
  if (/IFOOD|RAPPI|MCDONALD|BURGER|RESTAURANTE|SUPERMERCADO|MERCEARIA|CARREFOUR|MERCADO|PADARIA|CAFE|ATACADAO|BAR|PIZZA|ZAFFARI|ASSAI|EXTRA HIPER/.test(desc)) {
    return 'Alimentação';
  }
  if (/ALUGUEL|CONDOMINIO|LIGHT|ELETRO|SABESP|INTERNET|NET |CLARO|VIVO|FIBRA|ENEL|CEMIG|CPFL|GAS |IMOBILIAR/.test(desc)) {
    return 'Moradia';
  }
  if (/DROGASIL|PAGUE MENOS|FARMACIA|MEDICO|CONSULTA|UNIMED|HAPVIDA|HOSPITAL|EXAME|ODONTO|DENTISTA|LABORATOR/.test(desc)) {
    return 'Saúde';
  }
  if (/NETFLIX|SPOTIFY|STEAM|CINEMA|SHOW|HOTEL|DECOLAR|INGRESSO|PLAYSTATION|VIAGEM|DISNEY|HBO|PRIME VIDEO/.test(desc)) {
    return 'Lazer';
  }
  if (/FACULDADE|CURSO|LIVRARIA|UDEMY|ALURA|SCHOOL|COLEGIO|IDIOMAS|EDUCA/.test(desc)) {
    return 'Educação';
  }
  if (/PORTO SEG|TOKIO|SUHAI|AZUL SEG|BRADESCO SEG|SEGURO|ALLIANZ|MAPFRE/.test(desc)) {
    return 'Seguro';
  }
  if (/TARIFA|IOF|MANUTENCAO|BANCO|JUROS|ANUIDADE|SERVICO|TAXA|TED DOC|DOC TED/.test(desc)) {
    return 'Serviços';
  }
  if (/PIX (RECEB|ENV)|SALARIO|HOLERITE|PROVENTOS|RENDIMENTO/.test(desc)) {
    return 'Receita';
  }

  return 'Outros';
}
