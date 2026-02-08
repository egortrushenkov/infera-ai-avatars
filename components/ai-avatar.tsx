"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AIAvatarProps {
  isThinking: boolean;
  isSpeaking?: boolean;
}

export function AIAvatar({ isThinking, isSpeaking = false }: AIAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-3 sm:gap-5">
      <div
        className={cn(
          "relative rounded-full overflow-hidden w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 border-2 border-primary/30 shrink-0",
          !isSpeaking && "animate-float",
          isThinking && "animate-pulse-glow",
          isSpeaking && "animate-avatar-speak"
        )}
      >
        <Image
          src="/avatar_portrait_v1.png"
          alt="AI-ассистент Инфера"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h2 className="text-lg font-bold text-foreground tracking-wide sm:text-xl">
          Инфера
        </h2>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span
            className={cn(
              "w-2 h-2 rounded-full sm:w-2.5 sm:h-2.5",
              isThinking
                ? "bg-primary animate-pulse"
                : "bg-emerald-400"
            )}
          />
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            {isThinking ? "Думаю..." : isSpeaking ? "Говорю..." : "В сети"}
          </span>
        </div>
      </div>
    </div>
  );
}
