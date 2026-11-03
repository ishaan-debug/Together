"use client";

import type { RefObject } from "react";
import { motion } from "motion/react";
import { PhoneDisconnect } from "@phosphor-icons/react";

import { useSocketContext } from "@/contexts/SocketContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import classes from "@/styles/components/videoController.module.scss";

const VideoController = ({ constraintsRef }: { constraintsRef: RefObject<HTMLDivElement | null> }) => {
  const { leaveCall } = useSocketContext();
  const { width } = useWindowDimensions();

  return (
    <motion.div
      className={classes.controller}
      animate={width >= 1200 ? { y: -10 } : { x: 10, y: -10 }}
      drag={true}
      dragConstraints={constraintsRef}
    >
      <button
        onClick={() => {
          leaveCall();
        }}
      >
        <PhoneDisconnect />
      </button>
    </motion.div>
  );
};

export default VideoController;
