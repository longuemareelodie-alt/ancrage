import React from "react";
import { AbsoluteFill } from "remotion";
import { Phone } from "../components/Phone";
import { Kicker, WordsReveal, Line } from "../components/Type";

export const Scene2: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 120px" }}>
    <div style={{ flex: 1, paddingRight: 60 }}>
      <Kicker delay={2}>Aujourd'hui</Kicker>
      <div style={{ height: 26 }} />
      <WordsReveal words={["Un", "seul", "écran", "pour", "respirer."]} delay={10} size={86} italicFrom={4} />
      <div style={{ height: 30 }} />
      <Line delay={44} width={620}>
        Les rendez-vous, les humeurs, les petites victoires. Rien à chercher,
        rien à retenir.
      </Line>
    </div>
    <div style={{ display: "flex", gap: 44, alignItems: "center" }}>
      <Phone src="dashboard.jpg" delay={6} rotate={-3} />
      <Phone src="frise.jpg" delay={22} rotate={3} scale={0.86} />
    </div>
  </AbsoluteFill>
);
