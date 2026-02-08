import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface RankedBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  likes: number;
  likedBy: string[];
}

export function RankingTab() {
  const [books, setBooks] = useState<RankedBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: allBooks } = await supabase
        .from("books")
        .select("id, title, author, cover_url");

      const { data: allVotes } = await supabase
        .from("votes")
        .select("book_id, user_name, vote_value");

      if (!allBooks) {
        setLoading(false);
        return;
      }

      const ranked: RankedBook[] = allBooks.map((book) => {
        const bookVotes = (allVotes || []).filter((v) => v.book_id === book.id);
        const likes = bookVotes.filter((v) => v.vote_value === 1).length;
        const likedBy = bookVotes
          .filter((v) => v.vote_value === 1)
          .map((v) => v.user_name);
        return { ...book, likes, likedBy };
      });

      ranked.sort((a, b) => b.likes - a.likes);
      setBooks(ranked);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-4">
      <h2 className="mb-4 text-2xl font-bold">Ranking</h2>

      {books.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">
          Noch keine Bücher vorgeschlagen.
        </p>
      ) : (
        books.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="mb-3 flex gap-3 rounded-xl bg-card p-3 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {i + 1}
            </div>
            <img
              src={book.cover_url || "/placeholder.svg"}
              alt={book.title}
              className="h-20 w-14 shrink-0 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="truncate font-semibold leading-tight">{book.title}</p>
                <p className="truncate text-sm text-muted-foreground">{book.author}</p>
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Heart className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium text-primary">{book.likes}</span>
                {book.likedBy.length > 0 && (
                  <span className="ml-1 truncate text-muted-foreground">
                    · {book.likedBy.join(", ")}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
