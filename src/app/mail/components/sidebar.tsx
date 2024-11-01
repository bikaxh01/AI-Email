import React, { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Nav } from "./nav";
import { Inbox, Send, File } from "lucide-react";
import axios from "axios";

interface labelNums {
  getInboxNum: number;
  getDraftsNum: number;
  getSentNum: number;
}

function SideBarComponent({ isCollapsed }: { isCollapsed: boolean }) {
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<"inbox" | "drafts" | "sent">(
    "client-tab",
    "inbox"
  );

  const [labelNums, setLabelNumber] = useState<labelNums>();

  useEffect(() => {
    const getLabels = async () => {
      try {
        const response = await axios.get(
          `api/get-num-inbox?accountId=${accountId}`
        );
        setLabelNumber(response.data.data);
      } catch (error) {
        console.log("🚀 ~ getLabels ~ error:", error);
      }
    };
    getLabels();
  }, []);

  return (
    <>
      <Nav
        isCollapsed={isCollapsed}
        links={[
          {
            title: "Inbox",
            label: labelNums?.getInboxNum.toString() || "0",
            icon: Inbox,
            variant: tab == "inbox" ? "default" : "ghost",
          },
          {
            title: "Drafts",
            label: labelNums?.getDraftsNum.toString() || "0",
            icon: File,
            variant: tab == "drafts" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: labelNums?.getSentNum.toString() || "0",
            icon: Send,
            variant: tab == "sent" ? "default" : "ghost",
          },
        ]}
      />
    </>
  );
}

export default SideBarComponent;
