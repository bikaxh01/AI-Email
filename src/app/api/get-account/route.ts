import { prisma_client } from "@/config/DB";
import { GetUserId } from "@/lib/getUser";

export async function GET(req: Request) {
  const userId = await GetUserId();

  const accounts = await prisma_client.account.findMany({
    where: {
      userId: userId,
    },
    select: {
      emailAddress: true,
      name: true,
      id: true,
    },
  });

  return Response.json(
    {
      message: "Successfully fetched",
      data: accounts,
    },
    {
      status: 200,
    }
  );
}

export async function POST(req: Request) {
  const body = await req.json();
  const { accountId } = body;

  if (!accountId) {
    return Response.json({
      message: "Invalid request",
    });
  }

  const getAccount = await prisma_client.account.findUnique({
    where: {
      id: accountId,
    },
  });

  return Response.json({
    message: "successfully fetched account details",
    data: getAccount,
  });
}
