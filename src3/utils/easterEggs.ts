// Easter Egg Utilities for Terminal Portfolio
// Collection of fun terminal Easter eggs
import type { PortfolioData } from '../../src/lib/portfolioStorage';
import type { GitHubDataset } from '../../shared/github/githubDataset';
import { formatMonthYear, relativeTime } from '../../shared/github/githubDataset';
import { formatDateRange, splitDateRange } from '../../shared/format';
import { bar, bucket, heading, padEnd, padStart, sparkline } from './asciiCharts';

// ASCII Arts Collection
export const ASCII_ARTS = {
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
        .filter((q: { text?: string }) => q.text && q.text.length > 30 && q.text.length < 150)
        .map((q: { text: string }) => q.text);
      
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
  
  if (command === 'rain') {
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

// Levenshtein distance, for "did you mean" suggestions
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = Array.from({ length: a.length + 1 }, (_, j) => j);
  for (let i = 1; i <= b.length; i++) {
    const row = [i];
    for (let j = 1; j <= a.length; j++) {
      row[j] = b[i - 1] === a[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], row[j - 1], prev[j]);
    }
    prev = row;
  }
  return prev[a.length];
};

/** The candidate closest to `input`, or null when nothing is plausibly what was meant. */
export const closestCommand = (input: string, candidates: string[]): string | null => {
  const word = input.trim().toLowerCase();
  if (!word) return null;
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = levenshteinDistance(word, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best !== null && bestDistance <= Math.max(2, Math.floor(word.length / 3)) ? best : null;
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

// ── Data-driven commands ────────────────────────────────────────────────────
// Unlike the jokes above, these surface real portfolio data. Each returns the
// lines to print (the terminal streams them like a log) or null if the input
// isn't one of them.

export interface DataCommandContext {
  portfolio: PortfolioData | null;
  dataset: GitHubDataset;
  /** Usable character width of the terminal */
  cols: number;
  /** Absolute URL of the resume PDF */
  resumeUrl?: string;
}

const whoami = ({ portfolio, dataset, resumeUrl }: DataCommandContext): string[] => {
  const info: { name?: string; title?: string; email?: string; location?: string; availability?: string } =
    portfolio?.personalInfo ?? {};
  const latest = portfolio?.experience?.[0];
  const range = splitDateRange(latest?.dates || latest?.duration);
  const role = latest ? `${latest.title || latest.role} @ ${latest.company}` : undefined;
  const login = dataset.username ?? (info.name ?? 'guest').toLowerCase().replace(/\s+/g, '-');
  const groups = dataset.languages.map((l) => l.name.toLowerCase()).join(',');
  const rows: Array<[string, string | undefined]> = [
    ['name', info.name],
    ['role', info.title],
    // "now" only for a role that is still running; otherwise show when it was.
    range.isCurrent || !range.start
      ? ['now', role]
      : ['latest', role && `${role} (${formatDateRange(latest?.dates || latest?.duration)})`],
    // First sentence only: the motd above already prints availability in full.
    ['status', info.availability?.split(/(?<=\.)\s+/)[0]],
    ['location', info.location],
    ['email', info.email],
    ['resume', resumeUrl],
    ['github', dataset.memberSince ? `member since ${formatMonthYear(dataset.memberSince)} · ${dataset.totals.followers} followers` : undefined],
    ['stack', (portfolio?.insights?.technicalProfile?.primaryStack ?? []).slice(0, 6).join(', ') || undefined],
  ];
  return [
    login,
    `uid=${dataset.totals.repos}(repos) gid=${dataset.totals.stars}(stars)${groups ? ` groups=${groups}` : ''}`,
    '',
    ...rows.filter(([, v]) => v).map(([k, v]) => `  ${padEnd(k, 10)}${v}`),
  ];
};

const githubStats = ({ dataset, cols }: DataCommandContext, args: string[]): string[] => {
  if (!dataset.hasData) return ['[warn] no GitHub data in portfolio.json yet.'];

  const only = ['--langs', '--repos', '--activity'].find((f) => args.includes(f));
  const show = (flag: string) => !only || only === flag;
  const { totals, languages, repos, contributions } = dataset;
  const width = Math.min(cols, 72);
  const out: string[] = [
    `$ gh api users/${dataset.username ?? 'me'} --cache public/data/portfolio.json`,
    `[ ok ] ${repos.length} repositories indexed · ${languages.length} languages · ${contributions.length} days of activity`,
    '',
    `  REPOS ${totals.repos}   STARS ${totals.stars}   FORKS ${totals.forks}   COMMITS ${totals.commitsLabel}${
      totals.followers ? `   FOLLOWERS ${totals.followers}` : ''
    }`,
  ];

  if (show('--langs') && languages.length) {
    const barW = Math.max(8, width - 24);
    const max = Math.max(...languages.map((l) => l.percent));
    out.push('', heading('languages · share of repos', width));
    languages.forEach((l) => out.push(`  ${padEnd(l.name, 11)} ${bar(l.percent, max, barW)} ${padStart(`${l.percent}%`, 6)}`));
  }

  if (show('--repos') && repos.length) {
    const top = repos.slice(0, 8);
    const barW = Math.max(8, width - 32);
    const max = Math.max(...top.map((r) => r.commits));
    out.push('', heading('commits by repository', width));
    top.forEach((r) =>
      out.push(`  ${padEnd(r.name, 14)} ${bar(r.commits, max, barW)} ${padStart(String(r.commits), 5)}  ★${r.stars}`),
    );
  }

  if (show('--activity') && contributions.length) {
    const room = Math.max(20, cols - 4);
    const counts = contributions.map((c) => c.count);
    const series = counts.length > room ? bucket(counts, room) : counts;
    const perChar = Math.ceil(counts.length / series.length);
    const first = new Date(`${contributions[0].date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const last = new Date(`${contributions[contributions.length - 1].date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    out.push('', heading(`activity · last ${contributions.length} days`, width));
    out.push(`  ${sparkline(series)}`);
    out.push(`  ${first.padEnd(Math.max(first.length + 1, series.length - last.length))}${last}`);
    out.push(
      `  ${dataset.contributionTotal} contributions · ${dataset.activeDays} active days · longest streak ${dataset.longestStreak}d${
        perChar > 1 ? ` · ${perChar} days per char` : ''
      }`,
    );
  }

  out.push('', `  → ${dataset.profileUrl ?? ''}`);
  return out;
};

const gitLog = ({ dataset }: DataCommandContext, args: string[]): string[] => {
  const limit = Number(args.find((a) => /^-n?\d+$/.test(a))?.replace(/\D/g, '')) || 12;
  const stamp = (d: Date | null) =>
    d ? d.toISOString().slice(0, 16).replace('T', ' ') : '????-??-?? ??:??';

  const events = dataset.activity.map((e) => ({
    at: e.at,
    line: `${e.type.replace(/Event$/, '').toLowerCase().padEnd(7)} ${e.repo.split('/').pop()}${e.ref ? ` (${e.ref})` : ''}`,
  }));
  const heads = dataset.repos
    .filter((r) => r.updatedAt)
    .map((r) => ({ at: r.updatedAt, line: `update  ${r.name} · ${r.commits} commits · ${r.language}` }));

  const entries = [...events, ...heads]
    .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0))
    .slice(0, limit);

  if (!entries.length) return ['fatal: your current branch has no activity yet'];
  return [
    `$ git log --all --oneline -n ${limit}`,
    ...entries.map((e, i) => `${i === 0 ? '*' : '|'} ${stamp(e.at)}  ${e.line}  ${i === 0 ? '(HEAD) ' : ''}${relativeTime(e.at)}`),
  ];
};

/** Returns output lines for a data command, or null if `command` isn't one. */
export const runDataCommand = (command: string, ctx: DataCommandContext): string[] | null => {
  const [head, ...args] = command.trim().split(/\s+/);
  if (head === 'whoami') return whoami(ctx);
  if (head === 'git' && args[0] === 'log') return gitLog(ctx, args.slice(1));
  if (head === 'github' || head === 'gh') return githubStats(ctx, args);
  if (head === 'stats' && (args.length === 0 || args.some((a) => a.startsWith('--')))) return githubStats(ctx, args);
  return null;
};
