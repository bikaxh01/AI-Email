'use client'
import React from "react";
import { Button } from "./ui/button";
import { getAurinkoAuthUrl } from "@/config/aurinko";
import { redirect } from "next/navigation";

function LinkAccountButton() {


  const handleClick = async () => {
    const authUrl = await getAurinkoAuthUrl("Google");
    return redirect(authUrl);
  };

  return (
    <div>
      <Button onClick={handleClick}>Link Account</Button>
    </div>
  );
}

export default LinkAccountButton;
