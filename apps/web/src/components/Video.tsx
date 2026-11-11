"use client";

import { Fragment, useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";

import VideoController from "./VideoController";
import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/video.module.scss";

const Video = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const { callAccepted, myVideo, callEnded, stream, remoteStream, setStream } = useSocketContext();

  // The remote stream often arrives before this page has rendered its <video>; attach it once both exist.
  const showRemote = useCallback(
    (video: HTMLVideoElement | null) => {
      if (video && remoteStream) video.srcObject = remoteStream;
    },
    [remoteStream],
  );

  // Known issue (roadmap 1.1): asks for the camera a second time; the call sends the first stream.
  useEffect(() => {
    if (navigator.mediaDevices)
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      });
  }, [myVideo, setStream]);

  return (
    <Fragment>
      <motion.div className={classes.userVideo} ref={constraintsRef}>
        {callAccepted && !callEnded && <video playsInline ref={showRemote} autoPlay />}
      </motion.div>
      <motion.div className={classes.myVideo} animate={{ x: -10, y: -10 }} drag={true} dragConstraints={constraintsRef}>
        {stream && <video playsInline muted ref={myVideo} autoPlay />}
      </motion.div>

      {callAccepted && !callEnded && <VideoController constraintsRef={constraintsRef} />}
    </Fragment>
  );
};

export default Video;
