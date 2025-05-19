import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  GitFork,
  Github,
  ExternalLink,
  Calendar,
  Code,
  Cpu,
  Layers,
  X,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DEFAULT_ASSETS } from "@/config/env";
import { usePortfolio } from "@/hooks/PortfolioContext";

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

const ProjectCard = ({
  project,
  index,
  activeProject,
  setActiveProject,
}: {
  project: EnhancedProject;
  index: number;
  activeProject: string | null;
  setActiveProject: (id: string | null) => void;
}) => {
  // Handle image error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src =
      DEFAULT_ASSETS.PROJECT_IMAGE || "/assets/default-project.png";
  };

  // Toggle project details
  const handleProjectClick = (projectId: string) => {
    setActiveProject(activeProject === projectId ? null : projectId);
  };

  return (
    <motion.div
      key={project.id || index}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className="group"
    >
      <div
        className={`relative h-full rounded-xl overflow-hidden transition-all duration-300 ${
          activeProject === project.id
            ? "glass-panel border-primary glow-text"
            : "glass-panel border-transparent hover:border-primary/30"
        }`}
      >
        {/* Project header with image */}
        <div className="relative h-44 overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>

          <img
            src={project.image || getRepoImageUrl(project.github)}
            alt={project.title || "Project thumbnail"}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Overlay with GitHub stats */}
          {project.repoData && (
            <div className="absolute top-3 right-3 flex items-center space-x-3 z-20">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-primary/20"
                title="GitHub Stars"
              >
                <Star size={16} className="text-yellow-400" />
                <span className="text-sm font-medium text-yellow-100">
                  {project.repoData.stars.toLocaleString()}
                </span>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm border border-primary/20"
                title="GitHub Forks"
              >
                <GitFork size={16} className="text-green-400" />
                <span className="text-sm font-medium text-green-100">
                  {project.repoData.forks.toLocaleString()}
                </span>
              </motion.div>
            </div>
          )}

          {/* Featured badge */}
          {project.featured && (
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-primary text-primary-foreground shadow-glow border-none px-3 py-1">
                Featured
              </Badge>
            </div>
          )}

          {/* Source badge */}
          {project.source && (
            <div className="absolute bottom-3 left-3 z-20">
              <Badge
                variant="outline"
                className="bg-black/60 backdrop-blur-sm border-primary/30 text-xs"
              >
                {project.source === "github" ? (
                  <>
                    <Github size={12} className="mr-1" /> GitHub
                  </>
                ) : (
                  <>
                    <Code size={12} className="mr-1" /> Portfolio
                  </>
                )}
              </Badge>
            </div>
          )}

          {/* Project title */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
              {project.title || "Untitled Project"}
            </h3>
          </div>
        </div>

        {/* Project content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Project description */}
          <div
            className={`mb-4 transition-all ${
              activeProject === project.id ? "line-clamp-none" : "line-clamp-3"
            }`}
          >
            <p className="text-muted-foreground text-sm">
              {project.description || "No description available"}
            </p>
          </div>

          {/* Tech stack */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {(activeProject === project.id
                ? project.technologies
                : project.technologies.slice(0, 3)
              ).map((tech, techIndex) => (
                <Badge
                  key={techIndex}
                  variant="secondary"
                  className="text-xs bg-accent/50 border border-border/40"
                >
                  {tech}
                </Badge>
              ))}
              {activeProject !== project.id &&
                project.technologies.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-accent/50 border border-border/40 cursor-pointer"
                    onClick={() => setActiveProject(project.id || null)}
                  >
                    +{project.technologies.length - 3}
                  </Badge>
                )}
            </div>
          )}

          {/* Additional project details when expanded */}
          <AnimatePresence>
            {activeProject === project.id && project.timeline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-1 mb-1">
                  <Calendar size={14} />
                  <span>
                    {project.timeline.updated_at
                      ? `Last updated: ${new Date(
                          project.timeline.updated_at
                        ).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>
                {project.timeline.has_recent_activity && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-400">Active development</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project links and expand button */}
          <div className="flex flex-wrap items-center gap-3 mt-auto pt-3 border-t border-border/30">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
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
                className="flex items-center gap-1 text-sm hover:text-blue-400 transition-colors"
                aria-label={`View ${project.title} live demo`}
              >
                <ExternalLink size={16} />
                <span>Demo</span>
              </a>
            )}

            <button
              onClick={() => handleProjectClick(project.id || "")}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {activeProject === project.id ? (
                <>
                  Less details <ChevronUp size={14} />
                </>
              ) : (
                <>
                  More details <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
          <div
            className={`absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary transition-opacity duration-300 ${
              activeProject === project.id
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-30"
            }`}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectsModal = ({
  isOpen,
  onClose,
  projects,
}: {
  isOpen: boolean;
  onClose: () => void;
  projects: EnhancedProject[];
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTechFilter, setSelectedTechFilter] = useState<string[]>([]);
  const [availableTech, setAvailableTech] = useState<string[]>([]);
  const [showAllTech, setShowAllTech] = useState<boolean>(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"featured" | "recent" | "stars" | null>("featured");
  const [filteredProjects, setFilteredProjects] = useState<EnhancedProject[]>(
    []
  );

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position and lock scrolling
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      // Restore scrolling when modal closes
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      // Cleanup function to ensure scroll is restored if component unmounts
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Extract unique technologies for filters
  useEffect(() => {
    const techSet = new Set<string>();
    projects.forEach((project) => {
      project.technologies?.forEach((tech) => techSet.add(tech));
    });
    setAvailableTech(Array.from(techSet).sort());
    setFilteredProjects(projects);
  }, [projects]);

  // Filter projects based on search query and tech filters
  useEffect(() => {
    let filtered = [...projects];

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
  }, [searchQuery, selectedTechFilter, projects]);

  // Sort projects based on the current sort order
  const sortedProjects = useMemo(() => {
    if (filteredProjects.length === 0) return [];

    if (!sortOrder) {
      // If no sort order is selected, return projects in their original order
      return [...filteredProjects];
    }

    return [...filteredProjects].sort((a, b) => {
      if (sortOrder === "featured") {
        // Featured projects first, then sort by stars
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.repoData?.stars || 0) - (a.repoData?.stars || 0);
      } else if (sortOrder === "recent") {
        // Sort by last update date
        const aDate = a.timeline?.updated_at
          ? new Date(a.timeline.updated_at)
          : new Date(0);
        const bDate = b.timeline?.updated_at
          ? new Date(b.timeline.updated_at)
          : new Date(0);
        return bDate.getTime() - aDate.getTime();
      } else {
        // Sort by stars
        return (b.repoData?.stars || 0) - (a.repoData?.stars || 0);
      }
    });
  }, [filteredProjects, sortOrder]);

  // Toggle sort order
  const handleSortToggle = (newSortOrder: "featured" | "recent" | "stars") => {
    setSortOrder((current) => (current === newSortOrder ? null : newSortOrder));
  };

  // Toggle tech filter
  const handleTechFilterToggle = (tech: string) => {
    setSelectedTechFilter((prev) =>
      prev.includes(tech)
        ? prev.filter((item) => item !== tech)
        : [...prev, tech]
    );
  };

  // Check if no projects match the filters
  const noMatchingProjects =
    filteredProjects.length === 0 && projects.length > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-4 md:inset-10 lg:inset-[5%] z-50 flex flex-col"
          >
            <div className="relative w-full h-full bg-black border border-border rounded-xl flex flex-col shadow-xl shadow-black/50">
              {/* Modal header - fixed at top */}
              <div className="flex justify-between items-center p-4 md:p-6 border-b border-border/50 bg-black/95 backdrop-blur-md sticky top-0 z-10 rounded-t-xl">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-3xl font-bold flex items-center gap-3"
                >
                  <Rocket size={24} className="text-primary" />
                  <span>All Projects</span>
                </motion.h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent/20 rounded-full transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
                  aria-label="Close projects panel"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Search and filters - fixed below header */}
              <div className="p-4 md:p-6 border-b border-border/50 bg-black/95 backdrop-blur-md sticky top-[72px] z-10">
                <div className="w-4/5 mx-auto">
                  <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
                    {/* Search bar */}
                    <div className="relative flex-1">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-border bg-black/50 backdrop-blur-sm focus:border-primary transition-colors"
                      />
                    </div>

                    {/* Sort options */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <button
                        onClick={() => handleSortToggle("featured")}
                        className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                          sortOrder === "featured"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        Featured
                      </button>
                      <button
                        onClick={() => handleSortToggle("recent")}
                        className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                          sortOrder === "recent"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        Recent
                      </button>
                      <button
                        onClick={() => handleSortToggle("stars")}
                        className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                          sortOrder === "stars"
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        Most Starred
                      </button>

                      {sortOrder && (
                        <button
                          onClick={() => setSortOrder(null)}
                          className="ml-2 p-1.5 hover:bg-accent/20 rounded-full transition-colors text-muted-foreground hover:text-primary"
                          title="Clear sorting"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tech filters */}
                  {availableTech.length > 0 && (
                    <div className="glass-panel py-3 px-4 bg-black/70">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center text-sm text-muted-foreground mr-1">
                          <Filter size={14} className="mr-1" /> Filters:
                        </span>

                        {/* Show only first 10 filters by default */}
                        {availableTech
                          .slice(0, showAllTech ? availableTech.length : 10)
                          .map((tech) => (
                            <Badge
                              key={tech}
                              variant={
                                selectedTechFilter.includes(tech)
                                  ? "default"
                                  : "outline"
                              }
                              className={`cursor-pointer hover:bg-accent transition-all duration-300 ${
                                selectedTechFilter.includes(tech)
                                  ? "bg-primary text-primary-foreground shadow-glow"
                                  : "hover:border-primary/70"
                              }`}
                              onClick={() => handleTechFilterToggle(tech)}
                            >
                              {tech}
                            </Badge>
                          ))}

                        {/* Show more/less button */}
                        {availableTech.length > 10 && (
                          <button
                            onClick={() => setShowAllTech(!showAllTech)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-muted-foreground hover:text-primary border border-border rounded-full transition-all duration-300 hover:border-primary/50"
                          >
                            {showAllTech ? (
                              <>
                                <ChevronUp size={14} />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown size={14} />+
                                {availableTech.length - 10} more
                              </>
                            )}
                          </button>
                        )}

                        {selectedTechFilter.length > 0 && (
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-accent/50 hover:text-primary transition-all duration-300 ml-auto"
                            onClick={() => setSelectedTechFilter([])}
                          >
                            Clear all
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Projects grid - scrollable */}
              <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-black/95 rounded-b-xl">
                {/* No matching projects message */}
                {noMatchingProjects && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="glass-panel border-border/50 p-10 max-w-3xl mx-auto text-center mb-12 w-4/5"
                  >
                    <div className="inline-block p-5 rounded-full bg-accent/30 mb-4">
                      <Search size={32} className="text-primary/70" />
                    </div>
                    <h3 className="text-2xl font-medium mb-3">
                      No Matching Projects
                    </h3>
                    <p className="text-muted-foreground">
                      No projects match your current filters. Try adjusting your
                      search criteria or clearing filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTechFilter([]);
                      }}
                      className="mt-6 px-5 py-2 border border-primary/50 hover:bg-primary/10 rounded-md transition-colors text-primary"
                    >
                      Reset Filters
                    </button>
                  </motion.div>
                )}

                {!noMatchingProjects && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                        },
                      },
                    }}
                    className="w-4/5 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                  >
                    {sortedProjects.map((project, index) => (
                      <ProjectCard
                        key={project.id || index}
                        project={project}
                        index={index}
                        activeProject={activeProject}
                        setActiveProject={setActiveProject}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Add some padding at bottom for scrolling */}
                <div className="h-4"></div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Projects = () => {
  const { portfolio, isLoading } = usePortfolio();

  const [allProjects, setAllProjects] = useState<EnhancedProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [displayCount, setDisplayCount] = useState<number>(
    window.innerWidth >= 768 ? 4 : 2
  );

  // Process project data when portfolio is loaded
  useEffect(() => {
    if (portfolio?.projects?.length) {
      // Combine all projects into a single list and enhance them
      const projects = [...(portfolio.projects || [])].map(enhanceProject);
      setAllProjects(projects);
    }
  }, [portfolio]);

  // Handle window resize to update display count
  useEffect(() => {
    const handleResize = () => {
      setDisplayCount(window.innerWidth >= 768 ? 4 : 2);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  // Get top projects to display on main page
  const topProjects = useMemo(() => {
    if (allProjects.length === 0) return [];

    // First get featured projects
    const featured = allProjects.filter((p) => p.featured);

    // If we have enough featured projects, just use those
    if (featured.length >= displayCount) {
      return featured.slice(0, displayCount);
    }

    // Otherwise, add most starred projects to fill the slots
    const nonFeatured = allProjects
      .filter((p) => !p.featured)
      .sort((a, b) => (b.repoData?.stars || 0) - (a.repoData?.stars || 0));

    return [...featured, ...nonFeatured].slice(0, displayCount);
  }, [allProjects, displayCount]);

  // Display loading state
  if (isLoading) {
    return (
      <section id="projects" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold inline-block"
            >
              <span className="relative">
                Projects
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </span>
            </motion.h2>
          </div>

          <div className="flex flex-col justify-center items-center h-60 glass-panel">
            <div className="w-16 h-16 relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
                className="absolute inset-0 rounded-full border-4 border-t-primary border-r-primary/30 border-b-primary/10 border-l-primary/60"
              />
              <Cpu size={32} className="absolute inset-0 m-auto text-primary" />
            </div>
            <span className="mt-5 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-primary animate-pulse">
              Loading projects...
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Fetching your amazing work
            </p>
          </div>
        </div>

        {/* Background tech elements */}
        <div className="absolute -bottom-20 -left-20 w-64 h-64 border border-primary/10 rounded-full opacity-10"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 border border-primary/20 rounded-full opacity-20"></div>
      </section>
    );
  }

  // Display error state
  if (error || !allProjects.length) {
    return (
      <section id="projects" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold inline-block"
            >
              <span className="relative">
                Projects
                <motion.span
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-panel border-border/50 p-10 max-w-3xl mx-auto text-center"
          >
            <div className="mb-6 inline-block p-6 rounded-full bg-accent/30">
              <Github size={48} className="text-primary/70" />
            </div>
            <h3 className="text-2xl font-medium mb-4">No Projects Found</h3>
            <p className="text-muted-foreground mb-6">
              Connect your GitHub account to showcase your coding journey and
              technical expertise.
            </p>
            {error && (
              <p className="text-sm text-destructive/70 mt-4 p-4 bg-destructive/10 rounded-md">
                {error}
              </p>
            )}
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Connect GitHub
            </button>
          </motion.div>
        </div>

        {/* Background tech elements */}
        <div className="absolute top-1/3 -right-20 w-40 h-40 border border-primary/20 rounded-lg rotate-12 opacity-20"></div>
        <div className="absolute bottom-1/3 -left-10 w-20 h-20 border border-primary/30 rounded-lg -rotate-12 opacity-30"></div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      {/* Decorative tech-themed background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/5 blur-3xl -z-10"></div>
      <div className="absolute top-40 left-10 w-2 h-2 bg-primary rounded-full animate-ping duration-1000"></div>
      <div className="absolute bottom-60 right-20 w-3 h-3 bg-primary rounded-full animate-ping duration-700 delay-300"></div>

      <div className="mx-auto px-4 relative w-4/5">
        <div className="text-center mb-16 relative">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold inline-block"
          >
            <span className="relative">
              Projects
              <motion.span
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.4, duration: 0.8 }}
              />
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-muted-foreground max-w-2xl mx-auto mt-4"
          >
            A showcase of my technical expertise spanning web applications, API
            integrations, and innovative solutions.
          </motion.p>
        </div>

        {/* Featured Projects Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className={`grid grid-cols-1 ${
            displayCount > 2 ? "md:grid-cols-2 lg:grid-cols-2" : ""
          } gap-6 max-w-5xl mx-auto mb-12`}
        >
          {topProjects.map((project, index) => (
            <ProjectCard
              key={project.id || index}
              project={project}
              index={index}
              activeProject={activeProject}
              setActiveProject={setActiveProject}
            />
          ))}
        </motion.div>

        {/* View All Projects Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center"
        >
          <button
            onClick={() => setShowModal(true)}
            className="group relative overflow-hidden px-8 py-3.5 rounded-lg border-2 border-primary/30 bg-black/20 backdrop-blur-sm transition-all hover:border-primary flex items-center gap-3"
          >
            {/* Button background effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

            {/* Text with icons */}
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                Explore All Projects
              </span>

              {/* Animated icon */}
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -10, 10, -10, 0],
                  transition: { duration: 0.5 },
                }}
              >
                <Rocket size={20} className="text-primary" />
              </motion.div>
            </span>

            {/* Decorative circles */}
            {/* <div className="absolute -right-3 -top-3 w-12 h-12 rounded-full border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -left-3 -bottom-3 w-8 h-8 rounded-full border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div> */}
          </button>
        </motion.div>

        {/* Modal for All Projects */}
        <ProjectsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          projects={allProjects}
        />

        {/* Section decorative lines */}
        {/* <div className="absolute -right-20 top-1/4 w-40 h-40 border border-primary/10 rounded-full"></div>
        <div className="absolute -left-10 bottom-1/3 w-20 h-20 border border-primary/20 rounded-full"></div> */}
      </div>
    </section>
  );
};

export default Projects;
