import { useState } from "react";
import { QuizCard } from "./QuizCard";
import { Button } from "./ui/button";
import { PassMeter } from "./PassMeter";
import { ArrowRight, RefreshCw, Trophy, FileText } from "lucide-react";

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizViewProps {
  quizzes: Quiz[];
  onGoToNotes: () => void;
}

export const QuizView = ({ quizzes, onGoToNotes }: QuizViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (quizzes.length === 0) {
    return (
      <div className="space-y-8 animate-slide-up">
        <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 text-center shadow-card">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No Quizzes Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your notes or type them in to generate quizzes automatically using AI.
          </p>
          <Button variant="gradient" size="lg" onClick={onGoToNotes}>
            <FileText className="w-5 h-5 mr-2" />
            Add Notes to Generate Quizzes
          </Button>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentIndex];
  const passPercentage = Math.round((correctAnswers / quizzes.length) * 100);

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    setAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
    setAnswered(false);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <div className="space-y-8 animate-scale-in">
        <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-card text-center">
          <div className="w-20 h-20 mx-auto rounded-full gradient-accent flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-accent-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Quiz Complete!</h2>
          <p className="text-lg text-muted-foreground mb-6">
            You scored {correctAnswers} out of {quizzes.length}
          </p>
          
          <div className="max-w-md mx-auto mb-8">
            <PassMeter percentage={passPercentage} size="lg" />
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="gradient" size="lg" onClick={handleRestart}>
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Progress */}
      <div className="bg-card rounded-2xl border-2 border-border p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Quiz Progress</h2>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {quizzes.length}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: `${((currentIndex) / quizzes.length) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-success font-medium">✓ {correctAnswers} correct</span>
          <span className="text-muted-foreground">{currentIndex - correctAnswers} incorrect</span>
        </div>
      </div>

      {/* Quiz Card */}
      <QuizCard
        key={currentQuiz.id}
        question={currentQuiz.question}
        options={currentQuiz.options}
        correctIndex={currentQuiz.correctIndex}
        onAnswer={handleAnswer}
      />

      {/* Next Button */}
      {answered && (
        <div className="flex justify-center animate-slide-up">
          <Button variant="gradient" size="lg" onClick={handleNext}>
            {currentIndex < quizzes.length - 1 ? (
              <>
                Next Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                See Results
                <Trophy className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
