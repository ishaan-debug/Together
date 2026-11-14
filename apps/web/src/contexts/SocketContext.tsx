"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents, SignalData, SocketId } from "@together/shared";

import { useLocalMedia, type LocalMedia } from "@/hooks/useLocalMedia";
import { createPeer, isSignalData, type Peer } from "@/lib/peer";

type SignalingSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL ?? "http://localhost:5000";

// One connection per tab, created on first use in the browser (never during static rendering).
let socket: SignalingSocket | null = null;
function getSocket() {
  socket ??= io(SIGNALING_URL);
  return socket;
}

export type CallState = {
  isReceivingCall: boolean;
  from?: SocketId;
  name?: string;
  signal?: SignalData;
};

type SocketContextValue = {
  me: string;
  call: CallState;
  callAccepted: boolean;
  callEnded: boolean;
  /** This device's camera and microphone, with its status and any error to show. */
  media: LocalMedia;
  /** Shorthand for media.stream; null until the camera is ready. */
  stream: MediaStream | null;
  /** The other participant's media; the call page attaches it to its <video> once that mounts. */
  remoteStream: MediaStream | null;
  /** Why the call failed, if it did; the call page shows it with a way out. */
  callError: string | null;
  name: string;
  setName: (name: string) => void;
  setCall: (call: CallState) => void;
  callUser: (id: SocketId) => void;
  leaveCall: () => void;
  answerCall: () => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocketContext must be used inside SocketContextProvider");
  return ctx;
}

export function SocketContextProvider({ children }: { children: ReactNode }) {
  const media = useLocalMedia();
  const stream = media.stream;
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [me, setMe] = useState("loading...");
  const [call, setCall] = useState<CallState>({ isReceivingCall: false });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("Ishaan");
  const [callError, setCallError] = useState<string | null>(null);

  const connectionRef = useRef<Peer | null>(null);

  useEffect(() => {
    const s = getSocket();
    const onMe = (id: SocketId) => setMe(id);
    const onAny = (event: string, ...args: unknown[]) => console.log(event, args);
    const onCallUser = ({ from, name: callerName, signal }: { from: SocketId; name: string; signal: SignalData }) => {
      console.log(from);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    };
    // Registered once for the whole session; the answer goes to whichever call is in progress.
    const onCallAccepted = (signal: SignalData) => {
      const peer = connectionRef.current;
      if (!peer) return;
      setCallAccepted(true);
      peer.signal(signal);
    };

    s.on("me", onMe);
    s.onAny(onAny);
    s.on("callUser", onCallUser);
    s.on("callAccepted", onCallAccepted);
    return () => {
      s.off("me", onMe);
      s.offAny(onAny);
      s.off("callUser", onCallUser);
      s.off("callAccepted", onCallAccepted);
    };
  }, []);

  // Starts a connection for a new call, replacing any previous one.
  const startPeer = (initiator: boolean, mediaStream: MediaStream, onSignal: (signal: SignalData) => void) => {
    connectionRef.current?.destroy();
    setCallError(null);
    const peer = createPeer({
      initiator,
      stream: mediaStream,
      onSignal,
      onStream: setRemoteStream,
      onError: (error) => {
        console.error("Call failed:", error, error.cause ?? "");
        // Ignore errors from a connection that has already been replaced.
        if (connectionRef.current === peer) setCallError(error.message);
      },
    });
    connectionRef.current = peer;
    return peer;
  };

  // Calls need the camera: without it the other side would get a one-way call.
  const answerCall = () => {
    if (!stream) return;
    const from = call.from;
    if (!from || !isSignalData(call.signal)) {
      setCallError("This call can no longer be answered.");
      return;
    }
    setCallAccepted(true);
    const peer = startPeer(false, stream, (signal) => getSocket().emit("answerCall", { signal, to: from }));
    peer.signal(call.signal);
  };

  const callUser = (id: SocketId) => {
    if (!stream) return;
    startPeer(true, stream, (signal) => {
      console.log("Calling: " + id);
      getSocket().emit("callUser", { userToCall: id, signalData: signal, from: me, name });
    });
  };

  const leaveCall = () => {
    setCallEnded(true);
    // There may be no connection yet, e.g. when hanging up before the other side answers.
    connectionRef.current?.destroy();
    connectionRef.current = null;
    media.stop();
    window.location.replace("/");
  };

  return (
    <SocketContext.Provider
      value={{
        me,
        call,
        callAccepted,
        callEnded,
        media,
        stream,
        remoteStream,
        callError,
        name,
        setName,
        setCall,
        callUser,
        leaveCall,
        answerCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
