import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { PersistentBackground } from "./components/PersistentBackground";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { SceneSpaces } from "./scenes/SceneSpaces";
import { Scene3 } from "./scenes/Scene3";
import { SceneAssistant } from "./scenes/SceneAssistant";
import { SceneFamille } from "./scenes/SceneFamille";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";

const T = 22;
const timing = springTiming({ config: { damping: 200 }, durationInFrames: T });

const LENGTHS = [110, 140, 155, 140, 150, 140, 115, 115];
// somme - 7 transitions * 22
export const DURATION = LENGTHS.reduce((a, b) => a + b, 0) - 7 * T;

const SCENES = [Scene1, Scene2, SceneSpaces, Scene3, SceneAssistant, SceneFamille, Scene4, Scene5];

export const MainVideo: React.FC = () => (
  <AbsoluteFill>
    <PersistentBackground />
    <TransitionSeries>
      {SCENES.map((Scene, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (
            <TransitionSeries.Transition presentation={fade()} timing={timing} />
          ) : null}
          <TransitionSeries.Sequence durationInFrames={LENGTHS[i]}>
            <Scene />
          </TransitionSeries.Sequence>
        </React.Fragment>
      ))}
    </TransitionSeries>
  </AbsoluteFill>
);
