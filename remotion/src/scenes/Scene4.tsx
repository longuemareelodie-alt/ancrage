import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Frame, Kicker, WordsReveal } from "../components/Type";
import { body } from "../fonts";
import { NIGHT, CARD, ROSE_DARK } from "../theme";

const ITEMS = [
  "Accès à vie",
  "Sans abonnement",
  "Mises à jour incluses",
  "Tes données restent les tiennes",
];

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <Frame align="center">
        <Kicker delay={2}>Un paiement, une fois</Kicker>
        <div style={{ height: 28 }} />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <WordsReveal words={["Tu", "l'as", "pour", "toujours."]} delay={10} size={92} italicFrom={3} />
        </div>
        <div style={{ height: 56 }} />
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", maxWidth: 1250 }}>
          {ITEMS.map((it, i) => {
            const p = spring({
              frame: frame - 46 - i * 8,
              fps,
              config: { damping: 200 },
              durationInFrames: 26,
            });
            return (
              <div
                key={it}
                style={{
                  fontFamily: body,
                  fontSize: 27,
                  color: NIGHT,
                  backgroundColor: CARD,
                  border: `1px solid ${ROSE_DARK}33`,
                  borderRadius: 999,
                  padding: "18px 34px",
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px)`,
                  boxShadow: `0 24px 50px -30px ${NIGHT}44`,
                }}
              >
                ✓ {it}
              </div>
            );
          })}
        </div>
      </Frame>
    </AbsoluteFill>
  );
};
