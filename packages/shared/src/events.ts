// Socket.IO event contract shared by apps/signaling and apps/web.
// Mirrors the events the legacy client and server exchange today;
// later steps replace these with room-based events.

export type SocketId = string;

/**
 * A WebRTC session description (offer or answer) with all ICE candidates included.
 * The server passes it through untouched; the receiving browser validates it.
 */
export type SignalData = { type: "offer" | "answer"; sdp: string };

export interface ServerToClientEvents {
  me: (id: SocketId) => void;
  callUser: (payload: { signal: SignalData; from: SocketId; name: string }) => void;
  callAccepted: (signal: SignalData) => void;
  callEnded: () => void;
}

export interface ClientToServerEvents {
  callUser: (payload: { userToCall: SocketId; signalData: SignalData; from: SocketId; name: string }) => void;
  answerCall: (payload: { signal: SignalData; to: SocketId }) => void;
}
