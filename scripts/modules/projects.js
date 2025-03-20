import { CONFIGS } from "../configs.js";
import { Utils } from "../utils.js";

/**
 * Handles fetching, caching and displaying GitHub projects
 */
export const GitHubProjects = {
  init() {
    this.fetchGitHubProjects();
  },

  /**
   * Load the featured repos
   * @returns {Promise<Array>} featured reps or empty if not available
   */
  async loadFeaturedRepos() {
    try {
      const response = await fetch("/assets/data/featured-repos.json");
      if (!response.ok) {
        Utils.log(
          `Featured repos unavailable: HTTP ${response.status}`,
          "error"
        );
        return [];
      }

      const data = await response.json();

      // Validate essential data structure
      if (!data || !Array.isArray(data.repos) || !data.timestamp) {
        Utils.log("Invalid featured repos data structure", "warn");
        return [];
      }

      // Check data freshness
      const maxAgeDays = CONFIGS.github.featuredReposMaxAgeDays || 30;
      const timestampDate = new Date(data.timestamp);
      const now = new Date();
      const ageInDays = (now - timestampDate) / (1000 * 60 * 60 * 24);

      if (ageInDays >= maxAgeDays) {
        Utils.log(
          `Featured repos data is stale (${ageInDays.toFixed(1)} days old)`,
          "warn"
        );
      }

      Utils.log(`Using featured repos (${ageInDays.toFixed(1)} days old)`);
      return data.repos.filter(
        (repo) => typeof repo === "string" && repo.trim().length > 0
      );
    } catch (error) {
      Utils.log(`Featured repos error: ${error.message}`, "error");
      return [];
    }
  },

  /**
   * Main function to fetch and display GitHub projects
   * Uses cached data when available with background refresh for aging caches
   */
  async fetchGitHubProjects() {
    const container = document.getElementById("github-projects");
    if (!container) return;

    this.showLoading(container);

    try {
      // Get featured repos and preserve original config
      const featuredRepos = await this.loadFeaturedRepos();
      const originalFeatured = [...CONFIGS.github.featuredRepos];

      if (featuredRepos.length > 0) {
        CONFIGS.github.featuredRepos = featuredRepos;
      }

      try {
        // First try to use cache for immediate display
        const cachedRepos = this.getValidCache();
        if (cachedRepos) {
          this.displayProjects(cachedRepos, container);

          // Check cache age for background refresh
          const cache = JSON.parse(
            localStorage.getItem(CONFIGS.github.cacheKey)
          );
          const cacheAge = Date.now() - cache.timestamp;

          // Refresh aging cache in background (half of cache duration)
          if (cacheAge > CONFIGS.github.cacheDuration / 2) {
            this.fetchAndCacheRepos().catch((error) =>
              Utils.log(`Background refresh failed: ${error.message}`, "error")
            );
          }
        } else {
          // Fetch fresh data when cache is invalid or missing
          const repos = await this.fetchAndCacheRepos();
          this.displayProjects(repos, container);
        }
      } finally {
        // Always restore original featured repos config
        if (featuredRepos.length > 0) {
          CONFIGS.github.featuredRepos = originalFeatured;
        }
      }
    } catch (error) {
      Utils.log(`Error fetching repositories: ${error.message}`, "error");
      this.showError(container, error.message);
    }
  },

  /**
   * Display loading indicator in container
   */
  showLoading(container) {
    container.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading projects...</p>
      </div>
    `;
  },

  /**
   * Display user-friendly error message
   */
  showError(container, message) {
    container.innerHTML = `
      <div class="error-message">
        <p><i class="fas fa-exclamation-circle"></i> Failed to load GitHub projects.</p>
        <p>Error: ${message}</p>
        <p>Please check your connection and try again.</p>
      </div>
    `;
  },

  /**
   * Get valid cache or null if invalid/expired
   * @returns {Array|null} Cached repos or null
   */
  getValidCache() {
    try {
      const cachedString = localStorage.getItem(CONFIGS.github.cacheKey);
      if (!cachedString) return null;

      const cache = JSON.parse(cachedString);

      // Quick validation - all conditions must pass
      const isValid =
        cache &&
        Array.isArray(cache.data) &&
        cache.version === CONFIGS.github.cacheVersion &&
        cache.timestamp &&
        Date.now() - cache.timestamp <= CONFIGS.github.cacheDuration;

      if (!isValid) return null;

      Utils.log(
        `Using cached repos from ${new Date(cache.timestamp).toLocaleString()}`
      );
      return cache.data;
    } catch (error) {
      // Any parse error means invalid cache
      Utils.log(`Cache read error: ${error.message}`, "error");
      return null;
    }
  },

  /**
   * Sanitize repo data with fallbacks for missing properties
   * Ensures consistent data structure regardless of API response
   */
  sanitizeRepoData(repo) {
    return {
      name: repo.name || "Unnamed Repository",
      html_url: repo.html_url || "#",
      homepage: repo.homepage || "",
      description: repo.description || "No description available.",
      language: repo.language || null,
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      score: repo.score || 0,
      isFeatured: !!repo.isFeatured,
    };
  },

  /**
   * Display repositories in the container with proper formatting
   * @param {Array} repos - Repositories to display
   * @param {HTMLElement} container - Container element
   */
  displayProjects(repos, container) {
    if (!repos?.length) {
      container.innerHTML = "<p>No repositories found.</p>";
      return;
    }

    // Clear container and create projects grid
    container.innerHTML = "";
    const projectsGrid = document.createElement("div");
    projectsGrid.className = "projects-grid";
    container.appendChild(projectsGrid);

    // Create project cards for all repos
    // The show/hide logic is handled by setupProjectExpander
    repos.forEach((rawRepo) => {
      const repo = this.sanitizeRepoData(rawRepo);
      const languageColor = this.getLanguageColor(repo.language);

      const projectCard = document.createElement("div");
      projectCard.className = "project-card";

      // Use template literal for readability
      projectCard.innerHTML = this.projectCard(repo, languageColor);
      projectsGrid.appendChild(projectCard);
    });

    // Apply animations
    this.applyAnimations();

    // Show more/less projects
    this.setupProjectExpander(repos.length);
  },

  /**
   * HTML for a project card
   * @param {Object} repo - Repository data
   * @param {string} languageColor - Color code for language
   * @returns {string} HTML for project card
   */
  projectCard(repo, languageColor) {
    return `
      <div class="project-content">
        <div class="project-header">
          <h3 class="project-title">
            <a href="${repo.html_url}" target="_blank" rel="noopener">
              <i class="fab fa-github"></i> ${repo.name}
            </a>
          </h3>
          ${
            repo.homepage
              ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="homepage-link" aria-label="Live Demo">
                  <i class="fas fa-external-link-alt"></i>
                </a>`
              : ""
          }
        </div>
        <p class="project-description">${repo.description}</p>
        <div class="project-footer">
          <div class="project-tech-stack">
            ${
              repo.language
                ? `<span class="tech-tag">
                    <span class="language-color" style="background-color: ${languageColor}"></span>
                    ${repo.language}
                  </span>`
                : `<span class="tech-tag empty-tag">No language specified</span>`
            }
          </div>
          <div class="project-stats">
            ${
              repo.stargazers_count > 0
                ? `<span class="project-stat has-count">
                    <i class="fas fa-star"></i> ${repo.stargazers_count}
                  </span>`
                : ""
            }
            ${
              repo.forks_count > 0
                ? `<span class="project-stat has-count">
                    <i class="fas fa-code-branch"></i> ${repo.forks_count}
                  </span>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Set up show more/less expander
   * @param {number} totalProjects - Total number of projects
   */
  setupProjectExpander(totalProjects) {
    // Import the ContentExpander dynamically to avoid circular dependencies
    import("../modules/expander.js")
      .then((module) => {
        const ContentExpander = module.ContentExpander;
        const initialCount = CONFIGS.showMore.initialItems.projects;

        // Only setup expander if we have more projects than the initial count
        if (totalProjects <= initialCount) return;

        const projectsSection = document.getElementById("projects");
        const projectsGrid = projectsSection.querySelector(".projects-grid");

        // Apply hidden-item class to projects beyond initial count
        const projectCards = projectsGrid.querySelectorAll(".project-card");
        projectCards.forEach((card, index) => {
          if (index >= initialCount) {
            card.classList.add("hidden-item");
          }
        });

        // Add the show more/less button
        ContentExpander.addContentExpander(
          ".projects-grid",
          ".project-card",
          initialCount,
          "projects"
        );
      })
      .catch((error) => {
        Utils.log(`Failed to load expander module: ${error.message}`, "error");
      });
  },

  /**
   * Apply animations to project cards using IntersectionObserver
   */
  applyAnimations() {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        }),
      { threshold: CONFIGS.animation.threshold }
    );

    document
      .querySelectorAll(".project-card, .view-more-container")
      .forEach((el) => {
        observer.observe(el);
      });
  },

  /**
   * Fetch repositories from GitHub API and cache the processed results
   * @returns {Promise<Array>} Processed repositories ordered by importance
   */
  async fetchAndCacheRepos() {
    const username = CONFIGS.github.username;
    Utils.log("Fetching repositories from GitHub API");

    try {
      // API request with timeout protection
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=pushed&per_page=${CONFIGS.github.fetchLimit}`,
        {
          headers: { Accept: "application/vnd.github.v3+json" },
          signal: AbortSignal.timeout(CONFIGS.github.apiTimeout),
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
      }

      // Process repositories
      const allRepos = await response.json();
      Utils.log(`Fetched ${allRepos.length} repos from GitHub API`);

      // Filter and separate repositories
      const { featuredRepos, otherRepos } = this.organizeRepositories(allRepos);

      // Select repos to analyze in detail (featured + top other repos)
      const reposToAnalyze = [
        ...featuredRepos,
        ...otherRepos.slice(
          0,
          CONFIGS.github.analyzeLimit - featuredRepos.length
        ),
      ];

      // Get detailed stats and calculate scores
      const processedRepos = await this.getDetailedRepoStats(reposToAnalyze);

      // Sort repositories - featured first, then by score
      const sortedRepos = this.sortRepositories(processedRepos);

      // Cache all processed repos to ensure we have both featured and algorithmic repos
      this.cacheRepos(sortedRepos);

      return sortedRepos;
    } catch (error) {
      Utils.log(`Repository fetch error: ${error.message}`, "error");
      throw error; // Re-throw to allow proper error handling upstream
    }
  },

  /**
   * Organize repositories into featured and other categories
   * @param {Array} repos - Raw repositories from GitHub API
   * @returns {Object} Object with featuredRepos and otherRepos arrays
   */
  organizeRepositories(repos) {
    const featuredRepos = [];
    const otherRepos = [];

    // Filter out excluded repos and categorize remaining
    repos
      .filter((repo) => !this.isExcluded(repo.name))
      .forEach((repo) => {
        if (CONFIGS.github.featuredRepos.includes(repo.name)) {
          featuredRepos.push({ ...repo, isFeatured: true });
        } else {
          otherRepos.push(repo);
        }
      });

    // Sort non-featured repos by size (as initial relevance indicator)
    otherRepos.sort((a, b) => b.size - a.size);

    return { featuredRepos, otherRepos };
  },

  /**
   * Sort repositories by featured status and score
   * @param {Array} repos - Repositories with calculated scores
   * @returns {Array} Sorted repositories array
   */
  sortRepositories(repos) {
    return [...repos].sort((a, b) => {
      // Featured repos always come first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Order featured repos by their order in the configuration
      if (a.isFeatured && b.isFeatured) {
        return (
          CONFIGS.github.featuredRepos.indexOf(a.name) -
          CONFIGS.github.featuredRepos.indexOf(b.name)
        );
      }

      // Sort non-featured repos by score
      return b.score - a.score;
    });
  },

  /**
   * Check if repo should be excluded based on naming patterns
   */
  isExcluded(repoName) {
    return CONFIGS.github.excludedRepos.some((excluded) =>
      repoName.toLowerCase().includes(excluded.toLowerCase())
    );
  },

  /**
   * Get detailed stats for repositories and calculate scores
   * @param {Array} repos - Repositories to analyze
   * @returns {Promise<Array>} Repositories with additional stats and scores
   */
  async getDetailedRepoStats(repos) {
    const username = CONFIGS.github.username;

    return Promise.all(
      repos.map(async (repo) => {
        try {
          // Get commit activity for the past year
          const statsResponse = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/stats/participation`
          );

          let totalCommits = 0;
          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            totalCommits = stats.all
              ? stats.all.reduce((sum, count) => sum + count, 0)
              : 0;
          }

          // Calculate score
          const score = repo.isFeatured
            ? Number.MAX_SAFE_INTEGER
            : this.calculateRepoScore(repo, totalCommits);

          return {
            ...repo,
            totalCommits,
            score,
          };
        } catch (error) {
          Utils.log(
            `Couldn't get stats for ${repo.name}: ${error.message}`,
            "error"
          );
          return {
            ...repo,
            totalCommits: 0,
            score: repo.isFeatured ? Number.MAX_SAFE_INTEGER : 0,
          };
        }
      })
    );
  },

  /**
   * Calculate repository score based on multiple weighted metrics
   * @param {Object} repo - Repository data
   * @param {number} totalCommits - Total commit count
   * @returns {number} Calculated repository score
   */
  calculateRepoScore(repo, totalCommits) {
    const weights = CONFIGS.github.weights;

    // Calculate recency score (higher for recently updated repos)
    const ageInDays =
      (new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 100 - ageInDays);

    // Calculate weighted score from multiple factors
    return (
      repo.size * weights.size +
      totalCommits * weights.commits * 10 +
      repo.stargazers_count * weights.stars * 20 +
      recencyScore * weights.recency
    );
  },

  /**
   * Cache repositories with schema version and timestamp
   * @param {Array} repos - Repositories to cache
   */
  cacheRepos(repos) {
    try {
      const cacheData = {
        version: CONFIGS.github.cacheVersion,
        timestamp: Date.now(),
        data: repos,
      };

      localStorage.setItem(CONFIGS.github.cacheKey, JSON.stringify(cacheData));
      Utils.log("Repository data cached successfully");
    } catch (error) {
      Utils.log(`Failed to cache repositories: ${error.message}`, "error");
    }
  },

  /**
   * GitHub's language colors
   * @param {string} language - Programming language name
   * @returns {string} Hex color code
   */
  getLanguageColor(language) {
    if (!language) return "#8257e5"; // Default for undefined/null

    // Official GitHub language colors
    const colors = {
      // Core languages from your tech stack
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      HTML: "#e34c26",
      CSS: "#563d7c",

      // Frontend frameworks/libraries
      React: "#61dafb",
      Angular: "#dd0031",
      Vue: "#41b883",
      Svelte: "#ff3e00",

      // Backend languages
      "Node.js": "#339933",
      Java: "#b07219",
      "C#": "#178600",
      Python: "#3572A5",
      Go: "#00ADD8",
      Rust: "#dea584",
      PHP: "#4F5D95",

      // Mobile
      Kotlin: "#A97BFF",
      Swift: "#F05138",
      Dart: "#00B4AB",

      // Database related
      SQL: "#e38c00",
      PLpgSQL: "#336790",

      // Config/Shell
      YAML: "#cb171e",
      JSON: "#292929",
      Markdown: "#083fa1",
      Shell: "#89e051",
      PowerShell: "#012456",
      Dockerfile: "#384d54",
    };

    return colors[language] || "#8257e5"; // Return matching color or default purple
  },
};
