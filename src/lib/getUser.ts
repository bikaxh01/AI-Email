
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export  async function GetUserId() {
    const { userId } = await auth();

    if (!userId) {
      return redirect("/sign-in");
    }

    return userId
}