import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { DEFAULT_USER } from '../../src/config/env';
import type { PortfolioData } from '../../src/lib/portfolioStorage';
import MatrixEffect from './MatrixEffect.tsx';
import { useToast } from '../../src/components/ui/use-toast';
import { mainSiteHref, parseTextForLinks, resumeUrlOf } from '../utils/terminalUtils';
import { formatDateRange } from '../../shared/format';
import { useGitHubDataset } from '../../shared/github/useGitHubDataset';
import { usePrefersReducedMotion } from '../../shared/hooks/usePrefersReducedMotion';
import { BANNER_MIN_COLS, bannerArt, terminalColumns } from '../utils/asciiCharts';
import {
  generateRandomResponse,
  checkKonamiCode,
  TYPING_TEST,
  runDataCommand,
  closestCommand,
} from '../utils/easterEggs';

// Shorthand aliases → full commands
const COMMAND_ALIASES: Record<string, string> = {
  h: 'help',
  '?': 'help',
  c: 'clear',
  cls: 'clear',
  q: 'exit',
  quit: 'exit',
  logout: 'exit',
  cd: 'paper',
  'cd ~': 'paper',
  a: 'about',
  me: 'about',
  bio: 'about',
  p: 'projects',
  proj: 'projects',
  s: 'skills',
  tech: 'skills',
  e: 'experience',
  exp: 'experience',
  work: 'experience',
  edu: 'education',
  school: 'education',
  con: 'contact',
  soc: 'social',
  links: 'social',
  g: 'github',
  git: 'github',
  stats: 'github',
  gl: 'git log',
  who: 'whoami',
  cv: 'resume',
  m: 'matrix',
  mtx: 'matrix',
  d: 'download',
  dl: 'download',
  dlp: 'download -p',
  dlr: 'download -r',
  art: 'ascii',
  logo: 'ascii',
  banner: 'ascii',
  f: 'fortune',
  type: 'typingtest',
};

/** Every command the terminal understands (used for completion and "did you mean"). */
const KNOWN_COMMANDS = [
  'help', 'clear', 'whoami', 'about', 'experience', 'projects', 'project', 'skills',
  'education', 'contact', 'social', 'resume', 'download', 'github', 'git log', 'paper',
  'exit', 'theme', 'matrix', 'history', 'clear-history', 'ascii', 'fortune', 'typingtest',
  'coffee', 'rocket', 'cow', 'sudo', '42',
];
const COMPLETIONS = [...new Set([...KNOWN_COMMANDS, ...Object.keys(COMMAND_ALIASES)])].sort();

/** Commands surfaced as buttons on the first screen and above the prompt. */
const TRY_COMMANDS = ['whoami', 'resume', 'experience', 'projects', 'contact', 'github', 'paper'];
const CHIP_COMMANDS = ['whoami', 'experience', 'projects', 'resume', 'contact', 'github', 'paper'];

// [command, aliases, description]; rows whose command takes no argument are clickable.
const HELP_ROWS: Array<[string, string, string]> = [
  ['whoami', 'who', 'who this is'],
  ['about', 'a, bio', 'summary'],
  ['experience', 'e, exp', 'work experience'],
  ['projects', 'p', 'one line per project'],
  ['project <n|name>', '', 'details for one project'],
  ['skills', 's', 'skills, grouped, with evidence'],
  ['education', 'edu', 'education'],
  ['contact', 'con', 'email, resume and profiles'],
  ['social', 'links', 'profile links'],
  ['resume', 'cv', 'open the resume PDF in a new tab'],
  ['download', 'd, dl', 'download the resume PDF'],
  ['download -p', 'dlp', 'download portfolio.json'],
  ['github', 'g, stats', 'GitHub stats as ASCII charts (--langs, --repos, --activity)'],
  ['git log', 'gl', 'recent pushes and repository activity'],
  ['paper', 'exit, cd ~', 'back to the main site'],
  ['theme [name]', '', 'list or switch colour themes'],
  ['matrix', 'm', 'toggle the matrix rain'],
  ['history', '', 'commands run so far'],
  ['clear', 'c, cls', 'clear the screen'],
  ['help', 'h, ?', 'this list'],
];
const HELP_EXTRAS = ['fortune', 'typingtest', 'coffee', 'rocket', 'cow', 'sudo', '42'];

type Experience = NonNullable<PortfolioData['experience']>[number];
type Education = NonNullable<PortfolioData['education']>[number];
type Project = NonNullable<PortfolioData['projects']>[number];

const formatExperience = (exp: Experience) => {
  const achievements: string[] = exp.achievements || exp.accomplishments || [];
  return [
    `${exp.title || exp.role} @ ${exp.company}`,
    `  ${formatDateRange(exp.dates || exp.duration) || 'dates not listed'}${exp.location ? ` · ${exp.location}` : ''}`,
    ...(exp.description ? [`  ${exp.description}`] : []),
    ...achievements.map((a) => `  - ${a}`),
  ].join('\n');
};

const formatEducation = (edu: Education) =>
  [
    `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
    `  ${edu.institution}`,
    `  ${formatDateRange(edu.dates || edu.duration) || 'dates not listed'}${edu.cgpa ? ` · ${edu.cgpa}` : ''}`,
    ...(edu.description ? [`  ${edu.description}`] : []),
  ].join('\n');

const projectNumber = (i: number) => String(i + 1).padStart(2, '0');

const formatProject = (project: Project, index: number) => {
  const rows: Array<[string, string | undefined]> = [
    ['role', project.role],
    ['stack', project.technologies?.join(', ')],
    ['repo', project.github],
    ['live', project.demo],
    ['status', project.status],
  ];
  return [
    `${projectNumber(index)}  ${project.title || 'Untitled project'}`,
    ...rows.filter(([, v]) => v).map(([k, v]) => `    ${k.padEnd(8)}${v}`),
    ...(project.description ? ['', project.description] : []),
  ].join('\n');
};

interface TerminalLine {
  id: string;
  /** command | response | success | error | info, or a rich block: banner | try | help */
  type: string;
  text: string;
  isAnimating?: boolean;
}

const TERMINAL_THEMES = {
  classic: { name: 'Classic Green', bg: '#0c0c0c', text: '#00ff00', prompt: '#00ff00', success: '#00ff00', error: '#ff0000' },
  midnight: { name: 'Midnight Blue', bg: '#0d1117', text: '#58a6ff', prompt: '#79c0ff', success: '#56d364', error: '#f85149' },
  retro: { name: 'Retro Amber', bg: '#150f01', text: '#ffb000', prompt: '#ffb000', success: '#ffc533', error: '#ff5555' },
  monochrome: { name: 'Monochrome', bg: '#0a0a0a', text: '#ffffff', prompt: '#ffffff', success: '#cccccc', error: '#999999' },
  matrix: { name: 'Matrix', bg: '#000000', text: '#03A062', prompt: '#00ff41', success: '#03A062', error: '#ff0000' },
};
type ThemeKey = keyof typeof TERMINAL_THEMES;

// Parsed link content per line object (lines are immutable, so a WeakMap is a safe cache).
const linkCache = new WeakMap<TerminalLine, (string | JSX.Element)[]>();

const Terminal: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('classic');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cols, setCols] = useState<number>(terminalColumns);
  const [typingTest, setTypingTest] = useState<{ isActive: boolean; quote: string; startTime: number }>({
    isActive: false,
    quote: '',
    startTime: 0,
  });
  const [retroMode, setRetroMode] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);
  const bootedRef = useRef(false);
  const streamRef = useRef<{ id: string; lines: string[]; shown: number; timer: number } | null>(null);

  const { toast } = useToast();
  const { portfolio, isLoading } = usePortfolio();
  const { dataset } = useGitHubDataset();
  const reducedMotion = usePrefersReducedMotion();

  const name = portfolio?.personalInfo?.name || DEFAULT_USER.NAME;
  const title = portfolio?.personalInfo?.title || DEFAULT_USER.TITLE;
  const availability = (portfolio?.personalInfo as { availability?: string } | undefined)?.availability;
  const resumeUrl = resumeUrlOf(portfolio);
  const paperHref = mainSiteHref();
  const theme = TERMINAL_THEMES[currentTheme];

  // Tokens the matrix rain occasionally spells out: real repo and language names.
  const matrixWords = React.useMemo(
    () => [...dataset.repos.slice(0, 12).map((r) => r.name), ...dataset.languages.map((l) => l.name)],
    [dataset],
  );

  const line = (type: string, text = ''): TerminalLine => ({ id: `l${lineIdRef.current++}`, type, text });
  const print = (...lines: TerminalLine[]) => setOutput((prev) => [...prev, ...lines]);
  const say = (type: string, text: string) => print(line(type, text));

  /** Ends the current streamed response — either printing the rest (flush) or dropping it. */
  const stopStream = (flush: boolean) => {
    const stream = streamRef.current;
    if (!stream) return;
    window.clearInterval(stream.timer);
    streamRef.current = null;
    setIsStreaming(false);
    if (flush) {
      const text = stream.lines.join('\n');
      setOutput((prev) => prev.map((l) => (l.id === stream.id ? { ...l, text, isAnimating: false } : l)));
    }
  };

  /** Prints lines one at a time like a scrolling log; instant under reduced motion. */
  const streamOutput = (lines: string[], type = 'response') => {
    stopStream(true);
    if (reducedMotion || lines.length <= 2) {
      say(type, lines.join('\n'));
      return;
    }
    const first = line(type);
    const id = first.id;
    print({ ...first, isAnimating: true });
    const timer = window.setInterval(() => {
      const stream = streamRef.current;
      if (!stream) return;
      stream.shown += 1;
      if (stream.shown >= stream.lines.length) {
        stopStream(true);
        return;
      }
      const text = stream.lines.slice(0, stream.shown).join('\n');
      setOutput((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)));
    }, 32);
    streamRef.current = { id, lines, shown: 0, timer };
    setIsStreaming(true);
  };

  useEffect(
    () => () => {
      if (streamRef.current) window.clearInterval(streamRef.current.timer);
    },
    [],
  );

  // Track the terminal's column count (banner and help layout depend on it).
  useEffect(() => {
    const onResize = () => setCols(terminalColumns());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--terminal-bg', theme.bg);
    root.setProperty('--terminal-text', theme.text);
    root.setProperty('--terminal-prompt', theme.prompt);
    root.setProperty('--terminal-cursor', theme.prompt);
    root.setProperty('--terminal-success', theme.success);
    root.setProperty('--terminal-error', theme.error);

    setShowMatrix(currentTheme === 'matrix');

    if (retroMode) {
      root.setProperty('--terminal-text', '#33ff00');
      root.setProperty('--terminal-bg', '#000000');
      root.setProperty('--terminal-font', '"VT323", "Courier New", monospace');
      root.setProperty('--terminal-filter', 'contrast(1.2) brightness(1.1) sepia(0.2)');
    } else {
      root.setProperty('--terminal-font', '"JetBrains Mono", "Courier New", monospace');
      root.setProperty('--terminal-filter', 'none');
    }
  }, [theme, currentTheme, retroMode]);

  // Focus the prompt once on mount; afterwards only when the user clicks the transcript.
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Keep the newest output in view.
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  useEffect(() => {
    document.title = `${name} — terminal`;
  }, [name]);

  // Keep the fullscreen button's label in sync when the user leaves with Esc.
  useEffect(() => {
    const onChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // First screen: who this is, what to try, then `whoami` run for the visitor.
  useEffect(() => {
    if (isLoading || bootedRef.current) return;
    bootedRef.current = true;
    const who = runDataCommand('whoami', { portfolio, dataset, cols: terminalColumns(), resumeUrl }) ?? [];
    setOutput([
      line('banner'),
      ...(availability ? [line('response', availability)] : []),
      line('try'),
      line('command', '> whoami'),
      line('response', who.join('\n')),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Konami code toggles retro mode
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (typingTest.isActive) return;
      const result = checkKonamiCode(e.key);
      if (result.completed && result.message) {
        setRetroMode(!retroMode);
        setOutput((prev) => [...prev, { id: `l${lineIdRef.current++}`, type: 'success', text: result.message ?? '' }]);
        toast({ title: 'Easter Egg Found!', description: 'Konami code activated! Retro mode toggled.', duration: 3000 });
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [retroMode, toast, typingTest.isActive]);

  const goToMainSite = () => {
    window.location.assign(paperHref);
  };

  const openResume = () => {
    window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    say('success', `opening resume in a new tab → ${resumeUrl}`);
  };

  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = resumeUrl.split('/').pop() || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    say('success', `downloading resume → ${resumeUrl}`);
  };

  const downloadPortfolioJSON = () => {
    if (!portfolio) {
      say('error', 'No portfolio data available to download.');
      return;
    }
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'portfolio.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      say('success', 'downloading portfolio.json');
    } catch (error) {
      console.error('Failed to download portfolio data:', error);
      say('error', 'Failed to download portfolio data.');
    }
  };

  const startTypingTest = async () => {
    const { quote, startTime } = await TYPING_TEST.start();
    setTypingTest({ isActive: true, quote, startTime });
    say('info', `Type the following text:\n\n"${quote}"\n\nPress Enter when finished.`);
    setInput('');
  };

  const endTypingTest = () => {
    const timeElapsed = Date.now() - typingTest.startTime;
    const wpm = TYPING_TEST.calculateSpeed(typingTest.quote, timeElapsed);
    const expected = typingTest.quote;
    let correctChars = 0;
    for (let i = 0; i < Math.min(input.length, expected.length); i++) {
      if (input[i] === expected[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / expected.length) * 100);
    print(
      line('command', `> ${input}`),
      line('success', `Typing test results:\nWPM: ${wpm}\nAccuracy: ${accuracy}%\nTime: ${(timeElapsed / 1000).toFixed(2)} seconds`),
    );
    setTypingTest({ isActive: false, quote: '', startTime: 0 });
    setInput('');
  };

  const executeCommand = (cmd: string) => {
    stopStream(true);
    const typed = cmd.trim();
    setCommandHistory((prev) => (typed ? [...prev, typed] : prev));
    setHistoryIndex(-1);

    const command = typed.toLowerCase().replace(/\s+/g, ' ');
    print(line('command', `> ${cmd}`));
    if (!command) return;

    const aliasedCommand = COMMAND_ALIASES[command] || command;
    const [head, ...args] = aliasedCommand.split(' ');

    // Jokes and easter eggs (coffee, cow, fortune, …)
    const easterEggResponse = generateRandomResponse(aliasedCommand);
    if (easterEggResponse) {
      say('response', easterEggResponse);
      return;
    }

    // Data-driven commands (whoami, github / stats --github, git log) stream like a log
    const dataResponse = runDataCommand(aliasedCommand, { portfolio, dataset, cols: terminalColumns(), resumeUrl });
    if (dataResponse) {
      streamOutput(dataResponse);
      return;
    }

    switch (head) {
      case 'help':
        print(line('help'));
        return;

      case 'clear':
        stopStream(false);
        setOutput([]);
        return;

      case 'theme': {
        if (!args.length) {
          const themeList = (Object.keys(TERMINAL_THEMES) as ThemeKey[])
            .map((key) => `  ${key.padEnd(11)}${TERMINAL_THEMES[key].name}${key === currentTheme ? ' (current)' : ''}`)
            .join('\n');
          say('response', `themes:\n${themeList}\n\nusage: theme <name>`);
          return;
        }
        const requested = args[0];
        if (requested in TERMINAL_THEMES) {
          setCurrentTheme(requested as ThemeKey);
          say('success', `Theme set to ${TERMINAL_THEMES[requested as ThemeKey].name}.`);
        } else {
          say('error', `Unknown theme: ${requested}. Type 'theme' to see available options.`);
        }
        return;
      }

      case 'history':
        say('response', commandHistory.length
          ? commandHistory.map((c, i) => `${String(i + 1).padStart(3)}  ${c}`).join('\n')
          : 'No command history yet.');
        return;

      case 'clear-history':
        setCommandHistory([]);
        say('success', 'Command history cleared.');
        return;

      case 'typingtest':
        void startTypingTest();
        return;

      case 'about':
        say('response', `${name}\n${title}\n\n${portfolio?.personalInfo?.summary || DEFAULT_USER.BIO}`);
        return;

      case 'projects': {
        const projects = portfolio?.projects ?? [];
        if (!projects.length) {
          say('response', 'No projects found.');
          return;
        }
        const lines = projects.flatMap((p, i) => {
          const stack = p.technologies?.join(', ');
          const url = p.github || p.demo;
          return [`${projectNumber(i)}  ${p.title || 'Untitled project'}${stack ? ` — ${stack}` : ''}`, ...(url ? [`    ${url}`] : [])];
        });
        streamOutput([...lines, '', 'details: project <n|name>, e.g. `project 1`']);
        return;
      }

      case 'project': {
        const projects = portfolio?.projects ?? [];
        const query = args.join(' ');
        if (!query) {
          say('response', 'usage: project <n|name>, e.g. `project 1` (see `projects` for the list)');
          return;
        }
        const index = /^\d+$/.test(query)
          ? Number(query) - 1
          : projects.findIndex((p) => p.title?.toLowerCase().includes(query) || p.id?.toLowerCase() === query);
        const project = projects[index];
        if (!project) {
          say('error', `project not found: ${query} — type \`projects\` for the list`);
          return;
        }
        say('response', formatProject(project, index));
        return;
      }

      case 'skills': {
        const topSkills = portfolio?.insights?.topSkills ?? [];
        if (topSkills.length) {
          const byCategory = new Map<string, typeof topSkills>();
          topSkills.forEach((skill) => byCategory.set(skill.category, [...(byCategory.get(skill.category) ?? []), skill]));
          const lines: string[] = [];
          byCategory.forEach((skills, category) => {
            lines.push('', `== ${category} ==`);
            skills.forEach((skill) => lines.push(skill.justification ? `  ${skill.name} — ${skill.justification}` : `  ${skill.name}`));
          });
          streamOutput(lines.slice(1));
        } else if (Array.isArray(portfolio?.skills) && portfolio.skills.length) {
          // Older data shape: plain strings such as "Languages: Go, C, ..."
          say('response', (portfolio.skills as unknown[]).map((s) => (typeof s === 'string' ? s : (s as { name?: string }).name)).join('\n'));
        } else {
          say('response', 'No skills data found.');
        }
        return;
      }

      case 'experience':
        say('response', portfolio?.experience?.length
          ? portfolio.experience.map(formatExperience).join('\n\n')
          : 'No experience data found.');
        return;

      case 'education':
        say('response', portfolio?.education?.length
          ? portfolio.education.map(formatEducation).join('\n\n')
          : 'No education data found.');
        return;

      case 'contact': {
        const info = portfolio?.personalInfo;
        const social = portfolio?.socialLinks ?? {};
        const rows: Array<[string, string | undefined]> = [
          ['email', info?.email || DEFAULT_USER.EMAIL],
          ['college', info?.collegeEmail],
          ['phone', info?.phone],
          ['location', info?.location],
          ['resume', resumeUrl],
          ['github', social.github],
          ['linkedin', social.linkedin],
        ];
        say('response', rows.filter(([, v]) => v).map(([k, v]) => `${k.padEnd(10)}${v}`).join('\n'));
        return;
      }

      case 'social': {
        const social = portfolio?.socialLinks ?? {};
        const rows: Array<[string, string | undefined]> = [
          ['GitHub', social.github],
          ['LinkedIn', social.linkedin],
          ['Codeforces', social.codeforces],
          ['Twitter', social.twitter],
          ['Website', social.website],
        ];
        const present = rows.filter(([, v]) => v);
        say('response', present.length ? present.map(([k, v]) => `${k.padEnd(12)}${v}`).join('\n') : 'No profile links found.');
        return;
      }

      case 'resume':
        openResume();
        return;

      case 'download':
        if (!args.length || args.includes('-r')) downloadResume();
        if (args.includes('-p')) downloadPortfolioJSON();
        if (args.length && !args.includes('-p') && !args.includes('-r')) {
          say('error', 'usage: download (resume PDF) or download -p (portfolio.json)');
        }
        return;

      case 'matrix':
        setShowMatrix(!showMatrix);
        say('response', showMatrix ? 'Matrix effect disabled.' : 'Matrix effect enabled.');
        return;

      case 'ascii':
        print(line('banner'));
        return;

      case 'paper':
      case 'exit':
        say('response', `opening the main site → ${paperHref}`);
        goToMainSite();
        return;

      default: {
        const suggestion = closestCommand(command, KNOWN_COMMANDS) ?? closestCommand(head, KNOWN_COMMANDS);
        say('error', suggestion
          ? `command not found: ${typed} — did you mean \`${suggestion}\`?`
          : `command not found: ${typed} — type \`help\` for the list`);
      }
    }
  };

  /** Runs a command from a button (chips, help rows, motd). */
  const runFromClick = (cmd: string) => {
    executeCommand(cmd);
    // Return focus to the prompt on desktop; on touch it would pop the keyboard.
    if (window.matchMedia?.('(pointer: fine)').matches) inputRef.current?.focus({ preventScroll: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typingTest.isActive) {
      endTypingTest();
      return;
    }
    // Enter during a streamed response fast-forwards it; a typed command still runs.
    if (streamRef.current && !input.trim()) {
      stopStream(true);
      return;
    }
    const current = input;
    setInput('');
    executeCommand(current);
  };

  // History navigation and Tab completion
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab' && !e.shiftKey && input.trim()) {
      // Only take over Tab when there is something to complete; otherwise focus moves on.
      const typed = input.trim().toLowerCase();
      const matches = COMPLETIONS.filter((c) => c.startsWith(typed) && c !== typed);
      if (!matches.length) return;
      e.preventDefault();
      if (matches.length === 1) {
        setInput(matches[0]);
      } else {
        print(line('command', `> ${input}`), line('response', matches.join('  ')));
      }
    }
  };

  const handleThemeToggle = () => {
    const keys = Object.keys(TERMINAL_THEMES) as ThemeKey[];
    const next = keys[(keys.indexOf(currentTheme) + 1) % keys.length];
    setCurrentTheme(next);
    toast({ title: 'Theme Changed', description: `Using theme: ${TERMINAL_THEMES[next].name}`, duration: 2000 });
  };

  const handleMaximize = () => {
    const entering = !document.fullscreenElement;
    const request = entering ? document.documentElement.requestFullscreen?.() : document.exitFullscreen?.();
    request?.catch((error: unknown) => console.error('Fullscreen toggle failed:', error));
  };

  // Clicking the transcript (not a link, button or a text selection) returns focus to the prompt.
  const handleOutputClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button')) return;
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const cmdButton = (cmd: string, label = cmd) => (
    <button type="button" className="terminal-cmd" onClick={() => runFromClick(cmd)}>
      {label}
    </button>
  );

  const renderBanner = () => {
    const art = cols >= BANNER_MIN_COLS ? bannerArt(name, cols) : null;
    if (!art) {
      return <pre className="terminal-line response">{`${name} — ${title}`.toLowerCase()}</pre>;
    }
    return (
      <>
        <pre className="terminal-banner" aria-hidden="true">{art}</pre>
        <p className="terminal-sr-only">{name}</p>
        <pre className="terminal-line response">{title}</pre>
      </>
    );
  };

  const renderTry = () => (
    <pre className="terminal-line response">
      {'try: '}
      {TRY_COMMANDS.map((cmd, i) => (
        <React.Fragment key={cmd}>
          {i > 0 && ' · '}
          {cmdButton(cmd)}
          {cmd === 'paper' && ' (main site)'}
        </React.Fragment>
      ))}
    </pre>
  );

  const renderHelp = () => {
    const wide = cols >= 64;
    return (
      <pre className="terminal-line response">
        {'commands\n'}
        {HELP_ROWS.map(([cmd, aliases, desc]) => {
          const runnable = !/[<[]/.test(cmd);
          const aliasText = aliases ? `(${aliases})` : '';
          return (
            <React.Fragment key={cmd}>
              {'  '}
              {runnable ? cmdButton(cmd) : cmd}
              {wide
                ? `${' '.repeat(Math.max(1, 18 - cmd.length))}${aliasText.padEnd(14)}${desc}\n`
                : `${aliasText ? `  ${aliasText}` : ''}\n      ${desc}\n`}
            </React.Fragment>
          );
        })}
        {'\nextras: '}
        {HELP_EXTRAS.map((cmd, i) => (
          <React.Fragment key={cmd}>
            {i > 0 && ' · '}
            {cmdButton(cmd)}
          </React.Fragment>
        ))}
      </pre>
    );
  };

  const renderLine = (l: TerminalLine) => {
    if (l.type === 'banner') return renderBanner();
    if (l.type === 'try') return renderTry();
    if (l.type === 'help') return renderHelp();

    let content: React.ReactNode = l.text;
    if (l.type !== 'command') {
      let parsed = linkCache.get(l);
      if (!parsed) {
        parsed = parseTextForLinks(l.text);
        if (!l.isAnimating) linkCache.set(l, parsed);
      }
      content = parsed;
    }
    return (
      <pre className={`terminal-line ${l.type}`}>
        {content}
        {l.isAnimating && <span className="cursor-blink" aria-hidden="true">█</span>}
      </pre>
    );
  };

  return (
    <div className={`terminal-container ${isFullScreen ? 'terminal-fullscreen' : ''} ${retroMode ? 'retro-mode' : ''}`}>
      {showMatrix && <MatrixEffect themeColor={theme.text} words={matrixWords} />}

      <div className="terminal-header">
        <div className="terminal-header-buttons">
          <a
            href={paperHref}
            className="terminal-header-button terminal-button-exit"
            aria-label="Back to the main site"
            title="Back to the main site"
          />
          <button
            type="button"
            className="terminal-header-button terminal-button-theme"
            onClick={handleThemeToggle}
            aria-label={`Change theme (current: ${theme.name})`}
            title={`Change theme (current: ${theme.name})`}
          />
          <button
            type="button"
            className="terminal-header-button terminal-button-maximize"
            onClick={handleMaximize}
            aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          />
        </div>
        <h1>{name} — terminal</h1>
        <span className="terminal-header-balance" aria-hidden="true" />
      </div>

      <div
        className="terminal-output"
        ref={outputRef}
        onClick={handleOutputClick}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={isStreaming}
        aria-label="Terminal output"
      >
        {output.map((l, index) => (
          <React.Fragment key={l.id}>
            {renderLine(l)}
            {index === output.length - 1 && l.isAnimating && (
              <pre className="terminal-line terminal-hint" aria-hidden="true">Press Enter to fast-forward…</pre>
            )}
          </React.Fragment>
        ))}
      </div>

      <nav className="terminal-chips" aria-label="Quick commands">
        {CHIP_COMMANDS.map((cmd) => (
          <button key={cmd} type="button" className="terminal-chip" onClick={() => runFromClick(cmd)}>
            {cmd}
          </button>
        ))}
      </nav>

      <form onSubmit={handleSubmit} className="terminal-input-line">
        <span className="terminal-prompt" aria-hidden="true">{'>'}</span>
        <input
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-label="Terminal command"
        />
      </form>
    </div>
  );
};

export default Terminal;
