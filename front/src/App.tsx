import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BackgroundEffects } from "./components/layout/BackgroundEffects";
import { Hero } from "./components/Hero";
import { Footer } from "./components/layout/Footer";

// Pages
import { AuthPage } from "./pages/auth/AuthPage";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { UserSpacePage } from "./pages/user-space/UserSpacePage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { DesignSystemPage } from "./pages/design-system/DesignSystemPage";

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

      {/* Pages Switcher */}
      {route === 'app' && (
        <DashboardPage navigateTo={navigateTo} />
      )}

      {route === 'user-space' && (
        <UserSpacePage />
      )}

      {route === 'perfil' && (
        <ProfilePage />
      )}

      {route === 'design-system' && (
        <DesignSystemPage />
      )}

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
