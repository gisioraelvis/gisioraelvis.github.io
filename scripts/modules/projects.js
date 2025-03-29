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
   * Load featured repos from JSON file
   * @returns {Promise<string[]>} Array of featured repository names
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

      // Validate data structure
      if (!data?.repos?.length || !data.timestamp) {
        Utils.log("Invalid featured repos data structure", "warn");
        return [];
      }

      // Check data freshness using time utilities
      const dataAge = Utils.formatTimeElapsed(data.timestamp, {
        short: false,
        includeSeconds: false,
      });
      const dataAgeMs = Date.now() - new Date(data.timestamp).getTime();
      const isStale = dataAgeMs >= CONFIGS.github.cacheDuration;

      if (isStale) {
        Utils.log(`Featured repos data is stale (${dataAge})`, "warn");
      } else {
        Utils.log(`Using featured repos updated ${dataAge}`);
      }

      // Filter out invalid entries
      return data.repos.filter(
        (repo) => typeof repo === "string" && repo.trim()
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
      // Load featured repos first
      this.featuredRepoNames = await this.loadFeaturedRepos();

      // Try to use cache for immediate display
      const cachedRepos = this.getValidCache();

      if (cachedRepos) {
        // Display cached repos immediately
        this.displayProjects(cachedRepos, container);

        // Check if cache needs background refresh (older than half duration)
        const cache = JSON.parse(localStorage.getItem(CONFIGS.github.cacheKey));
        const cacheAge = Date.now() - cache.timestamp;

        if (cacheAge > CONFIGS.github.cacheDuration / 2) {
          // Use a more descriptive log message with formatted time
          const cacheAgeFormatted = Utils.formatTimeElapsed(cache.timestamp, {
            includeSeconds: false,
          });
          Utils.log(
            `Cache is ${cacheAgeFormatted} old - refreshing in background`
          );

          // Refresh cache in background without disrupting the UI
          this.fetchAndCacheRepos().catch((error) =>
            Utils.log(`Background refresh failed: ${error.message}`, "error")
          );
        }
      } else {
        // No valid cache, fetch fresh data
        const repos = await this.fetchAndCacheRepos();
        this.displayProjects(repos, container);
      }
    } catch (error) {
      Utils.log(`Error loading GitHub projects: ${error.message}`, "error");
      this.showError(container, error.message);
    }
  },

  /**
   * Display loading indicator in container with consistent site styling
   * @param {HTMLElement} container - Target container element
   */
  showLoading(container) {
    container.innerHTML = `
      <div class="loading-container">
        <div class="loading-card">
          <div class="loading-spinner-wrapper">
            <div class="loading-spinner-circle"></div>
            <i class="fab fa-github loading-logo"></i>
          </div>
          <p class="loading-text">Loading GitHub projects...</p>
          <p class="loading-subtext">Retrieving latest repositories</p>
        </div>
      </div>
    `;
  },

  /**
   * Display user-friendly error message with consistent site styling
   * @param {HTMLElement} container - Target container element
   * @param {string} message - Error message to display
   */
  showError(container, message) {
    container.innerHTML = `
      <div class="error-container">
        <div class="error-card">
          <div class="error-icon-wrapper">
            <i class="fas fa-exclamation-circle error-icon"></i>
          </div>
          <h3 class="error-title">Unable to Load Projects</h3>
          <p class="error-message">${message}</p>
          <p class="error-help">Please check your connection and try again.</p>
          <button class="error-retry-btn" onclick="window.location.reload()">
            <i class="fas fa-sync-alt"></i> Retry
          </button>
        </div>
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

      // Validate cache integrity and freshness
      if (
        !cache?.data?.length ||
        cache.version !== CONFIGS.github.cacheVersion ||
        !cache.timestamp ||
        Date.now() - cache.timestamp > CONFIGS.github.cacheDuration
      ) {
        return null;
      }

      // Log date and time elapsed since cache
      const cacheDate = Utils.formatDate(cache.timestamp, "full-datetime");
      const cacheAgeFormatted = Utils.formatTimeElapsed(cache.timestamp, {
        short: false,
        includeSeconds: false,
      });
      Utils.log(`Using repos cached on ${cacheDate} (${cacheAgeFormatted})`);

      return cache.data;
    } catch (error) {
      Utils.log(`Cache read error: ${error.message}`, "error");
      return null;
    }
  },

  /**
   * Sanitize repo data with fallbacks for missing properties
   * @param {Object} repo - Repository data from API or cache
   * @returns {Object} Sanitized repository object
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
   * Display repositories in the container
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

    // Create project cards
    repos.forEach((rawRepo) => {
      const repo = this.sanitizeRepoData(rawRepo);
      const languageColor = this.getLanguageColor(repo.language);

      const projectCard = document.createElement("div");
      projectCard.className = "project-card";
      projectCard.innerHTML = this.projectCard(repo, languageColor);
      projectsGrid.appendChild(projectCard);
    });

    // Apply animations and show/hide functionality
    this.applyAnimations();
    this.setupProjectExpander(repos.length);
  },

  /**
   * Generate HTML for a project card
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
              ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="homepage-link">
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
   * Set up show more/less expander for projects
   * @param {number} totalProjects - Total number of projects
   */
  setupProjectExpander(totalProjects) {
    const initialCount = CONFIGS.showMore.initialItems.projects;

    // Only proceed if we have more projects than initial count
    if (totalProjects <= initialCount) return;

    // Import the ContentExpander dynamically to avoid circular dependencies
    import("../modules/expander.js")
      .then((module) => {
        const ContentExpander = module.ContentExpander;
        const projectsSection = document.getElementById("projects");
        const projectsGrid = projectsSection?.querySelector(".projects-grid");

        if (!projectsGrid) return;

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
      .forEach((el) => observer.observe(el));
  },

  /**
   * Fetch repositories from GitHub API and process them
   * @returns {Promise<Array>} Processed repositories ordered by importance
   */
  async fetchAndCacheRepos() {
    Utils.log("Fetching repositories from GitHub API");

    try {
      // API request with timeout protection
      const response = await fetch(
        `https://api.github.com/users/${CONFIGS.github.username}/repos?sort=pushed&per_page=${CONFIGS.github.fetchLimit}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
          signal: AbortSignal.timeout(CONFIGS.github.apiTimeout),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GitHub API returned ${response.status}: ${response.statusText}`
        );
      }

      // Process repositories
      const allRepos = await response.json();
      Utils.log(`Fetched ${allRepos.length} repos from GitHub API`);

      // Organize and filter repositories
      const { featuredRepos, otherRepos } = this.organizeRepositories(allRepos);
      const reposToAnalyze = [...featuredRepos, ...otherRepos];

      // Get detailed stats and calculate scores
      const processedRepos = await this.getDetailedRepoStats(reposToAnalyze);

      // Sort repositories by importance
      const sortedRepos = this.sortRepositories(processedRepos);

      // Apply showcase limit while prioritizing featured repos
      const showcaseRepos = this.selectShowcaseRepos(sortedRepos);

      // Cache processed repos
      this.cacheRepos(showcaseRepos);
      return showcaseRepos;
    } catch (error) {
      const errorMessage =
        error.name === "AbortError"
          ? "GitHub API request timed out"
          : error.message;

      Utils.log(`Repository fetch error: ${errorMessage}`, "error");
      throw error;
    }
  },

  /**
   * Select repositories for showcase, prioritizing featured repos
   * @param {Array} repos - Sorted repositories array
   * @returns {Array} Selected repositories for showcase
   */
  selectShowcaseRepos(repos) {
    if (!repos?.length) return [];

    const showcaseTotal = CONFIGS.github.showcaseTotal || 12;
    const initialDisplayCount = CONFIGS.showMore.initialItems.projects;

    // Ensure showcase total is at least the initial display count
    const effectiveShowcaseTotal = Math.max(showcaseTotal, initialDisplayCount);

    // Separate featured and computed repos
    const featuredRepos = repos.filter((repo) => repo.isFeatured);
    const computedRepos = repos.filter((repo) => !repo.isFeatured);

    // If fewer repos than the limit, return all of them
    if (repos.length <= effectiveShowcaseTotal) {
      return repos;
    }

    // If featured repos already exceed the limit, truncate them
    if (featuredRepos.length >= effectiveShowcaseTotal) {
      return featuredRepos.slice(0, effectiveShowcaseTotal);
    }

    // Calculate how many computed repos we can include
    const computedCount = effectiveShowcaseTotal - featuredRepos.length;

    // Pick top computed repos based on the limit
    const selectedComputedRepos = computedRepos.slice(0, computedCount);

    // Log the number of featured and computed repos
    Utils.log(
      `Showing ${featuredRepos.length} featured and ${selectedComputedRepos.length} computed repos`
    );

    // Return combined repositories
    return [...featuredRepos, ...selectedComputedRepos];
  },

  /**
   * Organize repositories into featured and other categories
   * @param {Array} repos - Raw repositories from GitHub API
   * @returns {Object} Object with featuredRepos and otherRepos arrays
   */
  organizeRepositories(repos) {
    // Filter out excluded repos
    const filteredRepos = repos.filter((repo) => !this.isExcluded(repo.name));

    // Separate featured and other repos
    const featuredRepos = [];
    const otherRepos = [];

    filteredRepos.forEach((repo) => {
      if (this.featuredRepoNames?.includes(repo.name)) {
        featuredRepos.push({ ...repo, isFeatured: true });
      } else {
        otherRepos.push(repo);
      }
    });

    // Sort non-featured repos by initial relevance indicator
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
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }

      // Keep featured repos in their specified order
      if (a.isFeatured && b.isFeatured) {
        return (
          this.featuredRepoNames.indexOf(a.name) -
          this.featuredRepoNames.indexOf(b.name)
        );
      }

      // Sort non-featured repos by score
      return b.score - a.score;
    });
  },

  /**
   * Check if repo should be excluded based on naming patterns
   * @param {string} repoName - Repository name
   * @returns {boolean} True if repo should be excluded
   */
  isExcluded(repoName) {
    if (!repoName || !CONFIGS.github.excludedRepos?.length) return false;

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
    // Process repositories sequentially with rate limiting awareness
    const processedRepos = [];
    const delayBetweenRequests = 250; // 250ms delay between requests

    for (const repo of repos) {
      try {
        // Get commit activity for scoring with retry logic
        let totalCommits = 0;
        let retries = 0;
        const maxRetries = 3;
        let lastError = null;

        while (retries < maxRetries) {
          try {
            const statsResponse = await fetch(
              `https://api.github.com/repos/${CONFIGS.github.username}/${repo.name}/stats/participation`,
              {
                headers: {
                  Accept: "application/vnd.github.v3+json",
                },
              }
            );

            // Check for rate limiting
            if (statsResponse.status === 403) {
              const rateLimitRemaining = statsResponse.headers.get(
                "X-RateLimit-Remaining"
              );
              const rateLimitReset =
                statsResponse.headers.get("X-RateLimit-Reset");

              if (rateLimitRemaining === "0" && rateLimitReset) {
                const resetTime = new Date(rateLimitReset * 1000);
                const waitTime = Math.max(0, resetTime - new Date()) + 1000;

                // Log the rate limit and fallback to score calculation without commits
                Utils.log(
                  `GitHub API rate limit reached. Reset at ${resetTime.toLocaleTimeString()}`,
                  "warn"
                );

                // If wait time is reasonable, wait and retry
                if (waitTime < 60000) {
                  // Less than a minute
                  await new Promise((resolve) => setTimeout(resolve, waitTime));
                  retries++;
                  continue;
                } else {
                  // If wait time is too long, break and continue with limited data
                  break;
                }
              }
            }

            if (statsResponse.ok) {
              const stats = await statsResponse.json();
              totalCommits =
                stats.all?.reduce((sum, count) => sum + count, 0) || 0;
              break; // Success, exit retry loop
            } else if (statsResponse.status === 202) {
              // GitHub is computing the stats, wait and retry
              Utils.log(
                `Stats for ${repo.name} being computed, retrying...`,
                "info"
              );
              await new Promise((resolve) => setTimeout(resolve, 2000));
              retries++;
            } else {
              throw new Error(`HTTP ${statsResponse.status}`);
            }
          } catch (error) {
            lastError = error;
            // Exponential backoff
            const backoffTime = Math.min(1000 * Math.pow(2, retries), 10000);
            await new Promise((resolve) => setTimeout(resolve, backoffTime));
            retries++;
          }
        }

        // Calculate score - featured repos get maximum score
        const score = repo.isFeatured
          ? Number.MAX_SAFE_INTEGER
          : this.calculateRepoScore(repo, totalCommits);

        processedRepos.push({
          ...repo,
          totalCommits,
          score,
        });

        // Add delay between requests to avoid hitting rate limits
        if (repos.length > 5) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayBetweenRequests)
          );
        }
      } catch (error) {
        Utils.log(
          `Couldn't get stats for ${repo.name}: ${error.message}`,
          "warn"
        );

        // Add repo with fallback score even if there was an error
        processedRepos.push({
          ...repo,
          totalCommits: 0,
          score: repo.isFeatured ? Number.MAX_SAFE_INTEGER : 0,
        });
      }
    }

    return processedRepos;
  },

  /**
   * Calculate repository score based on multiple weighted metrics
   * @param {Object} repo - Repository data
   * @param {number} totalCommits - Total commit count
   * @returns {number} Calculated repository score
   */
  calculateRepoScore(repo, totalCommits) {
    const weights = CONFIGS.github.weights;

    // Calculate recency score using time utilities for accurate age calculation
    // Get age in milliseconds first
    const ageMs = Date.now() - new Date(repo.pushed_at).getTime();
    // Convert to days for scoring (max 100 points for recent repos)
    const ageInDays = ageMs / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 100 - ageInDays);

    // Calculate weighted score with appropriate scaling factors
    return (
      repo.size * weights.size +
      totalCommits * 10 * weights.commits +
      repo.stargazers_count * 20 * weights.stars +
      recencyScore * weights.recency
    );
  },

  /**
   * Cache repositories with schema version and timestamp
   * @param {Array} repos - Repositories to cache
   */
  cacheRepos(repos) {
    if (!repos?.length) return;

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
   * Get color for programming language
   * @param {string} language - Programming language name
   * @returns {string} Hex color code
   */
  getLanguageColor(language) {
    if (!language) return "#8257e5"; // Default purple for undefined/null

    // Common language colors - matches GitHub's color scheme
    const colors = {
      // Core languages
      JavaScript: "#f1e05a",
      TypeScript: "#3178c6",
      HTML: "#e34c26",
      CSS: "#563d7c",

      // Frontend frameworks
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
      Flutter: "#02569B",

      // Database and config
      SQL: "#e38c00",
      PLpgSQL: "#336790",
      YAML: "#cb171e",
      JSON: "#292929",
      Markdown: "#083fa1",
      Shell: "#89e051",
      PowerShell: "#012456",
      Dockerfile: "#384d54",
    };

    return colors[language] || "#8257e5";
  },
};
