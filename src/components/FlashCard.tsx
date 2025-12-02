import { useState } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface FlashCardProps {
  front: string;
  back: string;
  strength?: "weak" | "okay" | "strong";
  onStrengthChange?: (strength: "weak" | "okay" | "strong") => void;
}

export const FlashCard = ({ front, back, strength = "weak", onStrengthChange }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const strengthColors = {
    weak: "border-destructive/50 bg-destructive/5",
    okay: "border-warning/50 bg-warning/5",
    strong: "border-success/50 bg-success/5",
  };

  const strengthBadgeColors = {
    weak: "bg-destructive/10 text-destructive",
    okay: "bg-warning/10 text-warning",
    strong: "bg-success/10 text-success",
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className={cn(
          "flip-card cursor-pointer",
          isFlipped && "flipped"
        )}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flip-card-inner relative w-full" style={{ minHeight: "280px" }}>
          {/* Front */}
          <div
            className={cn(
              "flip-card-front absolute inset-0 rounded-2xl border-2 p-8 shadow-card flex flex-col items-center justify-center text-center transition-all",
              strengthColors[strength]
            )}
          >
            <span className={cn("absolute top-4 left-4 text-xs font-semibold px-2 py-1 rounded-full", strengthBadgeColors[strength])}>
              {strength.charAt(0).toUpperCase() + strength.slice(1)}
            </span>
            <span className="absolute top-4 right-4 text-muted-foreground">
              <RotateCcw className="w-5 h-5" />
            </span>
            <p className="text-xl font-semibold text-foreground leading-relaxed">{front}</p>
            <p className="mt-4 text-sm text-muted-foreground">Tap to reveal answer</p>
          </div>
          
          {/* Back */}
          <div
            className={cn(
              "flip-card-back absolute inset-0 rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 shadow-card flex flex-col items-center justify-center text-center"
            )}
          >
            <span className="absolute top-4 right-4 text-muted-foreground">
              <RotateCcw className="w-5 h-5" />
            </span>
            <p className="text-xl font-medium text-foreground leading-relaxed">{back}</p>
            <p className="mt-4 text-sm text-muted-foreground">Tap to see question</p>
          </div>
        </div>
      </div>

      {/* Strength Buttons */}
      {onStrengthChange && (
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStrengthChange("weak");
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              strength === "weak"
                ? "bg-destructive text-destructive-foreground"
                : "bg-destructive/10 text-destructive hover:bg-destructive/20"
            )}
          >
            😟 Weak
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStrengthChange("okay");
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              strength === "okay"
                ? "bg-warning text-warning-foreground"
                : "bg-warning/10 text-warning hover:bg-warning/20"
            )}
          >
            🤔 Okay
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStrengthChange("strong");
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              strength === "strong"
                ? "bg-success text-success-foreground"
                : "bg-success/10 text-success hover:bg-success/20"
            )}
          >
            😎 Strong
          </button>
        </div>
      )}
    </div>
  );
};
