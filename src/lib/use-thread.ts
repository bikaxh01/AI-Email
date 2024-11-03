import { Thread, Email, account, EmailLabel, EmailAddress } from "@prisma/client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { atom, useAtom } from "jotai";


export type threadType = Thread & { emails: Array<Email & { from: EmailAddress }> };

export type accountType = account;
export const threadIdAtom = atom<string | null>(null);
  
function useThread() {
  const [tab] = useLocalStorage("client-tab", "");
  const [accountId] = useLocalStorage("accountId", "");
  const [done] = useLocalStorage("done", "");
  const [threads, setThreads] = useState<threadType[] | []>([]);
  const [threadId, setThreadId] = useAtom(threadIdAtom);
  const [isFetching, setIsFetching] = useState(false);
  const [account, setAccount] = useState<accountType | null>(null);
  useEffect(() => {
    const getThreads = async () => {
      if (tab || accountId || done) {
        try {
          setIsFetching(true);
          const response = await axios.get(
            `/api/get-threads?accountId=${accountId}&tab=${tab}&done=${done}`
          );
          const getAccountDetails = await axios.post("api/get-account", {
            accountId: accountId,
          });
          setAccount(getAccountDetails.data.data);
          setThreads(response.data.data);
        } catch (error) {
          console.log("🚀 ~ getThreads ~ error:", error);
        } finally {
          setIsFetching(false);
        }
      }
    };
    getThreads();
  }, [tab, accountId, done]);

  return { isFetching, threads, setThreadId, threadId, account };
}

export default useThread;
