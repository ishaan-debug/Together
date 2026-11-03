"use client";

import { CopySimple } from "@phosphor-icons/react";

import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/createMeeting.module.scss";

const CreateMeeting = () => {
  const { me } = useSocketContext();

  return (
    <div className={classes.createMeeting}>
      <h2>Share</h2>
      <div>{me}</div>
      <button className="btn-white" onClick={() => navigator.clipboard.writeText(me)}>
        <span>Copy</span>
        <CopySimple weight="bold" />
      </button>
    </div>
  );
};

export default CreateMeeting;
