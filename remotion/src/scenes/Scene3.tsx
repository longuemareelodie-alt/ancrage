import React from "react";
import { AbsoluteFill } from "remotion";
import { Phone } from "../components/Phone";
import { Kicker, WordsReveal, Line } from "../components/Type";

export const Scene3: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 120px" }}>
    <div style={{ display: "flex", gap: 44, alignItems: "center" }}>
      <Phone src="journal.jpg" delay={4} rotate={-2} scale={0.86} />
      <Phone src="portrait.jpg" delay={20} rotate={3} />
    </div>
    <div style={{ flex: 1, paddingLeft: 80 }}>
      <Kicker delay={2}>Studio d'autonomie</Kicker>
      <div style={{ height: 26 }} />
      <WordsReveal words={["Des", "supports", "faits", "pour", "lui."]} delay={12} size={86} italicFrom={4} />
      <div style={{ height: 30 }} />
      <Line delay={46} width={620}>
        Routines, histoires sociales, pictogrammes. Créés en quelques minutes,
        imprimables tout de suite.
      </Line>
    </div>
  </AbsoluteFill>
);
