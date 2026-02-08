"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ input, setInput, onSubmit, isLoading }: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-lg shadow-primary/5 sm:gap-3 sm:p-3"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Введите сообщение..."
        disabled={isLoading}
        className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-base font-medium text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50 sm:px-4 sm:py-3 [font-size:16px]"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || isLoading}
        className="h-11 min-h-[44px] w-11 min-w-[44px] shrink-0 touch-manipulation rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 active:scale-95"
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Отправить сообщение</span>
      </Button>
    </form>
  );
}
