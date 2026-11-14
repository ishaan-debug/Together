"use client";

import { Fragment, useCallback, useRef } from "react";
import { motion } from "motion/react";

import CallNotice from "./CallNotice";
import MediaNotice from "./MediaNotice";
import VideoController from "./VideoController";
import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/video.module.scss";

const Video = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { callAccepted, callEnded, callError, stream, remoteStream } = useSocketContext();

  // Streams can arrive before this page renders its <video> elements; attach each once both exist.
  const showRemote = useCallback(
    (video: HTMLVideoElement | null) => {
      if (video && remoteStream) video.srcObject = remoteStream;
    },
    [remoteStream],
  );
  // The same stream the call sends, so the preview always shows what the other side sees.
  const showSelf = useCallback(
    (video: HTMLVideoElement | null) => {
      if (video && stream) video.srcObject = stream;
    },
    [stream],
  );

  return (
    <Fragment>
      <MediaNotice />
      <CallNotice />
      <motion.div className={classes.userVideo} ref={constraintsRef}>
        {callAccepted && !callEnded && !callError && <video playsInline ref={showRemote} autoPlay />}
      </motion.div>
      <motion.div className={classes.myVideo} animate={{ x: -10, y: -10 }} drag={true} dragConstraints={constraintsRef}>
        {stream && <video playsInline muted ref={showSelf} autoPlay />}
      </motion.div>

      {callAccepted && !callEnded && !callError && <VideoController constraintsRef={constraintsRef} />}
    </Fragment>
  );
};

export default Video;
