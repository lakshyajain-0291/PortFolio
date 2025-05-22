// Easter Egg Utilities for Terminal Portfolio
// Collection of fun terminal Easter eggs

// ASCII Arts Collection
export const ASCII_ARTS = {
  // ASCII glitch effect for typos or invalid commands
  GLITCH: `
▒█▀▀▄ █▀▀ █▄░▄█ █▀▀█ █▀▀█ █▀▀█ █░░ 　 █▀▀ █▀▀█ █▀▀█ █▀▀█ █▀▀█ 
▒█░▒█ █▀▀ █▒█▒█ █▄▄█ █░░█ █▄▄▀ █░░ 　 █▀▀ █▄▄▀ █▄▄▀ █░░█ █▄▄▀ 
▒█▄▄▀ ▀▀▀ ▀░░▒▀ ▀░░▀ █▀▀▀ ▀░▀▀ ▀▀▀ 　 ▀▀▀ ▀░▀▀ ▀░▀▀ ▀▀▀▀ ▀░▀▀
  `,
  
  // ASCII coffee when typing "coffee" or "break"
  COFFEE: `
   ( (
    ) )
  ........
  |      |]
  \\      /
   '----'
  `,
  
  // ASCII rocket for "launch" command
  ROCKET: `
      /\\
     /  \\
    |    |
    |    |
    |    |
   /|    |\\
  / |    | \\
 /__|____|__\\
     /\\
    /  \\
    ^^^^
  `,
  
  // ASCII matrix rain for "rain" command
  MATRIX_RAIN: `
 1  0  1  0  1  0  1  0  1  0
   0  1  0  1  0     0  1  0  1
 0     0     0  1  0  1     0
   1  0  1  0     0  1  0  1  0
 1     1     1  0  1     1
   0  1  0  1  0  1  0     0  1
 0     0  1     0     0  1  0
  `,
  
  // ASCII cow for cowsay "moo" command
  COW: `
         \\   ^__^
          \\  (oo)\\_______
             (__)\\       )\\/\\
                 ||----w |
                 ||     ||
  `
};

// Console game: typing speed test with dynamic quotes
export const TYPING_TEST = {
  quotes: [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "The best error message is the one that never shows up.",
    "Code is like humor. When you have to explain it, it's bad.",
    "Good code is its own best documentation.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "First, solve the problem. Then, write the code.",
    "Experience is the name everyone gives to their mistakes.",
    "It's not a bug, it's an undocumented feature.",
    "The most disastrous thing that you can ever learn is your first programming language.",
    "Java is to JavaScript what car is to carpet.",
    "When debugging, novices insert corrective code; experts remove defective code.",
    "A user interface is like a joke. If you have to explain it, it's not that good.",
    "Software and cathedrals are much the same — first we build them, then we pray.",
    "Programming today is a race between software engineers striving to build bigger and better idiot-proof programs, and the Universe trying to produce bigger and better idiots. So far, the Universe is winning.",
    "There are only two hard things in Computer Science: cache invalidation and naming things.",
    "Debugging is like being the detective in a crime movie where you are also the murderer.",
    "The best programmers are not marginally better than merely good ones. They are an order-of-magnitude better.",
    "If debugging is the process of removing software bugs, then programming must be the process of putting them in.",
    "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live.",
    "The trouble with programmers is that you can never tell what a programmer is doing until it's too late.",
    "That's the thing about people who think they hate computers. What they really hate is lousy programmers."
  ],
  
  // Try to fetch quotes from the internet, fallback to hardcoded ones
  fetchQuotes: async (): Promise<string[]> => {
    try {
      // Attempt to fetch quotes from an API with CORS handling
      const response = await fetch('https://type.fit/api/quotes', {
        mode: 'cors', // Explicitly set CORS mode
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn('Could not fetch quotes, using fallback quotes');
        return TYPING_TEST.quotes;
      }
      
      const quotes = await response.json();
      
      // Extract and filter quotes (keep only medium-length ones)
      const filteredQuotes = quotes
        .filter((q: any) => q.text && q.text.length > 30 && q.text.length < 150)
        .map((q: any) => q.text);
      
      // Return fetched quotes or fallback if empty
      return filteredQuotes.length > 5 ? filteredQuotes : TYPING_TEST.quotes;
    } catch (error) {
      console.warn('Failed to fetch quotes due to CORS or network error, using fallback quotes');
      // Simply return the default quotes without showing an error
      return TYPING_TEST.quotes;
    }
  },
  
  // Start a typing test
  start: async () => {
    // Always use local quotes - skipping network request to avoid CORS issues
    const quotes = TYPING_TEST.quotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    return { quote: randomQuote, startTime: Date.now() };
  },
  
  // Calculate typing speed (WPM)
  calculateSpeed: (quote: string, timeMs: number) => {
    const words = quote.split(' ').length;
    const minutes = timeMs / (1000 * 60);
    return Math.round(words / minutes);
  }
};

// Fun terminal responses for various commands or typos
export const generateRandomResponse = (command: string): string | null => {
  // Check if it's a typo or unknown command
  if (command.length > 2) {
    // Common typos and their Easter egg responses
    const typos: Record<string, string> = {
      'hlep': "I think you meant 'help'. Let me help you with that!",
      'clea': "Almost there! Try 'clear' to clean the terminal.",
      'eixt': "Want to exit? Just type 'exit'.",
      'clera': "Did you mean 'clear'? My keyboard gets sticky sometimes too."
    };
    
    if (typos[command]) {
      return typos[command];
    }
  }
  
  // Special keywords that trigger Easter eggs
  if (command === 'coffee' || command === 'break') {
    return `Taking a coffee break?\n${ASCII_ARTS.COFFEE}\nHere's a virtual cup for you!`;
  }
  
  if (command === 'launch' || command === 'rocket') {
    return `Initiating launch sequence...\n${ASCII_ARTS.ROCKET}\nHouston, we have liftoff!`;
  }
  
  if (command === 'rain' || command === 'matrix') {
    return `${ASCII_ARTS.MATRIX_RAIN}\nFollow the white rabbit...`;
  }
  
  if (command.includes('moo') || command === 'cow') {
    return `${ASCII_ARTS.COW}\nMooooooo!`;
  }
  
  if (command === 'fortune') {
    const fortunes = [
      "Your code will compile on the first try today.",
      "A bug fixed today prevents a critical issue tomorrow.",
      "Someone will star your GitHub repository soon.",
      "A great opportunity for contribution awaits you.",
      "Your next pull request will be merged without comments.",
      "The path to becoming a better developer is through documentation.",
      "Your commit today will save someone hours of debugging tomorrow.",
      "The best code is no code at all.",
      "A clever person solves a problem; a wise person avoids it.",
      "Before software can be reusable, it first has to be usable.",
      "The sooner you start coding, the longer the program will take."
    ];
    return `🔮 Your fortune: ${fortunes[Math.floor(Math.random() * fortunes.length)]}`;
  }
  
  if (command === '42') {
    return "The Answer to the Ultimate Question of Life, the Universe, and Everything.";
  }

  if (command === 'sudo') {
    return "Nice try! But sudo won't work here. You're already the master of this terminal.";
  }
  
  return null;
};

// Function to check if a command has a typo (for glitch effect)
export const hasTypo = (command: string, validCommands: string[]): boolean => {
  if (command.length < 3) return false;
  
  // Check if command is close to any valid command using Levenshtein distance
  for (const validCommand of validCommands) {
    const distance = levenshteinDistance(command, validCommand);
    // If the command is close enough to a valid one but not exact
    if (distance > 0 && distance <= 2) {
      return true;
    }
  }
  
  return false;
};

// Levenshtein distance calculation for typo detection
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

// Generate glitch text effect for typos
export const generateGlitchText = (text: string): string => {
  const glitchChars = '!@#$%^&*()_+-={}[]|;:,.<>?/\\~`';
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    // About 20% chance to replace a character with a glitch character
    if (Math.random() < 0.2) {
      const glitchChar = glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
      result += glitchChar;
    } else {
      result += text.charAt(i);
    }
  }
  
  return result;
};

// Generate a blinking text effect for typos
export const generateBlinkingEffect = (command: string): string[] => {
  const frames = [];
  const iterations = 6; // 6 frames of animation
  
  // Original command
  frames.push(`Command not found: ${command}`);
  
  // Glitch frames
  for (let i = 0; i < iterations; i++) {
    if (i % 2 === 0) {
      // Glitched version
      frames.push(`C0mm@nd n0t f0und: ${generateGlitchText(command)}`);
    } else {
      // Normal version with different formatting
      frames.push(`Command not found: ${command}`);
    }
  }
  
  // Final frame with suggestion
  frames.push(`Command not found: ${command}. Type 'help' to see available commands.`);
  
  return frames;
};

// Fun hidden games and features
export const HIDDEN_FEATURES = {
  konami: {
    sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    currentIndex: 0,
    reward: "⭐ KONAMI CODE ACTIVATED! ⭐\nUnlocked retro mode!"
  }
};

// Track konami code progress
export const checkKonamiCode = (key: string): { completed: boolean, message: string | null } => {
  const konami = HIDDEN_FEATURES.konami;
  
  if (key === konami.sequence[konami.currentIndex]) {
    konami.currentIndex++;
    
    if (konami.currentIndex === konami.sequence.length) {
      konami.currentIndex = 0; // Reset for next time
      return { completed: true, message: konami.reward };
    }
    
    return { completed: false, message: null };
  } else {
    konami.currentIndex = 0; // Reset on mistake
    return { completed: false, message: null };
  }
};