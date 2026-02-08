import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const nameSchema = z.string().trim().min(1, "Name ist erforderlich").max(50, "Max. 50 Zeichen");
const pinSchema = z.string().regex(/^\d{4}$/, "PIN muss genau 4 Ziffern haben");

function nameToEmail(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
  return `${slug}@buchclub.local`;
}

function pinToPassword(pin: string): string {
  return `buchclub-pin-${pin}`;
}

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      toast.error(nameResult.error.errors[0].message);
      return;
    }
    const pinResult = pinSchema.safeParse(pin);
    if (!pinResult.success) {
      toast.error(pinResult.error.errors[0].message);
      return;
    }

    const email = nameToEmail(nameResult.data);
    const password = pinToPassword(pin);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Dieser Name ist bereits vergeben. Bitte einloggen.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data.user) {
          await supabase.from("profiles").insert({
            user_id: data.user.id,
            display_name: nameResult.data,
          });
          toast.success("Willkommen im Buchclub!");
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error("Name oder PIN falsch.");
          return;
        }
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
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

        <AnimatePresence mode="wait">
          <motion.div
            key={isSignUp ? "signup" : "login"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="mb-2 text-3xl font-bold text-foreground">Buchclub</h1>
            <p className="mb-8 text-muted-foreground">
              {isSignUp ? "Werde Teil unserer Leserunde 🌱" : "Schön, dass du wieder da bist 👋"}
            </p>
          </motion.div>
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Dein Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl bg-card text-center text-lg"
            autoFocus
          />
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-stelliger PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            className="h-12 rounded-xl bg-card text-center text-lg tracking-[0.5em]"
          />
          <Button
            type="submit"
            disabled={loading || !name.trim() || pin.length !== 4}
            className="h-12 w-full rounded-xl text-lg font-semibold"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isSignUp ? (
              "Beitreten 📚"
            ) : (
              "Einloggen 📚"
            )}
          </Button>
        </form>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 text-sm text-muted-foreground underline"
        >
          {isSignUp ? "Schon dabei? Einloggen" : "Neu hier? Beitreten"}
        </button>
      </motion.div>
    </div>
  );
}
