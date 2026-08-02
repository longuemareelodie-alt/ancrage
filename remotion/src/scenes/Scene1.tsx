import React from "react";
import { AbsoluteFill } from "remotion";
import { Frame, Kicker, WordsReveal, Line } from "../components/Type";

export const Scene1: React.FC = () => (
  <AbsoluteFill>
    <Frame>
      <div style={{ maxWidth: 1250 }}>
        <Kicker delay={4}>Éclosia</Kicker>
        <div style={{ height: 34 }} />
        <WordsReveal
          words={["Porter", "un", "peu", "moins."]}
          delay={16}
          size={140}
          italicFrom={3}
        />
        <div style={{ height: 40 }} />
        <Line delay={60}>
          Tout ce qui compte pour accompagner ton enfant, réuni dans un seul
          endroit calme.
        </Line>
      </div>
    </Frame>
  </AbsoluteFill>
);
