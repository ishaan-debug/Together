"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { io, type Socket } from "socket.io-client";
import Peer from "simple-peer/simplepeer.min.js";
import type { ClientToServerEvents, ServerToClientEvents, SignalData, SocketId } from "@together/shared";

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
  myVideo: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  /** The other participant's media; the call page attaches it to its <video> once that mounts. */
  remoteStream: MediaStream | null;
  name: string;
  setStream: (stream: MediaStream | null) => void;
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [me, setMe] = useState("loading...");
  const [call, setCall] = useState<CallState>({ isReceivingCall: false });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("Ishaan");

  const myVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (navigator.mediaDevices)
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
        setStream(currentStream);
      });

    const s = getSocket();
    const onMe = (id: SocketId) => setMe(id);
    const onAny = (event: string, ...args: unknown[]) => console.log(event, args);
    const onCallUser = ({ from, name: callerName, signal }: { from: SocketId; name: string; signal: SignalData }) => {
      console.log(from);
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    };

    s.on("me", onMe);
    s.onAny(onAny);
    s.on("callUser", onCallUser);
    return () => {
      s.off("me", onMe);
      s.offAny(onAny);
      s.off("callUser", onCallUser);
    };
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream: stream ?? undefined });

    peer.on("signal", (data) => {
      getSocket().emit("answerCall", { signal: data, to: call.from! });
    });

    peer.on("stream", (currentStream: MediaStream) => setRemoteStream(currentStream));

    peer.signal(call.signal as Peer.SignalData);

    connectionRef.current = peer;
  };

  const callUser = (id: SocketId) => {
    const peer = new Peer({ initiator: true, trickle: false, stream: stream ?? undefined });

    peer.on("signal", (data) => {
      console.log("Calling: " + id);
      getSocket().emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream: MediaStream) => setRemoteStream(currentStream));

    getSocket().on("callAccepted", (signal) => {
      setCallAccepted(true);
      console.log("accepted");
      peer.signal(signal as Peer.SignalData);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current!.destroy();
    window.location.replace("/");
  };

  return (
    <SocketContext.Provider
      value={{
        me,
        call,
        callAccepted,
        callEnded,
        myVideo,
        stream,
        remoteStream,
        name,
        setStream,
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
