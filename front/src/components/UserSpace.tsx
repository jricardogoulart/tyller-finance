import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import api, { createTransactionRule, fetchRules, deleteRule, approveRule, updateRule } from '../utils/api';
import { CategoryBadge } from './CategoryBadge';
import { CATEGORIES_LIST } from '../utils/categories';
import { useAuth } from '../context/AuthContext';

interface UploadHistoryItem {
  id: string;
  filename: string;
  transaction_count: number;
  status: string;
  upload_date: string;
}

interface ContextMapData {
  average_spend: number;
  top_category: string;
  recurrence_patterns: string[];
}

interface Transaction {
  id: string;
  description: string;
  amount: number | string;
  date: string;
  category: string;
  original_memo?: string;
  clean_memo?: string;
  suggested_identifier?: string;
}

interface ClassificationRule {
  id: string;
  search_token: string;
  category: string;
  transaction_type: string;
  origin: string;
  subcategory?: string;
  created_at: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const cardVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 85,
      damping: 18
    }
  }
};

export function UserSpace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'uploads' | 'transactions' | 'rules'>('uploads');
  const [uploads, setUploads] = useState<UploadHistoryItem[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  const [contextMap, setContextMap] = useState<ContextMapData>({
    average_spend: 0,
    top_category: 'Nenhuma',
    recurrence_patterns: ['Aguardando importações...']
  });
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Rules Engine State
  const [rules, setRules] = useState<ClassificationRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [isEditingRuleModal, setIsEditingRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ClassificationRule | null>(null);
  
  // Custom interactive rule creation suggestion on manual classification
  const [ruleConfirmModal, setRuleConfirmModal] = useState<{
    isOpen: boolean;
    transaction: Transaction;
    suggestedToken: string;
    category: string;
  } | null>(null);

  // New Rule inputs
  const [ruleTokenInput, setRuleTokenInput] = useState('');
  const [ruleCategoryInput, setRuleCategoryInput] = useState('');
  const [ruleTypeInput, setRuleTypeInput] = useState('ANY');
  const [isCustomCategoryActive, setIsCustomCategoryActive] = useState(false);
  const [customCategoryText, setCustomCategoryText] = useState('');

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortField, setSortField] = useState<'date' | 'description' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Custom Category Filter Dropdown State & Ref
  const filterRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load History & Context Map
  const fetchUploadHistory = async () => {
    setLoadingUploads(true);
    try {
      const res = await api.get('/transactions/uploads/history');
      setUploads(res.data?.history || []);
    } catch (err) {
      console.error('Failed to fetch upload history:', err);
    } finally {
      setLoadingUploads(false);
    }
  };

  const fetchContextMap = async () => {
    try {
      const res = await api.get('/ai/context-map');
      if (res.data?.contextMap) {
        setContextMap(res.data.contextMap);
      }
    } catch (err) {
      console.error('Failed to fetch context map:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data?.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchRulesList = async () => {
    setLoadingRules(true);
    try {
      const res = await fetchRules();
      setRules(res.data?.rules || []);
    } catch (err) {
      console.error('Failed to fetch rules list:', err);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleRecalculateContextMap = async () => {
    setIsRecalculating(true);
    try {
      const res = await api.post('/ai/recalculate');
      if (res.data?.contextMap) {
        setContextMap(res.data.contextMap);
      }
    } catch (err) {
      console.error('Failed to recalculate context map:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  useEffect(() => {
    fetchUploadHistory();
    fetchContextMap();
    fetchTransactions();
    fetchRulesList();
  }, []);

  const handleUpdateCategory = async (txId: string, newCat: string) => {
    try {
      const tx = transactions.find(t => t.id === txId);
      if (!tx) return;

      // 1. Atualiza imediatamente esta transação individual
      await api.put(`/ai/transactions/${txId}/category`, { category: newCat });
      
      // 2. Abre a sugestão interativa para salvar regra automática (Self-Learning)
      const token = tx.suggested_identifier || tx.clean_memo || tx.description || '';
      setRuleConfirmModal({
        isOpen: true,
        transaction: tx,
        suggestedToken: token,
        category: newCat
      });

      // Atualiza localmente a lista de transações e o mapa de contexto
      await Promise.all([fetchTransactions(), fetchContextMap()]);
    } catch (err) {
      console.error('Failed to update category inline:', err);
    }
  };

  const handleConfirmRuleCreation = async (token: string) => {
    if (!ruleConfirmModal) return;
    try {
      const { transaction, category } = ruleConfirmModal;
      const amountNum = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
      
      await createTransactionRule({
        search_token: token.trim().toUpperCase(),
        category: category,
        transaction_type: amountNum < 0 ? 'DEBIT' : 'CREDIT',
        origin: 'MANUAL'
      });

      setRuleConfirmModal(null);
      // O backend executou o Efeito Cascata em lote. Atualizamos tudo!
      await Promise.all([fetchTransactions(), fetchContextMap(), fetchRulesList()]);
    } catch (err) {
      console.error('Failed to create transaction rule:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Sort & Filter logic
  const handleSort = (field: 'date' | 'description' | 'amount') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredTransactions = transactions
    .filter(tx => {
      const matchSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || tx.category === categoryFilter;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'description') {
        comparison = a.description.localeCompare(b.description);
      } else if (sortField === 'amount') {
        const valA = typeof a.amount === 'string' ? parseFloat(a.amount) : a.amount;
        const valB = typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount;
        comparison = valA - valB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const uniqueCategories = Array.from(new Set(transactions.map(tx => tx.category)));

  // Lista dinâmica de todas as categorias, incluindo categorias personalizadas criadas nas transações ou regras
  const dynamicCategoriesList = Array.from(new Set([
    ...CATEGORIES_LIST,
    ...transactions.map(t => t.category),
    ...rules.map(r => r.category)
  ])).filter(Boolean);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative max-w-screen-xl mx-auto px-6 md:px-12 pt-28 pb-12 z-10"
    >
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] rounded-full bg-brand-400/[0.025] blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-success-500/[0.02] blur-[140px] pointer-events-none" />

      {/* Hero Header */}
      <motion.div variants={cardVariants} className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-float-slow">
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-ping-glow" />
            <span className="text-[10px] tracking-[0.2em] font-mono text-brand-400 uppercase">
              Gerenciamento Avançado
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2 leading-none flex flex-wrap items-baseline gap-3 justify-center md:justify-start">
            <span>Olá, <span className="text-gradient-brand-loop">{user?.name || 'Usuário'}!</span></span>
            <button
              onClick={() => window.location.hash = '#/perfil'}
              className="text-xs font-mono text-neutral-500 hover:text-brand-400 transition-colors uppercase tracking-wider cursor-pointer"
            >
              — Meu Perfil
            </button>
          </h1>
          <p className="text-sm text-neutral-400 max-w-xl">
            Histórico completo de extratos bancários, controle do IA Context Map e painel granular de transações com controle inline de categorias.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-neutral-950 border border-neutral-800 p-1.5 rounded-2xl self-center md:self-end relative">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`relative px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all z-10 focus:outline-none cursor-pointer ${
              activeTab === 'uploads'
                ? 'text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {activeTab === 'uploads' && (
              <motion.div
                layoutId="activeUserTab"
                className="absolute inset-0 bg-brand-400 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Meus Extratos & IA
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`relative px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all z-10 focus:outline-none cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {activeTab === 'transactions' && (
              <motion.div
                layoutId="activeUserTab"
                className="absolute inset-0 bg-brand-400 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Tabela de Gastos
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`relative px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all z-10 focus:outline-none cursor-pointer ${
              activeTab === 'rules'
                ? 'text-neutral-950 font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {activeTab === 'rules' && (
              <motion.div
                layoutId="activeUserTab"
                className="absolute inset-0 bg-brand-400 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Regras de Categoria
          </button>
        </div>
      </motion.div>

      {/* Main Switcher */}
      <AnimatePresence mode="wait">
        {activeTab === 'uploads' ? (
          <motion.div
            key="uploads-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Upload History List */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-glass-card border-glass p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">Histórico de Arquivos</h3>
                    <p className="text-xs text-neutral-400">Extratos bancários processados por TyllerFinance</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    onClick={fetchUploadHistory}
                    className="btn-glass-premium p-2 rounded-xl flex items-center justify-center cursor-pointer"
                    title="Atualizar histórico"
                  >
                    <svg className={`w-4 h-4 ${loadingUploads ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                  </motion.button>
                </div>

                {loadingUploads ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-brand-400 animate-spin" />
                    <span className="text-xs text-neutral-500 font-mono">Buscando extratos...</span>
                  </div>
                ) : uploads.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                    <svg className="w-8 h-8 mx-auto mb-3 opacity-40 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm font-semibold block text-neutral-300">Nenhum extrato importado</span>
                    <span className="text-xs max-w-xs mx-auto block text-neutral-500 mt-1">Carregue arquivos OFX ou PDF no painel principal para popular seu histórico.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-neutral-850 flex items-center justify-center text-neutral-400 border border-neutral-800 flex-shrink-0">
                            <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 10.5a3 3 0 11-6 0 3 3 0 016 0zM16.5 15.25a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-neutral-200 truncate">{upload.filename}</span>
                            <span className="block text-xs text-neutral-500 font-mono mt-0.5">{formatDateTime(upload.upload_date)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0 text-right">
                          <div>
                            <span className="block text-xs font-bold text-neutral-300">{upload.transaction_count} lançamentos</span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-success-400 font-mono mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                              Sucesso
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* IA Context Map Display */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-glass-card border-glass p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-brand-400/5 blur-[50px] pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-white">IA Context Map</h3>
                    <p className="text-xs text-neutral-400">Perfil e padrões de gastos aprendidos</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: isRecalculating ? 1 : 1.05, translateY: isRecalculating ? 0 : -1.5 }}
                    whileTap={{ scale: isRecalculating ? 1 : 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    disabled={isRecalculating}
                    onClick={handleRecalculateContextMap}
                    className="btn-tech-outline px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isRecalculating ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full border-t-transparent border-brand-400 animate-spin border-2" />
                        Otimizando...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-8.983m-8.982 3.125l5.247-5.247m-5.247 5.247L3 21l.125-8.982M18.982 12.017a8.25 8.25 0 00-13.802-1.685l.125 8.982" />
                        </svg>
                        Otimizar IA
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 text-center">
                      <span className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Média Mensal</span>
                      <span className="block text-xl font-extrabold text-white mt-1">R$ {formatCurrency(contextMap.average_spend)}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 text-center">
                      <span className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Maior Categoria</span>
                      <span className="block text-xl font-extrabold text-brand-400 mt-1">{contextMap.top_category}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-mono tracking-widest text-neutral-500 uppercase mb-3">Padrões de Recorrência (IA)</span>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {contextMap.recurrence_patterns.map((pattern, idx) => (
                        <div
                          key={idx}
                          className="px-3.5 py-2.5 rounded-lg border border-neutral-800 bg-neutral-950/40 text-xs text-neutral-300 flex items-start gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                          <span className="leading-relaxed">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'transactions' ? (
          <motion.div
            key="transactions-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Advanced Filters */}
            <div className="bg-glass-card border-glass p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por descrição ou categoria..."
                    className="w-full pl-9 pr-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>

                {/* Custom Category Filter Dropdown */}
                <div className="relative sm:w-48" ref={filterRef}>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-300 hover:text-white hover:border-neutral-750 transition-colors cursor-pointer focus:outline-none"
                  >
                    <span>
                      {categoryFilter === 'All' ? 'Todas Categorias' : categoryFilter}
                    </span>
                    <svg
                      className={`w-4 h-4 text-neutral-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-2 rounded-2xl border shadow-xl z-50 overflow-hidden"
                        style={{
                          backgroundColor: "rgba(17, 17, 17, 0.95)",
                          backdropFilter: "blur(16px)",
                          borderColor: "rgba(255, 255, 255, 0.08)",
                          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.7)",
                        }}
                      >
                        <div className="p-1 flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryFilter('All');
                              setIsFilterOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                              categoryFilter === 'All'
                                ? 'bg-brand-500/10 text-brand-400'
                                : 'text-neutral-300 hover:bg-white/5'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                            Todas Categorias
                          </button>
                          
                          {uniqueCategories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setCategoryFilter(cat);
                                setIsFilterOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                                categoryFilter === cat
                                  ? 'bg-brand-500/10 text-brand-400'
                                  : 'text-neutral-300 hover:bg-white/5'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                              {cat}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                  {filteredTransactions.length} registros filtrados
                </span>
              </div>
            </div>

            {/* Advanced Grid Table */}
            <div className="overflow-hidden border border-neutral-800 rounded-2xl bg-neutral-900/40 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-900/90 border-b border-neutral-800">
                    <tr>
                      <th
                        onClick={() => handleSort('date')}
                        className="p-4 text-xs uppercase cursor-pointer select-none hover:text-neutral-200 transition-colors"
                        style={{ fontFamily: 'var(--font-family-mono)', color: sortField === 'date' ? 'var(--color-brand-400)' : 'var(--color-neutral-400)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          Data
                          {sortField === 'date' && (
                            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('description')}
                        className="p-4 text-xs uppercase cursor-pointer select-none hover:text-neutral-200 transition-colors"
                        style={{ fontFamily: 'var(--font-family-mono)', color: sortField === 'description' ? 'var(--color-brand-400)' : 'var(--color-neutral-400)' }}
                      >
                        <div className="flex items-center gap-1.5">
                          Descrição
                          {sortField === 'description' && (
                            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                      <th className="p-4 text-xs uppercase" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>
                        Categoria (Editar inline)
                      </th>
                      <th
                        onClick={() => handleSort('amount')}
                        className="p-4 text-xs uppercase text-right cursor-pointer select-none hover:text-neutral-200 transition-colors"
                        style={{ fontFamily: 'var(--font-family-mono)', color: sortField === 'amount' ? 'var(--color-brand-400)' : 'var(--color-neutral-400)' }}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          Valor
                          {sortField === 'amount' && (
                            <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTransactions ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full border-t-2 border-brand-400 border-l-transparent border-r-transparent animate-spin" />
                            <span className="text-xs text-neutral-500 font-mono">Carregando lançamentos...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-neutral-500">
                          Nenhuma transação corresponde aos filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => {
                        const amountNum = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;
                        const isIncome = amountNum > 0;

                        return (
                          <tr
                            key={tx.id}
                            className="border-b last:border-0 hover:bg-neutral-850/20 transition-colors"
                            style={{ borderColor: 'var(--color-neutral-850)' }}
                          >
                            <td className="p-4 text-xs" style={{ fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>
                              {formatDate(tx.date)}
                            </td>
                            <td className="p-4 text-sm font-semibold text-neutral-200" style={{ fontFamily: 'var(--font-family-body)' }}>
                              {tx.description}
                            </td>
                            <td className="p-4">
                              <CategoryBadge
                                category={tx.category}
                                transactionId={tx.id}
                                onUpdate={(newCat) => handleUpdateCategory(tx.id, newCat)}
                                categoriesList={dynamicCategoriesList}
                              />
                            </td>
                            <td className="p-4 text-right font-mono text-sm" style={{
                              color: isIncome ? 'var(--color-success-500)' : 'var(--color-neutral-200)',
                              fontWeight: 600
                            }}>
                              {isIncome ? '+' : '-'} R$ {formatCurrency(Math.abs(amountNum))}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rules-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Rules Dashboard Control Bar */}
            <div className="bg-glass-card border-glass p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                {/* Search in Rules */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar regras por termo ou categoria..."
                    className="w-full pl-9 pr-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-brand-500/50 transition-colors"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingRule(null);
                  setRuleTokenInput('');
                  setRuleCategoryInput(CATEGORIES_LIST[0] || 'Alimentação');
                  setIsCustomCategoryActive(false);
                  setCustomCategoryText('');
                  setRuleTypeInput('ANY');
                  setIsEditingRuleModal(true);
                }}
                className="btn-tech px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer"
              >
                + Nova Regra
              </motion.button>
            </div>

            {/* Rules List Grid Table */}
            <div className="overflow-hidden border border-neutral-800 rounded-2xl bg-neutral-900/40 backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-neutral-900/90 border-b border-neutral-800">
                    <tr>
                      <th className="p-4 text-xs uppercase text-neutral-400 font-mono">Termo de Busca</th>
                      <th className="p-4 text-xs uppercase text-neutral-400 font-mono">Categoria</th>
                      <th className="p-4 text-xs uppercase text-neutral-400 font-mono">Tipo Transação</th>
                      <th className="p-4 text-xs uppercase text-neutral-400 font-mono">Origem / Status</th>
                      <th className="p-4 text-xs uppercase text-right text-neutral-400 font-mono">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRules ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full border-t-2 border-brand-400 border-l-transparent border-r-transparent animate-spin" />
                            <span className="text-xs text-neutral-500 font-mono">Carregando regras...</span>
                          </div>
                        </td>
                      </tr>
                    ) : rules.filter(r => r.search_token.toLowerCase().includes(searchTerm.toLowerCase()) || r.category.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-neutral-500">
                          Nenhuma regra de pre-classificação cadastrada.
                        </td>
                      </tr>
                    ) : (
                      rules
                        .filter(r => r.search_token.toLowerCase().includes(searchTerm.toLowerCase()) || r.category.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((rule) => {
                          const isAiSuggested = rule.origin === 'AUTO_AI';
                          return (
                            <tr
                              key={rule.id}
                              className="border-b last:border-0 hover:bg-neutral-850/20 transition-colors"
                              style={{ borderColor: 'var(--color-neutral-850)' }}
                            >
                              <td className="p-4 text-sm font-mono font-bold text-neutral-200">
                                {rule.search_token}
                              </td>
                              <td className="p-4">
                                <CategoryBadge
                                  category={rule.category}
                                  transactionId={rule.id}
                                  onUpdate={async (newCat) => {
                                    try {
                                      await updateRule(rule.id, { search_token: rule.search_token, category: newCat });
                                      await fetchRulesList();
                                    } catch (err) {
                                      console.error('Failed to update category:', err);
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-4 text-xs font-semibold">
                                {rule.transaction_type === 'DEBIT' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-red-500/30 bg-red-500/10 text-red-400">Débito</span>
                                ) : rule.transaction_type === 'CREDIT' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-success-500/30 bg-success-500/10 text-success-400">Crédito</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-neutral-700 bg-neutral-800 text-neutral-400">Qualquer</span>
                                )}
                              </td>
                              <td className="p-4 text-xs font-semibold">
                                {isAiSuggested ? (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 animate-pulse-glow">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                                    IA Sugerida
                                  </div>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-success-500/30 bg-success-500/10 text-success-400">
                                    Manual
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {isAiSuggested && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={async () => {
                                        try {
                                          await approveRule(rule.id);
                                          await fetchRulesList();
                                        } catch (err) {
                                          console.error('Failed to approve rule:', err);
                                        }
                                      }}
                                      className="px-2.5 py-1 bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                      title="Aprovar e tornar permanente"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                      Aprovar
                                    </motion.button>
                                  )}

                                  <button
                                    onClick={() => {
                                      setEditingRule(rule);
                                      setRuleTokenInput(rule.search_token);
                                      const isStandard = dynamicCategoriesList.includes(rule.category);
                                      if (isStandard) {
                                        setRuleCategoryInput(rule.category);
                                        setIsCustomCategoryActive(false);
                                        setCustomCategoryText('');
                                      } else {
                                        setRuleCategoryInput('CUSTOM');
                                        setIsCustomCategoryActive(true);
                                        setCustomCategoryText(rule.category);
                                      }
                                      setRuleTypeInput(rule.transaction_type);
                                      setIsEditingRuleModal(true);
                                    }}
                                    className="p-1.5 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition-colors text-neutral-350 hover:text-white rounded-lg cursor-pointer"
                                    title="Editar regra"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                  </button>

                                  <button
                                    onClick={async () => {
                                      if (confirm('Deseja excluir esta regra de pre-classificação?')) {
                                        try {
                                          await deleteRule(rule.id);
                                          await fetchRulesList();
                                        } catch (err) {
                                          console.error('Failed to delete rule:', err);
                                        }
                                      }
                                    }}
                                    className="p-1.5 bg-neutral-850 hover:bg-red-500/15 border border-neutral-800 hover:border-red-500/30 text-neutral-450 hover:text-red-400 transition-colors rounded-lg cursor-pointer"
                                    title="Excluir regra"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editing / Creation Rule Modal */}
      <AnimatePresence>
        {isEditingRuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingRuleModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-brand-400/5 blur-[40px] pointer-events-none" />
              
              <h3 className="text-lg font-bold text-white mb-1.5">
                {editingRule ? 'Editar Regra de Categoria' : 'Nova Regra de Pre-classificação'}
              </h3>
              <p className="text-xs text-neutral-400 mb-5">
                {editingRule ? 'Modifique os parâmetros da regra de classificação existente.' : 'Cadastre uma nova regra para classificar de imediato transações recorrentes similares.'}
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1.5">Termo de Busca (Contém)</label>
                  <input
                    type="text"
                    value={ruleTokenInput}
                    onChange={(e) => setRuleTokenInput(e.target.value)}
                    placeholder="Ex: UBER, IFOOD, NETFLIX"
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 focus:outline-none focus:border-brand-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1.5">Categoria Associada</label>
                  <select
                    value={isCustomCategoryActive ? 'CUSTOM' : ruleCategoryInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setIsCustomCategoryActive(true);
                        setRuleCategoryInput('CUSTOM');
                      } else {
                        setIsCustomCategoryActive(false);
                        setRuleCategoryInput(val);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 focus:outline-none focus:border-brand-500/50 cursor-pointer mb-3"
                  >
                    {dynamicCategoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="CUSTOM">+ Outra Categoria (Personalizada)...</option>
                  </select>

                  {isCustomCategoryActive && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative"
                    >
                      <input
                        type="text"
                        value={customCategoryText}
                        onChange={(e) => setCustomCategoryText(e.target.value)}
                        placeholder="Nome da categoria (Ex: Seguro, Academia)"
                        className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-200 focus:outline-none focus:border-brand-500/50"
                      />
                    </motion.div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-widest text-neutral-500 uppercase mb-1.5">Tipo de Lançamento</label>
                  <div className="flex bg-neutral-950 border border-neutral-800 p-1 rounded-xl">
                    {['ANY', 'DEBIT', 'CREDIT'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setRuleTypeInput(t)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          ruleTypeInput === t 
                            ? 'bg-neutral-800 text-white border border-neutral-700' 
                            : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        {t === 'ANY' ? 'Qualquer' : t === 'DEBIT' ? 'Débito' : 'Crédito'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditingRuleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const finalCategory = isCustomCategoryActive ? customCategoryText.trim() : ruleCategoryInput;
                    if (!ruleTokenInput || !finalCategory) {
                      alert('Preencha os campos obrigatórios.');
                      return;
                    }
                    try {
                      if (editingRule) {
                        await updateRule(editingRule.id, {
                          search_token: ruleTokenInput,
                          category: finalCategory,
                          transaction_type: ruleTypeInput
                        });
                      } else {
                        await createTransactionRule({
                          search_token: ruleTokenInput,
                          category: finalCategory,
                          transaction_type: ruleTypeInput,
                          origin: 'MANUAL'
                        });
                      }
                      setIsEditingRuleModal(false);
                      await Promise.all([fetchRulesList(), fetchTransactions(), fetchContextMap()]);
                    } catch (err: any) {
                      console.error('Failed to save rule:', err);
                      const errMsg = err.response?.data?.error || 'Falha ao salvar regra de transação.';
                      alert(errMsg);
                    }
                  }}
                  className="btn-tech px-5 py-2 rounded-xl text-xs font-bold tracking-wide cursor-pointer"
                >
                  {editingRule ? 'Salvar Alterações' : 'Criar Regra'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
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
    </motion.div>
  );
}
