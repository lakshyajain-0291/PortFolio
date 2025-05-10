import React, { useEffect, useState } from 'react';
import { Loader2, Code2, Database, LineChart, Users, Brain, Server, Globe, Smartphone, Gamepad2, Wrench, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { usePortfolio } from '@/hooks/PortfolioContext';
import { getTechStackWithIcons } from '@/lib/portfolioReader';

// Map category names to appropriate icons
const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Frontend': <Code2 size={20} className="text-yellow-400" />,
    'Backend': <Server size={20} className="text-green-400" />,
    'DevOps': <Globe size={20} className="text-blue-400" />,
    'Mobile': <Smartphone size={20} className="text-purple-400" />,
    'Data/AI': <Brain size={20} className="text-pink-400" />,
    'Soft Skills': <Users size={20} className="text-orange-400" />,
    'Tools': <Wrench size={20} className="text-cyan-400" />,
    'Game Development': <Gamepad2 size={20} className="text-red-400" />,
  };
  return icons[category] || <Database size={20} className="text-darktech-holo-cyan" />;
};

// Function to get color based on proficiency level
const getProficiencyColor = (proficiency: number) => {
  if (proficiency >= 80) return 'from-green-400 to-green-600';
  if (proficiency >= 60) return 'from-blue-400 to-blue-600';
  if (proficiency >= 40) return 'from-yellow-400 to-yellow-600';
  return 'from-gray-400 to-gray-600';
};

const TechStack = () => {
  const { portfolio, isLoading, error } = usePortfolio();
  const [showTechModal, setShowTechModal] = useState<boolean>(false);

  if (isLoading) {
    return (
      <section id="tech-stack" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Tech Stack</h2>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-darktech-neon-green h-8 w-8" />
            <span className="ml-2">Loading tech stack...</span>
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
          <div className="glass-panel p-6">
            <p className="text-darktech-cyber-pink">Error loading tech data. Using default data.</p>
          </div>
        </div>
      </section>
    );
  }

  // Get tech stack icons
  const techStackWithIcons = getTechStackWithIcons(portfolio);

  // Extract top skills from insights with safe fallbacks
  const topSkills = portfolio?.insights?.topSkills || [];
  
  // Filter out programming languages from top skills
  const filteredTopSkills = topSkills.filter(skill => 
    !skill.name.toLowerCase().includes('javascript') && 
    !skill.name.toLowerCase().includes('typescript') &&
    !skill.name.toLowerCase().includes('python') &&
    !skill.name.toLowerCase().includes('java') &&
    !skill.name.toLowerCase().includes('c#') &&
    !skill.name.toLowerCase().includes('c++') &&
    !skill.name.toLowerCase().includes('ruby') &&
    !skill.name.toLowerCase().includes('php') &&
    !skill.name.toLowerCase().includes('go')
  );

  // Group skills by category
  const skillsByCategory: Record<string, typeof filteredTopSkills> = {};
  
  filteredTopSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  // Check if we have any data to show
  const hasNoData = filteredTopSkills.length === 0 && techStackWithIcons.length === 0;

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
    <section id="tech-stack" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tech Stack</h2>
          <p className="text-darktech-muted max-w-2xl mx-auto">
            My technical skills automatically analyzed from GitHub repositories and contributions.
          </p>
        </div>

        {/* Top Skills Section - Grouped by Category */}
        {Object.keys(skillsByCategory).length > 0 && (
          <div className="glass-panel p-8 rounded-xl mb-12 border border-darktech-border hover:border-darktech-neon-green/50 transition-colors">
            <h3 className="text-2xl font-bold mb-6 text-center">Top Skills by Category</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category} className="bg-darktech-card/20 rounded-lg p-5 hover:bg-darktech-card/30 transition-colors">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-darktech-border/40">
              {getCategoryIcon(category)}
              <h4 className="text-lg font-semibold text-darktech-neon-green">{category}</h4>
            </div>
            
            <div className="space-y-5">
              {skills.slice(0, 3).map((skill, index) => (
                <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">{skill.name}</span>
              <Badge variant="outline" className="bg-darktech-background/40">
                {skill.proficiency}%
              </Badge>
            </div>
            <div className="h-2 w-full bg-darktech-background/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getProficiencyColor(skill.proficiency)}`}
                style={{ width: `${skill.proficiency}%` }}
              ></div>
            </div>
            {skill.justification && (
              <p className="text-xs text-darktech-muted line-clamp-2">
                {skill.justification}
              </p>
            )}
                </div>
              ))}
            </div>
          </div>
              ))}
            </div>
          </div>
        )}
        {/* Tech Stack Modal Button */}
        <div className="text-center mb-6">
          <Dialog open={showTechModal} onOpenChange={setShowTechModal}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="bg-darktech-neon-green hover:bg-darktech-neon-green/90 text-darktech-background font-medium px-6 py-6 text-lg shadow-lg shadow-darktech-neon-green/20 hover:scale-105 transition-all"
              >
                <Code2 className="mr-2 h-5 w-5" />
                View Complete Tech Stack
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-3xl max-h-[80vh] bg-darktech-background border-darktech-border flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Complete Tech Stack</DialogTitle>
                <DialogDescription className="text-darktech-muted text-center">
                  Tools, frameworks, and technologies I work with
                </DialogDescription>
              </DialogHeader>
              
              {/* Scrollable content area */}
              <div className="overflow-y-auto flex-grow pb-16">
                {/* All Skills by Category */}
                <div className="p-4 mb-6">
                  <h3 className="text-xl font-semibold mb-4">All Skills by Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(skillsByCategory).map(([category, skills]) => (
                      <div key={category} className="bg-darktech-card/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-darktech-border">
                          {getCategoryIcon(category)}
                          <h4 className="font-medium text-darktech-neon-green">{category}</h4>
                        </div>
                        
                        <div className="space-y-3">
                          {skills.map((skill, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between">
                                <span className="font-medium">{skill.name}</span>
                                <Badge>{skill.proficiency}%</Badge>
                              </div>
                              <div className="h-1.5 w-full bg-darktech-background rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full bg-gradient-to-r ${getProficiencyColor(skill.proficiency)}`}
                                  style={{ width: `${skill.proficiency}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Icons Grid */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-4">Technologies & Tools</h3>
                  {techStackWithIcons.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {techStackWithIcons.map((tech, index) => (
                        <div 
                          key={index} 
                          className="flex flex-col items-center p-3 hover:scale-110 transition-transform rounded-lg bg-darktech-card/40 hover:bg-darktech-card/60"
                        >
                          {tech.icon ? (
                            <div className="w-16 h-16 flex items-center justify-center bg-white/95 rounded-md mb-2 p-2">
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
                            <div className="w-16 h-16 mb-2 flex items-center justify-center bg-darktech-card rounded-md">
                              <Code2 size={32} className="text-darktech-neon-green" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-center">{tech.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Fixed footer with close button */}
              <div className="absolute bottom-0 left-0 right-0 bg-darktech-background/90 backdrop-blur-sm p-4 border-t border-darktech-border flex justify-center">
                <Button 
                  onClick={() => setShowTechModal(false)}
                  className="bg-darktech-neon-green hover:bg-darktech-neon-green/80 text-darktech-background font-medium px-8"
                >
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default TechStack;