import { PassMeter } from "./PassMeter";
import { StatCard } from "./StatCard";
import { Button } from "./ui/button";
import { Brain, Clock, Flame, Sparkles, Target, Zap } from "lucide-react";

interface DashboardViewProps {
  stats: {
    flashcardsStudied: number;
    quizzesCompleted: number;
    streakDays: number;
    passPercentage: number;
    weakCards: number;
    studyMinutes: number;
  };
  onStartStudy: () => void;
}

export const DashboardView = ({ stats, onStartStudy }: DashboardViewProps) => {
  const cardsNeeded = Math.max(0, Math.ceil((80 - stats.passPercentage) * 2));

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Hero Section */}
      <div className="bg-card rounded-2xl border-2 border-border p-8 shadow-card">
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                Welcome back! 👋
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Let's make sure you pass today.
              </p>
            </div>

            <div className="max-w-md">
              <PassMeter percentage={stats.passPercentage} size="lg" />
            </div>

            {stats.passPercentage < 80 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
                <Target className="w-4 h-4 text-accent" />
                <span>Study <strong className="text-foreground">{cardsNeeded} more flashcards</strong> to reach 80% confidence</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button variant="gradient" size="lg" onClick={onStartStudy}>
                <Zap className="w-5 h-5" />
                Quick Study Session
              </Button>
              <Button variant="outline" size="lg">
                <Sparkles className="w-5 h-5" />
                Today's Essentials
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Streak"
                value={`${stats.streakDays} days`}
                icon={Flame}
                variant="accent"
                subtitle="Keep it up!"
                trend="up"
              />
              <StatCard
                title="Flashcards"
                value={stats.flashcardsStudied}
                icon={Brain}
                variant="primary"
                subtitle="This week"
              />
              <StatCard
                title="Weak Cards"
                value={stats.weakCards}
                icon={Target}
                variant="default"
                subtitle="Need review"
              />
              <StatCard
                title="Study Time"
                value={`${stats.studyMinutes}m`}
                icon={Clock}
                variant="success"
                subtitle="Today"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Plan */}
      <div className="bg-card rounded-2xl border-2 border-border p-6 shadow-card">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Target className="w-4 h-4 text-accent-foreground" />
          </div>
          Pass Guarantee Path
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-foreground">20 Flashcards</h3>
            <p className="text-sm text-muted-foreground">Most important concepts</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="text-2xl mb-2">✍️</div>
            <h3 className="font-semibold text-foreground">5 Quizzes</h3>
            <p className="text-sm text-muted-foreground">Test your knowledge</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="text-2xl mb-2">⏱️</div>
            <h3 className="font-semibold text-foreground">20 Minutes</h3>
            <p className="text-sm text-muted-foreground">Total time needed</p>
          </div>
        </div>
      </div>
    </div>
  );
};
