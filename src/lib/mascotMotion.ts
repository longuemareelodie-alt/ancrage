/** Système d'animation partagé des six compagnons (landing + « Ton équipe »). */
export const mascotAliveClass = (domain: string) => `mascot-alive mascot-${domain}`;
/** Décalage stable par mascotte, pour qu'elles ne respirent pas en même temps. */
export const mascotDelay = (i: number) => ({ animationDelay: `${-(i * 1.3).toFixed(1)}s` });
