"use client";

import { Fragment } from "react";

import CreateMeeting from "@/components/CreateMeeting";
import JoinMeeting from "@/components/JoinMeeting";
import Notification from "@/components/Notification";
import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/pages/callReadyPage.module.scss";

export default function CallReadyPage() {
  const { call, callAccepted } = useSocketContext();

  return (
    <Fragment>
      <div className={classes.layout}>
        <JoinMeeting />
        <CreateMeeting />
      </div>

      {call.isReceivingCall && !callAccepted && <Notification />}
    </Fragment>
  );
}
