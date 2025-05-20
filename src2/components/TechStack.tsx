import React, { useEffect, useState } from 'react';
import { Code2, Database, LineChart, Users, Brain, Server, Globe, Smartphone, Gamepad2, Wrench, X, Terminal, Cpu, Cloud, Layout, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../../src/components/ui/badge';
import { Button } from '../../src/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../src/components/ui/dialog";
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { getTechStackWithIcons } from '../../src/lib/portfolioReader';
import { useTheme } from './theme-provider';

// Map category names to appropriate icons
const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Frontend': <Layout size={20} className="text-yellow-400" />,
    'Backend': <Server size={20} className="text-green-400" />,
    'DevOps': <Globe size={20} className="text-blue-400" />,
    'Mobile': <Smartphone size={20} className="text-purple-400" />,
    'Data/AI': <Brain size={20} className="text-pink-400" />,
    'AI': <Brain size={20} className="text-pink-400" />,
    'Cloud': <Cloud size={20} className="text-blue-400" />,
    'Systems': <Cpu size={20} className="text-orange-400" />,
    'Architecture': <Layers size={20} className="text-cyan-400" />,
    'Soft Skills': <Users size={20} className="text-orange-400" />,
    'Tools': <Wrench size={20} className="text-cyan-400" />,
    'Game Development': <Gamepad2 size={20} className="text-red-400" />,
  };
  return icons[category] || <Database size={20} className="text-primary" />;
};

// Function to get color based on proficiency level
const getProficiencyColor = (proficiency: number) => {
  if (proficiency >= 80) return 'from-green-400 to-green-600';
  if (proficiency >= 60) return 'from-blue-400 to-blue-600';
  if (proficiency >= 40) return 'from-yellow-400 to-yellow-600';
  return 'from-gray-400 to-gray-600';
};

// Function to get proficiency level label
const getProficiencyLabel = (proficiency: number) => {
  if (proficiency >= 85) return 'Expert';
  if (proficiency >= 70) return 'Advanced';
  if (proficiency >= 50) return 'Intermediate';
  if (proficiency >= 30) return 'Beginner';
  return 'Novice';
};

// Circuit background pattern for tech theme
const CircuitBackground = () => {
  const { theme } = useTheme(); // Get current theme
  const isDark = theme === 'dark';
  const strokeColor = isDark ? 'currentColor' : '#3b82f6'; // Use blue for light mode
  const fillColor = isDark ? 'currentColor' : '#3b82f6'; // Use blue for light mode
  
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none" style={{ opacity: isDark ? 0.1 : 0.2 }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <pattern id="circuit" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M0 50 H100 M50 0 V100 M25 25 H50 V50 M75 25 V50 H50 M25 75 H50 V50 M75 75 V50" 
            fill="none" stroke={strokeColor} strokeWidth="1" />
          <circle cx="25" cy="25" r="3" fill={fillColor} />
          <circle cx="75" cy="25" r="3" fill={fillColor} />
          <circle cx="25" cy="75" r="3" fill={fillColor} />
          <circle cx="75" cy="75" r="3" fill={fillColor} />
        </pattern>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  );
};

// Terminal-like component for tech theme
const TechTerminal = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="rounded-lg overflow-hidden border border-primary/30 shadow-lg">
      <div className="bg-black/80 text-green-400 p-1 flex items-center border-b border-primary/30">
        <div className="flex space-x-1.5 ml-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 text-center text-xs font-mono font-bold">tech_stack.sh</div>
      </div>
      <div className="bg-black/70 p-4 font-mono text-sm">
        {children}
      </div>
    </div>
  );
};

type Skill = {
  name: string;
  category: string;
  proficiency: number;
  justification?: string;
};

const TechStack = () => {
  const { portfolio, isLoading } = usePortfolio();
  const [showTechModal, setShowTechModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [typedText, setTypedText] = useState("");
  
  // Terminal typing effect
  useEffect(() => {
    const text = "> Analyzing tech skills from GitHub repositories...";
    let i = 0;
    if (!isLoading) return;
    
    const typing = setInterval(() => {
      setTypedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(typing);
    }, 50);
    
    return () => clearInterval(typing);
  }, [isLoading]);

  // Get tech stack icons
  const techStackWithIcons = getTechStackWithIcons(portfolio);

  // Extract top skills from insights with safe fallbacks
  const topSkills = portfolio?.insights?.topSkills || [];
  
  // Group skills by category
  const skillsByCategory: Record<string, Skill[]> = {};
  
  // Organize all skills by their categories (not filtering out programming languages)
  topSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });
  
  // Sort categories by importance or alphabetically
  const sortedCategories = Object.keys(skillsByCategory).sort((a, b) => {
    const categoryPriority = {
      'Backend': 1,
      'Frontend': 2,
      'Mobile': 3,
      'Systems': 4,
      'Cloud': 5,
      'Architecture': 6,
      'AI': 7,
      'Data/AI': 8
    };
    return (categoryPriority[a as keyof typeof categoryPriority] || 99) - 
           (categoryPriority[b as keyof typeof categoryPriority] || 99);
  });

  // Check if we have any data to show
  const hasNoData = topSkills.length === 0 && techStackWithIcons.length === 0;

  // Display loading state
  if (isLoading) {
    return (
      <section id="tech-stack" className="py-20 relative">
        <CircuitBackground />
        <div className="container mx-auto px-4 text-center">
        <div className="mx-auto px-4 relative w-4/5">

          <motion.h2 
            className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Tech Stack
          </motion.h2>
          <div className="flex justify-center items-center h-40">
            <TechTerminal>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">$</span>
                <span className="text-white">{typedText}</span>
                <span className="inline-block w-2 h-5 ml-1 bg-green-400 animate-pulse"></span>
              </div>
            </TechTerminal>
          </div>
          </div>
        </div>
      </section>
    );
  }

  // Display empty state
  if (hasNoData) {
    return (
      <section id="tech-stack" className="py-20 relative">
        <CircuitBackground />
        <div className="container mx-auto px-4 text-center">
        <div className="mx-auto px-4 relative w-4/5">

          <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Tech Stack</h2>
          <TechTerminal>
            <div className="text-red-400 mb-2">$ Error: Data not found</div>
            <div className="text-white mb-1">No technical skills data available.</div>
            <div className="flex items-center mt-3">
              <span className="text-green-400 mr-2">$</span>
              <span className="text-white">Loading data</span>
              <span className="inline-block w-2 h-5 ml-1 bg-green-400 animate-pulse"></span>
            </div>
          </TechTerminal>
        </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tech-stack" className="py-20 relative">
      <CircuitBackground />
      <div className="container mx-auto px-4">
      <div className="mx-auto px-4 relative w-4/5">

        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            &lt;TechStack /&gt;
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* <span className="text-4xl font-bold mb-4"> My Tech Stack</span> */}
            <br />
            My technical skills automatically analyzed from GitHub repositories and contributions.
          </motion.p>
        </div>

        {/* Top Skills Section - Grouped by Category */}
        {Object.keys(skillsByCategory).length > 0 && (
          <motion.div 
            className="bg-black/20 backdrop-blur-sm border border-primary/30 hover:border-primary/60 transition-colors rounded-xl mb-12 max-w-5xl mx-auto p-8 shadow-lg shadow-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Terminal className="text-primary" size={24} />
              <h3 className="text-2xl font-bold text-center font-mono text-foreground">Top Skills by Category</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Object.entries(skillsByCategory).map(([category]) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`rounded-md text-sm transition-all ${selectedCategory === category ? 'shadow-md shadow-primary/20' : ''}`}
                  onClick={() => setSelectedCategory(currentCategory => 
                    currentCategory === category ? null : category
                  )}
                >
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category}</span>
                </Button>
              ))}
            </div>
            
            <div className="mt-8">
              <AnimatePresence mode="wait">
                {selectedCategory ? (
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-primary/30">
                      {getCategoryIcon(selectedCategory)}
                      <h4 className="text-lg font-semibold text-primary">{selectedCategory}</h4>
                    </div>
                    
                    {skillsByCategory[selectedCategory].map((skill, index) => (
                      <motion.div 
                        key={index} 
                        className="bg-black/30 backdrop-blur-sm rounded-lg p-5 border border-border/40 hover:border-primary/40 transition-colors"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                            {skill.proficiency}%
                          </Badge>
                        </div>
                        <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full rounded-full bg-gradient-to-r ${getProficiencyColor(skill.proficiency)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.proficiency}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                        {skill.justification && (
                          <p className="text-xs text-foreground/70 mt-3 line-clamp-2 text-left">
                            {skill.justification}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Terminal className="mx-auto mb-2 text-primary" size={32} />
                    <p>Select a category to view skills</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
        
        {/* Tech Stack Modal Button */}
        <div className="text-center mb-6">
          <Dialog open={showTechModal} onOpenChange={setShowTechModal}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="px-6 py-2 text-base shadow-md hover:scale-105 transition-all border border-primary/30 bg-gradient-to-r from-primary/80 to-blue-500/80"
              >
                <Terminal className="mr-2 h-5 w-5" />
                <span className="font-mono font-bold">./view-complete-stack.sh</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-3xl max-h-[85vh] bg-black/90 border-primary/30 flex flex-col backdrop-blur-xl overflow-hidden">
              <DialogHeader className="sticky top-0 z-10 bg-black/90 border-b border-primary/30 py-4">
                <DialogTitle className="text-2xl font-bold text-center font-mono text-primary">&lt;Complete Tech Stack /&gt;</DialogTitle>
                <DialogDescription className="text-muted-foreground text-center">
                  Tools, frameworks, and technologies I work with
                </DialogDescription>
              </DialogHeader>
              
              {/* Scrollable content area with custom scrollbar */}
              <div className="overflow-y-auto flex-grow custom-scrollbar py-4 px-2">
                {/* Tech Icons Grid */}
                <div className="p-2">
                  <div className="flex items-center mb-6">
                    <div className="h-px flex-1 bg-primary/30"></div>
                    <h3 className="text-xl font-semibold mx-4 font-mono">Technologies & Tools</h3>
                    <div className="h-px flex-1 bg-primary/30"></div>
                  </div>
                  
                  {techStackWithIcons.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {techStackWithIcons.map((tech, index) => (
                        <motion.div 
                          key={index} 
                          className="flex flex-col items-center p-3 rounded-lg bg-black/40 border border-primary/30 hover:border-primary transition-all"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          whileHover={{ scale: 1.03 }}
                        >
                          {tech.icon ? (
                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-md p-2">
                              <img 
                                src={tech.icon} 
                                alt={tech.name} 
                                className="max-w-full max-h-full object-contain" 
                                onError={(e) => {
                                  // Fallback for invalid icons
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallbackIcon = document.createElement('div');
                                    fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>';
                                    fallbackIcon.className = 'flex items-center justify-center text-primary';
                                    parent.appendChild(fallbackIcon);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-white rounded-md">
                              <Code2 size={24} className="text-primary" />
                            </div>
                          )}
                          <span className="text-xs font-medium text-center text-white mt-2">{tech.name}</span>
                          {/* Display category if available */}
                          {(tech as any).category && (
                            <span className="text-xs text-primary/70 mt-1">{(tech as any).category}</span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Fixed footer with code-inspired close button */}
              <div className="sticky bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm py-3 border-t border-primary/30 flex justify-center mt-auto">
                <Button 
                  onClick={() => setShowTechModal(false)}
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary/20 px-6 font-bold"
                >
                  <span className="font-mono font-bold mr-2">exit()</span>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Programming Languages Section - Terminal Style */}
        {portfolio?.insights?.technicalProfile?.languages && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto mt-16"
          >
            <TechTerminal>
              <div className="text-green-400 mb-4 font-mono"># Programming Languages Proficiency</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {portfolio.insights.technicalProfile.languages.map((lang, index) => (
                  <motion.div 
                    key={index}
                    className="bg-white/5 border border-primary/20 rounded-lg p-4 text-center hover:border-primary/60 transition-all"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  >
                    <div className="text-lg font-mono mb-2 text-foreground">{lang.name}</div>
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                      {lang.proficiency}
                    </Badge>
                  </motion.div>
                ))}
              </div>
              <div className="text-green-400 mt-4 flex items-center">
                <span>$</span>
                <span className="inline-block w-2 h-5 ml-2 bg-green-400 animate-pulse"></span>
              </div>
            </TechTerminal>
          </motion.div>
        )}
      </div>
        </div>
    </section>
  );
};

export default TechStack;