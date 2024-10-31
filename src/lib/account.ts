import axios from "axios";
import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "./types";

export class Account {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync() {
    const response = await axios.post<SyncResponse>(
      "https://api.aurinko.io/v1/email/sync",
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin: 10,
          bodyType: "html",
        },
      }
    );

    return response.data;
  }

  private async getUpdatedEmail({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }) {
    let params: Record<string, string> = {};

    if (deltaToken) params.deltaToken = deltaToken;

    if (pageToken) params.pageToken = pageToken;
    const response = await axios.get<SyncUpdatedResponse>(
      "https://api.aurinko.io/v1/email/sync/updated",
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      }
    );

    return response.data;
  }

  async performInitialSync() {
    try {
      let syncResponse = await this.startSync();

      while (!syncResponse.ready) {
        new Promise((resolve) =>
          setTimeout(() => {
            resolve;
          }, 1000)
        );
        syncResponse = await this.startSync();
      }

      let deltaToken: string = await syncResponse.syncUpdatedToken;

      let updatedResponse = await this.getUpdatedEmail({ deltaToken });

      if (updatedResponse.nextDeltaToken) {
        deltaToken = updatedResponse.nextDeltaToken;
      }

      let allEmails: EmailMessage[] = updatedResponse.records;

      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmail({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);

        if (updatedResponse.nextDeltaToken) {
          deltaToken = updatedResponse.nextDeltaToken;
        }
      }

      await this.getUpdatedEmail({ deltaToken });

      return {
        emails: allEmails,
        deltaToken,
      };
    } catch (error) {
      console.log("🚀 ~ Account ~ performInitialSync ~ error:", error);
    }
  }
}
