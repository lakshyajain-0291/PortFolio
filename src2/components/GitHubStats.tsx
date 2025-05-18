import React, { useState, useEffect } from "react";
import {
  Github,
  Star,
  GitFork,
  Calendar,
  Code,
  Activity,
} from "lucide-react";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { usePortfolio } from "@/hooks/PortfolioContext";

const GitHubStats = () => {
  const { portfolio, isLoading } = usePortfolio();
  const [username, setUsername] = useState<string | null>(null);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Extract GitHub username from the GitHub URL
  useEffect(() => {
    if (portfolio?.socialLinks?.github) {
      const match = portfolio.socialLinks.github.match(/github\.com\/([^\/]+)/);
      const extractedUsername = match ? match[1] : null;
      setUsername(extractedUsername);
    }
  }, [portfolio]);

  if (isLoading) {
    return (
      <section id="github-stats" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">GitHub Stats</h2>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3">Loading GitHub stats...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!portfolio?.githubStats || !username) {
    return (
      <section id="github-stats" className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">GitHub Public Stats</h2>
          <div className="bg-card p-6 rounded-lg border border-border">
            <p className="text-destructive mb-4">
              No GitHub statistics available. Connect your GitHub account to
              view your coding activity.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="github-stats" className="py-20">
      <div className="container mx-auto px-4">
      <div className="mx-auto px-4 relative w-4/5">

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4">GitHub Public Stats</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A visualization of my coding activities and contributions on GitHub.
            </p>
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
        >
          {/* Primary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12"
          >
            <div className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-all shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Github size={28} className="text-primary" />
              </div>
              <p className="text-3xl font-bold">
                {portfolio.githubStats.totalPublicRepos}
              </p>
              <p className="text-sm text-muted-foreground">Repositories</p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-all shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Star size={28} className="text-yellow-400" />
              </div>
              <p className="text-3xl font-bold">
                {portfolio.githubStats.totalStars}
              </p>
              <p className="text-sm text-muted-foreground">Stars</p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-all shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <GitFork size={28} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold">
                {portfolio.githubStats.totalForks}
              </p>
              <p className="text-sm text-muted-foreground">Forks</p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border hover:border-primary/50 transition-all shadow-sm">
              <div className="flex items-center justify-center mb-2">
                <Calendar size={28} className="text-primary" />
              </div>
              <p className="text-3xl font-bold">
                {portfolio.githubStats.totalCommits}
              </p>
              <p className="text-sm text-muted-foreground">Commits</p>
            </div>
          </motion.div>

          {/* Contribution Graph - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-all mb-12 shadow-sm"
          >
            <div className="flex items-center mb-4">
              <Activity className="text-primary mr-2" size={20} />
              <h3 className="text-xl font-semibold">Contribution Activity</h3>
            </div>

            <div className="flex items-center justify-center">
              {username && (
                <img
                  src={`https://ghchart.rshah.org/2563eb/${username}`}
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
                  style={{ backgroundColor: "rgba(37, 99, 235, 1)" }}
                ></span>
                <span className="text-xs text-muted-foreground pl-2">Less</span>
                </div>
                <div className="text-xs text-center text-muted-foreground">
                <span>12 months of activity</span>
                </div>
                <div className="flex items-center">
                <span className="text-xs text-muted-foreground pr-2">More</span>
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: "rgba(37, 99, 235, 0.2)" }}
                ></span>
              </div>
            </div>
          </motion.div>

          {/* Additional GitHub Stats with GitHub README Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12"
          >
            <div className="bg-card p-6 rounded-xl border border-border hover:border-primary/30 transition-all shadow-sm">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                {/* GitHub Stats Card */}
                <img
                  src={`https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&hide_border=true&title_color=3b82f6&icon_color=3b82f6&text_color=ffffff&bg_color=00000000`}
                  alt="GitHub Stats"
                  className="w-full lg:w-1/2"
                />
                {/* Top Languages Card */}
                <img
                  src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&hide_border=true&title_color=3b82f6&icon_color=3b82f6&text_color=ffffff&bg_color=00000000`}
                  alt="Top Languages"
                  className="w-full lg:w-1/2"
                />
              </div>
            </div>
          </motion.div>

          {/* GitHub Profile Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-10"
          >
            <a
              href={portfolio.socialLinks?.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/50 text-primary transition-all"
            >
              <Github size={20} />
              <span>View Full GitHub Profile</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </section>
  );
};

export default GitHubStats;