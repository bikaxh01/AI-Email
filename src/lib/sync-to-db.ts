import { EmailAddress, EmailAttachment, EmailMessage } from "./types";
import pLimit from "p-limit";
import { prisma_client } from "@/config/DB";
import { boolean } from "zod";

export const syncEmailsToDatabase = async (
  emails: EmailMessage[],
  accountId: string
) => {
  const limit = pLimit(10);

  try {
    Promise.all(
      emails.map((email, index) => saveEmail(email, index, accountId))
    );
  } catch (error) {
    console.log("🚀 ~ syncEmailsToDatabase ~ error:", error);
  }
};

async function saveEmail(
  email: EmailMessage,
  index: number,
  accountId: string
) {
  try {
    let emailLabelType: "inbox" | "sent" | "draft" = "inbox";

    if (
      email.sysLabels.includes("inbox") ||
      email.sysLabels.includes("important")
    ) {
      emailLabelType = "inbox";
    } else if (email.sysLabels.includes("draft")) {
      emailLabelType = "draft";
    } else if (email.sysLabels.includes("sent")) {
      emailLabelType = "sent";
    }

    const addressToUpsert = new Map();

    for (const address of [
      email.from,
      ...email.replyTo,
      ...email.bcc,
      ...email.cc,
      ...email.to,
    ]) {
      addressToUpsert.set(address.address, address);
    }
    console.log("🚀 ~ addressToUpsert:", addressToUpsert);

    const upsertedEmailAddresses: Awaited<
      ReturnType<typeof upsertEmailAddress>
    >[] = [];

    for (const address of addressToUpsert.values()) {
      const upsertedAddress = await upsertEmailAddress(address, accountId);
      upsertedEmailAddresses.push(upsertedAddress);
    }

    const addressToMap = new Map(
      upsertedEmailAddresses
        .filter(Boolean)

        .map((address) => [address!.address, address])
    );

    const fromAddress = addressToMap.get(email.from.address);
    if (!fromAddress) {
      console.log(
        `Failed to upsert from address for email ${email.bodySnippet}`
      );
      return;
    }

    const toAddresses = email.to
      .map((addr) => addressToMap.get(addr.address))
      .filter(Boolean);
    const ccAddresses = email.cc
      .map((addr) => addressToMap.get(addr.address))
      .filter(Boolean);
    const bccAddresses = email.bcc
      .map((addr) => addressToMap.get(addr.address))
      .filter(Boolean);
    const replyToAddresses = email.replyTo
      .map((addr) => addressToMap.get(addr.address))
      .filter(Boolean);

    // 2. Upsert Thread
    const thread = await prisma_client.thread.upsert({
      where: { id: email.threadId },
      update: {
        subject: email.subject,
        accountId,
        lastMessageDate: new Date(email.sentAt),
        done: false,
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
      create: {
        id: email.threadId,
        accountId,
        subject: email.subject,
        done: false,
        draftStatus: emailLabelType === "draft",
        inboxStatus: emailLabelType === "inbox",
        sentStatus: emailLabelType === "sent",
        lastMessageDate: new Date(email.sentAt),
        participantIds: [
          ...new Set([
            fromAddress.id,
            ...toAddresses.map((a) => a!.id),
            ...ccAddresses.map((a) => a!.id),
            ...bccAddresses.map((a) => a!.id),
          ]),
        ],
      },
    });
    // 3. Upsert Email
    await prisma_client.email.upsert({
      where: { id: email.id },
      update: {
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { set: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        internetHeaders: email.internetHeaders as any,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
        emailLabel: emailLabelType,
      },
      create: {
        id: email.id,
        emailLabel: emailLabelType,
        threadId: thread.id,
        createdTime: new Date(email.createdTime),
        lastModifiedTime: new Date(),
        sentAt: new Date(email.sentAt),
        receivedAt: new Date(email.receivedAt),
        internetMessageId: email.internetMessageId,
        subject: email.subject,
        sysLabels: email.sysLabels,
        internetHeaders: email.internetHeaders as any,
        keywords: email.keywords,
        sysClassifications: email.sysClassifications,
        sensitivity: email.sensitivity,
        meetingMessageMethod: email.meetingMessageMethod,
        fromId: fromAddress.id,
        to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
        cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
        bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
        replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
        hasAttachments: email.hasAttachments,
        body: email.body,
        bodySnippet: email.bodySnippet,
        inReplyTo: email.inReplyTo,
        references: email.references,
        threadIndex: email.threadIndex,
        nativeProperties: email.nativeProperties as any,
        folderId: email.folderId,
        omitted: email.omitted,
      },
    });

    const threadEmails = await prisma_client.email.findMany({
      where: { threadId: thread.id },
      orderBy: { receivedAt: "asc" },
    });

    let threadFolderType = "sent";
    for (const threadEmail of threadEmails) {
      if (threadEmail.emailLabel === "inbox") {
        threadFolderType = "inbox";
        break; // If any email is in inbox, the whole thread is in inbox
      } else if (threadEmail.emailLabel === "draft") {
        threadFolderType = "draft"; // Set to draft, but continue checking for inbox
      }
    }
    await prisma_client.thread.update({
      where: { id: thread.id },
      data: {
        draftStatus: threadFolderType === "draft",
        inboxStatus: threadFolderType === "inbox",
        sentStatus: threadFolderType === "sent",
      },
    });

    // 4. Upsert Attachments
    for (const attachment of email.attachments) {
      await upsertAttachment(email.id, attachment);
    }
  } catch (error) {
    console.log("🚀 ~ saveEmail ~ error:", error);
  }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
  try {
    const existingAddress = await prisma_client.emailAddress.findUnique({
      where: {
        accountId_address: {
          accountId: accountId,
          address: address.address ?? "",
        },
      },
    });

    if (existingAddress) {
      return await prisma_client.emailAddress.update({
        where: {
          id: existingAddress.id,
        },
        data: {
          name: address.name,
          raw: address.raw,
        },
      });
    } else {
      return await prisma_client.emailAddress.create({
        data: {
          address: address.address ?? "",
          raw: address.raw,
          name: address.name,
          accountId,
        },
      });
    }
  } catch (error) {
    console.log("🚀 ~ upsertEmailAddress ~ error:", error);
  }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
  try {
    await prisma_client.emailAttachment.upsert({
      where: { id: attachment.id ?? "" },
      update: {
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
      create: {
        id: attachment.id,
        emailId,
        name: attachment.name,
        mimeType: attachment.mimeType,
        size: attachment.size,
        inline: attachment.inline,
        contentId: attachment.contentId,
        content: attachment.content,
        contentLocation: attachment.contentLocation,
      },
    });
  } catch (error) {
    console.log(`Failed to upsert attachment for email ${emailId}: ${error}`);
  }
}
