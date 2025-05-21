import * as React from "react";
import { createPortal } from "react-dom";
import { Moon, Sun, AlertTriangle, X, Terminal, ThumbsUp, Check } from "lucide-react";
import { useTheme } from "./theme-provider";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [showLightModeWarning, setShowLightModeWarning] = React.useState(false);
  const [showDarkModeMessage, setShowDarkModeMessage] = React.useState(false);

  const handleThemeToggle = () => {
    if (theme === "dark" && !showLightModeWarning) {
      // Scroll to top of the page with smooth animation
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
      
      // Show warning after scrolling completes
      setTimeout(() => {
        setShowLightModeWarning(true);
        // Prevent scrolling when dialog is open
        document.body.style.overflow = "hidden";
      }, 500); // Wait for scroll animation to complete
    } else if (theme === "light") {
      // Switch to dark mode immediately
      setTheme("dark");
      
      // Show the dark mode message briefly
      setShowDarkModeMessage(true);
      document.body.style.overflow = "hidden";
      
      // Auto-dismiss after 2.5 seconds
      setTimeout(() => {
        setShowDarkModeMessage(false);
        document.body.style.overflow = "";
      }, 2500);
    } else {
      // Normal toggle behavior
      setTheme(theme === "system" ? "dark" : "light");
      setShowLightModeWarning(false);
    }
  };
  
  // Close dialog and restore scrolling
  const closeDialog = () => {
    setShowLightModeWarning(false);
    document.body.style.overflow = "";
  };
  
  // Close dark mode message
  const closeDarkModeMessage = () => {
    setShowDarkModeMessage(false);
    document.body.style.overflow = "";
  };

  return (
    <>
      <button
        onClick={handleThemeToggle}
        className="rounded-md w-9 h-9 flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />
        ) : (
          <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
        )}
      </button>

      {/* Light Mode Warning Dialog */}
      <AnimatePresence>
        {showLightModeWarning && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              className="bg-gray-900 border-2 border-primary shadow-xl shadow-primary/40 rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Terminal size={24} className="text-primary" />
                  <h3 className="text-xl font-mono font-bold text-white">$ sudo warning</h3>
                </div>
                <button
                  onClick={closeDialog}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="mt-1 bg-yellow-600/40 p-1.5 rounded-full">
                    <AlertTriangle size={20} className="text-yellow-300" />
                  </span>
                  <div>
                    <p className="text-white font-medium">
                      <span className="font-mono text-primary font-bold">"light_mode"</span> may not be set properly since this is a developer's portfolio.
                    </p>
                    <p className="mt-2 text-gray-300 text-sm">
                      Developers prefer dark mode for coding. Are you sure you want to continue?
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded border border-primary/40 font-mono text-sm text-gray-200">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">$</span>
                    <span>Warning: Light mode detected. Proceed with caution!</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeDialog}
                    className="px-4 py-2 rounded border-2 border-primary/70 text-primary font-medium hover:bg-primary/20 transition-colors text-base"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setTheme("light");
                      closeDialog();
                    }}
                    className="px-4 py-2 rounded bg-primary text-gray-900 font-bold hover:bg-primary/90 transition-colors text-base"
                  >
                    <span className="font-mono">I understand the risks</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dark Mode Success Message */}
      <AnimatePresence>
        {showDarkModeMessage && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <motion.div
              className="bg-gray-900 border-2 border-primary shadow-xl shadow-primary/40 rounded-lg p-6 max-w-md w-full mx-4"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Check size={24} className="text-green-400" />
                  <h3 className="text-xl font-mono font-bold text-white">$ status_update</h3>
                </div>
                <button
                  onClick={closeDarkModeMessage}
                  className="text-gray-300 hover:text-white transition-colors"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="mt-1 bg-green-600/40 p-1.5 rounded-full">
                    <ThumbsUp size={20} className="text-green-300" />
                  </span>
                  <div>
                    <p className="text-white font-medium">
                      Good to see you getting back to your senses!
                    </p>
                    <p className="mt-2 text-gray-300 text-sm">
                      Dark mode activated. Your eyes and developer cred thank you.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded border border-green-500/40 font-mono text-sm text-gray-200">
                  <div className="flex gap-2">
                    <span className="text-green-400 font-bold">$</span>
                    <span className="typing-animation">Dark mode initialized. System stability restored.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}