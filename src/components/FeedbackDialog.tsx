import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackDialogProps {
    userId?: string;
}

export function FeedbackDialog({ userId }: FeedbackDialogProps) {
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!feedback.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("feedback").insert({
                content: feedback,
                user_id: userId,
            });

            if (error) throw error;

            toast({
                title: "Feedback gesendet!",
                description: "Vielen Dank für deine Rückmeldung.",
                variant: "default",
            });
            setFeedback("");
            setOpen(false);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast({
                title: "Fehler beim Senden",
                description: "Bitte versuche es später erneut.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted"
                >
                    <MessageSquare className="h-5 w-5" />
                    <span className="sr-only">Feedback geben</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Feedback geben</DialogTitle>
                    <DialogDescription>
                        Hilf uns, die App zu verbessern! Hast du Wünsche, Bugs gefunden oder einfach eine Idee?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Dein Feedback hier..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[100px]"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !feedback.trim()}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Senden...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Senden
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
