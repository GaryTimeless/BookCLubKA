import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Heart, X } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
}

interface SwipeCardProps {
  book: Book;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}

export function SwipeCard({ book, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const dislikeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      initial={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      animate={{ scale: isTop ? 1 : 0.95, opacity: isTop ? 1 : 0.7 }}
      exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-card shadow-lg">
        {/* Cover image */}
        <div className="flex h-[65%] items-center justify-center bg-secondary/50 p-6">
          <img
            src={book.cover_url || "/placeholder.svg"}
            alt={book.title}
            className="max-h-full rounded-lg object-contain shadow-md"
          />
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="text-xl font-bold leading-tight">{book.title}</h3>
          <p className="mt-1 text-muted-foreground">{book.author}</p>
        </div>

        {/* Swipe overlays */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-success/20"
          style={{ opacity: likeOpacity }}
        >
          <Heart className="h-24 w-24 text-success fill-success" />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-destructive/20"
          style={{ opacity: dislikeOpacity }}
        >
          <X className="h-24 w-24 text-destructive" />
        </motion.div>
      </div>
    </motion.div>
  );
}
