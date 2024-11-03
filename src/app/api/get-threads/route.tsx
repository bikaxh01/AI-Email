import { prisma_client } from "@/config/DB";
import { GetUserId } from "@/lib/getUser";

export async function GET(req: Request) {
  const userID = await GetUserId();

  const { searchParams } = new URL(req.url);

  const accountId = searchParams.get("accountId");
  const tab = searchParams.get("tab");
  const done = searchParams.get("done");

  if (!accountId || !tab ) {
    return Response.json("Invalid Request", {
      status: 403,
    });
  }

  const threads = await prisma_client.thread.findMany({
    where: {
      accountId,
      draftStatus: tab == "drafts" ? true : false,
      sentStatus: tab == "sent" ? true : false,
      inboxStatus: tab == "inbox" ? true : false,
      done: done == "true" ? true : false,
    },
    include: {
      emails: {
        orderBy: {
          sentAt: "asc",
        },
        select: {
          from: true,
          body: true,
          bodySnippet: true,
          emailLabel: true,
          subject: true,
          sysLabels: true,
          id: true,
          sentAt: true,
        },
      },
    },
    take: 15,
    orderBy: {
      lastMessageDate: "desc",
    },
  });

  return Response.json({
    message: "successfully fetched",
    data: threads,
  });
}
