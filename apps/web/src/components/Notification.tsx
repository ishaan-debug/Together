"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PhoneDisconnect, PhoneIncoming, PhoneSlash } from "@phosphor-icons/react";

import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/notification.module.scss";

const Notification = () => {
  const router = useRouter();
  const { answerCall, setCall, media } = useSocketContext();
  return (
    <motion.div className={classes.box} animate={{ y: -20 }}>
      <span>Incoming call</span>
      <button
        className={classes.green}
        aria-label="Answer"
        disabled={media.status !== "ready"}
        onClick={() => {
          answerCall();
          router.push("/video");
        }}
      >
        <PhoneIncoming />
      </button>
      <button className={classes.red} aria-label="Decline" onClick={() => setCall({ isReceivingCall: false })}>
        <PhoneSlash />
      </button>
      <button className={classes.mute} aria-label="Dismiss" onClick={() => setCall({ isReceivingCall: false })}>
        <PhoneDisconnect />
      </button>
    </motion.div>
  );
};

export default Notification;
