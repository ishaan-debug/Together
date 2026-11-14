// A one-to-one call over the browser's own RTCPeerConnection (replaces simple-peer).
//
// Signalling is "non-trickle": each side waits until it has gathered its network
// candidates and then sends one complete offer or answer. That keeps the server to a
// single message each way, which is all the current signalling events support.

import type { SignalData } from "@together/shared";

// Until step 1.5 moves this into config: a public STUN server so calls work across networks
// that do not need a relay.
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

// Gathering normally finishes in well under a second; if a STUN server never answers,
// send what has been gathered rather than leave the call hanging.
const ICE_GATHERING_TIMEOUT_MS = 5000;

const UNREADABLE_SETUP = "The other person's call setup could not be read.";

export type PeerOptions = {
  /** True for the caller, who makes the offer; false for the person answering. */
  initiator: boolean;
  /** Local camera and microphone to send. */
  stream: MediaStream;
  iceServers?: RTCIceServer[];
  /** A complete offer or answer to pass to the other side through the server. */
  onSignal: (signal: SignalData) => void;
  /** The other side's camera and microphone. */
  onStream: (stream: MediaStream) => void;
  /** Called at most once; the connection is closed by then. */
  onError: (error: Error) => void;
};

export type Peer = {
  /** Apply the other side's offer or answer, as received from the server. */
  signal: (data: unknown) => void;
  /** Close the connection. Safe to call more than once; no callbacks run afterwards. */
  destroy: () => void;
};

/** Checks a message from the server before it reaches the browser's WebRTC code. */
export function isSignalData(data: unknown): data is SignalData {
  if (typeof data !== "object" || data === null) return false;
  const { type, sdp } = data as Record<string, unknown>;
  return (type === "offer" || type === "answer") && typeof sdp === "string" && sdp.length > 0;
}

export function createPeer({ initiator, stream, iceServers, onSignal, onStream, onError }: PeerOptions): Peer {
  const pc = new RTCPeerConnection({ iceServers: iceServers ?? DEFAULT_ICE_SERVERS });
  let closed = false;
  let gotRemote = false;

  const destroy = () => {
    if (closed) return;
    closed = true;
    pc.close();
  };

  const fail = (error: unknown) => {
    if (closed) return;
    destroy();
    onError(error instanceof Error ? error : new Error(String(error)));
  };

  // Swaps the browser's technical message for one a user can read; the original stays in `cause`.
  const explain = (message: string) => (cause: unknown) => {
    throw new Error(message, { cause });
  };

  // Every async step goes through here so no WebRTC failure becomes an unhandled rejection.
  const run = (step: () => Promise<void>) => {
    step().catch(fail);
  };

  for (const track of stream.getTracks()) pc.addTrack(track, stream);

  pc.ontrack = (event) => {
    if (!closed) onStream(event.streams[0] ?? new MediaStream([event.track]));
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === "failed") fail(new Error("The connection to the other person could not be made."));
  };

  const iceGathered = () =>
    new Promise<void>((resolve) => {
      if (pc.iceGatheringState === "complete") return resolve();
      const done = () => {
        if (pc.iceGatheringState !== "complete" && !timedOut) return;
        clearTimeout(timer);
        pc.removeEventListener("icegatheringstatechange", done);
        resolve();
      };
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        done();
      }, ICE_GATHERING_TIMEOUT_MS);
      pc.addEventListener("icegatheringstatechange", done);
    });

  // Creates our offer or answer (whichever the current state calls for) and sends it once complete.
  const sendLocalDescription = async () => {
    await pc.setLocalDescription().catch(explain("Your browser could not set up the call."));
    await iceGathered();
    if (closed) return;
    const { type, sdp } = pc.localDescription!;
    onSignal({ type: type as SignalData["type"], sdp });
  };

  if (initiator) run(sendLocalDescription);

  return {
    signal(data) {
      // A one-to-one call takes exactly one remote description; ignore repeats.
      if (closed || gotRemote) return;
      if (!isSignalData(data)) return fail(new Error(UNREADABLE_SETUP, { cause: data }));
      const expected = initiator ? "answer" : "offer";
      if (data.type !== expected)
        return fail(new Error(UNREADABLE_SETUP, { cause: `expected an ${expected}, got an ${data.type}` }));
      run(async () => {
        await pc.setRemoteDescription(data).catch(explain(UNREADABLE_SETUP));
        if (data.type === "offer") await sendLocalDescription();
      });
      gotRemote = true;
    },
    destroy,
  };
}
