import React, { ComponentProps } from "react";
import { format, formatDistanceToNow } from "date-fns";
import useThread, { threadType } from "@/lib/use-thread";
import { atom } from "jotai";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

function ThreadList() {
  const { isFetching, threads, threadId, setThreadId } = useThread();

  const groupedThread = threads?.reduce((acc: any, thread: threadType) => {
    const date: any = format(
      thread.emails[0]?.sentAt ?? new Date(),
      "yyyy-MM-dd"
    );

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(thread);
    return acc;
  }, {} as Record<string, threadType>);

  return (
    <div className=" max-w-full overflow-y-auto max-h-[calc(100vh-120px)]">
      <div className=" flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThread ?? {}).map(([date, threads]: any) => {
          return (
            <React.Fragment key={date}>
              <div className="text-xs font-medium text-muted-foreground mt-4 first:mt-0">
                {date}
              </div>
              {threads.map((thread: any) => (
                <button
                  id={`thread-${thread.id}`}
                  onClick={() => setThreadId(thread.id)}
                  key={thread.id}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all relative",
                    {
                      " bg-accent  font-semibold": thread.id === threadId,
                    }
                  )}
                >
                  <div className=" flex flex-col  w-full gap-2">
                    <div className=" flex items-center ">
                      <div className=" flex items-center gap-2">
                        <div className=" font-semibold">
                          {thread.emails.at(-1)?.from.name}
                        </div>
                      </div>
                      <div className={cn("ml-auto text-xs")}>
                        {formatDistanceToNow(
                          thread.emails.at(-1)?.sentAt ?? new Date(),
                          { addSuffix: true }
                        )}
                      </div>
                    </div>
                    <div className=" text-xs font-medium">{thread.subject}</div>
                  </div>
                  <div
                    className=" text-xs line-clamp-2 text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        thread.emails.at(-1)?.bodySnippet ?? "",
                        { USE_PROFILES: { html: true } }
                      ),
                    }}
                  ></div>
                  {thread.emails[0]?.sysLabels.length ? (
                    <div className="flex items-center gap-2">
                      {thread.emails.at(0)?.sysLabels.map((label: string) => (
                        <Badge
                          key={label}
                          variant={getBadgeVariantFromLabel(label)}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </button>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
export default ThreadList;
