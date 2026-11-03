"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneOutgoing } from "@phosphor-icons/react";

import { useSocketContext } from "@/contexts/SocketContext";
import classes from "@/styles/components/joinMeeting.module.scss";

const JoinMeeting = () => {
  const { callUser } = useSocketContext();
  const router = useRouter();
  const idRef = useRef<HTMLInputElement>(null);
  const [idToCall, setIdToCall] = useState("");
  return (
    <div className={classes.joinMeeting}>
      <h2>Call</h2>
      <input
        placeholder="Enter code here"
        type="text"
        id="ID to call"
        ref={idRef}
        value={idToCall}
        onChange={(e) => setIdToCall(e.target.value)}
        required
        autoComplete="Off"
      />
      <button
        onClick={() => {
          if (idRef.current?.value) {
            callUser(idToCall);
            router.push("/video");
          }
        }}
      >
        <span> Call </span>
        <PhoneOutgoing weight="bold" />
      </button>
    </div>
  );
};

export default JoinMeeting;
