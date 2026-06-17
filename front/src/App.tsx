import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
import { LandingPage } from "./pages/landing/LandingPage";

function MainLayout() {
  const { user, loading } = useAuth();
  const reducedMotion = useReducedMotion();

  // Clean, premium hash router state
  type Route = 'landing' | 'auth' | 'app' | 'design-system' | 'user-space' | 'perfil';
  const [route, setRoute] = useState<Route>(() => {
    const hash = window.location.hash;
    if (hash === '#/auth') return 'auth';
    if (hash === '#/app') return 'app';
    if (hash === '#/design-system') return 'design-system';
    if (hash === '#/user-space') return 'user-space';
    if (hash === '#/perfil') return 'perfil';
    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/auth') setRoute('auth');
      else if (hash === '#/app') setRoute('app');
      else if (hash === '#/design-system') setRoute('design-system');
      else if (hash === '#/user-space') setRoute('user-space');
      else if (hash === '#/perfil') setRoute('perfil');
      else setRoute('landing');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newRoute: Route) => {
    if (newRoute === 'landing') window.location.hash = '#/';
    else window.location.hash = `#/${newRoute}`;
    setRoute(newRoute);
  };

  const isAuthedRoute = route === 'app' || route === 'design-system' || route === 'user-space' || route === 'perfil';
  const isPublicRoute = route === 'landing' || route === 'auth';

  useEffect(() => {
    if (!loading && !user && isAuthedRoute) {
      window.location.hash = '#/auth';
      setRoute('auth');
    }
  }, [loading, user, isAuthedRoute]);

  useEffect(() => {
    if (user && route === 'auth') {
      window.location.hash = '#/app';
      setRoute('app');
    }
  }, [user, route]);

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

  return (
    <div className="relative isolation-isolate" style={{ minHeight: "100vh" }}>
      {/* ── Global Animated Background Effects ── */}
      <BackgroundEffects reducedMotion={!!reducedMotion} />

      {/* Authed Hero + Nav */}
      {user && isAuthedRoute && (
        <Hero
          currentRoute={route as 'app' | 'design-system' | 'user-space' | 'perfil'}
          onNavigate={navigateTo}
        />
      )}

      {/* Pages Switcher */}
      {route === 'landing' && (
        <LandingPage />
      )}

      {route === 'auth' && !user && (
        <AuthPage />
      )}

      {route === 'app' && user && (
        <DashboardPage navigateTo={navigateTo} />
      )}

      {route === 'user-space' && user && (
        <UserSpacePage />
      )}

      {route === 'perfil' && user && (
        <ProfilePage />
      )}

      {route === 'design-system' && user && (
        <DesignSystemPage />
      )}

      {!isPublicRoute && user && (
        <Footer isDesignSystem={route === 'design-system'} />
      )}
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
