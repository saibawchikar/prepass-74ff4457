import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardView } from "@/components/DashboardView";
import { NotesView } from "@/components/NotesView";
import { FlashcardsView } from "@/components/FlashcardsView";
import { QuizView } from "@/components/QuizView";
import { Toaster } from "@/components/ui/sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  strength: "weak" | "okay" | "strong";
}

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface GeneratedContent {
  flashcards: Array<{ front: string; back: string }>;
  quizzes: Array<{ question: string; options: string[]; correctIndex: number }>;
  importantPoints: string[];
  summary: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [importantPoints, setImportantPoints] = useState<string[]>([]);

  const stats = {
    flashcardsStudied: flashcards.length,
    quizzesCompleted: quizzes.length,
    streakDays: flashcards.length > 0 ? 1 : 0,
    passPercentage: flashcards.length > 0 
      ? Math.round(
          ((flashcards.filter(f => f.strength === "strong").length * 100 + 
            flashcards.filter(f => f.strength === "okay").length * 50) / 
           (flashcards.length * 100)) * 100
        )
      : 0,
    weakCards: flashcards.filter(f => f.strength === "weak").length,
    studyMinutes: flashcards.length * 2,
  };

  const handleStartStudy = () => {
    if (flashcards.length > 0) {
      setActiveTab("flashcards");
    } else {
      setActiveTab("notes");
    }
  };

  const handleGenerateContent = (content: GeneratedContent) => {
    // Convert generated flashcards to our format
    const newFlashcards: Flashcard[] = content.flashcards.map((fc, index) => ({
      id: `fc-${Date.now()}-${index}`,
      front: fc.front,
      back: fc.back,
      strength: "weak" as const,
    }));

    // Convert generated quizzes to our format
    const newQuizzes: Quiz[] = content.quizzes.map((q, index) => ({
      id: `quiz-${Date.now()}-${index}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
    }));

    setFlashcards(prev => [...prev, ...newFlashcards]);
    setQuizzes(prev => [...prev, ...newQuizzes]);
    setImportantPoints(prev => [...prev, ...content.importantPoints]);
  };

  const handleUpdateFlashcards = (updated: Flashcard[]) => {
    setFlashcards(updated);
  };

  const handleGoToNotes = () => {
    setActiveTab("notes");
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <DashboardView 
            stats={stats} 
            onStartStudy={handleStartStudy}
            importantPoints={importantPoints}
          />
        )}
        {activeTab === "notes" && (
          <NotesView onGenerateFlashcards={handleGenerateContent} />
        )}
        {activeTab === "flashcards" && (
          <FlashcardsView 
            flashcards={flashcards}
            onUpdateFlashcards={handleUpdateFlashcards}
            onGoToNotes={handleGoToNotes}
          />
        )}
        {activeTab === "quiz" && (
          <QuizView 
            quizzes={quizzes}
            onGoToNotes={handleGoToNotes}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built to make you pass. 📚 Prepass © 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
