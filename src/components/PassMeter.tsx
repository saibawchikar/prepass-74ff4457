import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface PassMeterProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  hasData?: boolean;
}

export const PassMeter = ({ percentage, showLabel = true, size = "md", hasData = true }: PassMeterProps) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(hasData ? percentage : 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, hasData]);

  const getStatusColor = () => {
    if (!hasData) return "text-muted-foreground";
    if (percentage < 40) return "text-destructive";
    if (percentage < 70) return "text-warning";
    return "text-success";
  };

  const getStatusText = () => {
    if (!hasData) return "Add flashcards to calculate";
    if (percentage < 40) return "Needs Work";
    if (percentage < 70) return "Getting There";
    if (percentage < 85) return "Almost Ready";
    return "Ready to Pass!";
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  if (!hasData) {
    return (
      <div className="space-y-2">
        {showLabel && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Pass Probability</span>
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              N/A
            </span>
          </div>
        )}
        <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
          <div className="h-full bg-muted-foreground/20 rounded-full w-full" />
        </div>
        {showLabel && (
          <p className="text-sm text-muted-foreground">
            {getStatusText()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Pass Probability</span>
          <span className={cn("text-lg font-bold", getStatusColor())}>
            {Math.round(animatedPercentage)}%
          </span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizeClasses[size])}>
        <div
          className="h-full gradient-meter rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <p className={cn("text-sm font-medium", getStatusColor())}>
          {getStatusText()}
        </p>
      )}
    </div>
  );
};
