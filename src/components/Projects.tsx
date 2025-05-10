import React, { useEffect, useState } from "react";
import {
  Github,
  ExternalLink,
  Loader2,
  Star,
  GitFork,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { readPortfolioData } from "@/lib/portfolioReader";
import { PortfolioData } from "@/lib/portfolioStorage";
import { DEFAULT_ASSETS, SECTION_NUMBERS } from "@/config/env";

// Helper function to get a repo image URL based on the GitHub URL
const getRepoImageUrl = (githubUrl?: string) => {
  if (!githubUrl)
    return DEFAULT_ASSETS.PROJECT_IMAGE || "/assets/default-project.png";

  // Extract the username and repo name from the GitHub URL
  const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match)
    return DEFAULT_ASSETS.PROJECT_IMAGE || "/assets/default-project.png";

  const [, username, repo] = match;

  // Return a GitHub repository social image URL
  return `https://opengraph.githubassets.com/1/${username}/${repo}`;
};

// Interface for project data
interface EnhancedProject {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  technologies?: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  stars?: number;
  forks?: number;
  commits?: number;
  topics?: string[];
  timeline?: {
    created_at?: string;
    updated_at?: string;
    recent_commits?: string[];
    has_recent_activity?: boolean;
  };
  source?: string;
  repoData?: {
    stars: number;
    forks: number;
    lastUpdate: string;
    language?: string;
    languageColor?: string;
  };
}

const Projects = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null
  );
  const [allProjects, setAllProjects] = useState<EnhancedProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<EnhancedProject[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMoreProjects, setShowMoreProjects] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTechFilter, setSelectedTechFilter] = useState<string[]>([]);
  const [availableTech, setAvailableTech] = useState<string[]>([]);
  const [showAllTech, setShowAllTech] = useState<boolean>(false);

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        setIsLoading(true);
        const data = await readPortfolioData();
        setPortfolioData(data);

        if (data) {
          // Combine featured and other projects into a single list
          const projects = [...(data.projects || [])];

          // Process projects with additional data
          const enhancedProjects = projects.map(enhanceProject);
          setAllProjects(enhancedProjects);
          setFilteredProjects(enhancedProjects);

          // Extract unique technologies for filters
          const techSet = new Set<string>();
          enhancedProjects.forEach((project) => {
            project.technologies?.forEach((tech) => techSet.add(tech));
          });
          setAvailableTech(Array.from(techSet).sort());
        }

        setError(null);
      } catch (err) {
        console.error("Error loading portfolio data:", err);
        setError("Failed to load portfolio data");
      } finally {
        setIsLoading(false);
      }
    }

    loadPortfolioData();
  }, []);

  // Helper function to enhance project with additional data
  const enhanceProject = (project: EnhancedProject): EnhancedProject => {
    // If project already has repoData, return as is
    if (project.repoData) return project;

    // Add repoData based on stars and forks if available
    const repoData =
      project.stars !== undefined && project.forks !== undefined
        ? {
            stars: project.stars || 0,
            forks: project.forks || 0,
            lastUpdate: project.timeline?.updated_at || "",
            language: project.technologies?.[0],
          }
        : undefined;

    return {
      ...project,
      repoData,
    };
  };

  // Filter projects based on search query and tech filters
  useEffect(() => {
    if (allProjects.length === 0) return;

    let filtered = [...allProjects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
      );
    }

    // Apply tech filters
    if (selectedTechFilter.length > 0) {
      filtered = filtered.filter((project) =>
        project.technologies?.some((tech) => selectedTechFilter.includes(tech))
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, selectedTechFilter, allProjects]);

  // Toggle tech filter
  const handleTechFilterToggle = (tech: string) => {
    setSelectedTechFilter((prev) =>
      prev.includes(tech)
        ? prev.filter((item) => item !== tech)
        : [...prev, tech]
    );
  };

  // Handle image error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src =
      DEFAULT_ASSETS.PROJECT_IMAGE || "/assets/default-project.png";
  };

  if (isLoading) {
    return (
      <section id="projects" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Projects</h2>
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-darktech-neon-green h-8 w-8" />
            <span className="ml-2">Loading projects...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error || (!filteredProjects.length && !allProjects.length)) {
    return (
      <section id="projects" className="py-20 relative align-left">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8">Projects</h2>
          <div className="w-4/5 mx-auto">
            <div className="glass-panel p-6">
              <p className="text-darktech-cyber-pink mb-4">
                No projects found. Connect your GitHub account to showcase your
                work.
              </p>
              {error && <p className="text-sm text-darktech-muted">{error}</p>}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Display a message when no projects match the filters
  const noMatchingProjects =
    filteredProjects.length === 0 && allProjects.length > 0;

  return (
    <section
      id="projects"
      className="py-20 relative"
      data-section-number={SECTION_NUMBERS.PROJECTS}
    >
      <div className="container mx-auto px-4">
      <div className={`w-4/5 ${SECTION_NUMBERS.PROJECTS === 0 ? 'mx-auto' : SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'ml-auto mr-0' : 'mr-auto ml-0'}`}>
        <div className={`mb-8 ${SECTION_NUMBERS.PROJECTS === 0 ? 'text-center' :SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'text-right' : 'text-left'}`}>
            <h2 className="text-4xl font-bold mb-4">Projects</h2>
            <p className={`text-darktech-muted max-w-2xl ${SECTION_NUMBERS.PROJECTS === 0 ? 'mx-auto' : SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
              Showcasing my work spanning web applications, AI integrations, and more.
            </p>
          </div>

          {/* Search and filters */}
            <div className="mb-12">
            {/* Search bar */}
            <div className={`relative max-w-md mb-6 ${SECTION_NUMBERS.PROJECTS === 0 ? 'mx-auto' :SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
              <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-darktech-lighter pl-10 border-darktech-border focus:border-darktech-neon-green"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-darktech-muted h-4 w-4" />
            </div>

            {/* Tech filters */}
            {availableTech.length > 0 && (
              <div className={`flex flex-wrap gap-2 max-w-3xl ${SECTION_NUMBERS.PROJECTS === 0 ? 'mx-auto' :SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'ml-auto' : 'mr-auto'}`}>
                <span className={`flex items-center text-sm text-darktech-muted ${SECTION_NUMBERS.PROJECTS === 0 ? 'mx-auto' :SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'ml-auto' : 'mr-auto'} mb-2`}>
                <Filter size={14} className="mr-1"/> Filters:
                </span>

              {/* Show only first 5 filters by default */}
              {availableTech
                .slice(0, showAllTech ? availableTech.length : 5)
                .map((tech) => (
                <Badge
                  key={tech}
                  variant={
                  selectedTechFilter.includes(tech)
                    ? "default"
                    : "outline"
                  }
                  className={`cursor-pointer hover:bg-darktech-card transition-colors ${
                  selectedTechFilter.includes(tech)
                    ? "bg-darktech-neon-green text-darktech-background"
                    : ""
                  }`}
                  onClick={() => handleTechFilterToggle(tech)}
                >
                  {tech}
                </Badge>
                ))}

              {/* Show more/less button if we have more than 5 tech filters */}
              {availableTech.length > 5 && (
                <button
                onClick={() => setShowAllTech(!showAllTech)}
                className="flex items-center gap-1 px-3 py-1 text-xs text-darktech-muted hover:text-darktech-holo-cyan border border-darktech-border rounded-full transition-colors"
                >
                {showAllTech ? (
                  <>
                  <ChevronUp size={14} />
                  Show less
                  </>
                ) : (
                  <>
                  <ChevronDown size={14} />+{availableTech.length - 5}{" "}
                  more
                  </>
                )}
                </button>
              )}

              {selectedTechFilter.length > 0 && (
                <Badge
                variant="outline"
                className="cursor-pointer hover:bg-darktech-card transition-colors"
                onClick={() => setSelectedTechFilter([])}
                >
                Clear all
                </Badge>
              )}
              </div>
            )}
            </div>

            {/* No matching projects message */}
            {noMatchingProjects && (
            <div className={`glass-panel p-6 text-${SECTION_NUMBERS.PROJECTS === 0 ? 'center' :SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'right' : 'left'} mb-12`}>
              <p className="text-darktech-cyber-pink">
              No projects match your filters. Try adjusting your search
              criteria.
              </p>
            </div>
            )}

          {/* Projects grid */}
          {!noMatchingProjects && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
            >
              {filteredProjects
                .slice(0, showMoreProjects ? undefined : 4)
                .map((project, index) => (
                  <motion.div
                    key={project.id || index}
                    className="glass-panel rounded-xl overflow-hidden group hover:border-darktech-neon-green/50 transition-all h-full flex flex-col"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Preview image */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={project.image || getRepoImageUrl(project.github)}
                        alt={project.title || "Project thumbnail"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                        loading="lazy"
                        onError={handleImageError}
                      />

                      {/* Overlay with GitHub stats */}
                      {project.repoData && (
                        <div className="absolute top-3 right-3 flex items-center space-x-3">
                          <div
                            className="flex items-center gap-1 bg-darktech-background/80 px-3 py-1.5 rounded-full backdrop-blur-sm"
                            title="GitHub Stars"
                          >
                            <Star size={16} className="text-yellow-400" />
                            <span className="text-sm font-medium">
                              {project.repoData.stars.toLocaleString()}
                            </span>
                          </div>
                          <div
                            className="flex items-center gap-1 bg-darktech-background/80 px-3 py-1.5 rounded-full backdrop-blur-sm"
                            title="GitHub Forks"
                          >
                            <GitFork size={16} className="text-green-400" />
                            <span className="text-sm font-medium">
                              {project.repoData.forks.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Featured badge */}
                      {project.featured && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-darktech-neon-green/80 text-darktech-background backdrop-blur-sm">
                            Featured
                          </Badge>
                        </div>
                      )}

                      {/* Source badge */}
                      {project.source && (
                        <div className="absolute bottom-3 left-3">
                          <Badge
                            className={`px-2 py-1 text-xs font-medium ${
                              project.source === "github"
                                ? "bg-darktech-neon-green/40 text-white border border-darktech-neon-green/50"
                                : "bg-darktech-cyber-pink/40 text-white border border-darktech-cyber-pink/50"
                            }`}
                          >
                            {project.source === "github" ? "GitHub" : "Resume"}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Project content */}
                    <div className={`p-5 flex flex-col flex-grow justify-between ${SECTION_NUMBERS.PROJECTS === 0 ? 'text-center' : SECTION_NUMBERS.PROJECTS % 2 === 0 ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-xl font-bold mb-2 text-darktech-holo-cyan group-hover:text-darktech-neon-green transition-colors">
                        {project.title}
                      </h4>

                      <p className="text-darktech-muted mb-4 text-sm line-clamp-3 flex-grow">
                        {project.description || "No description available"}
                      </p>

                      {/* Tech stack */}
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {project.technologies
                              .slice(0, 3)
                              .map((tech, techIndex) => (
                                <Badge
                                  key={techIndex}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            {project.technologies.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{project.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                      {/* Project links - always at the bottom */}
                      <div className="flex gap-3 mt-auto">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm hover:text-darktech-neon-green transition-colors"
                            aria-label={`View ${project.title} source code on GitHub`}
                          >
                            <Github size={16} />
                            <span>Source</span>
                          </a>
                        )}

                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm hover:text-darktech-holo-cyan transition-colors"
                            aria-label={`View ${project.title} live demo`}
                          >
                            <ExternalLink size={16} />
                            <span>Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          )}

          {/* Show more/less button */}
          {filteredProjects.length > 6 && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setShowMoreProjects(!showMoreProjects)}
                className="px-6 py-2 rounded-lg border border-darktech-border hover:border-darktech-holo-cyan transition-colors text-sm"
              >
                {showMoreProjects
                  ? "Show Less"
                  : `Show ${filteredProjects.length - 6} More Projects`}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
