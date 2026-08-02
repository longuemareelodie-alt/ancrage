import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { NIGHT, CARD } from "../theme";

/** Téléphone stylisé contenant une capture de l'app, avec entrée douce. */
export const Phone: React.FC<{
  src: string;
  delay?: number;
  rotate?: number;
  scale?: number;
}> = ({ src, delay = 0, rotate = 0, scale = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 34,
  });
  const y = interpolate(enter, [0, 1], [70, 0]);
  const drift = Math.sin((frame - delay) / 46) * 9;
  const blur = interpolate(enter, [0, 1], [10, 0]);

  return (
    <div
      style={{
        opacity: enter,
        transform: `translateY(${y + drift}px) rotate(${rotate}deg) scale(${scale})`,
        filter: `blur(${blur}px)`,
        width: 340,
        borderRadius: 44,
        padding: 10,
        backgroundColor: CARD,
        boxShadow: `0 60px 120px -40px ${NIGHT}55`,
      }}
    >
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: "100%",
          borderRadius: 34,
          display: "block",
          objectFit: "cover",
          maxHeight: 700,
          objectPosition: "top",
        }}
      />
    </div>
  );
};

export const SceneFill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill>{children}</AbsoluteFill>
);
