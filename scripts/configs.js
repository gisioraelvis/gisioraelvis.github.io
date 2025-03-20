/**
 * Configuration object for site-wide settings
 */
export const CONFIGS = {
  github: {
    username: "gisioraelvis", // GitHub username for API requests
    cacheKey: "github_repos_cache", // LocalStorage key for caching
    cacheVersion: 1.1, // Increment when cache structure changes
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours

    // API request parameters
    fetchLimit: 30, // Maximum number of repositories to fetch
    apiTimeout: 10000, // 10 seconds timeout

    // Repo filtering and analysis
    excludedRepos: [], // Rep names to exclude from display

    // Scoring weights for algorithmic ranking (must sum to 1.0)
    weights: {
      size: 0.30, // Repository size
      commits: 0.30, // Commit activity
      stars: 0.25, // Community interest
      recency: 0.15, // Recent updates
    },
  },
  animation: {
    threshold: 0.1, // 10% - Intersection Observer threshold for animations
    scrollOffset: 80, // Smooth scrolling offset in pixels
  },
  showMore: {
    // Initial items to show
    initialItems: {
      experience: 2,
      education: 6,
      projects: 6,
      softSkills: 6,
    },
  },
};
