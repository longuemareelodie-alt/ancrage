/**
 * Enregistrement audio → WAV complet (décodable partout, y compris iOS Safari).
 * Pensé pour le téléphone : micro nettoyé, niveau de voix en direct,
 * arrêt automatique et messages clairs quand quelque chose bloque.
 */
export function encodeWav(chunks: readonly Float32Array[], sampleRate: number): Blob {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const bytes = new ArrayBuffer(44 + length * 2);
  const view = new DataView(bytes);
  const tag = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i));
  };
  tag(0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  tag(36, "data");
  view.setUint32(40, length * 2, true);
  let offset = 44;
  for (const chunk of chunks)
    for (const value of chunk) {
      const sample = Math.max(-1, Math.min(1, value));
      view.setInt16(offset, sample * (sample < 0 ? 32768 : 32767), true);
      offset += 2;
    }
  return new Blob([bytes], { type: "audio/wav" });
}

/** Le micro est-il utilisable sur cet appareil / ce navigateur ? */
export const micSupported = () =>
  typeof navigator !== "undefined" &&
  !!navigator.mediaDevices?.getUserMedia &&
  (typeof AudioContext !== "undefined" ||
    typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !==
      "undefined");

/** Message humain pour chaque souci de micro. */
export function micErrorMessage(error: unknown): string {
  const name = (error as { name?: string } | null)?.name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Le micro est bloqué. Autorise-le dans les réglages de ton téléphone, puis réessaie.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "Je ne trouve pas de micro sur cet appareil.";
  if (name === "NotReadableError" || name === "AbortError")
    return "Un autre app utilise le micro. Ferme-la et réessaie.";
  if ((error as { message?: string } | null)?.message === "empty")
    return "Je n'ai rien entendu. Réessaie en parlant un peu plus longtemps.";
  return "Je n'ai pas pu accéder au micro. Réessaie dans un instant.";
}

/** Deux minutes suffisent : au-delà, on s'arrête tout seul. */
export const MAX_RECORDING_MS = 120_000;

type Recorder = {
  stop: () => Promise<File>;
  cancel: () => void;
  /** Niveau de voix entre 0 et 1, pour l'animation du micro. */
  level: () => number;
};

export async function recordWav(options?: { onAutoStop?: () => void }): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  let context: AudioContext | undefined;
  try {
    const Ctor =
      typeof AudioContext !== "undefined"
        ? AudioContext
        : ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    context = new Ctor();
    await context.resume();
    const audioContext = context;
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    const levels = new Uint8Array(analyser.frequencyBinCount);
    const node = audioContext.createScriptProcessor(4096, 1, 1);
    const chunks: Float32Array[] = [];
    node.onaudioprocess = (event) =>
      chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    source.connect(analyser);
    source.connect(node);
    // Gain à zéro : on ne renvoie pas la voix dans le haut-parleur (larsen sur mobile).
    const mute = audioContext.createGain();
    mute.gain.value = 0;
    node.connect(mute);
    mute.connect(audioContext.destination);

    let stopped = false;
    const teardown = () => {
      stopped = true;
      clearTimeout(timer);
      stream.getTracks().forEach((track) => track.stop());
      node.disconnect();
      mute.disconnect();
      analyser.disconnect();
      source.disconnect();
      node.onaudioprocess = null;
    };

    const timer = setTimeout(() => {
      if (!stopped) options?.onAutoStop?.();
    }, MAX_RECORDING_MS);

    return {
      async stop() {
        if (stopped) throw new Error("Recording already stopped");
        teardown();
        const blob = encodeWav(chunks, audioContext.sampleRate);
        await audioContext.close();
        if (blob.size < 4096) throw new Error("empty");
        return new File([blob], "recording.wav", { type: "audio/wav" });
      },
      cancel() {
        if (stopped) return;
        teardown();
        void audioContext.close();
      },
      level() {
        if (stopped) return 0;
        analyser.getByteTimeDomainData(levels);
        let peak = 0;
        for (const v of levels) peak = Math.max(peak, Math.abs(v - 128) / 128);
        return Math.min(1, peak * 1.8);
      },
    };
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    await context?.close();
    throw error;
  }
}
