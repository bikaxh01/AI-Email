import { prisma_client } from "@/config/DB";
import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";

export async function POST(req: Request) {
  const { accountId, userID } = await req.json();
  console.log("🚀 ~ POST ~ userID:", userID);
  console.log("🚀 ~ POST ~ accountId:", accountId);

  if (!accountId || !userID) {
    return Response.json("Invalid Request", {
      status: 500,
    });
  }

  try {
    const dbAccount = await prisma_client.account.findFirst({
      where: {
        id: accountId,
        userId: userID,
      },
    });

    if (!dbAccount) {
      return Response.json("Account not found", {
        status: 404,
      });
    }

    const account = new Account(dbAccount.accessToken);

    const response = await account.performInitialSync();
   
    if (!response) {
      return Response.json("Account not found", {
        status: 404,
      });
    }

    await prisma_client.account.update({
        where:{
            id:accountId
        },data:{
            deltaToken:response.deltaToken
        }
    })

    await syncEmailsToDatabase(response.emails, accountId);
    return Response.json(
      {
        status: "success",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error);
    return Response.json(
      {
        status: "false",
      },
      {
        status: 500,
      }
    );
  }
}
