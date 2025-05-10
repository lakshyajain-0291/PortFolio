import React, { useState, useEffect } from "react";
import {
  Github,
  Star,
  GitFork,
  Calendar,
  Code,
  Activity,
  Users,
  Award,
  Zap,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { motion, useAnimation } from "framer-motion";
import { readPortfolioData } from "@/lib/portfolioReader";
import { PortfolioData } from "@/lib/portfolioStorage";
import { Badge } from "@/components/ui/badge";
import { SECTION_NUMBERS } from "@/config/env";

const GitHubStats = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
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

  // Extract GitHub username from the GitHub URL
  const extractGithubUsername = (
    githubUrl: string | undefined
  ): string | null => {
    if (!githubUrl) return null;
    const match = githubUrl.match(/github\.com\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // Load portfolio data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Load portfolio data
        const data = await readPortfolioData();
        setPortfolioData(data);

        // Extract GitHub username from social links
        const extractedUsername = extractGithubUsername(
          data?.socialLinks?.github
        );
        setUsername(extractedUsername);

        if (!extractedUsername) {
          console.error(
            "GitHub username could not be extracted from portfolio data"
          );
          setError("GitHub username not found");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load GitHub stats data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <section
        id="github-stats"
        className="py-20 relative"
        data-section-number={
          SECTION_NUMBERS.GITHUB_STATS !== 0 ? SECTION_NUMBERS.GITHUB_STATS : 0
        }
      >
        <div className="container mx-auto px-4 text-center">
          <div className="w-4/5 mx-auto">
            <h2 className="text-4xl font-bold mb-8">GitHub Stats</h2>
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse">Loading GitHub stats...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !portfolioData?.githubStats || !username) {
    return (
      <section
        id="github-stats"
        className="py-20 relative"
        data-section-number={
          SECTION_NUMBERS.GITHUB_STATS !== 0 ? SECTION_NUMBERS.GITHUB_STATS : 0
        }
      >
        <div className="container mx-auto px-4 text-center">
          <div className="w-4/5 mx-auto">
            <h2 className="text-4xl font-bold mb-8">GitHub Public Stats</h2>
            <div className="glass-panel p-6">
              <p className="text-darktech-cyber-pink mb-4">
                No GitHub statistics available. Connect your GitHub account to
                view your coding activity.
              </p>
              {error && <p className="text-sm text-darktech-muted">{error}</p>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="github-stats"
      className="py-20 relative"
      data-section-number={
        SECTION_NUMBERS.GITHUB_STATS !== 0 ? SECTION_NUMBERS.GITHUB_STATS : 0
      }
    >
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className={`w-4/5 ${
            SECTION_NUMBERS.GITHUB_STATS === 0
              ? "mx-auto"
              : SECTION_NUMBERS.GITHUB_STATS % 2 === 0
              ? "ml-auto mr-0"
              : "mr-auto ml-0"
          }`}
        >
          <div
            className={`${
              SECTION_NUMBERS.GITHUB_STATS === 0
                ? "text-center"
                : SECTION_NUMBERS.GITHUB_STATS % 2 === 0
                ? "text-right"
                : "text-left"
            } mb-16`}
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold mb-4"
            >
              GitHub Public Stats
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className={`text-darktech-muted max-w-2xl ${
                SECTION_NUMBERS.GITHUB_STATS === 0
                  ? "mx-auto"
                  : SECTION_NUMBERS.GITHUB_STATS % 2 === 0
                  ? "ml-auto"
                  : "mr-auto"
              }`}
            >
              A visualization of my coding activities and contributions on GitHub.
            </motion.p>
          </div>

          {/* Primary Stats */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12"
          >
            <motion.div
              variants={itemVariants}
              className="glass-panel p-4 rounded-xl border border-darktech-border hover:border-darktech-neon-green/30 transition-all"
            >
              <div className="flex items-center justify-center mb-2">
                <Github size={28} className="text-darktech-neon-green" />
              </div>
              <p className="text-3xl font-bold">
                {portfolioData.githubStats.totalPublicRepos}
              </p>
              <p className="text-sm text-darktech-muted">Repositories</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-panel p-4 rounded-lg border border-darktech-border hover:border-darktech-neon-green/50 transition-all"
            >
              <div className="flex items-center justify-center mb-2">
                <Star size={28} className="text-yellow-400" />
              </div>
              <p className="text-3xl font-bold">
                {portfolioData.githubStats.totalStars}
              </p>
              <p className="text-sm text-darktech-muted">Stars</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-panel p-4 rounded-lg border border-darktech-border hover:border-darktech-neon-green/50 transition-all"
            >
              <div className="flex items-center justify-center mb-2">
                <GitFork size={28} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold">
                {portfolioData.githubStats.totalForks}
              </p>
              <p className="text-sm text-darktech-muted">Forks</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="glass-panel p-4 rounded-lg border border-darktech-border hover:border-darktech-neon-green/50 transition-all"
            >
              <div className="flex items-center justify-center mb-2">
                <Calendar size={28} className="text-darktech-cyber-pink" />
              </div>
              <p className="text-3xl font-bold">
                {portfolioData.githubStats.totalCommits}
              </p>
              <p className="text-sm text-darktech-muted">Commits</p>
            </motion.div>
          </motion.div>

          {/* Contribution Graph - Full Width */}
          <motion.div
            variants={itemVariants}
            className="glass-panel p-6 rounded-xl border border-darktech-border hover:border-darktech-neon-green/30 transition-all mb-12"
          >
            <div className="flex items-center mb-4">
              <Activity className="text-darktech-holo-cyan mr-2" size={20} />
              <h3 className="text-xl font-semibold">Contribution Activity</h3>
            </div>

            <div className="flex items-center justify-center">
              {username && (
                <img
                  src={`https://ghchart.rshah.org/008005/${username}`}
                  alt="GitHub Contribution Graph"
                  className="w-full"
                  style={{ filter: "brightness(1.1)" }}
                />
              )}
            </div>

            <div className="flex justify-between px-2 mt-3">
              <div className="flex items-center">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: "rgba(0, 128, 0, 1)" }}
                ></span>
                <span className="text-xs text-darktech-muted pl-2">Less</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: "rgba(0, 128, 0, 0.8)" }}
                ></span>
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: "rgba(0, 128, 0, 0.6)" }}
                ></span>
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: "rgba(0, 128, 0, 0.4)" }}
                ></span>
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: "rgba(0, 128, 0, 0.2)" }}
                ></span>
              </div>
              <div className="flex items-center">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: "rgba(0, 128, 0, 0.2)" }}
                ></span>
                <span className="text-xs text-darktech-muted pl-2">More</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-center text-darktech-muted flex justify-between px-2">
              <span>12 months ago</span>
              <span>6 months ago</span>
              <span>Now</span>
            </div>
          </motion.div>

          {/* Additional GitHub Stats with GitHub README Stats */}
          <motion.div
            variants={itemVariants}
            className="mb-12"
          >
            <div className="glass-panel p-6 rounded-xl border border-darktech-border hover:border-darktech-neon-green/30 transition-all">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                {/* GitHub Stats Card */}
                <img
                  src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&hide_border=true&title_color=4ade80&icon_color=4ade80&text_color=ffffff&bg_color=00000000`}
                  alt="GitHub Stats"
                  className="w-full lg:w-1/2"
                />
                {/* Top Languages Card */}
                <img
                  src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&hide_border=true&title_color=4ade80&icon_color=4ade80&text_color=ffffff&bg_color=00000000`}
                  alt="Top Languages"
                  className="w-full lg:w-1/2"
                />
              </div>
            </div>
          </motion.div>

          {/* GitHub Profile Link */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-10"
          >
            <a
              href={portfolioData.socialLinks?.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-darktech-neon-green/20 hover:bg-darktech-neon-green/30 border border-darktech-neon-green/50 text-darktech-neon-green transition-all"
            >
              <Github size={20} />
              <span>View Full GitHub Profile</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubStats;
