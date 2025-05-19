import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-md w-9 h-9 flex items-center justify-center hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
      )}
    </button>
  );
}