import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Kicker, WordsReveal, Line } from "../components/Type";
import { body } from "../fonts";
import { NIGHT, CARD, ROSE_DARK, GOLD } from "../theme";

const CARDS: { title: string; rows: string[]; tint: string }[] = [
  {
    title: "Carnet de santé",
    rows: ["Vaccins à jour", "Ordonnance — 12 jours", "Orthophonie · mardi 17h"],
    tint: ROSE_DARK,
  },
  {
    title: "Coffre-fort",
    rows: ["Bulletins scolaires", "Attestation CAF", "Notification MDPH"],
    tint: NIGHT,
  },
  {
    title: "Budget du mois",
    rows: ["Cantine — payée", "Assurance · le 12", "Reste 218 €"],
    tint: GOLD,
  },
];

/** Famille, santé, papiers : les charges qui se rangent d'elles-mêmes. */
export const SceneFamille: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ padding: "0 120px", justifyContent: "center" }}>
      <Kicker delay={2}>Famille, santé, papiers</Kicker>
      <div style={{ height: 22 }} />
      <WordsReveal
        words={["Ce", "que", "tu", "portais", "de", "tête."]}
        delay={8}
        size={74}
        italicFrom={4}
      />
      <div style={{ height: 22 }} />
      <Line delay={40} width={880}>
        Rendez-vous, ordonnances, documents, factures : tout est rangé, daté,
        rappelé au bon moment.
      </Line>
      <div style={{ height: 46 }} />

      <div style={{ display: "flex", gap: 30 }}>
        {CARDS.map((c, i) => {
          const p = spring({
            frame: frame - 30 - i * 12,
            fps,
            config: { damping: 200 },
            durationInFrames: 30,
          });
          const drift = Math.sin((frame - i * 20) / 48) * 5;
          return (
            <div
              key={c.title}
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 30,
                border: `1px solid ${ROSE_DARK}22`,
                padding: 34,
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [40, 0]) + drift}px)`,
                boxShadow: `0 44px 90px -50px ${NIGHT}55`,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: c.tint,
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  fontFamily: body,
                  fontWeight: 500,
                  fontSize: 28,
                  color: NIGHT,
                  marginTop: 20,
                }}
              >
                {c.title}
              </div>
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {c.rows.map((r, j) => {
                  const q = interpolate(frame - 44 - i * 12 - j * 9, [0, 20], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <div
                      key={r}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        opacity: q,
                        transform: `translateX(${interpolate(q, [0, 1], [16, 0])}px)`,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          backgroundColor: `${c.tint}AA`,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: body,
                          fontSize: 22,
                          color: `${NIGHT}C0`,
                        }}
                      >
                        {r}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
