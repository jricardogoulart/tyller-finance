import { LandingNav } from "../../components/landing/LandingNav";
import { LandingHero } from "../../components/landing/LandingHero";
import { LogoMarquee } from "../../components/landing/LogoMarquee";
import { FeatureBento } from "../../components/landing/FeatureBento";
import { HowItWorksTimeline } from "../../components/landing/HowItWorksTimeline";
import { SocialProof } from "../../components/landing/SocialProof";
import { Pricing } from "../../components/landing/Pricing";
import { LandingFooter } from "../../components/landing/LandingFooter";
import {
  BentoToTimelineScene,
  TimelineToSocialProofScene,
} from "../../components/landing/ScrollScene";

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        {/* 01 — Hero with parallax exit */}
        <LandingHero />

        {/* 02 — Logo marquee with clip-path reveal */}
        <LogoMarquee />

        {/* 03 — Feature bento grid */}
        <FeatureBento />

        {/* Bento → Timeline: afundamento scroll scene */}
        <BentoToTimelineScene />

        {/* 04 — How it works timeline */}
        <HowItWorksTimeline />

        {/* Timeline → SocialProof: diagonal clip reveal */}
        <TimelineToSocialProofScene />

        {/* 05 — Social proof */}
        <SocialProof />

        {/* 06 — Pricing */}
        <Pricing />
      </main>

      {/* 07 — Footer with scroll-to-top FAB */}
      <LandingFooter />
    </>
  );
}
