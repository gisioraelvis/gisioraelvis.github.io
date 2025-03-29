/**
 * Configuration object for site-wide settings
 */
export const CONFIGS = {
  github: {
    username: "gisioraelvis", // GitHub username for API requests
    cacheKey: "github_repos_cache", // LocalStorage key for caching
    cacheVersion: "1.0.1", // SemVer (MAJOR.MINOR.PATCH) - increment when cache structure changes
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours

    // API request parameters
    fetchLimit: 50, // Maximum number of repositories to fetch from API
    apiTimeout: 10000, // 10 seconds timeout for API requests

    // Limit on Featured + Computed repos
    showcaseTotal: 12, // Should be >= showMore.initialItems.projects

    // Repo filtering and analysis
    excludedRepos: [], // Rep names to exclude from display

    // Scoring weights for algorithmic ranking (must sum to 1.0)
    weights: {
      size: 0.3, // Repository size
      commits: 0.3, // Commit activity
      stars: 0.25, // Community interest
      recency: 0.15, // Recent updates
    },
  },
  animation: {
    threshold: 0.1, // 10% - Intersection Observer threshold for animations
    scrollOffset: 80, // Smooth scrolling offset in pixels
  },
  showMore: {
    // Expander initial visible elements
    initialItems: {
      experience: 2,
      education: 6,
      projects: 6,
      softSkills: 6,
    },
  },
  analytics: {
    gaId: "G-GD006D7DPB", // Google Analytics 4 measurement ID (also used for Search Console verification)
    searchConsoleId: "kDrMkev9Yuw3pXPHVlM8ldDKQK-wEMfVgYVaEANWsvU", // Explicit Search Console verification ID (only if needed)
    clarityId: "qu811yayq4", // Microsoft Clarity project ID

    // Privacy settings
    respectDnt: true, // Respect Do Not Track browser setting

    // Enhanced tracking options
    trackSections: true, // Track when sections become visible
    trackOutboundLinks: true, // Track clicks on external links

    // Performance considerations
    cookieExpiry: 365, // Cookie lifetime in days
  },
};
