import { motion } from "framer-motion";
import { ColorSection } from "../../components/ColorSection";
import { TypographySection } from "../../components/TypographySection";
import { SpacingSection } from "../../components/SpacingSection";
import { MotionSection } from "../../components/MotionSection";
import { RadiusShadowSection } from "../../components/RadiusShadowSection";
import { ZIndexBreakpointSection } from "../../components/ZIndexBreakpointSection";
import { ComponentsSection } from "../../components/ComponentsSection";
import { TokenExplorer } from "../../components/TokenExplorer";
import { Divider } from "../../components/layout/Footer";

export function DesignSystemPage() {
  return (
    <>
      <Divider label="Visual Design System Showcase" />

      {/* ── Colors ── */}
      <motion.div id="colors">
        <Divider label="01 · Colors" />
        <ColorSection />
      </motion.div>

      {/* ── Typography ── */}
      <motion.div id="typography">
        <Divider label="02 · Typography" />
        <TypographySection />
      </motion.div>

      {/* ── Spacing ── */}
      <motion.div id="spacing">
        <Divider label="03 · Spacing" />
        <SpacingSection />
      </motion.div>

      {/* ── Motion ── */}
      <motion.div id="motion">
        <Divider label="04 · Motion" />
        <MotionSection />
      </motion.div>

      {/* ── Radius & Shadow ── */}
      <motion.div id="radius">
        <Divider label="05 · Radius & Shadow" />
        <RadiusShadowSection />
      </motion.div>

      {/* ── Z-Index & Breakpoints ── */}
      <motion.div id="zindex">
        <Divider label="06 · Z-Index & Breakpoints" />
        <ZIndexBreakpointSection />
      </motion.div>

      {/* ── Components ── */}
      <motion.div id="components">
        <Divider label="07 · Components" />
        <ComponentsSection />
      </motion.div>

      {/* ── Token Explorer ── */}
      <motion.div id="explorer">
        <Divider label="08 · Token Explorer" />
        <TokenExplorer />
      </motion.div>
    </>
  );
}
