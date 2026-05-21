import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchActionPlansHistory } from '../utils/api';

interface ActionPlan {
  id: string;
  economy_level: string;
  plan_content: string;
  created_at: string;
  target_saving: number;
  actual_saving: number;
  adherence_score: number;
  category_percentages: Array<{ category: string; percentage: number }>;
  status: string;
  accuracy_report: string | null;
  plan_period_start: string | null;
  plan_period_end: string | null;
}

interface AccuracyReport {
  score?: number;
  metasCumpridas?: string[];
  desvios?: Array<{
    categoria: string;
    valorEsperado: number;
    valorReal: number;
    percentualDesvio: number;
  }>;
  instrucoesProximoPlano?: string[];
}

interface ActionPlanPanelProps {
  loadingGenerate?: boolean;
  onGenerate?: () => void;
}

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('###')) {
      return (
        <h3 key={i} className="text-lg font-semibold mt-4 mb-3 text-slate-100 flex items-center gap-2">
          {trimmed.replace('###', '')}
        </h3>
      );
    }
    if (trimmed.startsWith('####')) {
      return (
        <h4 key={i} className="text-md font-semibold mt-4 mb-2 text-amber-400">
          {trimmed.replace('####', '')}
        </h4>
      );
    }
    if (/^[1-4]\./.test(trimmed)) {
      return (
        <div
          key={i}
          className="pl-4 my-2.5 text-slate-300 text-sm font-normal border-l-2 border-amber-500/30 leading-relaxed"
        >
          <span className="font-semibold text-amber-400">{trimmed.slice(0, 2)}</span> {trimmed.slice(2)}
        </div>
      );
    }
    if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      return (
        <p key={i} className="text-xs italic text-slate-500 mt-4 text-center">
          {trimmed.replace(/\*/g, '')}
        </p>
      );
    }
    if (trimmed) {
      return (
        <p key={i} className="text-sm text-slate-300 font-normal leading-relaxed my-2">
          {trimmed}
        </p>
      );
    }
    return <div key={i} className="h-2" />;
  });
}

function parseAccuracyReport(raw: string | null): AccuracyReport | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AccuracyReport;
  } catch {
    return null;
  }
}

function getAccuracyBadgeColor(score: number) {
  if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (score >= 50) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

function formatPlanDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ActionPlanPanel({ loadingGenerate = false, onGenerate }: ActionPlanPanelProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await fetchActionPlansHistory();
      setPlans(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (!loadingGenerate) {
      loadPlans();
    }
  }, [loadingGenerate]);

  const activePlan = plans.find((p) => p.status === 'Ativo');
  const archivedPlans = plans
    .filter((p) => p.status === 'Arquivado')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700/50 rounded w-1/3" />
          <div className="h-32 bg-slate-700/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="border-b border-slate-700/50">
        <div className="flex items-center gap-1 p-2">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
            }`}
          >
            Plano Ativo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
            }`}
          >
            Histórico & Acurácia
          </button>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'active' && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activePlan ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-100">
                      Plano de Economia{' '}
                      {activePlan.economy_level.charAt(0).toUpperCase() + activePlan.economy_level.slice(1)}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Ativo
                    </span>
                  </div>

                  {activePlan.category_percentages?.length > 0 && (
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Distribuição de Gastos</h4>
                      <div className="space-y-3">
                        {activePlan.category_percentages.map((cat) => (
                          <div key={cat.category}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-400">{cat.category}</span>
                              <span className="text-xs font-medium text-slate-300">
                                {cat.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.percentage}%` }}
                                transition={{ duration: 0.8, delay: 0.1 }}
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="max-h-[280px] overflow-y-auto pr-2">{renderMarkdown(activePlan.plan_content)}</div>

                  {onGenerate && (
                    <button
                      type="button"
                      onClick={onGenerate}
                      disabled={loadingGenerate}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-400 font-medium hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-200 disabled:opacity-50"
                    >
                      {loadingGenerate ? 'Gerando Plano...' : 'Gerar Novo Plano'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-400 mb-4">Nenhum plano ativo</p>
                  <p className="text-sm text-slate-500">Gere um plano após importar seu primeiro extrato</p>
                  {onGenerate && (
                    <button
                      type="button"
                      onClick={onGenerate}
                      disabled={loadingGenerate}
                      className="mt-4 py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium disabled:opacity-50"
                    >
                      {loadingGenerate ? 'Gerando...' : 'Otimizar Plano'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {archivedPlans.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-400">Nenhum plano arquivado</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Planos são arquivados automaticamente após análise de acurácia
                  </p>
                </div>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-700/50" />
                  <div className="space-y-4">
                    {archivedPlans.map((plan, index) => {
                      const report = parseAccuracyReport(plan.accuracy_report);
                      const score = report?.score ?? plan.adherence_score ?? 0;
                      const isExpanded = expandedPlanId === plan.id;

                      return (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          <div className="absolute -left-6 top-5 w-3 h-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 border-2 border-slate-900" />
                          <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                              className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-100">
                                  Economia {plan.economy_level} — {formatPlanDate(plan.created_at)}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  Meta R$ {plan.target_saving.toFixed(2)} • Real R${' '}
                                  {plan.actual_saving.toFixed(2)}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${getAccuracyBadgeColor(score)}`}
                              >
                                {score.toFixed(0)}% acurácia
                              </span>
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden border-t border-slate-700/50"
                                >
                                  <div className="p-4 space-y-4 text-sm">
                                    {report ? (
                                      <>
                                        {report.metasCumpridas && report.metasCumpridas.length > 0 && (
                                          <div>
                                            <p className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                                              ✓ Metas cumpridas
                                            </p>
                                            <ul className="space-y-1 text-slate-300">
                                              {report.metasCumpridas.map((m, i) => (
                                                <li key={i}>• {m}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {report.desvios && report.desvios.length > 0 && (
                                          <div>
                                            <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1">
                                              ⚠ Desvios
                                            </p>
                                            <ul className="space-y-2 text-slate-300">
                                              {report.desvios.map((d, i) => (
                                                <li key={i} className="text-xs bg-slate-800/50 p-2 rounded-lg">
                                                  {d.categoria}: esperado R$ {d.valorEsperado?.toFixed(2)} vs real R${' '}
                                                  {d.valorReal?.toFixed(2)} ({d.percentualDesvio?.toFixed(0)}%)
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {report.instrucoesProximoPlano &&
                                          report.instrucoesProximoPlano.length > 0 && (
                                            <div>
                                              <p className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1">
                                                💡 Próximo plano
                                              </p>
                                              <ul className="space-y-1 text-slate-300">
                                                {report.instrucoesProximoPlano.map((tip, i) => (
                                                  <li key={i}>• {tip}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                      </>
                                    ) : (
                                      <p className="text-slate-500 text-xs">Aguardando análise de acurácia</p>
                                    )}
                                    <div className="pt-2 border-t border-slate-700/30 max-h-40 overflow-y-auto">
                                      {renderMarkdown(plan.plan_content)}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
