import { useEffect, FC } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import EducationCard from './EducationCard';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { SECTION_NUMBERS } from '@/config/env';

const Education: FC = () => {
  const { portfolio } = usePortfolio();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const controls = useAnimation();

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

  // Helper function to parse education dates
  const parseDates = (dateString: string) => {
    if (!dateString) return { startDate: "", endDate: "Present" };
    
    // Handle different date formats
    const parts = dateString.split('-');
    const startDate = parts[0].trim();
    
    // If there's no second part or the second part is "Present", use "Present"
    let endDate = parts.length > 1 ? parts[1].trim() : "Present";
    
    // If endDate is empty, use "Present"
    if (!endDate) endDate = "Present";
    
    return { startDate, endDate };
  };

  // For debugging
  console.log("Portfolio data:", portfolio);
  console.log("Education data:", portfolio?.education);

  return (
    <section id="education" className="py-16 bg-darktech-bg" data-section-number={SECTION_NUMBERS.EDUCATION !== 0 ? SECTION_NUMBERS.EDUCATION : 0}>
      <div className="container mx-auto px-4 md:px-8 text-left">
        <div className={`w-4/5 ${SECTION_NUMBERS.EDUCATION === 0 ? 'mx-auto' : SECTION_NUMBERS.EDUCATION % 2 === 0 ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}>
          <motion.div
            className={`mb-12 ${SECTION_NUMBERS.EDUCATION === 0 ? 'text-center' : SECTION_NUMBERS.EDUCATION % 2 === 0 ? 'text-right' : 'text-left'}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Education
            </h2>
            <p className={`text-darktech-muted max-w-2xl mb-6 ${SECTION_NUMBERS.EDUCATION === 0 ? 'mx-auto' : SECTION_NUMBERS.EDUCATION % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
              My academic background and qualifications.
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="grid grid-cols-1 gap-6"
          >
            {portfolio?.education && portfolio.education.length > 0 ? (
              portfolio.education.map((edu, index) => {
                const { startDate, endDate } = parseDates(edu.dates);
                return (
                  <motion.div key={index} variants={itemVariants}>
                    <EducationCard
                      school={edu.institution}
                      degree={edu.degree}
                      fieldOfStudy=""
                      startDate={startDate}
                      endDate={endDate}
                      location=""
                      grade={edu.cgpa}
                    />
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center text-darktech-text/70">Education information not available</p>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Education;