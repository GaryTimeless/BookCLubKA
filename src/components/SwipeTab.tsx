import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Heart, X, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SwipeCard } from "./SwipeCard";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
}

interface SwipeTabProps {
  userName: string;
  userId: string;
}

export function SwipeTab({ userName, userId }: SwipeTabProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data: votedBookIds } = await supabase
        .from("votes")
        .select("book_id")
        .or(`user_id.eq.${userId},user_name.eq.${userName}`);

      const votedIds = (votedBookIds || []).map((v) => v.book_id);

      let query = supabase.from("books").select("id, title, author, cover_url");
      if (votedIds.length > 0) {
        query = query.not("id", "in", `(${votedIds.join(",")})`);
      }

      const { data } = await query.order("created_at", { ascending: false });
      setBooks(data || []);
    } catch {
      toast.error("Fehler beim Laden der Bücher");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleSwipe = async (direction: "left" | "right") => {
    const currentBook = books[0];
    if (!currentBook) return;

    setBooks((prev) => prev.slice(1));

    try {
      await supabase.from("votes").insert({
        book_id: currentBook.id,
        user_name: userName,
        user_id: userId,
        vote_value: direction === "right" ? 1 : -1,
      });
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center px-6 text-center">
        <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h3 className="text-xl font-bold">Alle Bücher bewertet!</h3>
        <p className="mt-2 text-muted-foreground">
          Schlag neue Bücher vor oder warte auf Vorschläge deines Buchclubs.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 pb-24 pt-4">
      <h2 className="mb-4 self-start text-2xl font-bold">Swipen</h2>

      <div className="relative h-[60vh] w-full max-w-sm">
        <AnimatePresence>
          {books.slice(0, 2).map((book, i) => (
            <SwipeCard
              key={book.id}
              book={book}
              isTop={i === 0}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-6">
        <Button
          size="icon"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => handleSwipe("left")}
        >
          <X className="h-7 w-7" />
        </Button>
        <Button
          size="icon"
          className="h-16 w-16 rounded-full bg-success text-success-foreground hover:bg-success/90"
          onClick={() => handleSwipe("right")}
        >
          <Heart className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
}
