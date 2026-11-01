// Socket.IO event contract shared by apps/signaling and apps/web.
// Mirrors the events the legacy client and server exchange today;
// later steps replace these with room-based events.

export type SocketId = string;

/** Session description passed through the server untouched. */
export type SignalData = unknown;

export interface ServerToClientEvents {
  me: (id: SocketId) => void;
  callUser: (payload: { signal: SignalData; from: SocketId; name: string }) => void;
  callAccepted: (signal: SignalData) => void;
  callEnded: () => void;
}

export interface ClientToServerEvents {
  callUser: (payload: {
    userToCall: SocketId;
    signalData: SignalData;
    from: SocketId;
    name: string;
  }) => void;
  answerCall: (payload: { signal: SignalData; to: SocketId }) => void;
}
