"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useThread from "@/lib/use-thread";
import { Archive, ArchiveX, Clock, MoreVertical, Trash } from "lucide-react";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { format } from "date-fns";
import EmailDisplay from "./email-display";

function ThreadDisplay() {
  const { threads, threadId } = useThread();

  const thread = threads.find((thread) => thread.id === threadId);

  return (
    <div className=" flex flex-col h-full">
      <div className=" flex items-center p-2">
        <div className=" flex items-center gap-2">
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Archive className=" size-4" />
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <ArchiveX className=" size-4" />
          </Button>
          <Button variant={"ghost"} size={"icon"} disabled={!thread}>
            <Trash className=" size-4" />
          </Button>
        </div>
        <Separator orientation="vertical" className=" ml-2" />
        <Button
          className=" ml-2"
          variant={"ghost"}
          size={"icon"}
          disabled={!thread}
        >
          <Clock className=" size-4" />
        </Button>
        <div className=" flex items-center ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                className=" ml-2"
                variant={"ghost"}
                size={"icon"}
                disabled={!thread}
              >
                <MoreVertical className=" size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <Separator />
      {thread ? (
        <>
          <div className=" flex flex-col flex-1  overflow-auto">
            <div className=" flex items-center p-4">
              <div className=" flex items-center gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt="avatar" />
                  <AvatarFallback className=" h-14 w-64 items-center flex justify-center ">
                    {
                      //@ts-ignore
                      thread.emails[0].from.name
                        .split(" ")
                        .map((chunk: any) => chunk[0])
                    }
                  </AvatarFallback>
                </Avatar>
                <div className=" grid gap-1">
                  <div className=" ">
                   
                    {  //@ts-ignore
                    thread.emails[0].from.name}
                    <div className=" text-sm line-clamp-1">
                      {thread.emails[0].subject}
                    </div>
                    <div className=" text-sm line-clamp-1">
                      <span className=" font-medium">Reply-To:</span>
                      
                      {   //@ts-ignore
                      thread.emails[0].from.address}
                    </div>
                  </div>
                </div>
              </div>
              {thread.emails[0]?.sentAt && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(thread.emails[0].sentAt), "PPpp")}
                </div>
              )}
            </div>
            <Separator />
            <div className=" max-h[calc(100vh-500px)] overflow-auto  flex flex-col">
              <div className=" p-6 flex  flex-col gap-4">
                {thread.emails.map((email) => (
                  <EmailDisplay key={email.id} email={email}/>
                ))}
              </div>
            </div>
            <div className=" flex-1"></div>
            <Separator className=" mt-auto" />
            {/* reply-Box */}
            <h1>
              Reply box
            </h1>
          </div>
        </>
      ) : (
        <div className=" p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}

export default ThreadDisplay;