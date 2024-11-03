"use client";

import Avatar from "react-avatar";
import useThread from "@/lib/use-thread";
import { cn } from "@/lib/utils";
import { Email, EmailAddress } from "@prisma/client";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Letter } from "react-letter";
export type EmailType = Email & { from: EmailAddress };

function EmailDisplay({ email }: { email: EmailType }) {
  const { account } = useThread();

  const isMe = account?.emailAddress === email.from.address;

  return (
    <div
      className={cn(
        " border rounded-md p-4 transition-all  hover:translate-x-2",
        {
          " border-1-gray-900 border-1-4": isMe,
        }
      )}
    >
      <div className=" flex items-center justify-between gap-2">
        <div className=" flex items-center justify-between gap-2">
          {!isMe && (
            <Avatar
              name={email.from.name ?? email.from.address}
              email={email.from.address}
              size="35"
              textSizeRatio={2}
              round={true}
            />
          )}
          <span>{isMe ? "Me" : email.from.address}</span>
        </div>
        <p className=" text-xm text-muted-foreground">
          {formatDistanceToNow(email.sentAt ?? new Date(), {
            addSuffix: true,
          })}
        </p>
      </div>
      <div className=" h-10"> </div>
      <Letter
        html={email.body ?? ""}
        className=" bg-white rounded-md text-black p-2"
      />
    </div>
  );
}

export default EmailDisplay;
