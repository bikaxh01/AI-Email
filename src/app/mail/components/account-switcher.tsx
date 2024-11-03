"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useLocalStorage } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { getAurinkoAuthUrl } from "@/config/aurinko";
import { redirect } from "next/navigation";

function AccountSwitcher({ isCollapsed }: { isCollapsed: Boolean }) {
  const [accounts, setAccounts] = useState<any>([]);
  const [accountId, setAccountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<"inbox" | "drafts" | "sent">(
    "client-tab",
    "inbox"
  );
  useEffect(() => {
    const getAccounts = async () => {
      try {
        const response = await axios.get("/api/get-account");

        setAccounts(response.data.data);
      } catch (error) {
        console.log("🚀 ~ getAccounts ~ error:", error);
      }
    };
    getAccounts();
  }, []);

  return (
    <div className="items-center gap-2 flex w-full">
      <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger
          className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            <span className={cn({ hidden: !isCollapsed })}>
              {
                //@ts-ignore
                accounts.find((account: any) => account.id === accountId)
                  ?.emailAddress[0]
              }
            </span>
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {
                accounts.find((account: any) => account.id === accountId)
                  ?.emailAddress
              }
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account: any) => (
            <SelectItem key={account.id} value={account.id}>
              {account.emailAddress}
            </SelectItem>
          ))}
          <div
            onClick={async () => {
              const authUrl = await getAurinkoAuthUrl("Google");
              return redirect(authUrl);
            }}
            className=" flex  relative hover:bg-gray-100 w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent"
          >
            <PlusIcon className=" size-4 mr-1" /> Add Account
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}

export default AccountSwitcher;
