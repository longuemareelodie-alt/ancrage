import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CREAM, ROSE, GOLD } from "../theme";

/** Fond permanent : ivoire chaud + halos roses qui dérivent lentement. */
export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          left: -300 + Math.sin(t * Math.PI * 2) * 60,
          top: -500 + Math.cos(t * Math.PI * 2) * 50,
          background: `radial-gradient(circle, ${ROSE}55 0%, ${ROSE}00 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          right: -260 - Math.sin(t * Math.PI * 2) * 40,
          bottom: -420 + Math.sin(t * Math.PI * 3) * 40,
          background: `radial-gradient(circle, ${GOLD}33 0%, ${GOLD}00 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};
