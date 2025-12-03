import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "primary" | "accent" | "success";
}

export const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatCardProps) => {
  const variantClasses = {
    default: "bg-card border-border",
    primary: "bg-primary/5 border-primary/20",
    accent: "bg-accent/5 border-accent/20",
    success: "bg-success/5 border-success/20",
  };

  const iconVariantClasses = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    success: "bg-success/10 text-success",
  };

  return (
    <div className={cn(
      "rounded-xl border-2 p-4 transition-all hover:shadow-card overflow-hidden",
      variantClasses[variant]
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground truncate">{value}</p>
          {subtitle && (
            <p className={cn(
              "mt-1 text-xs truncate",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              !trend && "text-muted-foreground"
            )}>
              {trend === "up" && "↑ "}
              {trend === "down" && "↓ "}
              {subtitle}
            </p>
          )}
        </div>
        <div className={cn(
          "rounded-lg p-2 shrink-0",
          iconVariantClasses[variant]
        )}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
