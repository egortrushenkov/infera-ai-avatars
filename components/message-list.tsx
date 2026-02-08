"use client";

import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: UIMessage[];
}

export function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // if (messages.length === 0) {
  //   return (
  //     <div className="flex items-center justify-center py-10">
  //       <p className="text-muted-foreground text-base font-medium text-center">
  //         Спросите что угодно...
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <div
      ref={scrollRef}
      className="flex flex-col gap-3 overflow-y-auto max-h-[40dvh] min-h-0 px-2 py-2 sm:max-h-[48vh] sm:gap-4 sm:px-3 sm:py-3 scrollbar-thin touch-pan-y overscroll-contain"
    >
      {messages.map((message) => {
        const text = getMessageText(message);
        if (!text) return null;

        const isUser = message.role === "user";

        return (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-medium sm:max-w-[85%] sm:px-5 sm:py-4 sm:text-base",
                isUser
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              )}
            >
              <p className="whitespace-pre-wrap">{text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
