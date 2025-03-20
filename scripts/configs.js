/**
 * Configuration object for site-wide settings
 */
export const CONFIGS = {
  github: {
    username: "gisioraelvis",
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
    cacheKey: "github_repos_cache",
    fetchLimit: 50,
    analyzeLimit: 15,
    displayLimit: 6,
    apiTimeout: 10000, // 10 seconds
    // Repositories to exclude from display
    excludedRepos: [
      // Example: "test-repo", "playground", "learning"
    ],
    // Repositories to show at the top
    featuredRepos: [
      // Example: "portfolio-website", "important-project"
    ],
    // Scoring weights for repository ranking
    weights: {
      size: 0.4, // 40% weight for code size
      commits: 0.3, // 30% weight for commit activity
      stars: 0.2, // 20% weight for stars
      recency: 0.1, // 10% weight for recency
    },
  },
  animation: {
    threshold: 0.1, // Intersection observer threshold for animations (10%)
    scrollOffset: 80, // Offset for smooth scrolling
  },
  showMore: {
    initialItems: {
      experience: 2, // Initial number of timeline items to show
      education: 6, // Initial number of certification items to show
      projects: 4, // Initial number of project items to show
      softSkills: 6, // Initial number of soft skills to show
    },
  },
};
