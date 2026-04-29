/**
 * Browser-side screenshot capture via the Screen Capture API.
 *
 * The browser does NOT let us silently grab the page pixels — the user must
 * grant permission and choose a window/tab/screen via the native picker. We
 * grab a single frame, encode to PNG, and trigger a file download so the user
 * can attach it to their support email manually (mailto: cannot carry
 * attachments by spec).
 */

export const isScreenshotSupported = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const md = (navigator as Navigator & {
    mediaDevices?: { getDisplayMedia?: unknown };
  }).mediaDevices;
  return typeof md?.getDisplayMedia === "function";
};

export type CaptureResult =
  | { ok: true; filename: string }
  | { ok: false; reason: "unsupported" | "denied" | "error"; message?: string };

/**
 * Prompts the user to share their screen, captures a single frame, and
 * triggers a PNG download. Resolves with the chosen filename on success.
 */
export const captureAndDownloadScreenshot = async (
  baseFilename: string,
): Promise<CaptureResult> => {
  if (!isScreenshotSupported()) {
    return { ok: false, reason: "unsupported" };
  }

  let stream: MediaStream | null = null;
  try {
    // `preferCurrentTab` is a Chromium hint; harmless elsewhere.
    stream = await (navigator.mediaDevices as MediaDevices & {
      getDisplayMedia: (c: unknown) => Promise<MediaStream>;
    }).getDisplayMedia({
      video: { displaySurface: "browser" },
      audio: false,
      preferCurrentTab: true,
    } as unknown);

    const track = stream.getVideoTracks()[0];
    if (!track) {
      return { ok: false, reason: "error", message: "no_video_track" };
    }

    // Use ImageCapture if available (Chromium); fall back to <video> + canvas.
    let blob: Blob | null = null;

    const ImageCaptureCtor = (
      window as unknown as { ImageCapture?: new (track: MediaStreamTrack) => {
        grabFrame: () => Promise<ImageBitmap>;
      } }
    ).ImageCapture;

    if (ImageCaptureCtor) {
      try {
        const ic = new ImageCaptureCtor(track);
        const bitmap = await ic.grabFrame();
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no_2d_context");
        ctx.drawImage(bitmap, 0, 0);
        blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
      } catch {
        // Fall through to the <video> path below.
      }
    }

    if (!blob) {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      // Give the frame a moment to render.
      await new Promise((r) => setTimeout(r, 120));
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return { ok: false, reason: "error", message: "no_2d_context" };
      }
      ctx.drawImage(video, 0, 0);
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      video.pause();
      video.srcObject = null;
    }

    if (!blob) {
      return { ok: false, reason: "error", message: "encode_failed" };
    }

    const filename = `${baseFilename}.png`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    return { ok: true, filename };
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "NotAllowedError" || name === "AbortError") {
      return { ok: false, reason: "denied" };
    }
    return {
      ok: false,
      reason: "error",
      message: (err as Error)?.message ?? String(err),
    };
  } finally {
    stream?.getTracks().forEach((t) => t.stop());
  }
};
