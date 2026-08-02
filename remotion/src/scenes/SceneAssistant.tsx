import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Kicker, WordsReveal, Line } from "../components/Type";
import { body } from "../fonts";
import { NIGHT, CARD, ROSE, ROSE_DARK } from "../theme";

type Bubble = { from: "her" | "app"; text: string; delay: number };

const BUBBLES: Bubble[] = [
  { from: "her", text: "Le coucher est devenu un combat.", delay: 16 },
  {
    from: "app",
    text: "On va alléger ça. Voici une routine du soir en 5 images, à imprimer ce soir.",
    delay: 46,
  },
  { from: "her", text: "Et pour les matins pressés ?", delay: 84 },
  { from: "app", text: "Je te prépare aussi une version courte. Respire, je m'en occupe.", delay: 110 },
];

/** Assistant Éclosia : conversation qui s'écrit doucement. */
export const SceneAssistant: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 120px" }}>
      <div style={{ flex: 1, paddingRight: 70 }}>
        <Kicker delay={2}>Assistant Éclosia</Kicker>
        <div style={{ height: 26 }} />
        <WordsReveal
          words={["Tu", "expliques.", "Il", "prépare."]}
          delay={10}
          size={80}
          italicFrom={2}
        />
        <div style={{ height: 28 }} />
        <Line delay={44} width={580}>
          Tu racontes la situation avec tes mots. Éclosia propose des pistes
          concrètes, jamais un jugement.
        </Line>
      </div>

      <div
        style={{
          width: 760,
          backgroundColor: CARD,
          borderRadius: 34,
          border: `1px solid ${ROSE_DARK}22`,
          padding: 38,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: `0 60px 120px -50px ${NIGHT}55`,
        }}
      >
        {BUBBLES.map((b) => {
          const p = spring({
            frame: frame - b.delay,
            fps,
            config: { damping: 200 },
            durationInFrames: 26,
          });
          const isHer = b.from === "her";
          return (
            <div
              key={b.text}
              style={{
                alignSelf: isHer ? "flex-end" : "flex-start",
                maxWidth: "82%",
                opacity: p,
                transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px)`,
                backgroundColor: isHer ? `${ROSE}55` : `${NIGHT}0D`,
                borderRadius: isHer ? "22px 22px 6px 22px" : "22px 22px 22px 6px",
                padding: "20px 26px",
                fontFamily: body,
                fontSize: 25,
                lineHeight: 1.5,
                color: NIGHT,
              }}
            >
              {b.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
