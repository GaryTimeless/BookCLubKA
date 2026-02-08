import { BookPlus, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "suggest" | "swipe" | "ranking";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "suggest", label: "Vorschlagen", icon: BookPlus },
  { id: "swipe", label: "Swipen", icon: Flame },
  { id: "ranking", label: "Ranking", icon: Trophy },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors",
              activeTab === id
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-6 w-6", activeTab === id && "fill-primary/20")} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
