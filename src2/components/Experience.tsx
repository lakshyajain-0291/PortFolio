import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, ArrowRight, Github, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { Card } from '@/components/ui/card';

const Experience = () => {
  const { portfolio, isLoading } = usePortfolio();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <section id="experience" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Professional Experience</h2>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3">Loading experience data...</span>
          </div>
        </div>
      </section>
    );
  }

  // Get experience items from portfolio data
  const experienceItems = portfolio?.experience || [];
  
  return (
    <section id="experience" className="py-20">
      <div className="container mx-auto px-4">
      <div className="mx-auto px-4 relative w-4/5">

        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">Professional Experience</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              My professional journey and key accomplishments.
            </p>
          </motion.div>
          
          {/* GitHub Projects Summary - Show if available */}
          {portfolio?.githubStats && portfolio.githubStats.totalPublicRepos > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-accent/10">
                <Github className="h-4 w-4 text-primary" />
                <span className="text-sm"><strong>{portfolio.githubStats.totalPublicRepos}</strong> repositories</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm"><strong>{portfolio.githubStats.totalCommits}</strong> commits</span>
              </div>
            </motion.div>
          )}
        </div>

        {experienceItems.length === 0 ? (
          <div className="text-center py-12 bg-accent/5 rounded-lg">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg">No professional experience to display yet.</p>
            <p className="text-muted-foreground mt-2">Experience will appear here once added to your portfolio.</p>
          </div>
        ) : (
          <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="relative max-w-4xl mx-auto"
          >
            {/* Enhanced Timeline line - FIXED VISIBILITY */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-10 w-3">
              {/* Main animated central line with stronger visibility */}
              <div className="w-2 h-full mx-auto bg-gradient-to-b from-primary via-primary to-primary/70 rounded-full 
                              shadow-[0_0_8px_2px_rgba(var(--primary-rgb),0.3)]">
                {/* Animated light effect moving down the line */}
                <div 
                  className="absolute w-full h-[40%] top-0 bg-gradient-to-b from-transparent via-white/50 to-transparent" 
                  style={{ 
                    animation: "moveDown 8s linear infinite",
                  }}
                ></div>
                
                {/* Subtle pulsing dots along the line */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-white"
                    style={{ 
                      top: `${15 + i * 18}%`, 
                      left: '50%',
                      transform: 'translateX(-50%)',
                      animation: `pulse 4s ${i * 0.5}s infinite`,
                      boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.5)'
                    }}
                  ></div>
                ))}
              </div>
              
            </div>

            {/* Experience items */}
            <div className="space-y-12">
              {experienceItems.map((experience, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Enhanced Timeline dot with connector */}
                  <div className="hidden md:block">                    
                    {/* Connector line from dot to content - with stronger visibility */}
                    <div 
                      className={`absolute h-[3px] z-10 ${
                        index % 2 === 0 
                          ? 'right-1/2 bg-gradient-to-l from-primary to-transparent' 
                          : 'left-1/2 bg-gradient-to-r from-primary to-transparent'
                      } transition-all duration-300 shadow-sm`}
                      style={{
                        top: `${index * 12 + 1.5}rem`,
                        width: hoveredIndex === index ? '20%' : '15%',
                        transform: 'translateY(2px)',
                        opacity: hoveredIndex === index ? 1 : 0.7
                      }}
                    ></div>
                  </div>

                  {/* Content box */}
                  <div 
                    className={`bg-card p-6 rounded-lg border transition-all duration-300 md:w-5/12 ${
                      index % 2 === 0 ? 'md:ml-8' : 'md:mr-8'
                    } w-full shadow-sm ${
                      hoveredIndex === index 
                        ? 'border-primary shadow-lg shadow-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start mb-4 justify-between">
                      <h3 className="text-xl font-bold text-primary break-words mr-3">{experience.role || experience.title}</h3>
                      <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0 px-2 py-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {experience.duration || experience.dates}
                      </Badge>
                    </div>
                    <p className="text-lg font-medium mb-3">{experience.company}</p>
                    
                    {/* Key Achievements */}
                    {experience.achievements && experience.achievements.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-primary mb-2">Key Achievements</h4>
                        <ul className="space-y-2">
                          {experience.achievements.map((achievement, i) => (
                            <li key={i} className="flex text-sm">
                              <ArrowRight className="h-4 w-4 mt-1 flex-shrink-0 text-primary mr-2" />
                              <span className="text-muted-foreground">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Description (if available) */}
                    {experience.description && (
                      <p className="text-muted-foreground text-sm mt-4">{experience.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes moveDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) scale(0.8); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.2); }
        }
      `}</style>
      </div>
    </section>
  );
};

export default Experience;