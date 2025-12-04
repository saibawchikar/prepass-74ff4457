import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DashboardView } from "@/components/DashboardView";
import { NotesView } from "@/components/NotesView";
import { FlashcardsView } from "@/components/FlashcardsView";
import { QuizView } from "@/components/QuizView";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GeneratedContent {
  flashcards: Array<{ front: string; back: string }>;
  quizzes: Array<{ question: string; options: string[]; correctIndex: number }>;
  importantPoints: string[];
  summary: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    flashcards, 
    quizzes, 
    importantPoints, 
    loading: dataLoading,
    addFlashcards,
    addQuizzes,
    addImportantPoints,
    updateFlashcard,
    deleteAllData,
    setFlashcards,
  } = useUserData();
  
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  const handleGenerateContent = async (content: GeneratedContent) => {
    await Promise.all([
      addFlashcards(content.flashcards),
      addQuizzes(content.quizzes),
      addImportantPoints(content.importantPoints),
    ]);
  };

  const handleUpdateFlashcards = (updated: typeof flashcards) => {
    // Find changed flashcard and update in DB
    updated.forEach(card => {
      const original = flashcards.find(f => f.id === card.id);
      if (original && original.strength !== card.strength) {
        updateFlashcard(card.id, card.strength);
      }
    });
    setFlashcards(updated);
  };

  const handleGoToNotes = () => {
    setActiveTab("notes");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* User Menu */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all your data?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your flashcards, quizzes, and important points. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>

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
