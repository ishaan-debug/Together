import { useCallback, useEffect, useRef, useState } from "react";

export type MediaErrorKind = "insecure" | "denied" | "not-found" | "in-use" | "unknown";

export type LocalMedia = {
  stream: MediaStream | null;
  /** "requesting" until the browser answers; "stopped" after stop(), e.g. when leaving a call. */
  status: "requesting" | "ready" | "error" | "stopped";
  error: { kind: MediaErrorKind; message: string } | null;
  /** Ask for the camera again, e.g. after the user changes the site permission. */
  retry: () => void;
  /** Turn the camera and microphone off. */
  stop: () => void;
};

const CONSTRAINTS: MediaStreamConstraints = { video: true, audio: true };

class InsecureContextError extends Error {}

function requestMedia(): Promise<MediaStream> {
  // Browsers only expose getUserMedia on HTTPS pages and on localhost.
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return Promise.reject(new InsecureContextError());
  }
  return navigator.mediaDevices.getUserMedia(CONSTRAINTS);
}

function describe(e: unknown): NonNullable<LocalMedia["error"]> {
  if (e instanceof InsecureContextError) {
    return {
      kind: "insecure",
      message: "Camera access needs a secure page. Open the app over HTTPS, or on localhost on this computer.",
    };
  }
  const name = e instanceof DOMException ? e.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return {
        kind: "denied",
        message: "Camera and microphone access is blocked. Allow it in your browser's site settings, then try again.",
      };
    case "NotFoundError":
    case "OverconstrainedError":
      return { kind: "not-found", message: "No camera or microphone was found. Connect one, then try again." };
    case "NotReadableError":
    case "AbortError":
      return {
        kind: "in-use",
        message: "Your camera or microphone is in use by another app. Close it, then try again.",
      };
    default:
      return { kind: "unknown", message: "Your camera could not be started. Try again." };
  }
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

/** The local camera and microphone, requested once on mount and released on unmount. */
export function useLocalMedia(): LocalMedia {
  const [state, setState] = useState<Pick<LocalMedia, "stream" | "status" | "error">>({
    stream: null,
    status: "requesting",
    error: null,
  });
  const streamRef = useRef<MediaStream | null>(null);
  // Each request gets a number; an answer to an outdated request is discarded (and its camera released).
  const attempt = useRef(0);

  const start = useCallback(() => {
    const id = ++attempt.current;
    requestMedia().then(
      (stream) => {
        if (id !== attempt.current) return stopTracks(stream);
        streamRef.current = stream;
        setState({ stream, status: "ready", error: null });
      },
      (e: unknown) => {
        if (id !== attempt.current) return;
        setState({ stream: null, status: "error", error: describe(e) });
      },
    );
  }, []);

  const release = useCallback(() => {
    attempt.current++;
    stopTracks(streamRef.current);
    streamRef.current = null;
  }, []);

  useEffect(() => {
    start();
    return release;
  }, [start, release]);

  const retry = useCallback(() => {
    release();
    setState({ stream: null, status: "requesting", error: null });
    start();
  }, [release, start]);

  const stop = useCallback(() => {
    release();
    setState({ stream: null, status: "stopped", error: null });
  }, [release]);

  return { ...state, retry, stop };
}
