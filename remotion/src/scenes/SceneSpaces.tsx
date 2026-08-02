import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Kicker, WordsReveal } from "../components/Type";
import { body } from "../fonts";
import { NIGHT, CARD, ROSE_DARK } from "../theme";

const SPACES: { icon: string; label: string; note: string }[] = [
  { icon: "🏠", label: "Aujourd'hui", note: "Ta journée en un regard" },
  { icon: "❤️", label: "Moi", note: "Émotions, journal, respiration" },
  { icon: "👨‍👩‍👧", label: "Famille", note: "Profils, écoles, suivis" },
  { icon: "🌱", label: "Autonomie", note: "Supports sur mesure" },
  { icon: "📅", label: "Organisation", note: "Calendrier partagé" },
  { icon: "💛", label: "Santé", note: "Carnet & ordonnances" },
  { icon: "🔐", label: "Coffre-fort", note: "Documents en sécurité" },
  { icon: "💶", label: "Budget", note: "Factures et rappels" },
  { icon: "🤝", label: "Communauté", note: "Sans jugement" },
];

/** Panorama des espaces : grille de cartes qui se posent en cascade. */
export const SceneSpaces: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px" }}>
      <div style={{ width: 520, paddingRight: 60 }}>
        <Kicker delay={2}>Neuf espaces</Kicker>
        <div style={{ height: 24 }} />
        <WordsReveal
          words={["Tout", "au", "même", "endroit."]}
          delay={10}
          size={78}
          italicFrom={3}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 22,
        }}
      >
        {SPACES.map((s, i) => {
          const p = spring({
            frame: frame - 18 - i * 7,
            fps,
            config: { damping: 200 },
            durationInFrames: 28,
          });
          const drift = Math.sin((frame - i * 12) / 52) * 4;
          return (
            <div
              key={s.label}
              style={{
                backgroundColor: CARD,
                border: `1px solid ${ROSE_DARK}22`,
                borderRadius: 26,
                padding: "26px 26px 24px",
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [34, 0]) + drift}px) scale(${interpolate(
                  p,
                  [0, 1],
                  [0.94, 1],
                )})`,
                boxShadow: `0 32px 64px -40px ${NIGHT}55`,
              }}
            >
              <div style={{ fontSize: 34, lineHeight: 1 }}>{s.icon}</div>
              <div
                style={{
                  fontFamily: body,
                  fontWeight: 500,
                  fontSize: 25,
                  color: NIGHT,
                  marginTop: 14,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: body,
                  fontSize: 19,
                  lineHeight: 1.45,
                  color: `${NIGHT}99`,
                  marginTop: 6,
                }}
              >
                {s.note}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
