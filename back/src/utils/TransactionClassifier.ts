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
    category: 'ALIMENTACAO',
    subcategory: 'DELIVERY',
    priority: 10,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_2',
    search_token: 'UBER',
    category: 'TRANSPORTE',
    subcategory: 'APLICATIVO',
    priority: 10,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_3',
    search_token: 'POSTO',
    category: 'TRANSPORTE',
    subcategory: 'COMBUSTIVEL',
    priority: 20,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_4',
    search_token: 'AMAZON WEB SERVICES',
    category: 'TRABALHO',
    subcategory: 'INFRAESTRUTURA',
    priority: 10,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_5',
    search_token: 'AWS',
    category: 'TRABALHO',
    subcategory: 'INFRAESTRUTURA',
    priority: 15,
    transaction_type: 'DEBIT',
  },
  {
    id: 'rule_6',
    search_token: 'ALURA',
    category: 'EDUCACAO',
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

export function sanitizeMemo(rawMemo: string): string {
  let clean = rawMemo;

  // 1. Remover Acentos e converter para UPPERCASE
  clean = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  // 2. Remover Datas no formato DD/MM ou MM/DD
  clean = clean.replace(/\b\d{2}\/\d{2}\b/g, ' ');

  // 3. Remover Parcelas (ex: 01/03, 1V, PARC 2)
  clean = clean.replace(/\b\d{1,2}\/\d{1,2}\b/g, ' '); 
  clean = clean.replace(/\b\d{1,2}V\b/g, ' ');
  clean = clean.replace(/\bPARC(ELA)?\s*\d+\b/g, ' ');

  // 4. Remover prefixos bancários comuns e lixo numérico acoplado
  clean = clean.replace(/\b(AUT|DOC|TED|PIX|TEF)[:\-]?\s*\d+\b/g, ' ');

  // 5. Remover sequências numéricas longas (maior que 4 dígitos)
  clean = clean.replace(/\b\d{5,}\b/g, ' ');

  // 6. Remover sufixos societários comuns (LTDA, ME, S/A, SA, EIRELI)
  clean = clean.replace(/\b(LTDA|EIRELI|S\/?A|M\/?E)\b/g, ' ');

  // 7. Remover sufixos de localidade/adquirente residuais comuns no final de strings isoladas
  clean = clean.replace(/\b(SAO PAULO|RIO DE JANEI|SP|RJ|BR|DE)\b\s*$/g, ' ');

  // 8. Remover caracteres especiais (mantendo apenas alfanuméricos e espaços)
  clean = clean.replace(/[^A-Z0-9\s]/g, ' ');

  // 9. Limpar espaços extras
  clean = clean.replace(/\s{2,}/g, ' ').trim();

  return clean;
}

export function getSuggestedIdentifier(cleanMemo: string): string {
  const words = cleanMemo.split(' ').filter(w => w.length > 0);
  if (words.length <= 2) {
    return cleanMemo;
  }
  // Pega as duas primeiras palavras significativas para formar a sugestão inteligente
  return words.slice(0, 2).join(' ');
}

export function classifyTransaction(tx: RawTransaction, userRules: ClassificationRule[] = []): ClassifiedTransaction {
  const cleanMemo = sanitizeMemo(tx.memo);
  const sortedRules = [...rulesDb, ...userRules].sort((a, b) => a.priority - b.priority);

  // Pass 1: Match exato de substring (Alta precisão)
  for (const rule of sortedRules) {
    if (rule.transaction_type !== 'ANY' && rule.transaction_type !== tx.type) {
      continue;
    }

    if (cleanMemo.includes(rule.search_token)) {
      return {
        original_memo: tx.memo,
        clean_memo: cleanMemo,
        amount: tx.amount,
        type: tx.type,
        category: rule.category,
        subcategory: rule.subcategory,
        rule_applied: rule.id,
      };
    }
  }

  // Pass 2: Fuzzy Matching tolerante via distância de Levenshtein (Fuzzy Threshold >= 0.85)
  // Ignora tokens de busca muito pequenos (menos de 4 caracteres) para evitar falso-positivos
  for (const rule of sortedRules) {
    if (rule.transaction_type !== 'ANY' && rule.transaction_type !== tx.type) {
      continue;
    }

    const token = rule.search_token;
    if (token.length < 4) {
      continue;
    }

    // 1. Similaridade direta
    let sim = calculateSimilarity(cleanMemo, token);
    if (sim >= 0.85) {
      return {
        original_memo: tx.memo,
        clean_memo: cleanMemo,
        amount: tx.amount,
        type: tx.type,
        category: rule.category,
        subcategory: rule.subcategory,
        rule_applied: rule.id,
      };
    }

    // 2. Similaridade parcial de palavra
    const words = cleanMemo.split(' ').filter(w => w.length >= 4);
    for (const word of words) {
      if (calculateSimilarity(word, token) >= 0.85) {
        return {
          original_memo: tx.memo,
          clean_memo: cleanMemo,
          amount: tx.amount,
          type: tx.type,
          category: rule.category,
          subcategory: rule.subcategory,
          rule_applied: rule.id,
        };
      }
    }
  }

  return {
    original_memo: tx.memo,
    clean_memo: cleanMemo,
    amount: tx.amount,
    type: tx.type,
    category: 'PENDENTE_CLASSIFICACAO',
    subcategory: 'PENDENTE_CLASSIFICACAO',
    suggested_identifier: getSuggestedIdentifier(cleanMemo),
  };
}
