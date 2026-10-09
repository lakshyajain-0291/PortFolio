import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { toast } from "../../src/hooks/use-toast";

const resolve = (theme: string) =>
  theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : theme;

/**
 * Quiet light/dark switch. The old "are you sure about light mode?" joke lives
 * on as a one-line toast instead of a blocking dialog.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const current = resolve(theme);
  const next = current === "dark" ? "light" : "dark";

  const handleToggle = () => {
    setTheme(next);
    toast(
      next === "light"
        ? { title: "light_mode: on", description: "A bold choice for a developer portfolio. Respect." }
        : { title: "dark_mode: restored", description: "System stability restored. Your retinas thank you." },
    );
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[2px] text-muted-foreground transition-colors hover:text-foreground"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ y: 10, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -10, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.1, 1] }}
          className="block"
        >
          {current === "dark" ? <Sun size={17} strokeWidth={1.6} /> : <Moon size={17} strokeWidth={1.6} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
