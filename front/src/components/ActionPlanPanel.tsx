import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchActionPlansHistory } from '../utils/api';
import {
  GlassCard,
  StatusBadge,
  accuracyBadgeVariant,
  SegmentTabs,
  SegmentTab,
  ProgressBar,
  EmptyState,
  renderPlanMarkdown,
} from './design-system';

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
  refreshKey?: number;
}

function parseAccuracyReport(raw: string | null): AccuracyReport | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AccuracyReport;
  } catch {
    return null;
  }
}

function formatPlanDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function ActionPlanPanel({ loadingGenerate = false, onGenerate, refreshKey = 0 }: ActionPlanPanelProps) {
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
  }, [loadingGenerate, refreshKey]);

  const activePlan = plans.find((p) => p.status === 'Ativo');
  const archivedPlans = plans
    .filter((p) => p.status === 'Arquivado')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (loading) {
    return (
      <GlassCard className="p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'var(--color-neutral-800)' }} />
          <div className="h-32 rounded" style={{ backgroundColor: 'var(--color-neutral-800)' }} />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full overflow-hidden p-0">
      <SegmentTabs>
        <SegmentTab active={activeTab === 'active'} onClick={() => setActiveTab('active')}>
          Plano Ativo
        </SegmentTab>
        <SegmentTab active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
          Histórico & Acurácia
        </SegmentTab>
      </SegmentTabs>

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
                    <h3 className="ds-card-title">
                      Plano de Economia{' '}
                      {activePlan.economy_level.charAt(0).toUpperCase() + activePlan.economy_level.slice(1)}
                    </h3>
                    <StatusBadge label="Ativo" variant="success" />
                  </div>

                  {activePlan.category_percentages?.length > 0 && (
                    <div className="ds-card-inset p-4">
                      <h4 className="ds-card-subtitle mb-3" style={{ fontWeight: 600, color: 'var(--color-neutral-300)' }}>
                        Distribuição de Gastos
                      </h4>
                      <div className="space-y-3">
                        {activePlan.category_percentages.map((cat) => (
                          <div key={cat.category}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="ds-stat-label text-xs">{cat.category}</span>
                              <span className="text-xs font-medium" style={{ color: 'var(--color-neutral-300)' }}>
                                {cat.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <ProgressBar value={cat.percentage} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="max-h-[280px] overflow-y-auto pr-2">
                    {renderPlanMarkdown(activePlan.plan_content)}
                  </div>

                  {onGenerate && (
                    <button
                      type="button"
                      onClick={onGenerate}
                      disabled={loadingGenerate}
                      className="btn-tech-outline w-full py-3 px-4 rounded-xl font-medium text-sm disabled:opacity-50"
                    >
                      {loadingGenerate ? 'Gerando Plano...' : 'Gerar Novo Plano'}
                    </button>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  }
                  title="Nenhum plano ativo"
                  description="Selecione Leve, Moderado ou Intenso na simulação acima para gerar e salvar um plano."
                />
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
                <EmptyState
                  icon={
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  }
                  title="Nenhum plano arquivado"
                  description="Planos são arquivados automaticamente após análise de acurácia"
                />
              ) : (
                <div className="relative pl-6">
                  <div className="ds-timeline-line" />
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
                          <div className="ds-timeline-dot" />
                          <div className="ds-timeline-card">
                            <button
                              type="button"
                              onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                              className="ds-timeline-card-header"
                            >
                              <div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--color-neutral-100)' }}>
                                  Economia {plan.economy_level} — {formatPlanDate(plan.created_at)}
                                </p>
                                <p className="ds-card-subtitle mt-1">
                                  Meta R$ {plan.target_saving.toFixed(2)} • Real R${' '}
                                  {plan.actual_saving.toFixed(2)}
                                </p>
                              </div>
                              <StatusBadge
                                label={`${score.toFixed(0)}% acurácia`}
                                variant={accuracyBadgeVariant(score)}
                                className="flex-shrink-0"
                              />
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                  style={{ borderTop: '1px solid var(--color-neutral-800)' }}
                                >
                                  <div className="p-4 space-y-4 text-sm">
                                    {report ? (
                                      <>
                                        {report.metasCumpridas && report.metasCumpridas.length > 0 && (
                                          <div>
                                            <p className="ds-report-section-title ds-report-section-title-success">
                                              ✓ Metas cumpridas
                                            </p>
                                            <ul className="ds-report-list">
                                              {report.metasCumpridas.map((m, i) => (
                                                <li key={i}>• {m}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        {report.desvios && report.desvios.length > 0 && (
                                          <div>
                                            <p className="ds-report-section-title ds-report-section-title-warning">
                                              ⚠ Desvios
                                            </p>
                                            <ul className="ds-report-list space-y-2">
                                              {report.desvios.map((d, i) => (
                                                <li key={i} className="ds-report-deviation">
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
                                              <p className="ds-report-section-title ds-report-section-title-brand">
                                                💡 Próximo plano
                                              </p>
                                              <ul className="ds-report-list">
                                                {report.instrucoesProximoPlano.map((tip, i) => (
                                                  <li key={i}>• {tip}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                      </>
                                    ) : (
                                      <p className="ds-card-subtitle">Aguardando análise de acurácia</p>
                                    )}
                                    <div
                                      className="pt-2 max-h-40 overflow-y-auto"
                                      style={{ borderTop: '1px solid var(--color-neutral-800)' }}
                                    >
                                      {renderPlanMarkdown(plan.plan_content)}
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
    </GlassCard>
  );
}
