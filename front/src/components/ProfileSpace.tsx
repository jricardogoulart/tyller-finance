import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button, InputField } from './ComponentsSection';
import { Alert } from './ui/Alert';

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

export function ProfileSpace() {
  const { user, updateProfile, exportData, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<'dados' | 'seguranca' | 'privacidade'>('dados');
  
  // Name Edit States
  const [name, setName] = useState(user?.name || '');
  const [updatingName, setUpdatingName] = useState(false);
  const [nameAlert, setNameAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Privacy States
  const [deleteInput, setDeleteInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingConsent, setIsTogglingConsent] = useState(false);
  const [privacyAlert, setPrivacyAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameAlert(null);

    if (!name.trim()) {
      setNameAlert({ type: 'error', message: 'O nome completo é obrigatório.' });
      return;
    }

    setUpdatingName(true);
    try {
      await updateProfile(name);
      setNameAlert({ type: 'success', message: 'Nome atualizado com sucesso!' });
    } catch (err: any) {
      setNameAlert({ type: 'error', message: err.message || 'Erro ao atualizar o nome.' });
    } finally {
      setUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'Todos os campos de senha são obrigatórios.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'As senhas nova e de confirmação não coincidem.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateProfile(name, currentPassword, newPassword);
      setPasswordAlert({ type: 'success', message: 'Senha atualizada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordAlert({ type: 'error', message: err.message || 'Erro ao atualizar a senha.' });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setPrivacyAlert(null);
    try {
      await exportData();
      setPrivacyAlert({ type: 'success', message: 'Dados exportados com sucesso.' });
    } catch (err: any) {
      setPrivacyAlert({ type: 'error', message: err.message || 'Erro ao exportar dados.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETAR') {
      setPrivacyAlert({ type: 'error', message: 'Digite DELETAR para confirmar a exclusão.' });
      return;
    }
    setIsDeleting(true);
    setPrivacyAlert(null);
    try {
      await deleteAccount();
    } catch (err: any) {
      setPrivacyAlert({ type: 'error', message: err.message || 'Erro ao deletar conta.' });
      setIsDeleting(false);
    }
  };

  const handleToggleConsent = async () => {
    setIsTogglingConsent(true);
    setPrivacyAlert(null);
    try {
      await updateProfile(name, undefined, undefined, !user?.terms_accepted);
      setPrivacyAlert({ type: 'success', message: 'Preferência de consentimento atualizada.' });
    } catch (err: any) {
      setPrivacyAlert({ type: 'error', message: err.message || 'Erro ao atualizar consentimento.' });
    } finally {
      setIsTogglingConsent(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl mx-auto py-8 px-4 relative"
    >
      {/* Background Neon Lights */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          right: "10%",
          width: "400px",
          height: "200px",
          background: "radial-gradient(ellipse at center, rgba(190,240,48,0.04) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          left: "5%",
          width: "350px",
          height: "180px",
          background: "radial-gradient(ellipse at center, rgba(166,124,82,0.04) 0%, transparent 70%)",
          filter: "blur(45px)",
        }}
      />

      {/* Header section identical in spacing and structure to UserSpace */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded font-mono"
              style={{
                backgroundColor: "var(--color-brand-950)",
                color: "var(--color-brand-400)",
                border: "1px solid var(--color-brand-800)"
              }}
            >
              PERFIL DE USUÁRIO
            </span>
          </div>
          <h1
            className="tracking-tight"
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-2xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-neutral-50)",
              letterSpacing: "var(--letter-spacing-tight)"
            }}
          >
            Configurações de Conta
          </h1>
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-neutral-400)"
            }}
          >
            Gerencie sua identidade, dados de cadastro e segurança de acesso.
          </p>
        </div>

        {/* Tab switcher matching UserSpace layout */}
        <div
          className="flex p-1 rounded-xl border"
          style={{
            backgroundColor: "var(--color-neutral-900)",
            borderColor: "var(--color-neutral-800)"
          }}
        >
          <button
            onClick={() => setActiveTab('dados')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dados'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Meus Dados
          </button>
          <button
            onClick={() => setActiveTab('seguranca')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'seguranca'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Segurança
          </button>
          <button
            onClick={() => setActiveTab('privacidade')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'privacidade'
                ? 'bg-neutral-800 text-neutral-100 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Privacidade & LGPD
          </button>
        </div>
      </div>

      {/* Main glassmorphic card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border p-8 bg-glass-card border-glass shadow-lg relative z-10"
        >
          {activeTab === 'dados' ? (
            <form onSubmit={handleUpdateName} className="space-y-6">
              <h3
                className="text-xs uppercase tracking-widest font-mono border-b border-neutral-800/60 pb-3"
                style={{ color: "var(--color-neutral-400)", letterSpacing: "var(--letter-spacing-widest)" }}
              >
                Informações da Conta
              </h3>

              <AnimatePresence>
                {nameAlert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Alert
                      variant={nameAlert.type}
                      title={nameAlert.type === 'success' ? 'Sucesso' : 'Erro de validação'}
                      description={nameAlert.message}
                      visible={true}
                      onClose={() => setNameAlert(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-mono text-uppercase tracking-wider"
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-400)",
                    }}
                  >
                    E-mail da Conta (Não editável)
                  </label>
                  <div
                    className="rounded-xl border px-3.5 py-2.5 opacity-60 cursor-not-allowed bg-neutral-900/50"
                    style={{
                      borderColor: "var(--color-neutral-800)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-family-body)",
                        fontSize: "var(--font-size-sm)",
                        color: "var(--color-neutral-300)"
                      }}
                    >
                      {user?.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-mono text-uppercase tracking-wider"
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-400)",
                    }}
                  >
                    Atualize seu Nome
                  </label>
                  <InputField
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-neutral-800/60 pt-6 mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={updatingName}
                >
                  {updatingName ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <h3
                className="text-xs uppercase tracking-widest font-mono border-b border-neutral-800/60 pb-3"
                style={{ color: "var(--color-neutral-400)", letterSpacing: "var(--letter-spacing-widest)" }}
              >
                Segurança & Credenciais
              </h3>

              <AnimatePresence>
                {passwordAlert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Alert
                      variant={passwordAlert.type}
                      title={passwordAlert.type === 'success' ? 'Senha atualizada' : 'Falha na validação'}
                      description={passwordAlert.message}
                      visible={true}
                      onClose={() => setPasswordAlert(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-mono text-uppercase tracking-wider"
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-400)",
                    }}
                  >
                    Senha Atual
                  </label>
                  <InputField
                    type="password"
                    placeholder="Senha atual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-mono text-uppercase tracking-wider"
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-400)",
                    }}
                  >
                    Nova Senha
                  </label>
                  <InputField
                    type="password"
                    placeholder="Mínimo de 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-mono text-uppercase tracking-wider"
                    style={{
                      fontSize: "var(--font-size-2xs)",
                      color: "var(--color-neutral-400)",
                    }}
                  >
                    Confirmar Nova Senha
                  </label>
                  <InputField
                    type="password"
                    placeholder="Confirme a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-neutral-800/60 pt-6 mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={updatingPassword}
                >
                  {updatingPassword ? 'Atualizando...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          ) : activeTab === 'privacidade' ? (
            <div className="space-y-6">
              <h3
                className="text-xs uppercase tracking-widest font-mono border-b border-neutral-800/60 pb-3"
                style={{ color: "var(--color-neutral-400)", letterSpacing: "var(--letter-spacing-widest)" }}
              >
                Privacidade de Dados & LGPD
              </h3>

              <AnimatePresence>
                {privacyAlert && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Alert
                      variant={privacyAlert.type}
                      title={privacyAlert.type === 'success' ? 'Operação concluída' : 'Atenção'}
                      description={privacyAlert.message}
                      visible={true}
                      onClose={() => setPrivacyAlert(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data Portability Section */}
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">Exportação de Dados</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-md">
                    Baixe uma cópia completa dos seus dados armazenados (transações, contexto de IA, regras e perfil) em formato JSON.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? 'Processando...' : 'Exportar Dados (JSON)'}
                </Button>
              </div>

              {/* AI Consent Management Section */}
              <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200">Uso de Dados pela Inteligência Artificial</h4>
                  <p className="text-xs text-neutral-400 mt-1 max-w-md">
                    {user?.terms_accepted 
                      ? 'A IA está ativa. Seus dados de despesas (já anonimizados, sem CPFs ou e-mails) são processados para gerar categorizações e insights preditivos.' 
                      : 'Consentimento revogado. A inteligência artificial preditiva está suspensa para sua conta e dependerá de categorização manual.'}
                  </p>
                </div>
                <Button
                  variant={user?.terms_accepted ? "secondary" : "primary"}
                  size="sm"
                  type="button"
                  onClick={handleToggleConsent}
                  disabled={isTogglingConsent}
                >
                  {isTogglingConsent ? 'Atualizando...' : user?.terms_accepted ? 'Revogar Consentimento' : 'Permitir Análise de IA'}
                </Button>
              </div>

              {/* Account Deletion Section (Danger Zone) */}
              <div className="p-4 rounded-xl border border-red-900/50 bg-red-950/10 flex flex-col gap-4 mt-6">
                <div>
                  <h4 className="text-sm font-semibold text-red-400">Excluir Conta Permanentemente</h4>
                  <p className="text-xs text-red-300/80 mt-1 max-w-xl">
                    Esta ação é irreversível. Todos os seus dados, histórico, modelos de IA e preferências serão apagados imediatamente do nosso banco de dados.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="w-full md:w-64">
                    <InputField
                      type="text"
                      placeholder="Digite DELETAR"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteInput !== 'DELETAR'}
                    style={{
                      backgroundColor: deleteInput === 'DELETAR' ? 'var(--color-danger-500)' : 'var(--color-neutral-800)',
                      color: deleteInput === 'DELETAR' ? 'white' : 'var(--color-neutral-400)',
                      opacity: deleteInput === 'DELETAR' ? 1 : 0.5
                    }}
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir Minha Conta'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
