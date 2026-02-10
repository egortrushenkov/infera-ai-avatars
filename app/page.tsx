"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { UIMessage } from "ai";
import { AIAvatar } from "@/components/ai-avatar";
import { MessageList, getMessageText } from "@/components/message-list";
import { ChatInput } from "@/components/chat-input";
import { SuggestionChips } from "@/components/suggestion-chips";
import { useSpeech } from "@/hooks/use-speech";
import { useRouterAudio } from "@/hooks/use-router-audio";

function createMessage(role: "user" | "assistant", text: string): UIMessage {
  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text", text }],
  };
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastSpokenIdRef = useRef<string | null>(null);

  const { speak: speakFallback, stop: stopFallback } = useSpeech(true);
  const { speak: speakRouter, stop: stopRouter, isSpeaking } = useRouterAudio();

  const stop = useCallback(() => {
    stopRouter();
    stopFallback();
  }, [stopRouter, stopFallback]);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage = createMessage("user", text);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    stop();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            id: m.id,
            role: m.role,
            parts: m.parts,
          })),
        }),
      });
      const answer = await res.text();
      const assistantMessage = createMessage("assistant", answer || "Нет ответа.");
      setMessages((prev) => [...prev, assistantMessage]);
      lastSpokenIdRef.current = assistantMessage.id;
      if (answer.trim()) {
        try {
          await speakRouter(answer);
        } catch {
          speakFallback(answer);
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", "Ошибка при запросе."),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, stop, speakRouter, speakFallback]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  return (
    <main className="flex min-h-[100dvh] min-h-[100svh] flex-col items-center bg-background">
      {/* Background  subtle grid pattern */}
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
