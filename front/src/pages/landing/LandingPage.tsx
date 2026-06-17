import { LandingNav } from "../../components/landing/LandingNav";
import { LandingHero } from "../../components/landing/LandingHero";
import { LogoMarquee } from "../../components/landing/LogoMarquee";
import { FeatureBento } from "../../components/landing/FeatureBento";
import { HowItWorksTimeline } from "../../components/landing/HowItWorksTimeline";
import { SocialProof } from "../../components/landing/SocialProof";
import { Pricing } from "../../components/landing/Pricing";
import { LandingFooter } from "../../components/landing/LandingFooter";

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <LandingHero />
        <LogoMarquee />
        <FeatureBento />
        <HowItWorksTimeline />
        <SocialProof />
        <Pricing />
      </main>
      <LandingFooter />
    </>
  );
}
