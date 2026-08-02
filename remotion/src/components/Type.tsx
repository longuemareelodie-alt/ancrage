import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { display, body } from "../fonts";
import { NIGHT, ROSE_DARK } from "../theme";

/** Mot par mot, monté depuis le bas avec un léger flou. */
export const WordsReveal: React.FC<{
  words: string[];
  delay?: number;
  size?: number;
  italicFrom?: number;
  stagger?: number;
}> = ({ words, delay = 0, size = 110, italicFrom = -1, stagger = 6 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `0 ${size * 0.24}px` }}>
      {words.map((w, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 200 },
          durationInFrames: 30,
        });
        const isItalic = italicFrom >= 0 && i >= italicFrom;
        return (
          <span
            key={`${w}-${i}`}
            style={{
              fontFamily: display,
              fontWeight: 500,
              fontSize: size,
              lineHeight: 1.08,
              color: isItalic ? ROSE_DARK : NIGHT,
              fontStyle: isItalic ? "italic" : "normal",
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [46, 0])}px)`,
              filter: `blur(${interpolate(p, [0, 1], [8, 0])}px)`,
              display: "inline-block",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: body,
        fontSize: 24,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: ROSE_DARK,
        opacity: o,
      }}
    >
      {children}
    </div>
  );
};

export const Line: React.FC<{ children: React.ReactNode; delay?: number; width?: number }> = ({
  children,
  delay = 0,
  width = 720,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <p
      style={{
        fontFamily: body,
        fontSize: 30,
        lineHeight: 1.6,
        color: `${NIGHT}CC`,
        maxWidth: width,
        opacity: o,
        transform: `translateY(${interpolate(o, [0, 1], [18, 0])}px)`,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
};

export const Frame: React.FC<{ children: React.ReactNode; align?: "left" | "center" }> = ({
  children,
  align = "left",
}) => (
  <AbsoluteFill
    style={{
      padding: "0 130px",
      justifyContent: "center",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align === "center" ? "center" : "left",
    }}
  >
    {children}
  </AbsoluteFill>
);
