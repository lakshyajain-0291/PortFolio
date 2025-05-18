import React, { useRef, useMemo, useState } from 'react';
import { ArrowRight, FileText, Github, Linkedin, ExternalLink, Download, Code, Server, Database, Globe, Layers, Cpu, Briefcase, BookOpen, Mail } from 'lucide-react';
import { motion, useAnimation, useScroll, useTransform } from 'framer-motion';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { DEFAULT_USER, DEFAULT_SOCIAL, DEFAULT_ASSETS } from '../../src/config/env';
import { TypeAnimation } from 'react-type-animation';
import BackgroundEffect from './BackgroundEffect';

const Hero = () => {
  const { portfolio } = usePortfolio();
  const controls = useAnimation();
  const profileRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get user data from portfolio or fallback to defaults
  const name = portfolio?.personalInfo?.name || DEFAULT_USER.NAME;
  const firstNameLetter = name.charAt(0);
  const title = portfolio?.personalInfo?.title || DEFAULT_USER.TITLE;
  const bio = portfolio?.personalInfo?.summary || DEFAULT_USER.BIO;
  
  // Use the RESUME_URL from DEFAULT_ASSETS configuration
  const resumeUrl = DEFAULT_ASSETS.RESUME_URL;
  
  const avatarUrl = portfolio?.avatar || DEFAULT_ASSETS.AVATAR;
  const githubUrl = portfolio?.socialLinks?.github || DEFAULT_SOCIAL.GITHUB_URL;
  const linkedinUrl = portfolio?.socialLinks?.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL;
  const location = portfolio?.location || DEFAULT_USER.LOCATION;
  
  // Tech skills to display in the animation
  const techSkills = Array.isArray(portfolio?.skills) ? portfolio?.skills.slice(0, 6) : ['React', 'TypeScript', 'Node.js', 'AI', 'Cloud', 'UI/UX'];
    
  // Scroll effects
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  
  // Tech icons with proper attribution
  const allTechIcons = [
    { name: 'React', icon: <motion.svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path fill="currentColor" d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85-1.03 0-1.87-.85-1.87-1.85 0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9-.82-.08-1.63-.2-2.4-.36-.51 2.14-.32 3.61.31 3.96m.71-5.74-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9s-1.17 0-1.71.03c-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03s1.17 0 1.71-.03c.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96.77-.16 1.58-.28 2.4-.36.48-.67.99-1.31 1.51-1.9z"/></motion.svg>, color: 'text-blue-500/70 dark:text-blue-400/70' },
    { name: 'TypeScript', icon: <Cpu className="w-full h-full" />, color: 'text-blue-600/70 dark:text-blue-500/70' },
    { name: 'Node.js', icon: <Server className="w-full h-full" />, color: 'text-green-600/70 dark:text-green-400/70' },
    { name: 'JavaScript', icon: <motion.svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path fill="currentColor" d="M3 3h18v18H3V3zm16.525 13.707c-.131-.821-.666-1.511-2.252-2.155-.552-.259-1.165-.438-1.349-.854-.068-.248-.078-.382-.034-.529.113-.484.687-.629 1.137-.495.293.09.563.315.732.676.775-.507.775-.507 1.316-.844-.203-.314-.304-.451-.439-.586-.473-.528-1.103-.798-2.126-.775l-.528.067c-.507.124-.991.395-1.283.754-.855.968-.608 2.655.427 3.354 1.023.765 2.521.933 2.712 1.653.18.878-.652 1.159-1.475 1.058-.607-.136-.945-.439-1.316-1.002l-1.372.788c.157.359.337.517.607.832 1.305 1.316 4.568 1.249 5.153-.754.021-.067.18-.528.056-1.237l.034.049zm-6.737-5.434h-1.686c0 1.453-.007 2.898-.007 4.354 0 .924.047 1.772-.104 2.033-.247.517-.886.451-1.175.359-.297-.146-.448-.349-.623-.641-.047-.078-.082-.146-.095-.146l-1.368.844c.229.473.563.879.994 1.137.641.383 1.502.507 2.404.305.588-.17 1.095-.519 1.358-1.059.384-.697.302-1.553.299-2.509.008-1.541 0-3.083 0-4.635l.003-.042z"/></motion.svg>, color: 'text-yellow-500/70 dark:text-yellow-400/70' },
    { name: 'Python', icon: <motion.svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8-3.59 8-8-3.59-8-8-8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4-4-1.79 4-4 4z"/></motion.svg>, color: 'text-indigo-500/70 dark:text-indigo-400/70' },
    { name: 'Database', icon: <Database className="w-full h-full" />, color: 'text-red-500/70 dark:text-red-400/70' },
    { name: 'Cloud', icon: <Globe className="w-full h-full" />, color: 'text-sky-500/70 dark:text-sky-400/70' },
    { name: 'UI/UX', icon: <Layers className="w-full h-full" />, color: 'text-orange-500/70 dark:text-orange-400/70' },
    { name: 'GitOps', icon: <motion.svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></motion.svg>, color: 'text-gray-500/70 dark:text-gray-400/70' },
    { name: 'Dev', icon: <Code className="w-full h-full" />, color: 'text-teal-500/70 dark:text-teal-400/70' },
    { name: 'AI', icon: <motion.svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path fill="currentColor" d="M21 10.975V8a2 2 0 0 0-2-2h-6V4.688a1 1 0 0 0-1.658-.752l-3.342 2.8v-.048A3 3 0 0 0 5 3.5a3 3 0 0 0-3 3c0 1.11.603 2.08 1.5 2.598v6.404a3 3 0 0 0 1.5 2.598v.9a1 1 0 0 0 1.658.752l2.342-1.96V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2.975a1.05 1.05 0 0 0 0-4.05zM19 8v2h-2V8h2zm-2 10v-2h2v2h-2zM5 6.5a1 1 0 0 1 1-1 1 1 0 0 1 1 1v9a1 1 0 0 1-1 1 1 1 0 0 1-1-1v-9z"/></motion.svg>, color: 'text-purple-500/70 dark:text-purple-400/70' },
    { name: 'Backend', icon: <motion.svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><path fill="currentColor" d="M4 1h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m0 8h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1m0 8h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1M9 5h1V3H9v2m0 8h1v-2H9v2m0 8h1v-2H9v2M5 3v2h2V3H5m0 8v2h2v-2H5m0 8v2h2v-2H5z"/></motion.svg>, color: 'text-emerald-500/70 dark:text-emerald-400/70' },
  ];
  
  // Randomly select 5 tech icons - useMemo to ensure consistent selection
  const techIcons = useMemo(() => {
    // Shuffle array and take first 5
    return [...allTechIcons]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map((icon, index) => {
        // Generate random position and animation parameters
        const size = 60 + Math.random() * 50; // Random size between 60px and 110px
        const left = 10 + Math.random() * 80; // Random position between 10% and 90%
        const top = 10 + Math.random() * 70; // Random position between 10% and 80%
        const duration = 20 + Math.random() * 20; // Random duration between 20s and 40s
        const delay = Math.random() * 5; // Random delay between 0s and 5s
        
        return {
          ...icon,
          size,
          left,
          top,
          duration,
          delay,
          id: index
        };
      });
  }, []);  // Empty dependency array ensures it only runs once
  
  // Mouse move handler for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profileRef.current) return;
    
    const rect = profileRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation based on mouse position
    const rotateY = mouseX * 0.03; // Horizontal rotation
    const rotateX = -mouseY * 0.03; // Vertical rotation
    
    profileRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  // Reset 3D effect
  const handleMouseLeave = () => {
    if (!profileRef.current) return;
    setIsHovered(false);
    
    profileRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };
  
  // Function to properly handle resume download
  const handleDownloadResume = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Use a direct window.open with _blank to force download
    window.open(resumeUrl, '_blank');
  };
  
  return (
    <section id="home" className="min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
      {/* Animated floating tech icons - smoother independent movement */}
      <div className="fixed inset-0 pointer-events-none ">
        {techIcons.map((tech) => (
          <motion.div
            key={tech.id}
            className={`absolute ${tech.color} opacity-20 dark:opacity-30`}
            initial={{ 
              opacity: 0,
              x: `calc(${tech.left}vw - 50%)`,
              y: `calc(${tech.top}vh - 50%)`
            }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              x: [
                `calc(${tech.left}vw - 50%)`, 
                `calc(${tech.left + 10 * Math.sin(tech.id)}vw - 50%)`,
                `calc(${tech.left - 5}vw - 50%)`,
                `calc(${tech.left}vw - 50%)`
              ],
              y: [
                `calc(${tech.top}vh - 50%)`,
                `calc(${tech.top - 10}vh - 50%)`,
                `calc(${tech.top + 5}vh - 50%)`,
                `calc(${tech.top}vh - 50%)`
              ],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: tech.duration,
              delay: tech.delay,
              ease: "easeInOut",
              times: [0, 0.33, 0.66, 1]
            }}
            style={{
              width: `${tech.size}px`,
              height: `${tech.size}px`,
              zIndex: -1
            }}
          >
            {tech.icon}
          </motion.div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mx-auto px-4 relative">
          {/* Elegant geometric shapes in background */}
          <motion.div style={{ y, opacity }} className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 blur-3xl"></motion.div>
          <motion.div style={{ y, opacity }} className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/5 to-transparent dark:from-blue-500/10 blur-3xl"></motion.div>
          
          {/* Center-aligned content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-3xl mx-auto text-center"
          >
            <div className="space-y-4">
              <motion.div 
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full mb-4 backdrop-blur-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm text-primary font-medium">Available to collaborate on Cool Ideas :)</span>
              </motion.div>
              
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <span className="block">Heya, I'm </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500 dark:from-primary dark:to-blue-400">
                  {name}
                </span>
              </motion.h1>
              
              {/* Typing effect with TypeAnimation library */}
              <motion.div
                className="h-10 mt-3 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <h2 className="text-xl md:text-2xl text-foreground/80 dark:text-foreground/90 flex items-center">
                  <TypeAnimation
                    sequence={[
                      'Just a Developer',
                      2000,
                      'Finding Problems',
                      2000,
                      'And Exploring Solutions',
                      2000,
                    ]}
                    wrapper="span"
                    speed={50}
                    style={{ display: 'inline-block' }}
                    repeat={Infinity}
                    cursor={true}
                    className="text-xl md:text-2xl"
                  />
                </h2>
              </motion.div>
              
              <motion.div 
                className="flex items-center justify-center gap-2 text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/50 dark:bg-accent/30">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <span>{location}</span>
              </motion.div>
            </div>
            
            <motion.p
              className="text-lg text-foreground/70 dark:text-foreground/70 mx-auto leading-relaxed mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              {bio}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 mt-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <a
                href={resumeUrl}
                download
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground rounded-md hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/10 dark:shadow-primary/20"
              >
                <Download size={18} className="group-hover:animate-bounce" />
                <span>Download Resume</span>
              </a>
              
              <motion.a
                href="#projects"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-border bg-background/80 dark:bg-background/80 dark:border-border/70 rounded-md hover:bg-accent/50 dark:hover:bg-accent/20 transition-all duration-300 backdrop-blur-sm"
                whileHover={{ 
                  scale: 1.03,
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span>View Projects</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </motion.a>
            </motion.div>
                        
            {/* Contact shortcuts */}
            <motion.div
              className="flex gap-6 mt-6 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              <motion.a
                href="#contact"
                className="p-3 rounded-full bg-background/80 dark:bg-background/40 border border-border/40 dark:border-border/30 shadow-md backdrop-blur-sm hover:bg-accent/30 dark:hover:bg-accent/20 transition-all group"
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-5 h-5 text-primary" />
              </motion.a>
              <motion.a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-background/80 dark:bg-background/40 border border-border/40 dark:border-border/30 shadow-md backdrop-blur-sm hover:bg-accent/30 dark:hover:bg-accent/20 transition-all group"
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-primary" />
              </motion.a>
              <motion.a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-background/80 dark:bg-background/40 border border-border/40 dark:border-border/30 shadow-md backdrop-blur-sm hover:bg-accent/30 dark:hover:bg-accent/20 transition-all group"
                whileHover={{ y: -4, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-primary" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;