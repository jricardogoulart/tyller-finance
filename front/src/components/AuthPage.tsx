import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button, InputField } from './ComponentsSection';
import { Checkbox } from './ui/Checkbox';

export function AuthPage() {
  const { login, signup, error, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMsg('');

    if (!email || !password) {
      return;
    }

    if (!isLogin && !name) {
      return;
    }

    if (!isLogin && !termsAccepted) {
      alert('Você precisa aceitar os Termos de Uso e LGPD.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, termsAccepted);
        setSuccessMsg('Cadastro realizado com sucesso! Inicializando workspace...');
      }
    } catch (err) {
      // Error is set in AuthContext
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
    clearError();
    setSuccessMsg('');
  };

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden px-6"
      style={{ backgroundColor: "var(--color-neutral-950)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-neutral-900) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-neutral-900) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          opacity: 0.15,
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "250px",
          background: "radial-gradient(ellipse at center, rgba(190,240,48,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Branding abstracted from /front */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-brand-400)" }}
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" />
                <rect x="8" y="1" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.5" />
                <rect x="1" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.3" />
                <rect x="8" y="8" width="5" height="5" rx="1" fill="var(--color-neutral-950)" opacity="0.7" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--color-neutral-100)",
                letterSpacing: "var(--letter-spacing-tight)",
              }}
            >
              TyllerFinance
            </span>
          </motion.div>
          
          <h2
            className="mt-4"
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-2xl)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-neutral-50)",
              letterSpacing: "var(--letter-spacing-tight)",
            }}
          >
            {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-family-body)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-neutral-400)",
            }}
          >
            {isLogin ? 'Insira suas credenciais para continuar' : 'Seu assistente financeiro pessoal com IA proativa'}
          </p>
        </div>

        {/* Auth form card using design system glassmorphic parameters */}
        <motion.div
          layout
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: "var(--color-neutral-900)",
            borderColor: "var(--color-neutral-800)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-1.5"
              >
                <label
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-neutral-400)",
                    letterSpacing: "var(--letter-spacing-wide)",
                    textTransform: "uppercase",
                  }}
                >
                  Nome Completo
                </label>
                <InputField
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </motion.div>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-2xs)",
                  color: "var(--color-neutral-400)",
                  letterSpacing: "var(--letter-spacing-wide)",
                  textTransform: "uppercase",
                }}
              >
                E-mail
              </label>
              <InputField
                type="email"
                placeholder="nome@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                style={{
                  fontFamily: "var(--font-family-mono)",
                  fontSize: "var(--font-size-2xs)",
                  color: "var(--color-neutral-400)",
                  letterSpacing: "var(--letter-spacing-wide)",
                  textTransform: "uppercase",
                }}
              >
                Senha
              </label>
              <InputField
                type="password"
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-1.5"
              >
                <label
                  style={{
                    fontFamily: "var(--font-family-mono)",
                    fontSize: "var(--font-size-2xs)",
                    color: "var(--color-neutral-400)",
                    letterSpacing: "var(--letter-spacing-wide)",
                    textTransform: "uppercase",
                  }}
                >
                  Confirmar Senha
                </label>
                <InputField
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </motion.div>
            )}

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 mt-1"
              >
                <Checkbox
                  checked={termsAccepted}
                  onChange={(checked) => setTermsAccepted(checked)}
                  label="Eu concordo com os Termos de Uso e Política de Privacidade de IA (LGPD)."
                />
              </motion.div>
            )}

            {/* Error messaging inside active tokens */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: "var(--color-error-950)",
                    color: "var(--color-error-500)",
                    borderColor: "var(--color-error-800)",
                    fontFamily: "var(--font-family-body)",
                  }}
                >
                  {error}
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3.5 rounded-xl border text-xs"
                  style={{
                    backgroundColor: "var(--color-success-950)",
                    color: "var(--color-success-500)",
                    borderColor: "var(--color-success-800)",
                    fontFamily: "var(--font-family-body)",
                  }}
                >
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
          </form>

          {/* Toggle login/signup mode */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <button
              onClick={toggleMode}
              className="text-xs transition-colors hover:underline cursor-pointer"
              style={{
                fontFamily: "var(--font-family-body)",
                color: "var(--color-brand-400)",
              }}
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
