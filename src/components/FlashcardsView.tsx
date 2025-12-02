import { useState } from "react";
import { FlashCard } from "./FlashCard";
import { Button } from "./ui/button";
import { PassMeter } from "./PassMeter";
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle, FileText } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  strength: "weak" | "okay" | "strong";
}

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  onUpdateFlashcards: (flashcards: Flashcard[]) => void;
  onGoToNotes: () => void;
}

export const FlashcardsView = ({ flashcards, onUpdateFlashcards, onGoToNotes }: FlashcardsViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (flashcards.length === 0) {
    return (
      <div className="space-y-8 animate-slide-up">
        <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 text-center shadow-card">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Flashcards Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your notes or type them in to generate flashcards automatically using AI.
          </p>
          <Button variant="gradient" size="lg" onClick={onGoToNotes}>
            <FileText className="w-5 h-5 mr-2" />
            Add Notes to Generate Flashcards
          </Button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  
  const stats = {
    weak: flashcards.filter(f => f.strength === "weak").length,
    okay: flashcards.filter(f => f.strength === "okay").length,
    strong: flashcards.filter(f => f.strength === "strong").length,
  };

  const passPercentage = Math.round(
    ((stats.strong * 100 + stats.okay * 50) / (flashcards.length * 100)) * 100
  );

  const handleStrengthChange = (strength: "weak" | "okay" | "strong") => {
    const updated = flashcards.map((card, i) =>
      i === currentIndex ? { ...card, strength } : card
    );
    onUpdateFlashcards(updated);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    onUpdateFlashcards(shuffled);
    setCurrentIndex(0);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Progress Section */}
      <div className="bg-card rounded-2xl border-2 border-border p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground mb-3">Session Progress</h2>
            <PassMeter percentage={passPercentage} size="md" />
          </div>
          <div className="flex gap-4 text-center">
            <div className="px-4 py-3 bg-destructive/10 rounded-xl">
              <div className="text-2xl font-bold text-destructive">{stats.weak}</div>
              <div className="text-xs text-muted-foreground">Weak</div>
            </div>
            <div className="px-4 py-3 bg-warning/10 rounded-xl">
              <div className="text-2xl font-bold text-warning">{stats.okay}</div>
              <div className="text-xs text-muted-foreground">Okay</div>
            </div>
            <div className="px-4 py-3 bg-success/10 rounded-xl">
              <div className="text-2xl font-bold text-success">{stats.strong}</div>
              <div className="text-xs text-muted-foreground">Strong</div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Navigation */}
      <div className="text-center text-sm text-muted-foreground">
        Card {currentIndex + 1} of {flashcards.length}
      </div>

      {/* Flashcard */}
      <FlashCard
        front={currentCard.front}
        back={currentCard.back}
        strength={currentCard.strength}
        onStrengthChange={handleStrengthChange}
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="icon" onClick={handlePrev}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button variant="outline" onClick={handleShuffle}>
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle
        </Button>
        <Button variant="outline" onClick={handleRestart}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
        <Button variant="outline" size="icon" onClick={handleNext}>
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
