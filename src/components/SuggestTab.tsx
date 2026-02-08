import { useState } from "react";
import { Search, Plus, Check, Loader2, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarcodeScanner } from "./BarcodeScanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

interface SuggestTabProps {
  userName: string;
  userId: string;
}

export function SuggestTab({ userName, userId }: SuggestTabProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GoogleBook[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanResult = (result: string) => {
    setQuery(result);
    setShowScanner(false);
    // Optional: Direkt Suche auslösen
    setTimeout(() => search(), 100);
  };

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);

    // Bereinige Query für ISBN-Prüfung
    const cleanQuery = query.replace(/[-\s]/g, "");
    const isIsbn = /^\d{10}(\d{3})?$/.test(cleanQuery);
    const searchParam = isIsbn ? `isbn:${cleanQuery}` : query;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchParam)}&maxResults=10&key=${import.meta.env.VITE_GOOGLE_BOOKS_API_KEY}`;

    try {
      let res = await fetch(url);

      // Wenn Fehler 503 kommt: Kurz warten und nochmal probieren
      if (res.status === 503) {
        console.log("Server service unavailable (503), retry in 1s...");
        await new Promise((r) => setTimeout(r, 1000));
        res = await fetch(url);
      }

      if (res.status === 429) {
        toast.error("Google Books API-Limit erreicht. Bitte versuche es in ein paar Minuten erneut.");
        return;
      }
      if (!res.ok) {
        toast.error("Suche fehlgeschlagen");
        return;
      }
      const data = await res.json();
      setResults(data.items || []);
      if (!data.items?.length) {
        toast.info("Keine Ergebnisse gefunden");
      }
    } catch {
      toast.error("Suche fehlgeschlagen – prüfe deine Internetverbindung");
    } finally {
      setSearching(false);
    }
  };

  const addBook = async (book: GoogleBook) => {
    setAddingId(book.id);
    try {
      const { data: existing } = await supabase
        .from("books")
        .select("id")
        .eq("google_id", book.id)
        .maybeSingle();

      if (existing) {
        toast.info("Dieses Buch wurde bereits vorgeschlagen!");
        setAddedIds((s) => new Set(s).add(book.id));
        return;
      }

      const { error } = await supabase.from("books").insert({
        google_id: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.join(", ") || "Unbekannt",
        cover_url: book.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || "",
        description: book.volumeInfo.description || "",
        suggested_by: userName,
        user_id: userId,
      });

      if (error) throw error;
      setAddedIds((s) => new Set(s).add(book.id));
      toast.success(`„${book.volumeInfo.title}" hinzugefügt!`);
    } catch {
      toast.error("Fehler beim Hinzufügen");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="px-4 pb-24 pt-4">
      <h2 className="mb-4 text-2xl font-bold">Buch vorschlagen</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="mb-6 flex gap-2"
      >
        <Input
          placeholder="Titel oder ISBN suchen…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 rounded-xl bg-card"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-card border-none"
          onClick={() => setShowScanner(true)}
        >
          <Camera className="h-5 w-5" />
        </Button>
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-xl" disabled={searching}>
          {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </Button>
      </form>

      {showScanner && (
        <BarcodeScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}

      <AnimatePresence mode="popLayout">
        {results.map((book) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 flex gap-3 rounded-xl bg-card p-3 shadow-sm"
          >
            <img
              src={book.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || "/placeholder.svg"}
              alt={book.volumeInfo.title}
              className="h-24 w-16 shrink-0 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <p className="truncate font-semibold leading-tight">{book.volumeInfo.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {book.volumeInfo.authors?.join(", ") || "Unbekannt"}
                </p>
              </div>
              <Button
                size="sm"
                className="mt-2 w-fit rounded-lg"
                disabled={addedIds.has(book.id) || addingId === book.id}
                onClick={() => addBook(book)}
              >
                {addedIds.has(book.id) ? (
                  <>
                    <Check className="h-4 w-4" /> Hinzugefügt
                  </>
                ) : addingId === book.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Hinzufügen
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {results.length === 0 && !searching && (
        <div className="mt-16 text-center text-muted-foreground">
          <BookIcon className="mx-auto mb-3 h-16 w-16 opacity-30" />
          <p>Suche nach einem Buch, um es dem Buchclub vorzuschlagen</p>
        </div>
      )}
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
