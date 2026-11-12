"use client";

import { ArrowClockwise, VideoCameraSlash } from "@phosphor-icons/react";

import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/mediaNotice.module.scss";

/** Tells the user why their camera is not available, with a way to try again. Renders nothing when it works. */
const MediaNotice = () => {
  const { media } = useSocketContext();
  if (media.status !== "error" || !media.error) return null;

  return (
    <div className={classes.notice} role="alert">
      <VideoCameraSlash weight="bold" className={classes.icon} aria-hidden />
      <span>{media.error.message}</span>
      {/* Retrying cannot help on an insecure page; the address has to change. */}
      {media.error.kind !== "insecure" && (
        <button className="btn-white" onClick={media.retry}>
          <span>Try again</span>
          <ArrowClockwise weight="bold" />
        </button>
      )}
    </div>
  );
};

export default MediaNotice;
