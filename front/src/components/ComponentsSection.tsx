import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SectionHeader } from "./SectionHeader";
import { Stepper } from "./ui/Stepper";
import { Checkbox } from "./ui/Checkbox";
import { Alert } from "./ui/Alert";
import { Modal } from "./ui/Modal";
import { Skeleton } from "./ui/Skeleton";
import { Accordion } from "./ui/Accordion";
import { Breadcrumbs } from "./ui/Breadcrumbs";
import { Table, TableRow, TableCell } from "./ui/Table";
import { Select } from "./ui/Select";

export function Button({
  styleType = "technical-fissure",
  variant = "primary",
  size = "md",
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: {
  styleType?: "technical-fissure";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative";

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5",
  };

  const styleClasses: Record<string, string> = {
    "technical-fissure": "btn-technical-fissure",
  };

  const variantClasses: Record<string, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "btn-danger",
  };

  const isStandard = ["primary", "secondary", "ghost", "danger"].includes(variant);

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? {} : { scale: 1.025, y: -0.8 }}
      whileTap={disabled ? {} : { 
        scale: 0.96,
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
      }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`${base} ${sizes[size]} ${styleClasses[styleType] || ""} ${variantClasses[variant] || ""} ${className}`}
    >
      {children}

      {/* Extreme-Sweep effect overlay for standard buttons */}
      {isStandard && !disabled && (
        <motion.div
          initial={{ x: "-100%" }}
          whileTap={{ x: "200%" }}
          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
            width: "50%",
          }}
        />
      )}
    </motion.button>
  );
}

function Badge({ label, variant = "brand" }: { label: string; variant?: "brand" | "success" | "warning" | "error" | "info" | "neutral" }) {
  const styles: Record<string, React.CSSProperties> = {
    brand:   { backgroundColor: "var(--color-brand-900)",   color: "var(--color-brand-300)",   border: "1px solid var(--color-brand-800)" },
    success: { backgroundColor: "var(--color-success-950)", color: "var(--color-success-500)", border: "1px solid var(--color-success-700)" },
    warning: { backgroundColor: "var(--color-warning-950)", color: "var(--color-warning-500)", border: "1px solid var(--color-warning-700)" },
    error:   { backgroundColor: "var(--color-error-950)",   color: "var(--color-error-500)",   border: "1px solid var(--color-error-700)" },
    info:    { backgroundColor: "var(--color-info-950)",    color: "var(--color-info-500)",    border: "1px solid var(--color-info-700)" },
    neutral: { backgroundColor: "var(--color-neutral-900)", color: "var(--color-neutral-400)", border: "1px solid var(--color-neutral-700)" },
  };

  return (
    <span
      style={{
        ...styles[variant],
        fontFamily: "var(--font-family-mono)",
        fontSize: "var(--font-size-2xs)",
        padding: "0.2rem 0.6rem",
        borderRadius: "var(--radius-full)",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontWeight: 500,
        letterSpacing: "var(--letter-spacing-wide)",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: "currentColor",
          display: "inline-block",
        }}
      />
      {label}
    </span>
  );
}

function Card({ title, tag, desc, delay }: { title: string; tag: string; desc: string; delay: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.165, 0.84, 0.44, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-2xl border p-6 overflow-hidden cursor-default"
      style={{
        backgroundColor: "var(--color-neutral-900)",
        borderColor: hovered ? "var(--color-brand-700)" : "var(--color-neutral-800)",
        transition: "border-color 0.2s ease",
        boxShadow: hovered ? "var(--shadow-glow)" : "var(--shadow-md)",
      }}
    >
      {/* Shimmer on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 shimmer pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-4">
        <span
          className="text-xs px-2 py-1 rounded-lg"
          style={{
            fontFamily: "var(--font-family-mono)",
            fontSize: "var(--font-size-2xs)",
            backgroundColor: "var(--color-brand-900)",
            color: "var(--color-brand-400)",
            border: "1px solid var(--color-brand-800)",
          }}
        >
          {tag}
        </span>
        <motion.div
          animate={{ rotate: hovered ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: "var(--color-neutral-600)", fontSize: "1.1rem" }}
        >
          →
        </motion.div>
      </div>

      <h4
        className="mb-2 leading-snug"
        style={{
          fontFamily: "var(--font-family-body)",
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-neutral-50)",
          lineHeight: "var(--line-height-snug)",
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontFamily: "var(--font-family-body)",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-neutral-400)",
          lineHeight: "var(--line-height-relaxed)",
        }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn(!on)}
      className="relative inline-flex items-center cursor-pointer"
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "var(--radius-full)",
        backgroundColor: on ? "var(--color-brand-500)" : "var(--color-neutral-700)",
        border: `2px solid ${on ? "var(--color-brand-400)" : "var(--color-neutral-600)"}`,
        transition: "background-color 0.2s ease, border-color 0.2s ease",
        padding: "2px",
      }}
    >
      <motion.span
        animate={{ x: on ? 22 : 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "var(--color-white)",
          display: "block",
          boxShadow: "var(--shadow-sm)",
        }}
      />
    </button>
  );
}

export function InputField({
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
}: {
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className="relative rounded-xl transition-all overflow-hidden"
      style={{
        border: `1px solid ${focused ? "var(--color-brand-600)" : "var(--color-neutral-700)"}`,
        boxShadow: focused ? "0 0 0 3px rgb(166 217 24 / 0.12)" : "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        backgroundColor: "var(--color-neutral-850)",
      }}
    >
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none relative z-10"
        style={{
          padding: "0.625rem 0.875rem",
          fontFamily: "var(--font-family-body)",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-neutral-100)",
        }}
      />
      {focused && (
        <>
          {/* Bottom Neon line scaling from extreme left to right */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{
              position: "absolute",
              bottom: "-1px",
              left: "0",
              right: "0",
              height: "2px",
              backgroundColor: "var(--color-brand-400)",
              borderRadius: "var(--radius-full)",
              transformOrigin: "left",
              boxShadow: "0 0 10px var(--color-brand-400)",
              zIndex: 20,
            }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          />

          {/* Background horizontal neon sweep overlay */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(190, 240, 48, 0.08), transparent)",
              width: "50%",
              zIndex: 5,
            }}
          />
        </>
      )}
    </div>
  );
}

export function ComponentsSection() {
  const [activeStep, setActiveStep] = useState(2);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [skeletonsLoading, setSkeletonsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"core" | "layout">("core");
  
  // Showcase Form states
  const [categoryName, setCategoryName] = useState("Alimentação");
  const [monthlyLimit, setMonthlyLimit] = useState("500");
  const [transactionType, setTransactionType] = useState("expense");

  return (
    <section className="py-20 px-6 md:px-12 max-w-screen-xl mx-auto">
      <SectionHeader
        index="07"
        title="UI Components"
        description="Token-driven components demonstrating the design system in action — every value pulled from the primitive token set."
      />
      {/* Premium Glassmorphic Tab Switcher utilizing design system Button primitives */}
      <div className="flex gap-4 mb-10 justify-center">
        <Button
          styleType="technical-fissure"
          variant={activeTab === "core" ? "primary" : "secondary"}
          size="md"
          onClick={() => setActiveTab("core")}
        >
          Core & Interactions
        </Button>
        
        <Button
          styleType="technical-fissure"
          variant={activeTab === "layout" ? "primary" : "primary"}
          size="md"
          onClick={() => setActiveTab("layout")}
        >
          Forms & Layout Components
        </Button>
      </div>

      {activeTab === "core" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Buttons panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-neutral-800 p-6 col-span-1 lg:col-span-3"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-xs uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Buttons Matrix System
          </h3>

          <div className="grid grid-cols-1 gap-8">
            {/* 1. TECHNICAL FISSURE */}
            <div className="flex flex-col gap-5 p-4 rounded-xl border border-neutral-800/40 bg-neutral-900/50">
              <div>
                <h4 className="text-sm font-semibold text-neutral-200 mb-1">1. Technical Fissure</h4>
                <p className="text-2xs text-neutral-500 font-mono">vertical fissure flow lines + pp neue montreal</p>
              </div>

              <div>
                <p className="text-2xs mb-2.5 font-mono text-neutral-600">Sizes</p>
                <div className="flex flex-wrap gap-2.5 items-center">
                  <Button styleType="technical-fissure" size="sm" variant="primary">Small</Button>
                  <Button styleType="technical-fissure" size="md" variant="primary">Medium</Button>
                  <Button styleType="technical-fissure" size="lg" variant="primary">Large</Button>
                </div>
              </div>

              <div>
                <p className="text-2xs mb-2.5 font-mono text-neutral-600">Variants (Medium)</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button styleType="technical-fissure" variant="primary" size="sm">Primary</Button>
                  <Button styleType="technical-fissure" variant="secondary" size="sm">Secondary</Button>
                  <Button styleType="technical-fissure" variant="ghost" size="sm">Ghost</Button>
                  <Button styleType="technical-fissure" variant="danger" size="sm">Danger</Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badges panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="rounded-2xl border border-neutral-800 p-6 col-span-1 lg:col-span-2"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-xs uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Badges & Status
          </h3>
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge label="Brand" variant="brand" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Error" variant="error" />
            <Badge label="Info" variant="info" />
            <Badge label="Neutral" variant="neutral" />
          </div>

          {/* Form controls */}
          <p className="text-2xs mb-3 mt-6" style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-600)", fontSize: "var(--font-size-2xs)" }}>
            Toggle
          </p>
          <div className="flex items-center gap-3">
            <Toggle />
            <span style={{ fontFamily: "var(--font-family-body)", fontSize: "var(--font-size-sm)", color: "var(--color-neutral-400)" }}>
              Dark mode
            </span>
          </div>

          <p className="text-2xs mb-3 mt-5" style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-600)", fontSize: "var(--font-size-2xs)" }}>
            Input (focus me)
          </p>
          <InputField placeholder="Enter email address…" />
        </motion.div>

        {/* Cards panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="space-y-4"
        >
          <Card
            title="WordPress Development"
            tag="01."
            desc="Micro-interactive, design-precise development with Lightspeed audit results."
            delay={0}
          />
          <Card
            title="Digital Design"
            tag="02."
            desc="Impactful design systems that enable meaningful user engagement."
            delay={0.1}
          />
        </motion.div>

        {/* Stepper Showcase Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-neutral-800 p-6 col-span-1 lg:col-span-3"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-xs uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Stepper & Progress System Showcase
          </h3>
          
          <div className="flex flex-col gap-6 items-center">
            <Stepper
              currentStep={activeStep}
              totalSteps={4}
              labels={["Dados", "Importar", "Otimizar", "Resultados"]}
              className="w-full"
            />
            
            <div className="flex gap-4 mt-6">
              <Button
                styleType="technical-fissure"
                size="sm"
                variant="secondary"
                onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
                disabled={activeStep === 1}
              >
                Voltar
              </Button>
              <Button
                styleType="technical-fissure"
                size="sm"
                variant="primary"
                onClick={() => setActiveStep((prev) => Math.min(4, prev + 1))}
                disabled={activeStep === 4}
              >
                Avançar
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Phase 9 Components Showcase Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="rounded-2xl border border-neutral-800 p-6 col-span-1 lg:col-span-3"
          style={{ backgroundColor: "var(--color-neutral-900)" }}
        >
          <h3 className="text-xs uppercase tracking-widest mb-6"
            style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
            Overlay Modals, Checkboxes, Alerts & Skeletons
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Form Checkbox & Modal Toggle */}
            <div className="flex flex-col gap-6 p-5 rounded-xl border border-neutral-800/40 bg-neutral-950/40">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">1. Modals & Checkboxes</h4>
              
              <div className="flex flex-col gap-4">
                <Checkbox
                  checked={checkboxChecked}
                  onChange={(checked) => setCheckboxChecked(checked)}
                  label="Aceito os novos termos da política do assistente"
                />
                <p className="text-2xs text-neutral-500">Checkbox state: {checkboxChecked ? "checked" : "unchecked"}</p>
              </div>

              <div className="border-t border-neutral-800/60 my-2" />

              <div className="flex flex-col items-start gap-3">
                <p className="text-2xs text-neutral-400 font-mono">Modal Trigger</p>
                <Button
                  styleType="technical-fissure"
                  size="sm"
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  Abrir Modal Overlay
                </Button>
              </div>
            </div>

            {/* Right Column: Alerts & Skeletons */}
            <div className="flex flex-col gap-6 p-5 rounded-xl border border-neutral-800/40 bg-neutral-950/40">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">2. Alerts & Skeletons</h4>
                
                <button
                  onClick={() => setSkeletonsLoading(!skeletonsLoading)}
                  className="text-2xs font-semibold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-wider font-mono"
                >
                  {skeletonsLoading ? "Mostrar Real" : "Mostrar Skeletons"}
                </button>
              </div>

              {/* Skeletons Showcase */}
              <div className="flex flex-col gap-4">
                {skeletonsLoading ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circle" width={36} height={36} />
                      <div className="flex-1 flex flex-col gap-2">
                        <Skeleton variant="text" width="60%" height={12} />
                        <Skeleton variant="text" width="40%" height={10} />
                      </div>
                    </div>
                    <Skeleton variant="card" height={80} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-950 border border-brand-800 flex items-center justify-center text-brand-400 font-bold text-xs">
                        TF
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-neutral-200">Tyller Pro</h5>
                        <p className="text-3xs text-neutral-500 font-mono">Workspace ativo</p>
                      </div>
                    </div>
                    <p className="text-2xs text-neutral-400 leading-relaxed">
                      Seu assistente está pronto. Sincronize suas transações mensais para ativar as projeções.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-800/60 my-1" />

              {/* Alerts Showcase */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xs text-neutral-500 font-mono">Alert Component</span>
                  {!alertVisible && (
                    <button
                      onClick={() => setAlertVisible(true)}
                      className="text-2xs text-neutral-400 hover:text-white"
                    >
                      Reset Alert
                    </button>
                  )}
                </div>
                
                <Alert
                  variant="success"
                  title="Operação concluída"
                  description="OFX importado com 14 transações e categorizado pelo assistente financeiro."
                  visible={alertVisible}
                  onClose={() => setAlertVisible(false)}
                />
              </div>
            </div>
          </div>

          {/* Modal Instance */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Design System Dialog"
          >
            <div className="flex flex-col gap-4">
              <p className="text-xs text-neutral-300">
                Este é um modal interativo construído com spring física {"{ stiffness: 80, damping: 25 }"} e desfoque de fundo.
              </p>
              
              <div className="flex flex-col gap-3 p-3 bg-neutral-950/40 rounded-xl border border-neutral-800">
                <span className="text-2xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                  Deseja ativar as projeções premium?
                </span>
                <p className="text-3xs text-neutral-500 leading-relaxed">
                  Esta ação alterará as variáveis de simulação de economia do workspace ativo para o modo conservador.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  styleType="technical-fissure"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  styleType="technical-fissure"
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCheckboxChecked(true);
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </Modal>
        </motion.div>
      </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Breadcrumbs & Accordion Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-neutral-800 p-6 col-span-1 lg:col-span-3"
            style={{ backgroundColor: "var(--color-neutral-900)" }}
          >
            <h3 className="text-xs uppercase tracking-widest mb-6"
              style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
              Breadcrumbs & Accordions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Breadcrumbs Showcase */}
              <div className="flex flex-col gap-6 p-5 rounded-xl border border-neutral-800/40 bg-neutral-950/40">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">1. Breadcrumbs path navigation</h4>
                
                <div className="flex flex-col gap-4">
                  <Breadcrumbs
                    items={[
                      { label: "Home", onClick: () => alert("Home clicked!") },
                      { label: "Workspace", onClick: () => alert("Workspace clicked!") },
                      { label: "Configurações" }
                    ]}
                  />
                  <p className="text-3xs text-neutral-500 leading-relaxed">
                    Breadcrumbs are fully responsive and click-safe with scale micro-animations.
                  </p>
                </div>
              </div>

              {/* Right Column: Accordions Showcase */}
              <div className="flex flex-col gap-6 p-5 rounded-xl border border-neutral-800/40 bg-neutral-950/40">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">2. Spring-animated Accordions</h4>
                
                <Accordion
                  items={[
                    {
                      id: "ia",
                      title: "Como funciona a IA preditiva?",
                      content: "Nossa IA analisa padrões históricos de gastos, recorrentes mensais e categoriza automaticamente transações de extratos bancários (PDF/OFX) com altíssima taxa de acerto."
                    },
                    {
                      id: "workspaces",
                      title: "Como os workspaces são isolados?",
                      content: "Os dados de cada usuário são isolados logicamente em nosso banco de dados rígido por meio de filtros indexados pelo ID do usuário autenticado, garantindo máxima segurança."
                    }
                  ]}
                />
              </div>
            </div>
          </motion.div>

          {/* Form & Table Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-neutral-800 p-6 col-span-1 lg:col-span-3"
            style={{ backgroundColor: "var(--color-neutral-900)" }}
          >
            <h3 className="text-xs uppercase tracking-widest mb-6"
              style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
              Forms Matrix & Transaction Tables
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Form Matrix Column (2/5) */}
              <div className="xl:col-span-2 flex flex-col gap-6 p-5 rounded-xl border border-neutral-800/40 bg-neutral-950/40 h-fit">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">Form Inputs & Selectors</h4>
                
                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-3xs uppercase tracking-wider text-neutral-400 font-mono">Nome da Categoria</label>
                    <InputField
                      type="text"
                      placeholder="Ex: Alimentação"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-3xs uppercase tracking-wider text-neutral-400 font-mono">Limite Mensal (R$)</label>
                    <InputField
                      type="number"
                      placeholder="Ex: 500.00"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-3xs uppercase tracking-wider text-neutral-400 font-mono">Tipo de Transação</label>
                    <Select
                      value={transactionType}
                      onChange={(val) => setTransactionType(val)}
                      options={[
                        { value: "expense", label: "Despesa (Débito)" },
                        { value: "income", label: "Receita (Crédito)" },
                        { value: "investment", label: "Investimento" }
                      ]}
                    />
                  </div>

                  <Button
                    styleType="technical-fissure"
                    size="sm"
                    variant="primary"
                    className="mt-2"
                    onClick={() => alert("Formulário enviado!")}
                  >
                    Salvar Parâmetros
                  </Button>
                </div>
              </div>

              {/* Tables Column (3/5) */}
              <div className="xl:col-span-3 flex flex-col gap-6 p-5 rounded-xl border border-neutral-800/40 bg-neutral-950/40">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">Premium Transaction Table</h4>
                
                <Table headers={["Data", "Categoria", "Descrição", "Valor", "Status"]}>
                  <TableRow onClick={() => alert("Transação 1 clicada")}>
                    <TableCell className="font-mono text-neutral-400 text-3xs">19/05/2026</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-400 text-3xs font-semibold font-mono">
                        ALIMENTAÇÃO
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-neutral-100">Supermercado Z</TableCell>
                    <TableCell className="font-mono text-error-500 font-semibold">- R$ 142,50</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded bg-success-950 border border-success-800 text-success-400 text-3xs font-mono">
                        PAGO
                      </span>
                    </TableCell>
                  </TableRow>

                  <TableRow onClick={() => alert("Transação 2 clicada")}>
                    <TableCell className="font-mono text-neutral-400 text-3xs">18/05/2026</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded bg-neutral-850 border border-neutral-700 text-neutral-300 text-3xs font-semibold font-mono">
                        SALÁRIO
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-neutral-100">Pix Recebido X</TableCell>
                    <TableCell className="font-mono text-success-500 font-semibold font-bold">+ R$ 5.400,00</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded bg-success-950 border border-success-800 text-success-400 text-3xs font-mono">
                        EFETIVADO
                      </span>
                    </TableCell>
                  </TableRow>

                  <TableRow onClick={() => alert("Transação 3 clicada")}>
                    <TableCell className="font-mono text-neutral-400 text-3xs">15/05/2026</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded bg-brand-950 border border-brand-800 text-brand-400 text-3xs font-semibold font-mono">
                        TRANSPORTE
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-neutral-100">Combustível Posto Y</TableCell>
                    <TableCell className="font-mono text-error-500 font-semibold">- R$ 220,00</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded bg-warning-950 border border-warning-800 text-warning-400 text-3xs font-mono">
                        PENDENTE
                      </span>
                    </TableCell>
                  </TableRow>
                </Table>
                
                <p className="text-3xs text-neutral-500 font-mono leading-relaxed">
                  Hover rows to experience horizontal micro-slide springs.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Motion showcase row */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-neutral-800 p-6"
        style={{ backgroundColor: "var(--color-neutral-900)" }}
      >
        <h3 className="text-xs uppercase tracking-widest mb-6"
          style={{ fontFamily: "var(--font-family-mono)", color: "var(--color-neutral-500)", letterSpacing: "var(--letter-spacing-widest)" }}>
          Micro-interactions
        </h3>
        <div className="flex flex-wrap gap-6 items-center">
          {/* Glow pulse */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-2xl animate-pulse-glow"
              style={{ backgroundColor: "var(--color-brand-800)", border: "1px solid var(--color-brand-600)" }}
            />
            <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)" }}>
              pulse-glow
            </span>
          </div>

          {/* Float */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full animate-float"
              style={{ background: "linear-gradient(135deg, var(--color-brand-600), var(--color-brand-300))" }}
            />
            <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)" }}>
              float
            </span>
          </div>

          {/* Spin slow */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-2xl animate-spin-slow"
              style={{ background: "conic-gradient(from 0deg, var(--color-brand-400), var(--color-neutral-800), var(--color-brand-400))" }}
            />
            <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)" }}>
              spin-slow
            </span>
          </div>

          {/* Hover scale */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-12 h-12 rounded-2xl cursor-pointer"
              style={{ background: "linear-gradient(135deg, var(--color-brand-700), var(--color-neutral-700))" }}
            />
            <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)" }}>
              spring hover
            </span>
          </div>

          {/* Stagger */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scaleY: [1, 2, 1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                  style={{
                    width: "6px",
                    height: "20px",
                    backgroundColor: "var(--color-brand-400)",
                    borderRadius: "var(--radius-full)",
                    transformOrigin: "bottom",
                  }}
                />
              ))}
            </div>
            <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)" }}>
              stagger bars
            </span>
          </div>

          {/* Shimmer text */}
          <div className="flex flex-col items-center gap-2">
            <div
              style={{
                fontFamily: "var(--font-family-body)",
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-bold)",
                background: "linear-gradient(90deg, var(--color-neutral-600) 0%, var(--color-brand-300) 50%, var(--color-neutral-600) 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 2s ease-in-out infinite",
              }}
            >
              Shimmer
            </div>
            <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)" }}>
              text shimmer
            </span>
          </div>

          {/* Blink cursor */}
          <div className="flex flex-col items-center gap-2">
            <div style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-base)", color: "var(--color-brand-300)", display: "flex", alignItems: "center" }}>
              resolve_
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.9, ease: [1, 0, 1, 0] }}
                style={{ display: "inline-block", width: "2px", height: "1.1em", backgroundColor: "var(--color-brand-400)", marginLeft: "1px" }}
              />
            </div>
            <span style={{ fontFamily: "var(--font-family-mono)", fontSize: "var(--font-size-2xs)", color: "var(--color-neutral-600)" }}>
              cursor blink
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
