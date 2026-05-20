import { motion, AnimatePresence, Variants } from "framer-motion";
import { Hero } from "./components/Hero";
import { ColorSection } from "./components/ColorSection";
import { TypographySection } from "./components/TypographySection";
import { SpacingSection } from "./components/SpacingSection";
import { MotionSection } from "./components/MotionSection";
import { RadiusShadowSection } from "./components/RadiusShadowSection";
import { ZIndexBreakpointSection } from "./components/ZIndexBreakpointSection";
import { ComponentsSection } from "./components/ComponentsSection";
import { TokenExplorer } from "./components/TokenExplorer";
import { ProjectionsChart } from "./components/ProjectionsChart";
import { ActionPlanPanel } from "./components/ActionPlanPanel";
import { UserSpace } from "./components/UserSpace";
import { ProfileSpace } from "./components/ProfileSpace";
import { BackgroundEffects } from "./components/layout/BackgroundEffects";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { AuthPage } from "./components/AuthPage";

function Divider({ label }: { label: string }) {
  return (
    <div className="relative max-w-screen-xl mx-auto px-6 md:px-12 py-2">
      <div className="glow-line" />
      {label && (
        <span
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 top-1/2"
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-2xs)",
            color: "var(--color-neutral-700)",
            backgroundColor: "var(--color-neutral-950)",
            letterSpacing: "var(--letter-spacing-widest)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function Footer({ isDesignSystem }: { isDesignSystem?: boolean }) {
  if (isDesignSystem) {
    return (
      <footer
        className="border-t py-12 px-6 md:px-12"
        style={{
          borderColor: "var(--color-neutral-900)",
          backgroundColor: "var(--color-neutral-950)",
        }}
      >
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: "var(--color-brand-400)" }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" />
                  <rect x="8" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.5" />
                  <rect x="1" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.3" />
                  <rect x="8" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.7" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-family-body)",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-neutral-200)",
                }}
              >
                Motion Design System
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-family-mono)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-neutral-600)",
              }}
            >
              Inspired by Code Resolution® — Agency Growth Partner
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { label: "Colors",      count: "56" },
              { label: "Typography",  count: "26" },
              { label: "Spacing",     count: "20" },
              { label: "Motion",      count: "18" },
              { label: "Radius",      count: "8"  },
              { label: "Shadows",     count: "8"  },
              { label: "Z-Index",     count: "10" },
              { label: "Breakpoints", count: "5"  },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-brand-400)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {item.count}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-neutral-600)",
                    marginTop: "2px",
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="max-w-screen-xl mx-auto mt-10 pt-6 border-t flex items-center justify-between"
          style={{ borderColor: "var(--color-neutral-900)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-neutral-700)",
            }}
          >
            Primitive tokens · Semantic system · Motion language
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-neutral-700)",
            }}
          >
            v1.0.0 — 2026
          </span>
        </div>
      </footer>
    );
  }

  // TyllerFinance Standard Footer
  return (
    <footer
      className="border-t py-12 px-6 md:px-12"
      style={{
        borderColor: "var(--color-neutral-900)",
        backgroundColor: "var(--color-neutral-950)",
      }}
    >
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "var(--color-brand-400)" }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.5" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.3" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.7" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-neutral-200)",
              }}
            >
              TyllerFinance
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-xs)",
              color: "var(--color-neutral-400)",
              maxWidth: "450px",
              lineHeight: "1.6",
            }}
          >
            Seu assistente financeiro pessoal com IA proativa — saiba exatamente quanto vai sobrar no fim do mês.
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-1.5">
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-neutral-600)",
              letterSpacing: "var(--letter-spacing-wider)",
              textTransform: "uppercase",
            }}
          >
            Soberania Financeira © {new Date().getFullYear()}
          </span>
          <span
            style={{
              fontFamily: "var(--font-family-mono)",
              fontSize: "var(--font-size-2xs)",
              color: "var(--color-brand-500)",
            }}
          >
            Inteligência Proativa & Convicção
          </span>
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect } from "react";
import { UploadCard } from "./components/UploadCard";
import { ReviewList } from "./components/ReviewList";
import { TransactionList } from "./components/TransactionList";
import api from "./utils/api";

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

function MainLayout() {
  const { user, loading } = useAuth();

  // Clean, premium hash router state
  const [route, setRoute] = useState<'app' | 'design-system' | 'user-space' | 'perfil'>(() => {
    if (window.location.hash === '#/design-system') return 'design-system';
    if (window.location.hash === '#/user-space') return 'user-space';
    if (window.location.hash === '#/perfil') return 'perfil';
    return 'app';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/design-system') setRoute('design-system');
      else if (hash === '#/user-space') setRoute('user-space');
      else if (hash === '#/perfil') setRoute('perfil');
      else setRoute('app');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newRoute: 'app' | 'design-system' | 'user-space' | 'perfil') => {
    if (newRoute === 'design-system') window.location.hash = '#/design-system';
    else if (newRoute === 'user-space') window.location.hash = '#/user-space';
    else if (newRoute === 'perfil') window.location.hash = '#/perfil';
    else window.location.hash = '#/';
    setRoute(newRoute);
  };
  
  // Dashboard state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [ruleConfirmModal, setRuleConfirmModal] = useState<{
    isOpen: boolean;
    transaction: any;
    suggestedToken: string;
    category: string;
  } | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<any[]>([]);
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
      }
    } catch (err) {
      console.error('Failed to fetch projections:', err);
    }
  };

  const handleGenerateActionPlan = async () => {
    if (economyLevel === 'none') {
      alert('Por favor, selecione uma meta de economia (Leve, Moderado ou Intenso) antes de gerar o plano.');
      return;
    }
    setLoadingPlan(true);
    try {
      const response = await api.post('/ai/action-plan', { economyLevel });
      if (response.data?.plan) {
        setActionPlan(response.data.plan);
      }
    } catch (err) {
      console.error('Failed to generate action plan:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchContextMap();
      fetchProjections();
    }
  }, [user]);

  const handleParsed = (extracted: any[]) => {
    setParsedTransactions(extracted);
    setUploadError('');
    setSuccessMessage('');
  };

  const handleConfirmImport = async (importedCount: number, skippedCount: number) => {
    setParsedTransactions([]);
    setSuccessMessage(
      `Importação concluída! ${importedCount} transações adicionadas.` +
      (skippedCount > 0 ? ` (${skippedCount} duplicadas ignoradas).` : '')
    );
    await fetchTransactions();
    
    // Auto recalculate Context Map on import background to stay fresh!
    api.post('/ai/recalculate').then(res => {
      if (res.data?.contextMap) {
        setContextMap(res.data.contextMap);
      }
      fetchProjections(economyLevel);
    }).catch(console.error);
    
    // Clear toast message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  const handleCancelReview = () => {
    setParsedTransactions([]);
    setUploadError('');
  };

  const handleOptimizeAI = async () => {
    setIsOptimizing(true);
    setUploadError('');
    setSuccessMessage('');
    try {
      // 1. Categorize all pending transactions
      const catRes = await api.post('/ai/categorize');
      const categorizedCount = catRes.data?.categorizedCount || 0;

      // 2. Recalculate context map
      const recapRes = await api.post('/ai/recalculate');
      if (recapRes.data?.contextMap) {
        setContextMap(recapRes.data.contextMap);
      }

      // 3. Refresh transactions list
      await fetchTransactions();

      // 4. Refresh projections
      await fetchProjections(economyLevel);

      // 5. Emit premium success Toast
      setSuccessMessage(
        `IA Otimizada! ${categorizedCount} novas transações categorizadas, IA Context Map e Projeções recalculados.`
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
      
      // Update reatively
      setTransactions(prev =>
        prev.map(t => t.id === transactionId ? { ...t, category: newCategory } : t)
      );
      
      // Async update context map in background
      api.post('/ai/recalculate').then(res => {
        if (res.data?.contextMap) {
          setContextMap(res.data.contextMap);
        }
        fetchProjections(economyLevel);
      }).catch(console.error);

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
      // O backend executou o Efeito Cascata em lote. Atualizamos tudo!
      await fetchTransactions();
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

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center gap-4"
        style={{ backgroundColor: "var(--color-neutral-950)", color: "var(--color-neutral-100)" }}
      >
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
        <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-xs)", color: "var(--color-neutral-500)" }}>
          TyllerFinance...
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="relative isolation-isolate" style={{ minHeight: "100vh" }}>
      {/* ── Global Animated Background Effects ── */}
      <BackgroundEffects />

      {/* Hero + Nav */}
      <Hero currentRoute={route} onNavigate={navigateTo} />

      {/* ── TyllerFinance Personal Dashboard ── */}
      {route === 'app' && (
        <motion.section 
          variants={dashboardContainerVariants}
          initial="hidden"
          animate="visible"
          className="relative pt-24 pb-12 overflow-hidden px-4 md:px-8 lg:px-12"
        >
          <div className="max-w-screen-xl mx-auto flex flex-col gap-10">
            
            {/* Dashboard Header Banner */}
            <motion.div variants={dashboardCardVariants} className="flex flex-col gap-1">
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

            {/* Import & Parse Workspace Grid */}
            <motion.div variants={dashboardCardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              
              {/* Left/Middle: Import Area */}
              <div className="md:col-span-2 flex flex-col gap-6 h-full">
                {parsedTransactions.length > 0 ? (
                  <ReviewList
                    transactions={parsedTransactions}
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

              {/* Right Side: Proactive AI Helper Sidebar */}
              <div
                className="rounded-2xl border p-6 flex flex-col gap-5"
                style={{
                  backgroundColor: "var(--color-neutral-900)",
                  borderColor: "var(--color-neutral-800)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    style={{
                      fontFamily: "var(--font-family-mono)",
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-brand-400)",
                      letterSpacing: "var(--letter-spacing-widest)",
                      textTransform: "uppercase",
                    }}
                  >
                    Context Map
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-family-body)",
                      fontSize: "var(--font-size-md)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-neutral-100)",
                    }}
                  >
                    Análise de Hábitos
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 p-3 rounded-xl border bg-white/5 border-white/5">
                    <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Média Mensal</span>
                    <span className="text-base font-bold font-mono text-white">
                      R$ {contextMap.average_spend.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl border bg-white/5 border-white/5">
                    <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Maior Gasto</span>
                    <span className="text-xs font-bold text-lime-400 truncate mt-1">
                      {contextMap.top_category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Padrões Detectados</span>
                  <ul className="flex flex-col gap-2">
                    {contextMap.recurrence_patterns.map((pattern, idx) => (
                      <li key={idx} className="text-xs text-neutral-400 leading-relaxed pl-3 relative">
                        <span className="absolute left-0 top-1.5 w-1 h-1 rounded-full bg-lime-400" />
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glow-line my-1" />

                <motion.button
                  type="button"
                  disabled={isOptimizing}
                  whileHover={{ scale: isOptimizing ? 1 : 1.05, translateY: isOptimizing ? 0 : -1.5 }}
                  whileTap={{ scale: isOptimizing ? 1 : 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onClick={handleOptimizeAI}
                  className={`w-full py-3.5 rounded-2xl text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isOptimizing 
                      ? "bg-neutral-850 text-neutral-500 border border-neutral-800" 
                      : "btn-brand-glow"
                  }`}
                  style={{
                    fontFamily: "var(--font-family-body)",
                  }}
                >
                  {isOptimizing ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-neutral-500 border-t-transparent animate-spin" />
                      <span>ANALISANDO HÁBITOS...</span>
                    </>
                  ) : (
                    <>
                      <span>ANÁLISE AUTOMÁTICA</span>
                    </>
                  )}
                </motion.button>
              </div>

            </motion.div>

            {/* Projections & AI Action Plan Section */}
            {transactions.length > 0 && (
              <motion.div variants={dashboardCardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mt-4">
                <div className="md:col-span-2 flex flex-col gap-6">
                  {/* Chart controls & Chart */}
                  <div className="flex flex-col gap-4">
                    {/* Neon Economy Level Selectors */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border" style={{
                      backgroundColor: 'var(--color-neutral-900)',
                      borderColor: 'var(--color-neutral-800)',
                    }}>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Simular Economia</span>
                        <span className="text-xs text-neutral-300">Escolha seu nível de disciplina para este mês</span>
                      </div>
                      <div className="flex gap-2">
                        {(['none', 'leve', 'moderado', 'intenso'] as const).map((level) => {
                          const labelMap = { none: 'Sem Meta', leve: 'Leve (10%)', moderado: 'Moderado (25%)', intenso: 'Intenso (50%)' };
                          const active = economyLevel === level;
                          return (
                            <button
                              key={level}
                              onClick={() => {
                                setEconomyLevel(level);
                                fetchProjections(level);
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-300 cursor-pointer ${
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
                      </div>
                    </div>

                    <ProjectionsChart
                      historical={historicalPoints}
                      projected={projectionPoints}
                    />
                  </div>
                </div>
                
                <div className="flex">
                  <ActionPlanPanel
                    plan={actionPlan}
                    loading={loadingPlan}
                    onGenerate={handleGenerateActionPlan}
                  />
                </div>
              </motion.div>
            )}



          </div>
        </motion.section>
      )}

      {/* ── User Space Panel ── */}
      {route === 'user-space' && (
        <UserSpace />
      )}

      {/* ── User Profile Panel ── */}
      {route === 'perfil' && (
        <ProfileSpace />
      )}

      {/* ── Visual Design System Showcase ── */}
      {route === 'design-system' && (
        <>
          <Divider label="Visual Design System Showcase" />

          {/* ── Colors ── */}
          <motion.div id="colors">
            <Divider label="01 · Colors" />
            <ColorSection />
          </motion.div>

          {/* ── Typography ── */}
          <motion.div id="typography">
            <Divider label="02 · Typography" />
            <TypographySection />
          </motion.div>

          {/* ── Spacing ── */}
          <motion.div id="spacing">
            <Divider label="03 · Spacing" />
            <SpacingSection />
          </motion.div>

          {/* ── Motion ── */}
          <motion.div id="motion">
            <Divider label="04 · Motion" />
            <MotionSection />
          </motion.div>

          {/* ── Radius & Shadow ── */}
          <motion.div id="radius">
            <Divider label="05 · Radius & Shadow" />
            <RadiusShadowSection />
          </motion.div>

          {/* ── Z-Index & Breakpoints ── */}
          <motion.div id="zindex">
            <Divider label="06 · Z-Index & Breakpoints" />
            <ZIndexBreakpointSection />
          </motion.div>

          {/* ── Components ── */}
          <motion.div id="components">
            <Divider label="07 · Components" />
            <ComponentsSection />
          </motion.div>

          {/* ── Token Explorer ── */}
          <motion.div id="explorer">
            <Divider label="08 · Token Explorer" />
            <TokenExplorer />
          </motion.div>
        </>
      )}

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

      <Footer isDesignSystem={route === 'design-system'} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
