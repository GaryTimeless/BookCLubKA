import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav, type TabType } from "@/components/BottomNav";
import { SuggestTab } from "@/components/SuggestTab";
import { SwipeTab } from "@/components/SwipeTab";
import { RankingTab } from "@/components/RankingTab";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

const Index = () => {
  const { user, loading, displayName, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("swipe");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const userName = displayName || user.email || "User";

  return (
    <div className="mx-auto min-h-screen max-w-md bg-background">
      <header className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hallo, {userName}</span>
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600 border border-green-200 flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            LIVE
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full text-muted-foreground hover:bg-muted"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </header>
      {activeTab === "suggest" && <SuggestTab userName={userName} userId={user.id} />}
      {activeTab === "swipe" && <SwipeTab userName={userName} userId={user.id} />}
      {activeTab === "ranking" && <RankingTab />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
