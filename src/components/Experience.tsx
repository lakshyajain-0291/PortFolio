import React, { useEffect, useState } from 'react';
import { Briefcase, Calendar, ArrowRight, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { readPortfolioData, getExperience } from '@/lib/portfolioReader';
import { PortfolioData } from '@/lib/portfolioStorage';
import { SECTION_NUMBERS } from '@/config/env';

const Experience = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const controls = useAnimation();

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        setIsLoading(true);
        const data = await readPortfolioData();
        setPortfolioData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    }

    loadPortfolioData();
  }, []);

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const experienceItems = getExperience(portfolioData);
  
  return (
    <section id="experience" className="py-20 relative" data-section-number={SECTION_NUMBERS.EXPERIENCE !== 0 ? SECTION_NUMBERS.EXPERIENCE : 0}>
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className={`w-4/5 ${SECTION_NUMBERS.EXPERIENCE === 0 ? 'mx-auto' : SECTION_NUMBERS.EXPERIENCE % 2 === 0 ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}
        >
          <motion.div 
            variants={itemVariants}
            className={`${SECTION_NUMBERS.EXPERIENCE === 0 ? 'text-center' : SECTION_NUMBERS.EXPERIENCE % 2 === 0 ? 'text-right' : 'text-left'} mb-8`}
          >
            <h2 className="text-4xl font-bold mb-4">Professional Experience</h2>
            <p className={`text-darktech-muted max-w-2xl ${SECTION_NUMBERS.EXPERIENCE === 0 ? 'mx-auto' : SECTION_NUMBERS.EXPERIENCE % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
              My professional journey and key accomplishments.
            </p>
          </motion.div>
      
          {/* GitHub Projects Summary - Added here */}
          {!isLoading && !error && portfolioData?.githubStats && portfolioData.githubStats.totalPublicRepos > 0 && (
            <motion.div 
              variants={itemVariants}
              className={`mb-10 ${SECTION_NUMBERS.EXPERIENCE === 0 ? 'text-center' : SECTION_NUMBERS.EXPERIENCE % 2 === 0 ? 'text-right' : 'text-left'}`}
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-darktech-border">
                <Github className="h-4 w-4 text-darktech-neon-green" />
                <span className="text-sm"><strong>{portfolioData.githubStats.totalPublicRepos}</strong> repositories</span>
                <span className="text-darktech-muted">•</span>
                <span className="text-sm"><strong>{portfolioData.githubStats.totalCommits}</strong> commits</span>
              </div>
            </motion.div>
          )}

          {isLoading ? (
            <motion.div 
              variants={itemVariants}
              className="flex justify-center items-center h-40"
            >
              <div className="animate-spin w-8 h-8 border-4 border-darktech-neon-green border-t-transparent rounded-full"></div>
              <span className="ml-3 text-darktech-muted">Loading experience data...</span>
            </motion.div>
          ) : error ? (
            <motion.div 
              variants={itemVariants}
              className="glass-panel p-6 text-center"
            >
              <p className="text-darktech-cyber-pink">Failed to load experience data.</p>
            </motion.div>
          ) : experienceItems.length === 0 ? (
            <motion.div 
              variants={itemVariants}
              className="glass-panel p-8 text-center"
            >
              <Briefcase className="h-12 w-12 text-darktech-muted mx-auto mb-4" />
              <p className="text-lg">No professional experience to display yet.</p>
              <p className="text-darktech-muted mt-2">Experience will appear here once added to your portfolio.</p>
            </motion.div>
          ) : (
            
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              {/* Timeline line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-darktech-neon-green via-darktech-holo-cyan to-darktech-cyber-pink"></div>

              {/* Experience items */}
              <div className="space-y-12">
                {experienceItems.map((experience, index) => (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                  >
                    {/* Timeline dot */}
                    <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-darktech-background border-4 border-darktech-neon-green rounded-full"></div>

                    {/* Content box */}
                    <div className={`glass-panel p-6 rounded-lg border border-darktech-border md:w-5/12 ${
                      index % 2 === 0 ? 'md:ml-16' : 'md:mr-16'
                    } text-left`}>
                      <div className={`flex items-start mb-4 justify-between`}>
                        <h3 className="text-xl font-bold text-darktech-holo-cyan break-words mr-3">{experience.title}</h3>
                        <Badge variant="outline" className="text-xs whitespace-nowrap flex-shrink-0 px-2 py-1">
                        <Calendar className="mr-1 h-3 w-4" />
                        {experience.dates}
                        </Badge>
                      </div>
                      <p className="text-lg font-medium mb-3">{experience.company}</p>
                      
                      {/* Key Achievements */}
                      {experience.achievements && experience.achievements.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-darktech-neon-green mb-2">Key Achievements</h4>
                          <ul className="space-y-2">
                            {experience.achievements.map((achievement, i) => (
                              <li key={i} className={`flex text-sm `}>
                                <ArrowRight className={`h-4 w-4 mt-1 flex-shrink-0 text-darktech-neon-green mr-2`} />
                                <span className="text-darktech-muted">{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Description (if available) */}
                      {experience.description && (
                        <p className="text-darktech-muted text-sm mt-4">{experience.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
