import React, { useState, useEffect, useRef } from 'react';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { DEFAULT_USER, APP_SETTINGS, DEFAULT_ASSETS } from '../../src/config/env';
import MatrixEffect from './MatrixEffect.tsx';
import { useToast } from '../../src/components/ui/use-toast';
import { truncateWithEllipsis, formatTerminalDate, getNestedValue, parseTextForLinks } from '../utils/terminalUtils';
import { formatDate } from '@/lib/utils.ts';
// Import Easter eggs utilities
import { 
  ASCII_ARTS, 
  generateRandomResponse, 
  hasTypo, 
  generateBlinkingEffect,
  checkKonamiCode,
  TYPING_TEST
} from '../utils/easterEggs';

// ASCII art for the terminal logo
const ASCII_LOGO = `
 ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗     
 ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║     
    ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║     
    ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║     
    ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
    ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
                                                                   
██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗ 
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝ 
`;

// Command mappings - full commands to shorthand aliases
const COMMAND_ALIASES: Record<string, string> = {
  // Help and navigation
  'h': 'help',
  '?': 'help',
  'c': 'clear',
  'cls': 'clear',
  'q': 'exit',
  'quit': 'exit',
  
  // Information
  'a': 'about',
  'me': 'about',
  'bio': 'about',
  'p': 'projects',
  'proj': 'projects',
  's': 'skills',
  'tech': 'skills',
  'e': 'experience',
  'exp': 'experience',
  'work': 'experience',
  'edu': 'education',
  'school': 'education',
  'con': 'contact',
  'soc': 'social',
  'links': 'social',
  'g': 'github',
  'git': 'github',
  'stats': 'github',
  
  // Actions
  'm': 'matrix',
  'mtx': 'matrix',
  'dl': 'download',
  'd': 'download',
  'dlp': 'download -p',
  'dlr': 'download -r',
  'r': 'reload',
  'refresh': 'reload',
  'art': 'ascii',
  'logo': 'ascii',
  
  // Easter Egg commands
  'f': 'fortune',
  'type': 'typingtest'
};

// Add new commands to help text
const HELP_TEXT = `
Available commands:
  help    (h, ?)       Show this help text
  clear   (c, cls)     Clear terminal screen
  about   (a, me, bio) Display information about me
  projects(p, proj)    List my projects
  skills  (s, tech)    Show my technical skills
  experience(e, exp)   Show my work experience
  education(edu)       Show my education details
  contact (con)        Display contact information
  social  (soc, links) Show social media links
  github  (g, git)     Display GitHub stats
  matrix  (m, mtx)     Toggle matrix effect background
  download(d, dl)      Download files
    -p    (dlp)        Download portfolio.json data file
    -r    (dlr)        Download resume PDF
  reload  (r, refresh) Reload portfolio data with AI
  ascii   (art, logo)  Display ASCII art
  exit    (q, quit)    Exit terminal (redirects to main site)
  
Fun Commands:
  fortune (f)          Get a random fortune
  typingtest (type)    Test your typing speed
  
Try typing 'coffee', 'rocket', 'cow', 'sudo', or '42' for surprises!
`;

// Function to format project data for terminal display
const formatProject = (project: any) => {
  return `
Project: ${project.title || 'Unnamed Project'}
${project.description ? `Description: ${project.description}` : ''}
${project.technologies?.length ? `Technologies: ${project.technologies.join(', ')}` : ''}
${project.github ? `GitHub: ${project.github}` : ''}
${project.demo ? `Demo: ${project.demo}` : ''}
`;
};

// Function to format experience data for terminal display
const formatExperience = (exp: any) => {
  return `
Role: ${exp.title} at ${exp.company}
Duration: ${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : 'Present'}
${exp.description ? `Details: ${exp.description}` : ''}
${exp.accomplishments?.length ? `Achievements: \n${exp.accomplishments.map((a: string) => `  - ${a}`).join('\n')}` : ''}
`;
};

// Function to format education data for terminal display
const formatEducation = (edu: any) => {
  return `
Degree: ${edu.degree} in ${edu.field}
Institution: ${edu.institution}
Duration: ${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : 'Present'}
${edu.description ? `Details: ${edu.description}` : ''}
`;
};

// Interface for terminal output
interface TerminalLine {
  type: string;
  text: string;
  isAnimating?: boolean;
  animatedText?: string;
  parsedContent?: (string | JSX.Element)[];
}

// Additional interface for animations
interface AnimationState {
  isActive: boolean;
  frames: string[];
  currentFrame: number;
  interval: number | null;
}

// Pager config - how many lines to display at once
const LINES_PER_PAGE = 20;

// Pager state
interface PagerState {
  isActive: boolean;
  content: string[];
  currentLine: number;
  totalLines: number;
}

const TERMINAL_THEMES = {
  classic: {
    name: "Classic Green",
    bg: "#0c0c0c",
    text: "#00ff00",
    prompt: "#00ff00",
    success: "#00ff00",
    error: "#ff0000"
  },
  midnight: {
    name: "Midnight Blue",
    bg: "#0d1117",
    text: "#58a6ff",
    prompt: "#79c0ff",
    success: "#56d364",
    error: "#f85149"
  },
  retro: {
    name: "Retro Amber",
    bg: "#150f01",
    text: "#ffb000",
    prompt: "#ffb000",
    success: "#ffc533",
    error: "#ff5555"
  },
  monochrome: {
    name: "Monochrome",
    bg: "#0a0a0a",
    text: "#ffffff",
    prompt: "#ffffff",
    success: "#cccccc",
    error: "#999999"
  },
  matrix: {
    name: "Matrix",
    bg: "#000000",
    text: "#03A062",
    prompt: "#00ff41",
    success: "#03A062",
    error: "#ff0000"
  }
};

const Terminal: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [output, setOutput] = useState<TerminalLine[]>([]);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showTerminalOptions, setShowTerminalOptions] = useState<boolean>(false);
  const [typingSpeed, setTypingSpeed] = useState<number>(20); // ms per character
  const [skipAnimation, setSkipAnimation] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<string>("classic");
  const [isHistoryView, setIsHistoryView] = useState<boolean>(false);
  const [pager, setPager] = useState<PagerState>({
    isActive: false,
    content: [],
    currentLine: 0,
    totalLines: 0
  });
  
  // Easter egg states
  const [blinkAnimation, setBlinkAnimation] = useState<AnimationState>({
    isActive: false,
    frames: [],
    currentFrame: 0,
    interval: null
  });
  const [typingTest, setTypingTest] = useState<{
    isActive: boolean;
    quote: string;
    startTime: number;
  }>({
    isActive: false,
    quote: '',
    startTime: 0
  });
  const [retroMode, setRetroMode] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { portfolio, isLoading, refreshAllData } = usePortfolio();
  
  // List of valid commands for typo detection
  const validCommands = [
    'help', 'clear', 'about', 'projects', 'skills', 'experience',
    'education', 'contact', 'social', 'github', 'matrix', 'download',
    'reload', 'ascii', 'exit', 'fortune', 'typingtest'
  ];

  // Apply theme changes
  useEffect(() => {
    const theme = TERMINAL_THEMES[currentTheme as keyof typeof TERMINAL_THEMES];
    if (theme) {
      document.documentElement.style.setProperty('--terminal-bg', theme.bg);
      document.documentElement.style.setProperty('--terminal-text', theme.text);
      document.documentElement.style.setProperty('--terminal-prompt', theme.prompt);
      document.documentElement.style.setProperty('--terminal-cursor', theme.prompt);
      document.documentElement.style.setProperty('--terminal-success', theme.success);
      document.documentElement.style.setProperty('--terminal-error', theme.error);
    }
    
    // Set matrix effect for matrix theme
    setShowMatrix(currentTheme === 'matrix');
    
    // Apply retro mode if activated
    if (retroMode) {
      document.documentElement.style.setProperty('--terminal-text', '#33ff00');
      document.documentElement.style.setProperty('--terminal-bg', '#000000');
      document.documentElement.style.setProperty('--terminal-font', '"VT323", "Courier New", monospace');
      document.documentElement.style.setProperty('--terminal-filter', 'contrast(1.2) brightness(1.1) sepia(0.2)');
    } else {
      document.documentElement.style.setProperty('--terminal-font', '"JetBrains Mono", "Courier New", monospace');
      document.documentElement.style.setProperty('--terminal-filter', 'none');
    }
  }, [currentTheme, retroMode]);

  // Handle blinking effect animation
  useEffect(() => {
    if (blinkAnimation.isActive) {
      // Clear existing interval
      if (blinkAnimation.interval) {
        clearInterval(blinkAnimation.interval);
      }

      // Start animation
      const interval = setInterval(() => {
        setBlinkAnimation(prev => {
          const nextFrame = prev.currentFrame + 1;
          
          // Check if animation is complete
          if (nextFrame >= prev.frames.length) {
            clearInterval(interval);
            return {
              ...prev,
              isActive: false,
              currentFrame: 0,
              interval: null
            };
          }
          
          // Update animation frame
          return {
            ...prev,
            currentFrame: nextFrame
          };
        });
      }, 150) as unknown as number; // Update every 150ms
      
      // Store interval ID
      setBlinkAnimation(prev => ({
        ...prev,
        interval
      }));
      
      // Clean up on unmount
      return () => {
        clearInterval(interval);
      };
    }
  }, [blinkAnimation.isActive]);

  // Display current animation frame
  useEffect(() => {
    if (blinkAnimation.isActive && blinkAnimation.frames.length > 0) {
      // Get current frame
      const currentFrameContent = blinkAnimation.frames[blinkAnimation.currentFrame];
      
      // Update last line of output with current frame
      setOutput(prev => {
        // Create a copy of output
        const newOutput = [...prev];
        
        // Check if we need to add a new line or update existing
        if (newOutput.length > 0 && newOutput[newOutput.length - 1].type === 'error') {
          // Update existing error message with glitch effect
          newOutput[newOutput.length - 1] = {
            type: 'error',
            text: currentFrameContent,
            isAnimating: false,
            animatedText: currentFrameContent
          };
        } else {
          // Add new error line
          newOutput.push({
            type: 'error',
            text: currentFrameContent,
            isAnimating: false,
            animatedText: currentFrameContent
          });
        }
        
        return newOutput;
      });
    }
  }, [blinkAnimation.currentFrame, blinkAnimation.isActive]);

  // Automatically focus the input field and scroll to bottom when output changes
  useEffect(() => {
    inputRef.current?.focus();
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Initial welcome message
  useEffect(() => {
    const userName = portfolio?.personalInfo?.name || DEFAULT_USER.NAME;
    const welcomeMessages = [
      { type: 'response', text: ASCII_LOGO },
      { type: 'response', text: `Terminal Portfolio - ${APP_SETTINGS.SITE_TITLE}` },
      { type: 'response', text: `Welcome to ${userName}'s terminal portfolio. Type 'help' to see available commands.` },
      { type: 'response', text: `Current date: ${new Date().toLocaleString()}` },
      { type: 'response', text: '' },
    ];
    
    setOutput(welcomeMessages);
  }, [portfolio]);

  // Listen for navigation events from terminal links
  useEffect(() => {
    const handleTerminalNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const url = customEvent.detail?.url;
      
      if (url) {
        toast({
          title: "Opening Link",
          description: `Navigating to: ${url}`,
          duration: 3000
        });
        
        // For local file paths, we could implement a "cat" like command in the future
        // For now, we'll just output the URL to the terminal
        setOutput(prev => [...prev, { 
          type: 'info', 
          text: `Link clicked: ${url}`
        }]);
      }
    };
    
    window.addEventListener('terminalNavigate', handleTerminalNavigate);
    
    return () => {
      window.removeEventListener('terminalNavigate', handleTerminalNavigate);
    };
  }, [toast]);

  // Function to download portfolio JSON data
  const downloadPortfolioJSONFile = (data: any): boolean => {
    try {
      console.log('Downloading portfolio data:', data);
      const jsonData = JSON.stringify(data, null, 2);
      
      // Create a blob and generate download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'portfolio.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Dispatch a custom event to notify that the download has completed
      const event = new CustomEvent('portfolioDataDownloaded', {
        detail: { filename: 'portfolio.json' }
      });
      window.dispatchEvent(event);

      console.log('Portfolio data downloaded as portfolio.json');
      return true;
    } catch (error) {
      console.error('Failed to download portfolio data:', error);
      return false;
    }
  };

  // Konami code detection
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Skip if typing test is active
      if (typingTest.isActive) return;
      
      const result = checkKonamiCode(e.key);
      
      if (result.completed && result.message) {
        // Konami code completed - toggle retro mode
        setRetroMode(!retroMode);
        
        // Show message
        setOutput(prev => [...prev, {
          type: 'success',
          text: result.message,
          isAnimating: false,
          animatedText: result.message
        }]);
        
        // Show toast notification
        toast({
          title: "Easter Egg Found!",
          description: "Konami code activated! Retro mode toggled.",
          duration: 3000
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [retroMode, toast, typingTest.isActive]);

  // Start the blinking animation for typos
  const startBlinkingEffect = (command: string) => {
    // Generate animation frames
    const frames = generateBlinkingEffect(command);
    
    // Set animation state
    setBlinkAnimation({
      isActive: true,
      frames,
      currentFrame: 0,
      interval: null
    });
  };

  // Start typing test
  const startTypingTest = async () => {
    try {
      const { quote, startTime } = await TYPING_TEST.start();
      
      setTypingTest({
        isActive: true,
        quote,
        startTime
      });
      
      setOutput(prev => [...prev, {
        type: 'info',
        text: `Type the following text:\n\n"${quote}"\n\nPress Enter when finished.`,
        isAnimating: false,
        animatedText: `Type the following text:\n\n"${quote}"\n\nPress Enter when finished.`
      }]);
      
      // Clear input and focus
      setInput('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to start typing test:', error);
      setOutput(prev => [...prev, {
        type: 'error',
        text: `Failed to start typing test: ${error}`,
        isAnimating: false,
        animatedText: `Failed to start typing test: ${error}`
      }]);
    }
  };

  // End typing test
  const endTypingTest = () => {
    // Calculate time elapsed
    const endTime = Date.now();
    const timeElapsed = endTime - typingTest.startTime;
    
    // Calculate WPM
    const wpm = TYPING_TEST.calculateSpeed(typingTest.quote, timeElapsed);
    
    // Calculate accuracy
    const userInput = input;
    const expectedInput = typingTest.quote;
    let correctChars = 0;
    
    for (let i = 0; i < Math.min(userInput.length, expectedInput.length); i++) {
      if (userInput[i] === expectedInput[i]) {
        correctChars++;
      }
    }
    
    const accuracy = Math.round((correctChars / expectedInput.length) * 100);
    
    // Show results
    setOutput(prev => [...prev, {
      type: 'command',
      text: `> ${userInput}`,
      isAnimating: false,
      animatedText: `> ${userInput}`
    }, {
      type: 'success',
      text: `Typing test results:\nWPM: ${wpm}\nAccuracy: ${accuracy}%\nTime: ${(timeElapsed / 1000).toFixed(2)} seconds`,
      isAnimating: false,
      animatedText: `Typing test results:\nWPM: ${wpm}\nAccuracy: ${accuracy}%\nTime: ${(timeElapsed / 1000).toFixed(2)} seconds`
    }]);
    
    // Reset test
    setTypingTest({
      isActive: false,
      quote: '',
      startTime: 0
    });
    
    // Clear input
    setInput('');
  };

  // Handle command execution
  const executeCommand = (cmd: string) => {
    // Check if typing test is active
    if (typingTest.isActive) {
      endTypingTest();
      return;
    }
    
    // Add command to history
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    
    // Process command
    const command = cmd.trim().toLowerCase();
    
    // Add command to output
    setOutput(prev => [...prev, { type: 'command', text: `> ${cmd}` }]);
    
    // Check if the command is a shorthand/alias
    const aliasedCommand = COMMAND_ALIASES[command] || command;
    
    // Check for special Easter egg commands first
    const easterEggResponse = generateRandomResponse(command);
    if (easterEggResponse) {
      setOutput(prev => [...prev, { 
        type: 'response', 
        text: easterEggResponse 
      }]);
      return;
    }
    
    // Add theme command
    if (aliasedCommand === 'theme' || aliasedCommand.startsWith('theme ')) {
      const args = aliasedCommand.split(' ');
      
      // List available themes if no argument provided
      if (args.length === 1) {
        const themeList = Object.entries(TERMINAL_THEMES)
          .map(([key, theme]) => `${key}: ${theme.name}${key === currentTheme ? ' (current)' : ''}`)
          .join('\n');
        
        setOutput(prev => [...prev, { 
          type: 'response', 
          text: `Available themes:\n${themeList}\n\nUsage: theme <n>`
        }]);
        return;
      }
      
      // Set theme if valid
      const requestedTheme = args[1];
      if (TERMINAL_THEMES.hasOwnProperty(requestedTheme)) {
        setCurrentTheme(requestedTheme);
        setOutput(prev => [...prev, { 
          type: 'success', 
          text: `Theme set to ${TERMINAL_THEMES[requestedTheme as keyof typeof TERMINAL_THEMES].name}.`
        }]);
      } else {
        setOutput(prev => [...prev, { 
          type: 'error', 
          text: `Unknown theme: ${requestedTheme}. Type 'theme' to see available options.`
        }]);
      }
      return;
    }
    
    // Replace focus with history command
    if (aliasedCommand === 'history') {
      if (commandHistory.length === 0) {
        setOutput(prev => [...prev, { 
          type: 'info', 
          text: 'No command history available.'
        }]);
        return;
      }
      
      const historyList = commandHistory
        .map((cmd, index) => `${index + 1}. ${cmd}`)
        .join('\n');
      
      setOutput(prev => [...prev, { 
        type: 'response', 
        text: `Command history:\n${historyList}`
      }]);
      return;
    }
    
    // Clear history command
    if (aliasedCommand === 'clear-history') {
      setCommandHistory([]);
      setOutput(prev => [...prev, { 
        type: 'success', 
        text: 'Command history cleared.'
      }]);
      return;
    }

    // Process different commands
    if (aliasedCommand === '') {
      // Empty command, just add a new line
      return;
    } else if (aliasedCommand === 'clear') {
      setOutput([]);
      return;
    } else if (aliasedCommand === 'help') {
      const additionalHelp = `
  theme              View available themes
  theme <n>       Change terminal theme
  history            View command history
  clear-history      Clear command history
`;
      setOutput(prev => [...prev, { type: 'response', text: HELP_TEXT + additionalHelp }]);
    } else if (aliasedCommand === 'fortune') {
      // Display a random fortune
      const fortunes = [
        "Your code will compile on the first try today.",
        "A bug fixed today prevents a critical issue tomorrow.",
        "Someone will star your GitHub repository soon.",
        "A great opportunity for contribution awaits you.",
        "Your next pull request will be merged without comments.",
        "The path to becoming a better developer is through documentation.",
        "Your commit today will save someone hours of debugging tomorrow.",
        "The best code is no code at all."
      ];
      
      setOutput(prev => [...prev, { 
        type: 'response', 
        text: `🔮 Your fortune: ${fortunes[Math.floor(Math.random() * fortunes.length)]}` 
      }]);
    } else if (aliasedCommand === 'typingtest' || aliasedCommand === 'type') {
      startTypingTest();
    } else if (aliasedCommand === 'about') {
      const bio = portfolio?.personalInfo?.summary || DEFAULT_USER.BIO;
      const title = portfolio?.personalInfo?.title || DEFAULT_USER.TITLE;
      setOutput(prev => [
        ...prev, 
        { 
          type: 'response', 
          text: `Name: ${portfolio?.personalInfo?.name || DEFAULT_USER.NAME}\nTitle: ${title}\n\n${bio}`
        }
      ]);
    } else if (aliasedCommand === 'projects') {
      if (portfolio?.projects?.length) {
        const projectsOutput = portfolio.projects
          .map((project: any) => formatProject(project))
          .join('\n---\n');
        setOutput(prev => [...prev, { type: 'response', text: projectsOutput }]);
      } else {
        setOutput(prev => [...prev, { type: 'response', text: 'No projects found.' }]);
      }
    } else if (aliasedCommand === 'skills') {
      if (portfolio?.skills?.length) {
        const skillsByCategory: any = {};
        
        // Group skills by category
        if (Array.isArray(portfolio.skills)) {
          portfolio.skills.forEach((skill: any) => {
            const category = skill.category || 'Other';
            if (!skillsByCategory[category]) {
              skillsByCategory[category] = [];
            }
            skillsByCategory[category].push(skill);
          });
        }
        
        let skillsOutput = '';
        
        // Format output by category
        Object.keys(skillsByCategory).forEach(category => {
          skillsOutput += `\n== ${category} ==\n`;
          skillsByCategory[category].forEach((skill: any) => {
            const proficiency = skill.proficiency ? `[${'█'.repeat(Math.floor(skill.proficiency / 10))}${' '.repeat(10 - Math.floor(skill.proficiency / 10))}] ${skill.proficiency}%` : '';
            skillsOutput += `${skill.name}: ${proficiency}\n`;
          });
        });
        
        setOutput(prev => [...prev, { type: 'response', text: skillsOutput }]);
      } else {
        setOutput(prev => [...prev, { type: 'response', text: 'No skills data found.' }]);
      }
    } else if (aliasedCommand === 'experience') {
      if (portfolio?.experience?.length) {
        const experienceOutput = portfolio.experience
          .map((exp: any) => formatExperience(exp))
          .join('\n---\n');
        setOutput(prev => [...prev, { type: 'response', text: experienceOutput }]);
      } else {
        setOutput(prev => [...prev, { type: 'response', text: 'No experience data found.' }]);
      }
    } else if (aliasedCommand === 'education') {
      if (portfolio?.education?.length) {
        const educationOutput = portfolio.education
          .map((edu: any) => formatEducation(edu))
          .join('\n---\n');
        setOutput(prev => [...prev, { type: 'response', text: educationOutput }]);
      } else {
        setOutput(prev => [...prev, { type: 'response', text: 'No education data found.' }]);
      }
    } else if (aliasedCommand === 'contact') {
      const email = portfolio?.personalInfo?.email || DEFAULT_USER.EMAIL;
      setOutput(prev => [
        ...prev, 
        { 
          type: 'response', 
          text: `
Email: ${email}
${portfolio?.personalInfo?.phone ? `Phone: ${portfolio.personalInfo.phone}` : ''}
${portfolio?.personalInfo?.location ? `Location: ${portfolio.personalInfo.location}` : ''}

You can reach out via email or use the links in the 'social' command.
`
        }
      ]);
    } else if (aliasedCommand === 'social') {
      const githubUrl = portfolio?.socialLinks?.github || '';
      const linkedinUrl = portfolio?.socialLinks?.linkedin || '';
      const twitterUrl = portfolio?.socialLinks?.twitter || '';
      const personalUrl = portfolio?.socialLinks?.website || '';
      
      setOutput(prev => [
        ...prev, 
        { 
          type: 'response', 
          text: `
${githubUrl ? `GitHub: ${githubUrl}` : ''}
${linkedinUrl ? `LinkedIn: ${linkedinUrl}` : ''}
${twitterUrl ? `Twitter: ${twitterUrl}` : ''}
${personalUrl ? `Website: ${personalUrl}` : ''}
`
        }
      ]);
    } else if (aliasedCommand === 'github') {
      const stats = portfolio?.githubStats;
      if (stats) {
        setOutput(prev => [
          ...prev, 
          { 
            type: 'response', 
            text: `
GitHub Stats for ${portfolio?.personalInfo?.name || DEFAULT_USER.NAME}:

Total Repos: ${stats.totalPublicRepos || 'N/A'}
Total Stars: ${stats.totalStars || 'N/A'}
Total Forks: ${stats.totalForks || 'N/A'}
Total Contributions: ${stats.totalCommits || 'N/A'}

`
          }
        ]);
      } else {
        setOutput(prev => [...prev, { type: 'response', text: 'No GitHub stats available.' }]);
      }
    } else if (aliasedCommand === 'matrix') {
      setShowMatrix(!showMatrix);
      setOutput(prev => [...prev, { 
        type: 'response', 
        text: showMatrix ? 'Matrix effect disabled.' : 'Matrix effect enabled. May the force be with you.' 
      }]);
    } else if (aliasedCommand === 'download' || aliasedCommand.startsWith('download ')) {
      // Parse command for flags
      const args = aliasedCommand.split(' ');
      
      // Default to portfolio if no flags provided
      if (args.length === 1) {
        if (portfolio) {
          const success = downloadPortfolioJSONFile(portfolio);
          if (success) {
            setOutput(prev => [
              ...prev, 
              { type: 'success', text: 'Downloading portfolio.json file...' },
              { type: 'response', text: 'After downloading, place the file in the data/ folder to use your custom portfolio data.' }
            ]);
          } else {
            setOutput(prev => [
              ...prev, 
              { type: 'error', text: 'Failed to download portfolio data.' }
            ]);
          }
        } else {
          setOutput(prev => [
            ...prev, 
            { type: 'error', text: 'No portfolio data available to download.' }
          ]);
        }
        return;
      }
      
      // Process flags
      if (args.includes('-p')) {
        if (portfolio) {
          const success = downloadPortfolioJSONFile(portfolio);
          if (success) {
            setOutput(prev => [
              ...prev, 
              { type: 'success', text: 'Downloading portfolio.json file...' },
              { type: 'response', text: 'After downloading, place the file in the data/ folder to use your custom portfolio data.' }
            ]);
          } else {
            setOutput(prev => [
              ...prev, 
              { type: 'error', text: 'Failed to download portfolio data.' }
            ]);
          }
        } else {
          setOutput(prev => [
            ...prev, 
            { type: 'error', text: 'No portfolio data available to download.' }
          ]);
        }
      }
      
      if (args.includes('-r')) {
        // Download resume
        const resumeUrl = DEFAULT_ASSETS.RESUME_URL;
        
        // Create a temporary link and trigger the download
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.download = 'resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setOutput(prev => [
          ...prev, 
          { type: 'success', text: `Downloading resume from ${resumeUrl}...` }
        ]);
      }
      
      if (!args.includes('-p') && !args.includes('-r')) {
        setOutput(prev => [
          ...prev, 
          { type: 'error', text: 'Invalid download flag. Use "download -p" for portfolio or "download -r" for resume.' }
        ]);
      }
    } else if (aliasedCommand === 'reload') {
      setOutput(prev => [...prev, { type: 'response', text: 'Reloading portfolio data with AI...' }]);
      
      // Call the refresh function
      refreshAllData()
        .then(() => {
          setOutput(prev => [...prev, { type: 'success', text: 'Portfolio data successfully reloaded!' }]);
        })
        .catch(error => {
          setOutput(prev => [...prev, { type: 'error', text: `Error reloading data: ${error.message}` }]);
        });
    } else if (aliasedCommand === 'ascii') {
      setOutput(prev => [...prev, { type: 'response', text: ASCII_LOGO }]);
    } else if (aliasedCommand === 'exit') {
      // Show confirmation dialog for exiting
      if (window.confirm("This will close the current tab. Are you sure you want to exit?")) {
        // Try multiple approaches to close the tab
        try {
          // Attempt 1: Try to close using window.close()
          window.close();
          
          // Attempt 2: If window.close() doesn't work (most browsers block it), redirect to about:blank
          setTimeout(() => {
            window.location.href = "about:blank";
          }, 100);
          
          // Attempt 3: As a last resort, suggest manual closing
          setTimeout(() => {
            toast({
              title: "Unable to close tab automatically",
              description: "Please close this tab manually",
              duration: 5000
            });
          }, 300);
        } catch (e) {
          console.error("Error closing window:", e);
        }
      } else {
        toast({
          title: "Exit Canceled",
          description: "You can continue using the terminal",
          duration: 2000
        });
      }
    } else {
      // Command not found - check for typos to trigger blinking effect
      if (hasTypo(command, validCommands)) {
        // Start blinking effect instead of showing train
        startBlinkingEffect(command);
      } else {
        setOutput(prev => [...prev, { 
          type: 'error', 
          text: `Command not found: ${command}. Type 'help' to see available commands.` 
        }]);
      }
    }
  };

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(input);
    setInput('');
  };

  // Handle key navigation through command history
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple command auto-completion including aliases
      const allCommands = [
        ...Object.keys(COMMAND_ALIASES),
        'help', 'clear', 'about', 'projects', 'skills', 'experience',
        'education', 'contact', 'social', 'github', 'matrix', 'download', 
        'reload', 'ascii', 'exit', 'fortune', 'typingtest',
        'coffee', 'rocket', 'cow', 'sudo', '42'
      ];
      
      if (input) {
        const matchedCommands = allCommands.filter(cmd => cmd.startsWith(input.toLowerCase()));
        if (matchedCommands.length === 1) {
          setInput(matchedCommands[0]);
        } else if (matchedCommands.length > 1) {
          setOutput(prev => [...prev, 
            { type: 'command', text: `> ${input}` },
            { type: 'response', text: `Possible commands: ${matchedCommands.join(', ')}` }
          ]);
        }
      }
    }
  };

  // Handle terminal window controls
  const handleThemeToggle = () => {
    // Cycle through available themes
    const themeKeys = Object.keys(TERMINAL_THEMES);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    const nextTheme = themeKeys[nextIndex];
    
    setCurrentTheme(nextTheme);
    
    toast({
      title: "Theme Changed",
      description: `Using theme: ${TERMINAL_THEMES[nextTheme as keyof typeof TERMINAL_THEMES].name}`,
      duration: 2000
    });
  };
  
  // Handle exit button with confirmation
  const handleExit = () => {
    if (window.confirm("This will close the current tab. Are you sure you want to exit?")) {
      // Try multiple approaches to close the tab
      try {
        // Attempt 1: Try to close using window.close()
        window.close();
        
        // Attempt 2: If window.close() doesn't work (most browsers block it), redirect to about:blank
        setTimeout(() => {
          window.location.href = "about:blank";
        }, 100);
        
        // Attempt 3: As a last resort, suggest manual closing
        setTimeout(() => {
          toast({
            title: "Unable to close tab automatically",
            description: "Please close this tab manually",
            duration: 5000
          });
        }, 300);
      } catch (e) {
        console.error("Error closing window:", e);
      }
    } else {
      toast({
        title: "Exit Canceled",
        description: "You can continue using the terminal",
        duration: 2000
      });
    }
  };

  const handleHistoryToggle = () => {
    setIsHistoryView(!isHistoryView);
    
    if (!isHistoryView) {
      // Show command history
      if (commandHistory.length === 0) {
        toast({
          title: "History View",
          description: "No command history to display",
          duration: 2000
        });
        return;
      }
      
      const historyLines = commandHistory.map((cmd, index) => ({
        type: 'command',
        text: `${index + 1}. ${cmd}`,
        isAnimating: false,
        animatedText: `${index + 1}. ${cmd}`
      }));
      
      // Save current output to restore later
      const savedOutput = [...output];
      
      setOutput([
        { type: 'info', text: '--- Showing Command History ---', isAnimating: false, animatedText: '--- Showing Command History ---' },
        ...historyLines,
        { type: 'info', text: '--- End of History (Click history button to return) ---', isAnimating: false, animatedText: '--- End of History (Click history button to return) ---' }
      ]);
      
      // Store original output to be restored
      animationTimeoutRef.current = setTimeout(() => {
        // This will be accessed when toggling back
        animationTimeoutRef.current = savedOutput as any;
      }, 100);
      
    } else {
      // Restore previous output
      const savedOutput = animationTimeoutRef.current as unknown as TerminalLine[];
      if (Array.isArray(savedOutput)) {
        setOutput(savedOutput);
      } else {
        // If no saved output, just add a message
        setOutput([{ type: 'info', text: 'Terminal view restored', isAnimating: false, animatedText: 'Terminal view restored' }]);
      }
    }
  };

  const handleMaximize = () => {
    setIsFullScreen(!isFullScreen);
    
    // Request fullscreen if supported
    if (!isFullScreen) {
      try {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          element.requestFullscreen();
        }
      } catch (error) {
        console.error("Fullscreen request failed:", error);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      } catch (error) {
        console.error("Exit fullscreen failed:", error);
      }
    }
  };
  
  // Show terminal options dropdown
  const toggleTerminalOptions = () => {
    setShowTerminalOptions(!showTerminalOptions);
  };

  // Spacebar and Enter listener for both animation and paging
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Handle pager keys if pager is active
      if (pager.isActive) {
        if (e.code === 'Space') {
          // Spacebar: show next page
          e.preventDefault();
          handlePagerPageDown();
        } else if (e.code === 'Enter' || e.code === 'NumpadEnter') {
          // Enter: show next line
          e.preventDefault();
          handlePagerLineDown();
        } else if (e.key.toLowerCase() === 'q') {
          // Q: quit pager mode
          e.preventDefault();
          exitPagerMode();
        }
        return;
      }

      // Handle animation keys if not in pager mode
      const hasAnimatingLines = output.some(line => line.isAnimating);
      
      if ((e.code === 'Enter' || e.code === 'NumpadEnter') && hasAnimatingLines) {
        e.preventDefault();
        setSkipAnimation(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [output, pager]);
  
  // Pager mode functions
  const enterPagerMode = (content: string) => {
    // Split by newlines and filter out empty lines at the end
    const lines = content.split('\n');
    
    setPager({
      isActive: true,
      content: lines, 
      currentLine: 0,
      totalLines: lines.length
    });
    
    // Show the first page
    displayCurrentPage();
  };
  
  const exitPagerMode = () => {
    // Add a message indicating the pager was closed
    addToOutput([{ 
      type: 'info', 
      text: '--- Pager closed ---',
      isAnimating: false,
      animatedText: '--- Pager closed ---'
    }]);
    
    setPager({
      isActive: false,
      content: [],
      currentLine: 0,
      totalLines: 0
    });
    
    // Re-focus on input field
    setTimeout(() => inputRef.current?.focus(), 10);
  };
  
  const handlePagerPageDown = () => {
    if (!pager.isActive) return;
    
    const nextLine = Math.min(pager.currentLine + LINES_PER_PAGE, pager.totalLines);
    
    // If we're at the end, exit pager mode
    if (nextLine >= pager.totalLines) {
      exitPagerMode();
    } else {
      // Otherwise update current line and display next page
      setPager(prev => ({
        ...prev,
        currentLine: nextLine
      }));
      displayCurrentPage();
    }
  };
  
  const handlePagerLineDown = () => {
    if (!pager.isActive) return;
    
    const nextLine = Math.min(pager.currentLine + 1, pager.totalLines);
    
    // If we're at the end, exit pager mode
    if (nextLine >= pager.totalLines) {
      exitPagerMode();
    } else {
      // Otherwise update current line and display next page
      setPager(prev => ({
        ...prev,
        currentLine: nextLine
      }));
      displayCurrentPage();
    }
  };
  
  const displayCurrentPage = () => {
    if (!pager.isActive) return;
    
    // Get the lines for the current page
    const startLine = pager.currentLine;
    const endLine = Math.min(startLine + LINES_PER_PAGE, pager.totalLines);
    const pageLines = pager.content.slice(startLine, endLine);
    
    // Clear the output and display the current page
    setOutput([
      { 
        type: 'response', 
        text: pageLines.join('\n'),
        isAnimating: false,
        animatedText: pageLines.join('\n')
      },
      { 
        type: 'info', 
        text: `--- Page ${Math.floor(startLine / LINES_PER_PAGE) + 1}/${Math.ceil(pager.totalLines / LINES_PER_PAGE)} (${pager.currentLine + 1}-${endLine}/${pager.totalLines} lines) | SPACE: next page | ENTER: next line | q: quit ---`,
        isAnimating: false, 
        animatedText: `--- Page ${Math.floor(startLine / LINES_PER_PAGE) + 1}/${Math.ceil(pager.totalLines / LINES_PER_PAGE)} (${pager.currentLine + 1}-${endLine}/${pager.totalLines} lines) | SPACE: next page | ENTER: next line | q: quit ---`
      }
    ]);
  };

  // Special handler for Enter key to ensure animations continue
  const handleEnterKey = (e: React.KeyboardEvent) => {
    // If pager is active, don't process commands
    if (pager.isActive) {
      e.preventDefault();
      return;
    }
    
    if (e.key === 'Enter') {
      // Process the command immediately
      e.preventDefault();
      const currentInput = input;
      setInput('');
      
      // Temporarily blur the input to allow spacebar to work
      inputRef.current?.blur();
      
      // Execute command after a brief delay
      setTimeout(() => {
        executeCommand(currentInput);
        // Focus back on input a bit later
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 10);
    }
  };

  // Function to process terminal line text for links
  const processLineContent = (line: TerminalLine) => {
    // For command type, don't process for links
    if (line.type === 'command') {
      return line.isAnimating ? line.animatedText : line.text;
    }
    
    // Use cached parsed content if available
    if (!line.isAnimating && line.parsedContent) {
      return line.parsedContent;
    }
    
    // Process text for links - either the animating version or full version
    const textToProcess = line.isAnimating ? line.animatedText : line.text;
    if (!textToProcess) return '';
    
    // Parse links in the text
    const parsedContent = parseTextForLinks(textToProcess);
    
    // Cache the parsed content if not animating
    if (!line.isAnimating) {
      line.parsedContent = parsedContent;
    }
    
    return parsedContent;
  };

  // Modify addToOutput to check for large responses and activate pager mode
  const addToOutput = (lines: TerminalLine[]) => {
    // If pager mode is active, don't add output
    if (pager.isActive) return;

    // Process each line
    const processedLines = lines.map(line => ({
      ...line,
      isAnimating: line.type !== 'command', // Don't animate command inputs
      animatedText: line.type === 'command' ? line.text : '' // Start with empty text for animation
    }));
    
    // Check if any response is large enough to trigger pager mode
    const largeOutput = processedLines.find(line => {
      // Count lines by splitting on newlines
      const lineCount = (line.text.match(/\n/g) || []).length + 1;
      return line.type === 'response' && lineCount > LINES_PER_PAGE;
    });
    
    if (largeOutput) {
      // Add small indicator that pager mode is starting
      setOutput(prev => [
        ...prev, 
        { 
          type: 'info', 
          text: '--- Entering pager mode ---',
          isAnimating: false,
          animatedText: '--- Entering pager mode ---'
        }
      ]);
      
      // Activate pager mode with the large content
      setTimeout(() => enterPagerMode(largeOutput.text), 10);
    } else {
      // Normal output addition
      setOutput(prev => [...prev, ...processedLines]);
    }
  };

  return (
    <div 
      className={`terminal-container ${isHistoryView ? 'history-view' : ''} ${isFullScreen ? 'terminal-fullscreen' : ''} ${retroMode ? 'retro-mode' : ''}`}
      ref={terminalContainerRef}
    >
      {showMatrix && <MatrixEffect themeColor={TERMINAL_THEMES[currentTheme as keyof typeof TERMINAL_THEMES].text} />}
      
      <div className="terminal-header">
        <div className="terminal-header-buttons">
          <button 
            className="terminal-header-button terminal-button-exit" 
            onClick={handleExit}
            title="Close tab"
          />
          <button 
            className="terminal-header-button terminal-button-theme" 
            onClick={handleThemeToggle}
            title="Change theme"
          />
          <button 
            className="terminal-header-button terminal-button-maximize" 
            onClick={handleMaximize}
            title="Toggle fullscreen"
          />
        </div>
        <h1>LiveInsight - Terminal {isHistoryView ? ' - Command History' : ` - ${TERMINAL_THEMES[currentTheme as keyof typeof TERMINAL_THEMES].name}`}</h1>
        {/* Terminal menu container */}
      </div>
      
      <div className="terminal-output" ref={outputRef}>
        {output.map((line, index) => (
          <React.Fragment key={index}>
            <pre className={`terminal-line ${line.type}`}>
              {processLineContent(line)}
              {line.isAnimating && <span className="cursor-blink">█</span>}
            </pre>
            {index === output.length - 1 && line.isAnimating && (
              <pre className="terminal-line terminal-hint">Press ENTER to fast-forward...</pre>
            )}
          </React.Fragment>
        ))}
        
        {!pager.isActive && !isHistoryView && (
          <form onSubmit={handleSubmit} className="terminal-input-line">
            <span className="terminal-prompt">{'>'}</span>
            <input 
              type="text"
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                handleEnterKey(e);
                handleKeyDown(e);
              }}
              ref={inputRef}
              autoFocus
              spellCheck="false"
              autoComplete="off"
              aria-label="Terminal input"
            />
          </form>
        )}
        
        {isHistoryView && (
          <div className="history-controls">
            <button onClick={handleHistoryToggle} className="history-back-button">
              Return to Terminal
            </button>
            <button onClick={() => executeCommand('clear-history')} className="history-clear-button">
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;