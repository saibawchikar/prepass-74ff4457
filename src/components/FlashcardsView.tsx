import { useState } from "react";
import { FlashCard } from "./FlashCard";
import { Button } from "./ui/button";
import { PassMeter } from "./PassMeter";
import { ArrowLeft, ArrowRight, RotateCcw, Shuffle } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  strength: "weak" | "okay" | "strong";
}

const sampleFlashcards: Flashcard[] = [
  {
    id: "1",
    front: "What is Photosynthesis?",
    back: "The process by which plants convert light energy into chemical energy (glucose) using CO2 and water.",
    strength: "weak",
  },
  {
    id: "2",
    front: "Write the Photosynthesis equation",
    back: "6CO2 + 6H2O + light → C6H12O6 + 6O2",
    strength: "okay",
  },
  {
    id: "3",
    front: "Where does Photosynthesis occur?",
    back: "In chloroplasts, specifically in thylakoid membranes (light reactions) and stroma (Calvin cycle).",
    strength: "strong",
  },
  {
    id: "4",
    front: "Newton's First Law of Motion",
    back: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force (Law of Inertia).",
    strength: "weak",
  },
  {
    id: "5",
    front: "What is F = ma?",
    back: "Newton's Second Law: Force equals mass times acceleration. The acceleration of an object is directly proportional to the net force and inversely proportional to its mass.",
    strength: "okay",
  },
];

export const FlashcardsView = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    setFlashcards(cards =>
      cards.map((card, i) =>
        i === currentIndex ? { ...card, strength } : card
      )
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
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
