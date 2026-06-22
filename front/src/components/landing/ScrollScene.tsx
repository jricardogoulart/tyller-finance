// components/landing/ScrollScene.tsx

interface Props {
  /** Height of the transition zone (px). */
  height?: number;
  children?: React.ReactNode;
}

/**
 * Generic gap/spacer between sections.
 */
export function ScrollScene({ height = 250, children }: Props) {
  return (
    <div style={{ height }} className="relative overflow-hidden">
      {children}
    </div>
  );
}

// ─── Bento → Timeline afundamento ─────────────────────────────────────────────

export function BentoToTimelineScene() {
  // Purely a scroll-progress reader — no visible DOM height, no layout gap.
  return null;
}

// ─── Timeline → SocialProof fundo interpolado + clip diagonal ─────────────────

export function TimelineToSocialProofScene() {
  // Transition zone removida — a barra clara (#f5f0eb) aparecia como artefato visual entre seções.
  return null;
}

// ─── SocialProof → Pricing fan-out ───────────────────────────────────────────

export const fanOutVariants = {
  exit: (i: number) => ({
    rotate: (i - 1) * 5,
    opacity: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: i * 0.05 },
  }),
};
