import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PassMeterProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PassMeter = ({ percentage, showLabel = true, size = "md" }: PassMeterProps) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getStatusColor = () => {
    if (percentage < 40) return "text-destructive";
    if (percentage < 70) return "text-warning";
    return "text-success";
  };

  const getStatusText = () => {
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
