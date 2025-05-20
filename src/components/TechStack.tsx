import React, { useEffect, useState } from 'react';
import { Loader2, Code2, Database, LineChart, Users, Brain, Server, Globe, Smartphone, Gamepad2, Wrench, ChevronDown, ChevronUp, X, Terminal, CircuitBoard, Zap, Cpu, Cloud, Layout, Code, Layers } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortfolio } from '@/hooks/PortfolioContext';
import { getTechStackWithIcons } from '@/lib/portfolioReader';
import { SECTION_NUMBERS } from '@/config/env';

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
  return icons[category] || <Database size={20} className="text-darktech-holo-cyan" />;
};

// Function to get color based on proficiency level with enhanced cyberpunk colors
const getProficiencyColor = (proficiency: number) => {
  if (proficiency >= 80) return 'from-emerald-400 to-green-500 via-teal-400';
  if (proficiency >= 60) return 'from-blue-400 to-indigo-600 via-violet-500';
  if (proficiency >= 40) return 'from-yellow-300 to-amber-500 via-orange-400';
  return 'from-slate-400 to-gray-600 via-zinc-500';
};

// Get proficiency level label
const getProficiencyLabel = (proficiency: number) => {
  if (proficiency >= 85) return 'Expert';
  if (proficiency >= 70) return 'Advanced';
  if (proficiency >= 50) return 'Intermediate';
  if (proficiency >= 30) return 'Beginner';
  return 'Novice';
};

// Function to generate tech-themed background patterns
const getBackgroundPattern = (categoryName: string) => {
  const patterns = {
    'Frontend': 'radial-gradient(circle, rgba(255,204,0,0.03) 1px, transparent 1px)',
    'Backend': 'radial-gradient(circle, rgba(0,255,0,0.03) 1px, transparent 1px)', 
    'DevOps': 'radial-gradient(circle, rgba(0,128,255,0.03) 1px, transparent 1px)',
    'Data/AI': 'radial-gradient(circle, rgba(255,0,255,0.03) 1px, transparent 1px)',
    'AI': 'radial-gradient(circle, rgba(255,0,255,0.03) 1px, transparent 1px)',
    'Cloud': 'radial-gradient(circle, rgba(0,128,255,0.03) 1px, transparent 1px)',
    'Systems': 'radial-gradient(circle, rgba(255,128,0,0.03) 1px, transparent 1px)',
    'Mobile': 'radial-gradient(circle, rgba(159,0,255,0.03) 1px, transparent 1px)',
    'Architecture': 'radial-gradient(circle, rgba(0,255,255,0.03) 1px, transparent 1px)',
    'default': 'radial-gradient(circle, rgba(0,255,255,0.03) 1px, transparent 1px)'
  };
  
  return patterns[categoryName as keyof typeof patterns] || patterns.default;
};

const TechStack = () => {
  const { portfolio, isLoading, error } = usePortfolio();
  const [showTechModal, setShowTechModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const animationControls = useAnimation();
  
  // Get tech stack icons
  const techStackWithIcons = getTechStackWithIcons(portfolio);

  // Extract top skills from insights with safe fallbacks
  const topSkills = portfolio?.insights?.topSkills || [];
  
  // Group skills by category
  const skillsByCategory: Record<string, typeof topSkills> = {};
  
  // Organize all skills by their categories
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
      'AI': 7
    };
    return (categoryPriority[a as keyof typeof categoryPriority] || 99) - 
           (categoryPriority[b as keyof typeof categoryPriority] || 99);
  });

  // Check if we have any data to show
  const hasNoData = topSkills.length === 0 && techStackWithIcons.length === 0;
  
  // Group tech stack items by category for the modal
  const techStackByCategory = techStackWithIcons.reduce((acc: Record<string, typeof techStackWithIcons>, tech) => {
    // Using a type assertion since the category property may be added dynamically
    const category = (tech as any).category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tech);
    return acc;
  }, {});

  // Animation effect
  useEffect(() => {
    if (inView) {
      animationControls.start('visible');
    }
  }, [inView, animationControls]);

  // Category selection effect
  useEffect(() => {
    // Only set a category if we have categories and none is selected
    if (sortedCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(sortedCategories[0]);
    }
  }, [skillsByCategory, selectedCategory, sortedCategories]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  if (isLoading) {
    return (
      <section id="tech-stack" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Tech Stack</h2>
          <div className="flex flex-col justify-center items-center h-40">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-t-2 border-darktech-neon-green animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-t-2 border-darktech-cyber-pink animate-spin" style={{ animationDuration: '1.5s' }}></div>
              <div className="absolute inset-4 rounded-full border-t-2 border-darktech-holo-cyan animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
            </div>
            <span className="text-darktech-neon-green font-mono tracking-wider">Analyzing tech profile...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="tech-stack" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Tech Stack</h2>
          <div className="glass-panel p-6 border-l-2 border-darktech-cyber-pink">
            <div className="flex items-center justify-center gap-3">
              <Terminal size={24} className="text-darktech-cyber-pink" />
              <p className="text-darktech-cyber-pink font-mono">Error loading tech data. Using default profile.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (hasNoData) {
    return (
      <section id="tech-stack" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Tech Stack</h2>
          <div className="glass-panel p-6">
            <p className="text-darktech-muted mb-4">No technical skills data available. Connect your GitHub repositories to analyze your tech stack.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      id="tech-stack" 
      className="py-20 relative overflow-hidden" 
      data-section-number={SECTION_NUMBERS.TECH_STACK !== 0 ? SECTION_NUMBERS.TECH_STACK : 0}
      ref={ref}
      initial="hidden"
      animate={animationControls}
      variants={containerVariants}
    >
      {/* Tech-themed decorative elements */}
      <div className="absolute top-20 left-0 w-[150px] h-[150px] border border-darktech-neon-green/20 rounded-full opacity-10"></div>
      <div className="absolute bottom-20 right-0 w-[200px] h-[200px] border border-darktech-cyber-pink/20 rounded-full opacity-10"></div>
      <div className="absolute bottom-40 left-1/4 w-[50px] h-[50px] border border-darktech-holo-cyan/30 rounded-full opacity-20"></div>
      
      {/* Circuit lines */}
      <div className="absolute top-0 left-1/3 w-[1px] h-full bg-gradient-to-b from-transparent via-darktech-neon-green/30 to-transparent opacity-20"></div>
      <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-darktech-cyber-pink/20 to-transparent opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className={`w-4/5 ${SECTION_NUMBERS.TECH_STACK === 0 ? 'mx-auto' : SECTION_NUMBERS.TECH_STACK % 2 === 1 ? 'mr-auto ml-0' : 'ml-auto mr-0'}`}
          variants={itemVariants}
        >
          <div className={`${SECTION_NUMBERS.TECH_STACK === 0 ? 'text-center' : 
            SECTION_NUMBERS.TECH_STACK % 2 === 1 ? 'text-left' : 'text-right'} mb-16`}>
            <motion.div 
              className="inline-block relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl font-bold mb-2 relative z-10 inline-flex items-center gap-3">
                <CircuitBoard className="text-darktech-neon-green h-8 w-8" />
                <span>Tech Stack</span>
                <span className="ml-2 h-1 w-6 bg-darktech-cyber-pink rounded-full inline-block"></span>
              </h2>
              <div className="absolute -inset-1 bg-darktech-neon-green/10 blur-md rounded-lg -z-10"></div>
            </motion.div>
            <motion.p 
              className={`text-darktech-muted max-w-2xl mt-4 ${SECTION_NUMBERS.TECH_STACK === 0 ? 'mx-auto' : 
                SECTION_NUMBERS.TECH_STACK % 2 === 1 ? 'mr-auto' : 'ml-auto'}`}
              variants={itemVariants}
            >
              My technical skills automatically analyzed from GitHub repositories and contributions.
            </motion.p>
          </div>
        </motion.div>

        {/* Skill Categories Navigation Tabs */}
        {Object.keys(skillsByCategory).length > 0 && (
          <motion.div 
            className={`glass-panel p-8 rounded-xl mb-12 border border-darktech-border hover:border-darktech-neon-green/50 transition-all relative max-w-[90%] lg:max-w-[80%] backdrop-blur-sm ${SECTION_NUMBERS.TECH_STACK === 0 ? 'mx-auto' : SECTION_NUMBERS.TECH_STACK % 2 === 1 ? 'mr-auto' : 'ml-auto'}`}
            style={{ boxShadow: '0 0 30px rgba(0, 255, 0, 0.05)' }}
            variants={containerVariants}
          >
            <div className="absolute inset-0 rounded-xl overflow-hidden -z-10">
              <div className="w-full h-full" style={{ 
                backgroundImage: selectedCategory ? getBackgroundPattern(selectedCategory) : undefined,
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            <motion.h3 
              className={`text-2xl font-bold mb-6 pl-4 flex items-center gap-2 ${SECTION_NUMBERS.TECH_STACK === 0 ? 'justify-center' : 
              SECTION_NUMBERS.TECH_STACK % 2 === 1 ? 'justify-start' : 'justify-end'}`}
              variants={itemVariants}
            >
              <Zap size={20} className="text-darktech-neon-green" />
              <span>Top Skills Analysis</span>
            </motion.h3>
            
            {/* Category Selection Tabs */}
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {Object.entries(skillsByCategory).map(([category]) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full text-sm py-1 px-4 border ${
                      selectedCategory === category 
                        ? 'bg-darktech-card border-darktech-neon-green text-darktech-neon-green shadow-md shadow-darktech-neon-green/20' 
                        : 'bg-darktech-background/20 hover:bg-darktech-card/40 border-darktech-border/50'
                    }`}
                    size="sm"
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </motion.div>
            
            {/* Selected Category Skills */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {selectedCategory && skillsByCategory[selectedCategory] && (
                  <div className="space-y-6">
                    {skillsByCategory[selectedCategory].map((skill, index) => (
                        <motion.div 
                        key={skill.name} 
                        className={`p-4 rounded-lg bg-darktech-background/40 border border-transparent ${hoveredSkill === skill.name ? 'border-darktech-neon-green/50 shadow-lg shadow-darktech-neon-green/5' : ''} transition-all duration-300`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onMouseEnter={() => setHoveredSkill(skill.name)}
                        onMouseLeave={() => setHoveredSkill(null)}
                        >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-lg">{skill.name}</span>
                          <Badge variant="outline" className="bg-darktech-card/50 font-mono text-xs py-0">
                          {getProficiencyLabel(skill.proficiency)}
                          </Badge>
                        </div>
                        
                        <div className="h-2.5 w-full bg-darktech-background/70 rounded-full overflow-hidden relative">
                          <motion.div 
                          className={`h-full rounded-full bg-gradient-to-r ${getProficiencyColor(skill.proficiency)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.proficiency}%` }}
                          transition={{ delay: 0.2 + index * 0.1, duration: 1, ease: "easeOut" }}
                          >
                          {hoveredSkill === skill.name && (
                            <div className="absolute top-0 right-0 h-full w-1.5 bg-white animate-pulse"></div>
                          )}
                          </motion.div>
                        </div>
                        
                        {/* Digital percentage display */}
                        <div className="flex justify-end mt-1">
                          <span className="text-xs font-mono text-darktech-muted">{Math.round(skill.proficiency)}%</span>
                        </div>
                        
                        {skill.justification && (
                          <motion.p 
                          className={`text-sm text-darktech-muted mt-2 mb-2 text-left bg-darktech-card/20 rounded border-l-2 border-darktech-border font-mono ${
                            skill.justification.length > 100 ? 'p-4 line-clamp-2' : 
                            skill.justification.length > 50 ? 'p-2 line-clamp-1' : 'p-1.5'
                          }`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          >
                          {skill.justification}
                          </motion.p>
                        )}
                        
                        </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tech Stack Modal Button */}
        <motion.div 
          className="text-center mb-6"
          variants={itemVariants}
        >
          <Dialog open={showTechModal} onOpenChange={setShowTechModal}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="bg-darktech-card hover:bg-darktech-card/90 border-2 border-darktech-neon-green text-darktech-neon-green font-medium px-6 py-6 text-lg relative group overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-darktech-neon-green/20 via-transparent to-darktech-neon-green/20 opacity-0 group-hover:opacity-100 group-hover:animate-scan transition-opacity"></span>
                <Code2 className="mr-2 h-5 w-5 animate-pulse" />
                <span className="relative z-10">View Complete Tech Stack</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-4xl max-h-[85vh] bg-darktech-background border border-darktech-border rounded-xl flex flex-col overflow-hidden">
              <div className="absolute inset-0 border-2 border-darktech-neon-green/10 rounded-xl -m-px blur-sm"></div>
              
              <DialogHeader className="relative border-b border-darktech-border sticky top-0 z-10 bg-darktech-background p-4">
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                  <div className="w-full h-full border-t-2 border-r-2 border-darktech-neon-green/50 rounded-tr-xl"></div>
                </div>
                <div className="absolute top-0 left-0 w-24 h-24 opacity-10">
                  <div className="w-full h-full border-t-2 border-l-2 border-darktech-cyber-pink/50 rounded-tl-xl"></div>
                </div>
                
                <DialogTitle className="text-2xl font-bold text-center flex justify-center items-center gap-3">
                  <Terminal size={20} className="text-darktech-neon-green" />
                  <span>Complete Tech Stack</span>
                </DialogTitle>
                <DialogDescription className="text-darktech-muted text-center font-mono">
                  &lt; Tools, frameworks, and technologies I work with /&gt;
                </DialogDescription>
              </DialogHeader>
              
              {/* Scrollable content area with tabs for categories */}
              <div className="overflow-y-auto flex-grow mt-4 custom-scrollbar">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full flex flex-wrap justify-center mb-4 bg-darktech-card/20 sticky top-0 z-10 px-2">
                    <TabsTrigger value="all" className="data-[state=active]:bg-darktech-card data-[state=active]:text-darktech-neon-green">
                      All Technologies
                    </TabsTrigger>
                    {Object.keys(techStackByCategory).map((category) => (
                      <TabsTrigger 
                        key={category} 
                        value={category}
                        className="data-[state=active]:bg-darktech-card data-[state=active]:text-darktech-neon-green"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <TabsContent value="all" className="p-2">
                    <motion.div 
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {techStackWithIcons.map((tech, index) => (
                        <motion.div 
                          key={index} 
                          className="flex flex-col items-center p-3 hover:scale-110 transition-all rounded-lg bg-darktech-card/30 hover:bg-darktech-card/60 border border-darktech-border/30 hover:border-darktech-neon-green/30 group"
                          variants={itemVariants}
                          whileHover={{ y: -5 }}
                        >
                          {tech.icon ? (
                            <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-white to-gray-100 rounded-lg mb-2 p-2 shadow-md group-hover:shadow-darktech-neon-green/20 transition-all">
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
                                    fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-darktech-neon-green"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>';
                                    fallbackIcon.className = 'flex items-center justify-center text-darktech-neon-green';
                                    parent.appendChild(fallbackIcon);
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 mb-2 flex items-center justify-center bg-darktech-card rounded-lg group-hover:bg-darktech-card/80">
                              <Code2 size={32} className="text-darktech-neon-green" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-center group-hover:text-darktech-neon-green transition-colors">{tech.name}</span>
                          {/* Use type assertion for tech.category */}
                          {(tech as any).category && (
                            <span className="text-xs text-darktech-muted mt-1 opacity-70">{(tech as any).category}</span>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </TabsContent>
                  
                  {Object.entries(techStackByCategory).map(([category, techs]) => (
                    <TabsContent key={category} value={category} className="p-2">
                      <motion.div 
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {techs.map((tech, index) => (
                          <motion.div 
                            key={index} 
                            className="flex flex-col items-center p-3 hover:scale-110 transition-all rounded-lg bg-darktech-card/30 hover:bg-darktech-card/60 border border-darktech-border/30 hover:border-darktech-neon-green/30 group"
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                          >
                            {tech.icon ? (
                              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-white to-gray-100 rounded-lg mb-2 p-2 shadow-md group-hover:shadow-darktech-neon-green/20 transition-all">
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
                                      fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-darktech-neon-green"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>';
                                      fallbackIcon.className = 'flex items-center justify-center text-darktech-neon-green';
                                      parent.appendChild(fallbackIcon);
                                    }
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 mb-2 flex items-center justify-center bg-darktech-card rounded-lg group-hover:bg-darktech-card/80">
                                <Code2 size={32} className="text-darktech-neon-green" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-center group-hover:text-darktech-neon-green transition-colors">{tech.name}</span>
                            {/* Use type assertion for tech.category */}
                            {(tech as any).category && (
                              <span className="text-xs text-darktech-muted mt-1 opacity-70">{(tech as any).category}</span>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
              
              {/* Fixed footer with close button */}
              <div className="absolute bottom-0 left-0 right-0 bg-darktech-background/90 backdrop-blur-sm p-4 border-t border-darktech-border flex justify-center">
                <Button 
                  onClick={() => setShowTechModal(false)}
                  className="bg-darktech-card hover:bg-darktech-card/90 border border-darktech-neon-green/50 hover:border-darktech-neon-green text-darktech-neon-green font-medium px-8"
                >
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Decorative circuit element */}
        <motion.div 
          className="absolute bottom-0 left-0 w-32 h-32 opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ delay: 1 }}
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <path d="M10,50 L40,50 L40,20 L70,20 L70,80 L90,80" stroke="currentColor" className="stroke-darktech-neon-green" strokeWidth="1" />
            <circle cx="10" cy="50" r="3" className="fill-darktech-neon-green" />
            <circle cx="40" cy="50" r="3" className="fill-darktech-neon-green" />
            <circle cx="40" cy="20" r="3" className="fill-darktech-neon-green" />
            <circle cx="70" cy="20" r="3" className="fill-darktech-neon-green" />
            <circle cx="70" cy="80" r="3" className="fill-darktech-neon-green" />
            <circle cx="90" cy="80" r="3" className="fill-darktech-neon-green" />
          </svg>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TechStack;