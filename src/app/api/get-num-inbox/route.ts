import { prisma_client } from "@/config/DB";
import { GetUserId } from "@/lib/getUser";

export async function GET(req: Request) {
  const userID = await GetUserId();

  const { searchParams } = new URL(req.url);

  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return Response.json({
      message: "Invalid Request",
    });
  }

  const getDraftsNum = await prisma_client.thread.count({
    where: {
      accountId: accountId,
      draftStatus: true,
    },
  });
  const getSentNum = await prisma_client.thread.count({
    where: {
      accountId: accountId,
      sentStatus: true,
    },
  });
  const getInboxNum = await prisma_client.thread.count({
    where: {
      accountId: accountId,
      inboxStatus: true,
    },
  });

  return Response.json(
    {
      message: "Successfully Fetched",
      data: {
        getDraftsNum,
        getInboxNum,
        getSentNum,
      },
    },
    {
      status: 200,
    }
  );
}
