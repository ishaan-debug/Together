"use client";

import { PhoneDisconnect, WarningCircle } from "@phosphor-icons/react";

import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/mediaNotice.module.scss";

/** Tells the user the call failed, with a way back to the start page. Renders nothing otherwise. */
const CallNotice = () => {
  const { callError, leaveCall } = useSocketContext();
  if (!callError) return null;

  return (
    <div className={classes.notice} role="alert">
      <WarningCircle weight="bold" className={classes.icon} aria-hidden />
      <span>The call ended: {callError}</span>
      <button className="btn-white" onClick={leaveCall}>
        <span>Leave</span>
        <PhoneDisconnect weight="bold" />
      </button>
    </div>
  );
};

export default CallNotice;
