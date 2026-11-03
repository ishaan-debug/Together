"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PhoneDisconnect, PhoneIncoming, PhoneSlash } from "@phosphor-icons/react";

import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/notification.module.scss";

const Notification = () => {
  const router = useRouter();
  const { answerCall, setCall } = useSocketContext();
  return (
    <motion.div className={classes.box} animate={{ y: -20 }}>
      <span>Incoming call</span>
      <button
        className={classes.green}
        onClick={() => {
          answerCall();
          router.push("/video");
        }}
      >
        <PhoneIncoming />
      </button>
      <button className={classes.red} onClick={() => setCall({ isReceivingCall: false })}>
        <PhoneSlash />
      </button>
      <button className={classes.mute} onClick={() => setCall({ isReceivingCall: false })}>
        <PhoneDisconnect />
      </button>
    </motion.div>
  );
};

export default Notification;
