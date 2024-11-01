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
