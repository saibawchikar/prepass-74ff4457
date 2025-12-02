import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DashboardView } from "@/components/DashboardView";
import { NotesView } from "@/components/NotesView";
import { FlashcardsView } from "@/components/FlashcardsView";
import { QuizView } from "@/components/QuizView";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    flashcardsStudied: 47,
    quizzesCompleted: 12,
    streakDays: 5,
    passPercentage: 67,
    weakCards: 8,
    studyMinutes: 35,
  });

  const handleStartStudy = () => {
    setActiveTab("flashcards");
  };

  const handleGenerateFlashcards = (notes: string) => {
    toast.success("Flashcards generated!", {
      description: "Your new flashcards are ready to study.",
    });
    setStats(prev => ({
      ...prev,
      flashcardsStudied: prev.flashcardsStudied + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "dashboard" && (
          <DashboardView stats={stats} onStartStudy={handleStartStudy} />
        )}
        {activeTab === "notes" && (
          <NotesView onGenerateFlashcards={handleGenerateFlashcards} />
        )}
        {activeTab === "flashcards" && <FlashcardsView />}
        {activeTab === "quiz" && <QuizView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built to make you pass. 📚 PassMate © 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
