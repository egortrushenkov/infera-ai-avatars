"use client";

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
  visible: boolean;
}

const suggestions = [
  "С чем ты можешь помочь?",
  "Расскажи что-нибудь интересное",
  "Объясни квантовые вычисления",
  "Напиши мне стихотворение",
];

export function SuggestionChips({ onSelect, visible }: SuggestionChipsProps) {
  if (!visible) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 px-2 sm:gap-3 sm:px-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          type="button"
          className="min-h-[44px] touch-manipulation rounded-full border border-border bg-secondary/50 px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary/10 hover:border-primary/30 hover:text-foreground active:scale-[0.98] sm:px-5"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
