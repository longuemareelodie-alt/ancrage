import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { display, body } from "../fonts";
import { NIGHT, CREAM, ROSE } from "../theme";

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 40 });
  const sub = spring({ frame: frame - 24, fps, config: { damping: 200 }, durationInFrames: 34 });
  const breathe = 1 + Math.sin(frame / 40) * 0.012;

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ROSE}2E 0%, ${ROSE}00 62%)`,
          transform: `scale(${breathe})`,
        }}
      />
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div
          style={{
            fontFamily: display,
            fontSize: 150,
            fontWeight: 500,
            color: CREAM,
            opacity: p,
            transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${breathe})`,
            letterSpacing: 2,
          }}
        >
          Éclosia
        </div>
        <div
          style={{
            fontFamily: body,
            fontSize: 32,
            color: `${CREAM}CC`,
            marginTop: 28,
            opacity: sub,
            transform: `translateY(${interpolate(sub, [0, 1], [22, 0])}px)`,
          }}
        >
          Respirer un peu plus, chaque jour.
        </div>
      </div>
    </AbsoluteFill>
  );
};
