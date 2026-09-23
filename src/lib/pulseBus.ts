/**
 * Petit fil conducteur PULSE.
 * Le bloc d'« Aujourd'hui » et le badge flottant montrent la MÊME chose :
 * quand l'un change (action cochée, reportée, état du cerveau modifié),
 * l'autre se remet à jour tout seul. Aucune donnée nouvelle, juste un signal.
 */
import type { BrainState } from "@/hooks/usePulseState";

type Handler = () => void;
type StateHandler = (state: BrainState) => void;

const changeListeners = new Set<Handler>();
const stateListeners = new Set<StateHandler>();

export const emitPulseChange = () => {
  changeListeners.forEach((fn) => fn());
};

export const onPulseChange = (handler: Handler) => {
  changeListeners.add(handler);
  return () => {
    changeListeners.delete(handler);
  };
};

export const emitBrainState = (state: BrainState) => {
  stateListeners.forEach((fn) => fn(state));
};

export const onBrainState = (handler: StateHandler) => {
  stateListeners.add(handler);
  return () => {
    stateListeners.delete(handler);
  };
};
