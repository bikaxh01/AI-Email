import {
  exchangeCodeForAccessToken,
  getAccountDetails,
} from "@/config/aurinko";
import { prisma_client } from "@/config/DB";
import { GetUserId } from "@/lib/getUser";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userID = await GetUserId();

  const { searchParams } = new URL(req.url);

  const code = searchParams.get("code");

  const requestId = searchParams.get("requestId");

  const status = searchParams.get("status");

  if (status != "success" || !code) {
    return Response.json("failed to get Token ", {
      status: 500,
    });
  }

  const response = await exchangeCodeForAccessToken(code);

  if (!response?.accessToken) {
    return Response.json("Invalid Token", {
      status: 500,
    });
  }

  const accountDetails = await getAccountDetails(response.accessToken);
  if (!accountDetails) {
    return Response.json("Invalid Token", {
      status: 500,
    });
  }

  const getAccount = await prisma_client.account.create({
    data: {
      userId: userID,
      accessToken: response.accessToken,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
    },
  });

  return Response.redirect(new URL("/mail", req.url));
}
