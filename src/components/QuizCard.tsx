import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuizCardProps {
  question: string;
  options: string[];
  correctIndex: number;
  onAnswer: (isCorrect: boolean) => void;
}

export const QuizCard = ({ question, options, correctIndex, onAnswer }: QuizCardProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setShowResult(true);
    onAnswer(selectedIndex === correctIndex);
  };

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return selectedIndex === index
        ? "border-primary bg-primary/10"
        : "border-border hover:border-primary/50 hover:bg-primary/5";
    }
    
    if (index === correctIndex) {
      return "border-success bg-success/10";
    }
    
    if (index === selectedIndex && index !== correctIndex) {
      return "border-destructive bg-destructive/10";
    }
    
    return "border-border opacity-50";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-scale-in">
      <div className="bg-card rounded-2xl border-2 border-border p-6 shadow-card">
        <p className="text-lg font-semibold text-foreground leading-relaxed">{question}</p>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={showResult}
            className={cn(
              "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3",
              getOptionClass(index)
            )}
          >
            <span className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              selectedIndex === index && !showResult && "bg-primary text-primary-foreground",
              showResult && index === correctIndex && "bg-success text-success-foreground",
              showResult && index === selectedIndex && index !== correctIndex && "bg-destructive text-destructive-foreground",
              !showResult && selectedIndex !== index && "bg-muted text-muted-foreground"
            )}>
              {showResult && index === correctIndex ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : showResult && index === selectedIndex ? (
                <XCircle className="w-5 h-5" />
              ) : (
                String.fromCharCode(65 + index)
              )}
            </span>
            <span className="text-foreground font-medium">{option}</span>
          </button>
        ))}
      </div>

      {!showResult && (
        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          onClick={handleSubmit}
          disabled={selectedIndex === null}
        >
          Check Answer
        </Button>
      )}

      {showResult && (
        <div className={cn(
          "p-4 rounded-xl text-center",
          selectedIndex === correctIndex ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          <p className="font-semibold text-lg">
            {selectedIndex === correctIndex ? "🎉 Correct!" : "😅 Not quite right"}
          </p>
        </div>
      )}
    </div>
  );
};
