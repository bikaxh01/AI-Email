"use server";
import { GetUserId } from "@/lib/getUser";
import axios, { AxiosError } from "axios";

interface accessTokenResponse {
  accessToken: string;
  accountId: string;
}

export const getAurinkoAuthUrl = async (
  serviceType: "Google" | "Office365"
) => {
  const userId = await GetUserId();

  const params = new URLSearchParams({
    clientId: process.env.AURINKO_CLIENT_ID!,
    serviceType,
    scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
    responseType: "code",
    returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/callback/aurinko`,
  });

  return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
};

export const exchangeCodeForAccessToken = async (
  code: string
): Promise<accessTokenResponse | null> => {
  try {
    const response = await axios.post(
      `https://api.aurinko.io/v1/auth/token/${code}`,
      {},
      {
        auth: {
          username: process.env.AURINKO_CLIENT_ID as string,
          password: process.env.AURINKO_CLIENT_SECRET as string,
        },
      }
    );
    const data = response.data;
    return { accessToken: data.accessToken, accountId: data.accountId };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.log(
      "🚀 ~ exchangeCodeForAccessToken ~ error:",
      axiosError.response?.data
    );
    return null;
  }
};

export const getAccountDetails = async (accessToken: string) => {
  try {
    const response = await axios.get(`https://api.aurinko.io/v1/account`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data as {
      name: string;
      email: string;
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Axios Error", error.response?.data);
    } else {
      console.log("🚀 ~ getAccountDetails ~ error:", error);
    }
  }
};
