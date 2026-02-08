"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AIAvatar } from "@/components/ai-avatar";
import { MessageList, getMessageText } from "@/components/message-list";
import { ChatInput } from "@/components/chat-input";
import { SuggestionChips } from "@/components/suggestion-chips";
import { useSpeech } from "@/hooks/use-speech";

export default function Home() {
  const [input, setInput] = useState("");
  const lastSpokenIdRef = useRef<string | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const { speak, stop, isSpeaking } = useSpeech(true);
  const isLoading = status === "streaming" || status === "submitted";

  // Озвучить последний ответ ассистента, когда стрим закончится
  useEffect(() => {
    if (status !== "streaming" && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "assistant" && last.id !== lastSpokenIdRef.current) {
        const text = getMessageText(last);
        if (text.trim()) {
          lastSpokenIdRef.current = last.id;
          speak(text);
        }
      }
    }
  }, [status, messages, speak]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    stop();
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    stop();
    sendMessage({ text });
  };

  return (
    <main className="flex min-h-[100dvh] min-h-[100svh] flex-col items-center bg-background">
      {/* Background subtle grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(185 80% 50%) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-1 flex-col items-center gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:gap-8 md:px-5 md:py-10 md:py-14">
        {/* AI Avatar - centered at top */}
        <AIAvatar isThinking={isLoading} isSpeaking={isSpeaking} />

        {/* Message area */}
        <div className="w-full flex-1">
          <MessageList messages={messages} />
        </div>

        {/* Suggestion chips */}
        <SuggestionChips
          onSelect={handleSuggestion}
          visible={messages.length === 0}
        />

        {/* Chat input - sticky at bottom */}
        <div className="w-full">
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>
    </main>
  );
}
