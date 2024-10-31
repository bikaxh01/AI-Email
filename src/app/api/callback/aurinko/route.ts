import {
  exchangeCodeForAccessToken,
  getAccountDetails,
} from "@/config/aurinko";
import { prisma_client } from "@/config/DB";
import { GetUserId } from "@/lib/getUser";
import { waitUntil } from "@vercel/functions";
import axios from "axios";
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

  if (!response) {
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

  const getAccount = await prisma_client.account.upsert({
    where: {
      id: response.accountId.toString(),
    },
    create: {
      id: response.accountId.toString(),
      userId: userID,
      accessToken: response.accessToken,
      emailAddress: accountDetails.email,
      name: accountDetails.name,
    },
    update: {
      accessToken: response.accessToken,
    },
  });

  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        userID,
        accountId: response.accountId.toString(),
      })
      .then((res) => {
        console.log("🚀 ~ GET ~ res:", res);
      })
      .catch((error) => {

        if(axios.isAxiosError(error)){
          // console.log(error.response?.data);
          
        }
        // console.log("🚀 ~ GET ~ error:", error.response);
      })
  );

  return Response.redirect(new URL("/mail", req.url));
}
