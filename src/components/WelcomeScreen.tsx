import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WelcomeScreenProps {
  onSubmit: (name: string) => void;
}

export function WelcomeScreen({ onSubmit }: WelcomeScreenProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary"
        >
          <BookOpen className="h-10 w-10 text-primary-foreground" />
        </motion.div>

        <h1 className="mb-2 text-3xl font-bold text-foreground">Buchclub</h1>
        <p className="mb-8 text-muted-foreground">
          Entdeckt gemeinsam euer nächstes Lieblingsbuch
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Dein Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl bg-card text-center text-lg"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            className="h-12 w-full rounded-xl text-lg font-semibold"
          >
            Los geht's 📚
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
