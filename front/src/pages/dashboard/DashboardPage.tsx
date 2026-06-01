import { motion, AnimatePresence, Variants } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { UploadCard } from "../../components/UploadCard";
import { ReviewList } from "../../components/ReviewList";
import { ProjectionsChart } from "../../components/ProjectionsChart";
import { ActionPlanPanel } from "../../components/ActionPlanPanel";
import {
  GlassCard,
  CategoryRankingCard,
  RecurrenceInsightsCard,
  renderPlanMarkdown,
} from "../../components/design-system";
import {
  computeCategoryBreakdown,
  computeCashFlowTotals,
  computeExpenseRecurrencePatterns,
  computeMonthlyAverageExpense,
  DASHBOARD_REFRESH_EVENT,
} from "../../utils/categoryBreakdown";
import api, { saveActionPlan, fetchActionPlansHistory } from "../../utils/api";

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('###')) {
      return (
        <h3 key={i} className="text-sm font-semibold mt-4 mb-3 text-neutral-50 flex items-center gap-2 text-left">
          {trimmed.replace('###', '')}
        </h3>
      );
    }
    if (trimmed.startsWith('####')) {
      return (
        <h4 key={i} className="text-xs font-semibold mt-3 mb-2 text-brand-400 text-left">
          {trimmed.replace('####', '')}
        </h4>
      );
    }
    if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.') || trimmed.startsWith('4.')) {
      return (
        <div key={i} className="pl-3 my-2 text-neutral-200 text-[11px] font-normal border-l-2 border-brand-500/30 leading-relaxed text-left">
          <span className="font-semibold text-brand-400">{trimmed.slice(0, 2)}</span> {trimmed.slice(2)}
        </div>
      );
    }
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      return (
        <p key={i} className="text-[10px] italic text-neutral-400 mt-3 text-center">
          {trimmed.replace(/\*/g, '')}
        </p>
      );
    }
    if (trimmed) {
      return (
        <p key={i} className="text-xs text-neutral-200 font-normal leading-relaxed my-1.5 text-left">
          {trimmed}
        </p>
      );
    }
    return <div key={i} className="h-1.5" />;
  });
}

function EvolucaoChart({ selectedPlan }: { selectedPlan: any }) {
  if (!selectedPlan) return null;

  const createdDate = new Date(selectedPlan.created_at);
  const msDiff = Date.now() - createdDate.getTime();
  const daysElapsed = Math.max(1, Math.min(30, Math.ceil(msDiff / (1000 * 60 * 60 * 24))));

  const daysInMonth = 30;
  const targetSaving = selectedPlan.target_saving || 0;
  const actualSaving = selectedPlan.actual_saving || 0;

  // We'll plot cumulative saving over 30 days
  const points: { day: number; planned: number; actual: number | null }[] = [];
  for (let i = 0; i <= daysInMonth; i++) {
    const planned = (targetSaving / daysInMonth) * i;
    const actual = i <= daysElapsed ? (actualSaving / daysElapsed) * i : null;
    points.push({ day: i, planned, actual });
  }

  // Max and Min values for Y-axis scaling
  const maxVal = Math.max(targetSaving, actualSaving, 100);
  const range = maxVal || 1;
  const padding = range * 0.1;
  const graphMax = maxVal + padding;
  const graphMin = 0;
  const graphRange = graphMax - graphMin;

  const width = 600;
  const height = 220;
  const paddingX = 45;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Map point index to coordinate
  const getCoords = (pList: typeof points) => {
    return pList.map((p, i) => {
      const x = paddingX + (i / daysInMonth) * chartWidth;
      const y = paddingY + chartHeight - ((p.planned - graphMin) / graphRange) * chartHeight;
      
      let yActual = 0;
      if (p.actual !== null) {
        yActual = paddingY + chartHeight - ((p.actual - graphMin) / graphRange) * chartHeight;
      }

      return { x, y, yActual, ...p };
    });
  };

  const coords = getCoords(points);

  // Create SVG paths
  const plannedPath = coords.reduce((path, c, i) => {
    return i === 0 ? `M ${c.x} ${c.y}` : `${path} L ${c.x} ${c.y}`;
  }, '');

  const actualCoords = coords.filter(c => c.actual !== null);
  const actualPath = actualCoords.reduce((path, c, i) => {
    return i === 0 ? `M ${c.x} ${c.yActual}` : `${path} L ${c.x} ${c.yActual}`;
  }, '');

  return (
    <div className="w-full rounded-2xl border p-5 flex flex-col gap-4 relative overflow-hidden bg-neutral-900 border-neutral-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 z-10">
        <div>
          <h4 style={{
            fontFamily: 'var(--font-family-body)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)' as any,
            color: 'var(--color-neutral-100)'
          }} className="text-left">
            Economia Acumulada Planejada vs Realizada
          </h4>
          <p className="text-[10px] text-neutral-500 text-left">
            Visualização do período de vigência de 30 dias (Progresso: Dia {daysElapsed}/30)
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed" style={{ borderColor: 'var(--color-warning-500)', borderTopWidth: '2px' }} />
            Planejado (R$ {targetSaving.toFixed(0)})
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5" style={{ backgroundColor: 'var(--color-brand-400)' }} />
            Realizado (R$ {actualSaving.toFixed(0)})
          </div>
        </div>
      </div>

      <div className="relative w-full h-[180px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <filter id="glow-actual" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="var(--color-brand-400)" floodOpacity="0.4" />
            </filter>
            <linearGradient id="gradient-actual" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = paddingY + chartHeight * ratio;
            const val = graphMax - ratio * graphRange;
            return (
              <g key={i}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="var(--color-neutral-850)" strokeWidth="1" />
                <text x={paddingX - 10} y={y + 4} textAnchor="end" fill="var(--color-neutral-400)" style={{ fontSize: '9px', fontFamily: 'var(--font-family-mono)' }}>
                  R$ {val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </text>
              </g>
            );
          })}

          {/* Area under Actual Path */}
          {actualCoords.length > 0 && (
            <path
              d={`${actualPath} L ${actualCoords[actualCoords.length - 1].x} ${paddingY + chartHeight} L ${actualCoords[0].x} ${paddingY + chartHeight} Z`}
              fill="url(#gradient-actual)"
            />
          )}

          {/* Planned Line (Dashed Orange) */}
          {plannedPath && (
            <path
              d={plannedPath}
              fill="none"
              stroke="var(--color-warning-500)"
              strokeWidth="2"
              strokeDasharray="5,4"
              strokeLinecap="round"
            />
          )}

          {/* Actual Line (Solid Lime) */}
          {actualPath && (
            <path
              d={actualPath}
              fill="none"
              stroke="var(--color-brand-400)"
              strokeWidth="2.5"
              filter="url(#glow-actual)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* X Axis labels */}
          {[0, 0.5, 1].map((ratio, i) => {
            const dayIdx = Math.floor(ratio * daysInMonth);
            const x = paddingX + ratio * chartWidth;
            return (
              <text key={i} x={x} y={height - 2} textAnchor="middle" fill="var(--color-neutral-500)" style={{ fontSize: '9px', fontFamily: 'var(--font-family-mono)' }}>
                Dia {dayIdx}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const dashboardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const dashboardCardVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 18
    }
  }
};

interface DashboardPageProps {
  navigateTo: (route: 'app' | 'design-system' | 'user-space' | 'perfil') => void;
}

export function DashboardPage({ navigateTo }: DashboardPageProps) {
  const { user } = useAuth();
  
  // Dashboard state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ruleConfirmModal, setRuleConfirmModal] = useState<{
    isOpen: boolean;
    transaction: any;
    suggestedToken: string;
    category: string;
  } | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<any[]>([]);
  const [pendingFileHash, setPendingFileHash] = useState('');
  const [pendingFilename, setPendingFilename] = useState('');
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // AI Context Map state
  const [contextMap, setContextMap] = useState<{ average_spend: number; top_category: string; recurrence_patterns: string[] }>({
    average_spend: 0,
    top_category: 'Nenhuma',
    recurrence_patterns: ['Aguardando a primeira otimização de IA.'],
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Projections & Action Plan State
  const [economyLevel, setEconomyLevel] = useState<'none' | 'leve' | 'moderado' | 'intenso'>('none');
  const [historicalPoints, setHistoricalPoints] = useState<any[]>([]);
  const [projectionPoints, setProjectionPoints] = useState<any[]>([]);
  const [actionPlan, setActionPlan] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [projectionSummary, setProjectionSummary] = useState<{
    currentBalance: number;
    dailyExpenseAverage: number;
    projectedEndBalance: number;
    estimatedSavings30d: number;
    reductionPercent: number;
  } | null>(null);

  // Evolução Histórica State
  const [dashboardTab, setDashboardTab] = useState<'atual' | 'historico'>('atual');
  const [historyPlans, setHistoryPlans] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [historyError, setHistoryError] = useState('');
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  const categoryBreakdown = useMemo(
    () => computeCategoryBreakdown(transactions),
    [transactions]
  );

  const cashFlowTotals = useMemo(
    () => computeCashFlowTotals(transactions),
    [transactions]
  );

  const expenseRecurrencePatterns = useMemo(() => {
    const local = computeExpenseRecurrencePatterns(transactions);
    if (local.length > 0) return local;
    return contextMap.recurrence_patterns;
  }, [transactions, contextMap.recurrence_patterns]);

  const monthlyAverageExpense = useMemo(
    () => computeMonthlyAverageExpense(transactions),
    [transactions]
  );

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const response = await fetchActionPlansHistory();
      const plans = response.data || [];
      setHistoryPlans(plans);
      
      // Keep selectedPlan in sync if already selected, otherwise default to first
      setSelectedPlan((prevSelected: any) => {
        if (prevSelected) {
          const fresh = plans.find((p: any) => p.id === prevSelected.id);
          return fresh || plans[0] || null;
        }
        return plans[0] || null;
      });
    } catch (err) {
      console.error('Failed to fetch history plans:', err);
      setHistoryError('Erro ao carregar histórico de planos. Tente novamente em instantes.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchContextMap = async () => {
    try {
      const response = await api.get('/ai/context-map');
      if (response.data?.contextMap) {
        setContextMap(response.data.contextMap);
      }
    } catch (err) {
      console.error('Failed to fetch context map:', err);
    }
  };

  const fetchProjections = async (economy = economyLevel) => {
    try {
      const response = await api.get(`/ai/projections?economy=${economy}`);
      if (response.data) {
        setHistoricalPoints(response.data.historicalPoints || []);
        setProjectionPoints(response.data.projectionPoints || []);
        setProjectionSummary({
          currentBalance: response.data.currentBalance ?? 0,
          dailyExpenseAverage: response.data.dailyExpenseAverage ?? 0,
          projectedEndBalance: response.data.projectedEndBalance ?? 0,
          estimatedSavings30d: response.data.estimatedSavings30d ?? 0,
          reductionPercent: response.data.reductionPercent ?? 0,
        });
      }
      return response.data;
    } catch (err) {
      console.error('Failed to fetch projections:', err);
      return null;
    }
  };

  const generateActionPlanForLevel = async (level: 'leve' | 'moderado' | 'intenso') => {
    setLoadingPlan(true);
    setUploadError('');
    try {
      const response = await api.post('/ai/action-plan', { economyLevel: level });
      if (response.data?.plan) {
        setActionPlan(response.data.plan);
        await saveActionPlan({ economyLevel: level, planContent: response.data.plan });
        await fetchHistory();
        setDashboardRefreshKey((k) => k + 1);
      }
    } catch (err) {
      console.error('Failed to generate action plan:', err);
      setUploadError('Erro ao gerar o plano estratégico. Tente novamente.');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleEconomyLevelSelect = async (level: 'none' | 'leve' | 'moderado' | 'intenso') => {
    setEconomyLevel(level);
    await fetchProjections(level);
    if (level === 'none') {
      setActionPlan('');
    }
  };

  const handleGenerateStrategicPlan = async () => {
    if (economyLevel === 'none') {
      setUploadError('Selecione Leve, Moderado ou Intenso antes de gerar o plano estratégico.');
      return;
    }
    await generateActionPlanForLevel(economyLevel);
  };

  const refreshDashboardData = useCallback(async () => {
    await Promise.all([fetchTransactions(), fetchContextMap(), fetchProjections(economyLevel)]);
    if (dashboardTab === 'historico') {
      await fetchHistory();
    }
    setDashboardRefreshKey((k) => k + 1);
  }, [economyLevel, dashboardTab]);

  useEffect(() => {
    if (user) {
      void refreshDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (user && dashboardTab === 'historico') {
      fetchHistory();
      fetchProjections(economyLevel);
    }
  }, [user, dashboardTab]);

  useEffect(() => {
    const onRefresh = () => {
      void refreshDashboardData();
    };
    window.addEventListener(DASHBOARD_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(DASHBOARD_REFRESH_EVENT, onRefresh);
  }, [refreshDashboardData]);

  const handleParsed = (data: { transactions: any[]; fileHash: string; filename: string }) => {
    setParsedTransactions(data.transactions);
    setPendingFileHash(data.fileHash);
    setPendingFilename(data.filename);
    setUploadError('');
    setSuccessMessage('');
  };

  const handleConfirmImport = async (importedCount: number, skippedCount: number, autoCategorizedCount = 0) => {
    setParsedTransactions([]);
    setPendingFileHash('');
    setPendingFilename('');
    setSuccessMessage(
      `Importação concluída! ${importedCount} transações adicionadas.` +
      (skippedCount > 0 ? ` (${skippedCount} duplicadas ignoradas).` : '') +
      (autoCategorizedCount > 0 ? ` ${autoCategorizedCount} categorizadas automaticamente.` : '')
    );
    await refreshDashboardData();

    // Clear toast message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const handleCancelReview = () => {
    setParsedTransactions([]);
    setPendingFileHash('');
    setPendingFilename('');
    setUploadError('');
  };

  const handleOptimizeAI = async () => {
    setIsOptimizing(true);
    setUploadError('');
    setSuccessMessage('');
    try {
      const catRes = await api.post('/ai/categorize');
      const categorizedCount = catRes.data?.categorizedCount || 0;

      await api.post('/ai/recalculate');
      await refreshDashboardData();

      // Emit premium success Toast
      setSuccessMessage(
        `Categorização concluída! ${categorizedCount} transações atualizadas. Ranking e projeções recalculados.`
      );
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 6000);
    } catch (err) {
      console.error('AI Optimization failed:', err);
      setUploadError('Erro ao processar otimização por IA. Tente novamente.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUpdateCategory = async (transactionId: string, newCategory: string) => {
    try {
      const tx = transactions.find(t => t.id === transactionId);
      if (!tx) return;

      await api.put(`/ai/transactions/${transactionId}/category`, { category: newCategory });
      
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? { ...t, category: newCategory } : t))
      );

      void api.post('/ai/recalculate').then(() => refreshDashboardData()).catch(console.error);

      // Abre a sugestão interativa para salvar regra automática (Self-Learning)
      const token = tx.suggested_identifier || tx.clean_memo || tx.description || '';
      setRuleConfirmModal({
        isOpen: true,
        transaction: tx,
        suggestedToken: token,
        category: newCategory
      });
    } catch (err) {
      console.error('Failed to update category:', err);
      throw err;
    }
  };

  const handleConfirmRuleCreation = async (token: string) => {
    if (!ruleConfirmModal) return;
    try {
      const { transaction, category } = ruleConfirmModal;
      const amountNum = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
      
      await api.post('/rules', {
        search_token: token.trim().toUpperCase(),
        category: category,
        transaction_type: amountNum < 0 ? 'DEBIT' : 'CREDIT',
        origin: 'MANUAL'
      });

      setRuleConfirmModal(null);
      await refreshDashboardData();
      // Recalcular mapa e projeções
      const recapRes = await api.post('/ai/recalculate');
      if (recapRes.data?.contextMap) {
        setContextMap(recapRes.data.contextMap);
      }
      await fetchProjections(economyLevel);
    } catch (err) {
      console.error('Failed to create transaction rule:', err);
    }
  };

  return (
    <>
      <motion.section 
        variants={dashboardContainerVariants}
        initial="hidden"
        animate="visible"
        className="relative pt-24 pb-12 overflow-hidden px-4 md:px-8 lg:px-12"
      >
        <div className="max-w-screen-xl mx-auto flex flex-col gap-10"> {/* Dashboard Header Banner */}
          <motion.div variants={dashboardCardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-6" style={{ borderColor: 'var(--color-neutral-900)' }}>
            <div className="flex flex-col gap-1 text-left">
              <div className="animate-float-slow relative select-none w-fit">
                {/* Ambient Title Glow for Dashboard */}
                <div 
                  className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-glow-lime blur-[100px] opacity-10 pointer-events-none z-[-1]"
                  style={{ mixBlendMode: "screen" }}
                />
                <h1
                  className="tracking-tight leading-none"
                  style={{
                    fontFamily: "var(--font-family-body)",
                    fontSize: "var(--font-size-3xl)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  <span className="text-gradient-hero-loop">Painel </span>
                  <span className="text-gradient-brand-loop">Financeiro</span>
                </h1>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-neutral-400)",
                }}
              >
                Importe seu extrato bancário para mapear padrões de gastos e simular projeções.
              </p>
            </div>

            {/* Premium Glassmorphism Tab Selector */}
            <div className="flex p-1 rounded-xl border bg-neutral-900/60 backdrop-blur-md relative self-start md:self-center" style={{ borderColor: 'var(--color-neutral-800)' }}>
              {(['atual', 'historico'] as const).map((tab) => {
                const active = dashboardTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setDashboardTab(tab)}
                    className={`relative py-2 px-5 text-xs font-semibold tracking-wide uppercase cursor-pointer focus:outline-none transition-all rounded-lg flex items-center gap-2 ${
                      active ? 'text-neutral-100' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                    }`}
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      zIndex: 1,
                    }}
                  >
                    <span>{tab === 'atual' ? 'Atual' : 'Evolução Histórica'}</span>
                    {tab === 'historico' && (
                      <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded border transition-colors ${
                        active 
                          ? 'bg-neutral-800 text-brand-400 border-neutral-700' 
                          : 'bg-brand-400/10 text-brand-400 border-brand-400/25'
                      }`}>
                        Otimizado
                      </span>
                    )}
                    {active && (
                      <motion.div
                        layoutId="activeDashboardTabGlow"
                        className="absolute inset-0 bg-neutral-800 rounded-lg"
                        style={{
                          border: '1px solid var(--color-neutral-700)',
                          zIndex: -1
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Toast Notification Success */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border flex items-center gap-3"
              style={{
                backgroundColor: "var(--color-success-950)",
                borderColor: "var(--color-success-800)",
                color: "var(--color-success-400)",
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{successMessage}</span>
            </motion.div>
          )}

          {dashboardTab === 'atual' && (
            <>
              {/* Import & Parse Workspace Grid */}
              <motion.div variants={dashboardCardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                
                {/* Left/Middle: Import Area */}
                <div className="md:col-span-2 flex flex-col gap-6 h-full">
                  {parsedTransactions.length > 0 ? (
                    <ReviewList
                      transactions={parsedTransactions}
                      fileHash={pendingFileHash}
                      filename={pendingFilename}
                      onConfirm={handleConfirmImport}
                      onCancel={handleCancelReview}
                    />
                  ) : (
                    <div className="flex flex-col gap-4 h-full flex-1">
                      <UploadCard
                        onParsed={handleParsed}
                        onError={setUploadError}
                        className="h-full flex-1"
                      />
                      {uploadError && (
                        <span
                          className="text-xs p-3 rounded-lg border block"
                          style={{
                            backgroundColor: 'var(--color-error-950)',
                            color: 'var(--color-error-500)',
                            borderColor: 'var(--color-error-700)',
                            fontFamily: 'var(--font-family-mono)',
                          }}
                        >
                          ⚠️ {uploadError}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <CategoryRankingCard
                  motionProps={{ variants: dashboardCardVariants }}
                  items={categoryBreakdown}
                  cashFlow={cashFlowTotals}
                  monthlyAverageExpense={monthlyAverageExpense}
                  onViewDetails={() => navigateTo('user-space')}
                />

              </motion.div>
            </>
          )}

          {dashboardTab === 'historico' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-8"
            >
              {/* Projections & AI Action Plan Section */}
              <div className="flex flex-col gap-2 text-left">
                <h3 className="text-[11px] uppercase tracking-widest font-mono font-bold text-neutral-500 border-b border-neutral-800/60 pb-3">
                  Simulação & Novo Plano Estratégico
                </h3>
                <motion.div
                  variants={dashboardCardVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-6 mt-2"
                >
                  <div className="ds-glass-card p-4 flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-col text-left">
                        <span className="ds-stat-label">Simular economia</span>
                        <span className="ds-card-subtitle mt-1">
                          Simule o gráfico pelo nível; gere o plano só quando quiser (economiza tokens)
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(['none', 'leve', 'moderado', 'intenso'] as const).map((level) => {
                          const labelMap = {
                            none: 'Sem Meta',
                            leve: 'Leve (10%)',
                            moderado: 'Moderado (25%)',
                            intenso: 'Intenso (50%)',
                          };
                          const active = economyLevel === level;
                          return (
                            <button
                              key={level}
                              type="button"
                              disabled={loadingPlan}
                              onClick={() => void handleEconomyLevelSelect(level)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-300 cursor-pointer disabled:opacity-50 ${
                                active
                                  ? 'border-brand-400 text-neutral-950 font-bold'
                                  : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                              }`}
                              style={{
                                backgroundColor: active ? 'var(--color-brand-400)' : 'transparent',
                                boxShadow: active ? '0 0 12px rgba(163, 230, 53, 0.2)' : 'none',
                              }}
                            >
                              {labelMap[level]}
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          disabled={loadingPlan || economyLevel === 'none'}
                          onClick={() => void handleGenerateStrategicPlan()}
                          className="btn-tech px-4 py-2 rounded-xl text-xs font-bold tracking-wide disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {loadingPlan ? 'Gerando plano...' : 'Gerar plano estratégico'}
                        </button>
                      </div>
                    </div>

                    {projectionSummary && economyLevel !== 'none' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="ds-card-inset p-3">
                          <span className="ds-stat-label block">Saldo atual</span>
                          <span className="ds-stat-value text-sm mt-1">
                            R$ {projectionSummary.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="ds-card-inset p-3">
                          <span className="ds-stat-label block">Saldo dia 30</span>
                          <span className="ds-stat-value text-sm mt-1">
                            R$ {projectionSummary.projectedEndBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="ds-card-inset p-3">
                          <span className="ds-stat-label block">Economia estimada</span>
                          <span className="ds-stat-value-brand text-sm mt-1">
                            R$ {projectionSummary.estimatedSavings30d.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="ds-card-inset p-3">
                          <span className="ds-stat-label block">Meta de corte</span>
                          <span className="ds-stat-value text-sm mt-1">
                            {projectionSummary.reductionPercent}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <ProjectionsChart
                    historical={historicalPoints}
                    projected={projectionPoints}
                  />

                  {(actionPlan || loadingPlan) && economyLevel !== 'none' && (
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div>
                          <h3 className="ds-card-title">Plano estratégico</h3>
                          <p className="ds-card-subtitle mt-1">
                            Baseado na simulação de fluxo de caixa (30 dias) — meta{' '}
                            {economyLevel.charAt(0).toUpperCase() + economyLevel.slice(1)}
                          </p>
                        </div>
                        {loadingPlan && (
                          <span className="text-xs font-mono text-brand-400 animate-pulse">
                            Gerando com Groq...
                          </span>
                        )}
                      </div>
                      {actionPlan ? (
                        <div className="max-h-[320px] overflow-y-auto pr-2 text-left">
                          {renderPlanMarkdown(actionPlan)}
                        </div>
                      ) : (
                        <p className="ds-card-subtitle">Aguarde, o plano está sendo gerado...</p>
                      )}
                    </GlassCard>
                  )}

                  <ActionPlanPanel refreshKey={dashboardRefreshKey} />
                </motion.div>
              </div>

              <div className="flex flex-col gap-4 text-left mt-4">
                <h3 className="text-[11px] uppercase tracking-widest font-mono font-bold text-neutral-500 border-b border-neutral-800/60 pb-3">
                  Histórico de Planos e Execução
                </h3>
                
                {historyError && (
                  <span
                    className="text-xs p-3 rounded-lg border block text-left"
                    style={{
                      backgroundColor: 'var(--color-error-950)',
                      color: 'var(--color-error-500)',
                      borderColor: 'var(--color-error-700)',
                      fontFamily: 'var(--font-family-mono)',
                    }}
                  >
                    ⚠️ {historyError}
                  </span>
                )}

                {loadingHistory && historyPlans.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-20 gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      style={{
                        width: "32px",
                        height: "32px",
                        border: "3px solid var(--color-neutral-800)",
                        borderTop: "3px solid var(--color-brand-400)",
                        borderRadius: "50%",
                      }}
                    />
                    <span className="text-xs font-mono text-neutral-505">
                      Carregando histórico...
                    </span>
                  </div>
                ) : historyPlans.length === 0 ? (
                  <div
                    className="w-full flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border bg-neutral-900 border-neutral-800"
                    style={{ minHeight: '280px' }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-neutral-800/40 flex items-center justify-center border border-neutral-800 text-neutral-500 mb-4">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">
                      Nenhum plano gerado anteriormente
                    </h3>
                    <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                      Selecione uma meta e clique em "Otimizar Plano" para receber as sugestões estruturadas pela IA e começar a acompanhar sua evolução.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Metrics Row (M-01) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="rounded-2xl border p-5 flex flex-col gap-1 relative overflow-hidden bg-neutral-900 border-neutral-800 text-left">
                        <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-brand-400/5 blur-[40px] pointer-events-none" />
                        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider font-bold">Economia Total Acumulada</span>
                        <span className="text-2xl font-bold font-mono text-brand-400 mt-1">
                          R$ {historyPlans.reduce((sum, p) => sum + (p.actual_saving || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="rounded-2xl border p-5 flex flex-col gap-1 relative overflow-hidden bg-neutral-900 border-neutral-800 text-left">
                        <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-brand-400/5 blur-[40px] pointer-events-none" />
                        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider font-bold">Aderência Média</span>
                        <span className="text-2xl font-bold font-mono text-white mt-1">
                          {(historyPlans.reduce((sum, p) => sum + (p.adherence_score || 0), 0) / historyPlans.length).toFixed(1)}%
                        </span>
                      </div>

                      <div className="rounded-2xl border p-5 flex flex-col gap-1 relative overflow-hidden bg-neutral-900 border-neutral-800 text-left">
                        <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-brand-400/5 blur-[40px] pointer-events-none" />
                        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider font-bold">Planos Otimizados</span>
                        <span className="text-2xl font-bold font-mono text-white mt-1">
                          {historyPlans.length}
                        </span>
                      </div>
                    </div>

                    {/* Chart & Split details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                      
                      {/* Left: Chart & Plans List */}
                      <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Chart (M-02) */}
                        {selectedPlan && <EvolucaoChart selectedPlan={selectedPlan} />}

                        <RecurrenceInsightsCard patterns={expenseRecurrencePatterns} />

                        {/* List of Plans (M-03) */}
                        <div className="rounded-2xl border p-5 flex flex-col gap-4 bg-neutral-900 border-neutral-800">
                          <div className="text-left">
                            <h4 style={{
                              fontFamily: 'var(--font-family-body)',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-semibold)' as any,
                              color: 'var(--color-neutral-100)'
                            }}>
                              Histórico de Planos
                            </h4>
                            <p className="text-[10px] text-neutral-400">
                              Selecione um plano para inspecionar os detalhes e o breakdown
                            </p>
                          </div>

                          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                            {historyPlans.map((plan) => {
                              const active = selectedPlan?.id === plan.id;
                              const dateStr = new Date(plan.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });

                              // Badge style based on adherence score
                              let badgeColor = '';
                              let badgeBg = '';
                              let badgeBorder = '';
                              if (plan.adherence_score >= 80) {
                                badgeColor = 'var(--color-brand-400)';
                                badgeBg = 'rgba(190, 240, 48, 0.08)';
                                badgeBorder = 'rgba(190, 240, 48, 0.2)';
                              } else if (plan.adherence_score >= 50) {
                                badgeColor = 'var(--color-warning-500)';
                                badgeBg = 'rgba(245, 158, 11, 0.08)';
                                badgeBorder = 'rgba(245, 158, 11, 0.2)';
                              } else {
                                badgeColor = 'var(--color-error-500)';
                                badgeBg = 'rgba(239, 68, 68, 0.08)';
                                badgeBorder = 'rgba(239, 68, 68, 0.2)';
                              }

                              const levelLabel = plan.economy_level === 'leve' ? 'Leve (10%)' :
                                                 plan.economy_level === 'moderado' ? 'Moderado (25%)' : 'Intenso (50%)';

                              return (
                                <motion.div
                                  key={plan.id}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => setSelectedPlan(plan)}
                                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all ${
                                    active 
                                      ? 'border-brand-400 bg-brand-400/5' 
                                      : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20'
                                  }`}
                                >
                                  <div className="flex flex-col gap-1 text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-neutral-200">Meta: {levelLabel}</span>
                                      <span className="text-[9px] font-mono text-neutral-500">{dateStr}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-mono mt-0.5">
                                      <span>Alvo: R$ {plan.target_saving.toFixed(2)}</span>
                                      <span>Real: R$ {plan.actual_saving.toFixed(2)}</span>
                                    </div>
                                  </div>

                                  <div
                                    className="px-2.5 py-1 rounded-md text-[10px] font-bold font-mono border self-start md:self-auto"
                                    style={{
                                      color: badgeColor,
                                      backgroundColor: badgeBg,
                                      borderColor: badgeBorder
                                    }}
                                  >
                                    Aderência: {plan.adherence_score.toFixed(1)}%
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* Right: Plan details */}
                      <div className="flex flex-col gap-6">
                        {selectedPlan && (
                          <div className="rounded-2xl border p-5 flex flex-col gap-4 bg-neutral-900 border-neutral-800">
                            <div className="text-left">
                              <h4 style={{
                                fontFamily: 'var(--font-family-body)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-semibold)' as any,
                                color: 'var(--color-neutral-100)'
                              }}>
                                Detalhes do Plano Gerado
                              </h4>
                              <p className="text-[10px] text-neutral-400 font-mono">
                                Plano otimizado por IA para economia
                              </p>
                            </div>

                            <div className="max-h-[300px] overflow-y-auto pr-1 text-left">
                              {renderMarkdown(selectedPlan.plan_content)}
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </motion.section>

      {/* Interactive Cascade Confirm Modal (Self-Learning Suggestion) */}
      <AnimatePresence>
        {ruleConfirmModal && ruleConfirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRuleConfirmModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 w-[140px] h-[140px] bg-brand-400/5 blur-[50px] pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-400/10 flex items-center justify-center border border-brand-400/30 text-brand-400">
                  <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.983m-8.982 3.125l5.247-5.247m-5.247 5.247L3 21l.125-8.982M18.982 12.017a8.25 8.25 0 00-13.802-1.685l.125 8.982" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Criar Regra Automática?</h3>
                  <p className="text-[11px] text-neutral-400">Automatize categorizações futuras usando regras.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/40 text-xs text-neutral-300 mb-5 leading-relaxed">
                Você definiu a categoria da transação <span className="font-semibold text-white">"{ruleConfirmModal.transaction.description}"</span> como <span className="font-bold text-brand-400">{ruleConfirmModal.category}</span>.
                <div className="mt-2.5 pt-2.5 border-t border-neutral-850 text-neutral-400">
                  💡 <span className="text-neutral-300"><b>Efeito Cascata</b></span>: Salvar esta regra aplicará automaticamente a categoria <span className="font-bold text-neutral-200">{ruleConfirmModal.category}</span> em <b>todas</b> as transações pendentes ou sem classificação que correspondam a este termo imediatamente!
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono tracking-widest text-neutral-500 uppercase mb-1.5">Termo Sugerido (Você pode editar)</label>
                <input
                  type="text"
                  value={ruleConfirmModal.suggestedToken}
                  onChange={(e) => setRuleConfirmModal({ ...ruleConfirmModal, suggestedToken: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 focus:outline-none focus:border-brand-500/50"
                  placeholder="Termo para matching"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-7">
                <button
                  type="button"
                  onClick={() => setRuleConfirmModal(null)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Apenas Esta
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmRuleCreation(ruleConfirmModal.suggestedToken)}
                  className="btn-tech px-5 py-2 rounded-xl text-xs font-bold tracking-wide cursor-pointer"
                >
                  Criar Regra & Cascata
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
