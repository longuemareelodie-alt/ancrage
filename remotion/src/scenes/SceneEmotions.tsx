import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Kicker, WordsReveal, Line } from "../components/Type";
import { body } from "../fonts";
import { NIGHT, CARD, ROSE, ROSE_DARK, GOLD } from "../theme";

const EMOTIONS: { label: string; tint: string }[] = [
  { label: "Sereine", tint: GOLD },
  { label: "Fatiguée", tint: NIGHT },
  { label: "Débordée", tint: ROSE_DARK },
  { label: "Triste", tint: NIGHT },
  { label: "Tendue", tint: ROSE_DARK },
  { label: "Douce", tint: ROSE },
];

/** Index de l'émotion choisie et frame à laquelle le choix se fait. */
const PICKED = 2;
const PICK_AT = 62;

/**
 * L'écran Émotions : les six pastilles se posent, puis le doigt choisit
 * « Débordée » et l'app répond par un mot doux. Le moment du choix.
 */
export const SceneEmotions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Doigt : descend vers la pastille choisie, appuie, remonte.
  const handIn = spring({
    frame: frame - 40,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
  const press = interpolate(frame, [PICK_AT - 4, PICK_AT, PICK_AT + 10], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const handOut = interpolate(frame, [PICK_AT + 14, PICK_AT + 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chosen = spring({
    frame: frame - PICK_AT,
    fps,
    config: { damping: 200 },
    durationInFrames: 26,
  });

  const echo = spring({
    frame: frame - PICK_AT - 16,
    fps,
    config: { damping: 200 },
    durationInFrames: 30,
  });

  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 120px" }}>
      <div style={{ width: 520, paddingRight: 70 }}>
        <Kicker delay={2}>Un geste, c'est tout</Kicker>
        <div style={{ height: 24 }} />
        <WordsReveal
          words={["Comment", "tu", "te", "sens", "?"]}
          delay={10}
          size={74}
          italicFrom={4}
        />
        <div style={{ height: 28 }} />
        <Line delay={PICK_AT + 6} width={470}>
          Tu touches une pastille. Rien à écrire, rien à justifier.
        </Line>
      </div>

      {/* Écran Émotions */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: 760,
            backgroundColor: CARD,
            border: `1px solid ${ROSE_DARK}22`,
            borderRadius: 40,
            padding: "46px 46px 40px",
            boxShadow: `0 60px 120px -50px ${NIGHT}55`,
            transform: `translateY(${Math.sin(frame / 60) * 5}px)`,
          }}
        >
          <div
            style={{
              fontFamily: body,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: `${NIGHT}88`,
            }}
          >
            Émotions
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 22,
              marginTop: 26,
            }}
          >
            {EMOTIONS.map((e, i) => {
              const p = spring({
                frame: frame - 14 - i * 6,
                fps,
                config: { damping: 200 },
                durationInFrames: 26,
              });
              const isPicked = i === PICKED;
              const lift = isPicked ? chosen : 0;
              const dim = isPicked ? 0 : chosen * 0.55;
              return (
                <div
                  key={e.label}
                  style={{
                    borderRadius: 26,
                    padding: "26px 22px 22px",
                    backgroundColor: isPicked ? `${e.tint}14` : `${NIGHT}06`,
                    border: `${isPicked ? 2 : 1}px solid ${isPicked ? `${e.tint}99` : `${NIGHT}14`}`,
                    opacity: p * (1 - dim),
                    transform: `translateY(${interpolate(p, [0, 1], [26, 0]) - lift * 6}px) scale(${
                      interpolate(p, [0, 1], [0.94, 1]) + lift * 0.04 - press * (isPicked ? 0.03 : 0)
                    })`,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      margin: "0 auto",
                      borderRadius: "50%",
                      backgroundColor: `${e.tint}${isPicked ? "55" : "26"}`,
                      border: `1px solid ${e.tint}66`,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: body,
                      fontWeight: 500,
                      fontSize: 25,
                      color: NIGHT,
                      marginTop: 14,
                    }}
                  >
                    {e.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Réponse douce après le choix */}
          <div
            style={{
              marginTop: 28,
              borderRadius: 24,
              padding: "22px 26px",
              backgroundColor: `${ROSE}1F`,
              border: `1px solid ${ROSE_DARK}33`,
              opacity: echo,
              transform: `translateY(${interpolate(echo, [0, 1], [18, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: body,
                fontSize: 24,
                lineHeight: 1.5,
                color: `${NIGHT}DD`,
              }}
            >
              C'est noté. Rien d'autre à faire aujourd'hui.
            </div>
          </div>

          {/* Doigt */}
          <div
            style={{
              position: "absolute",
              left: 320,
              top: 190,
              width: 76,
              height: 76,
              borderRadius: "50%",
              backgroundColor: `${NIGHT}1A`,
              border: `2px solid ${NIGHT}44`,
              opacity: handIn * (1 - handOut),
              transform: `translate(${interpolate(handIn, [0, 1], [90, 0])}px, ${
                interpolate(handIn, [0, 1], [120, 0]) + handOut * 60
              }px) scale(${1 - press * 0.18})`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
