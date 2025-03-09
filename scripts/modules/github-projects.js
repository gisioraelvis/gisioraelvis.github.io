import { CONFIG } from "../config.js";
import { Utils } from "../utils/utils.js";

/**
 * GitHub repository fetching and display module
 */
export const GitHubProjects = {
  /**
   * Initialize GitHub projects section
   */
  init() {
    this.fetchGitHubProjects();
  },

  /**
   * Fetch GitHub projects and display them
   */
  async fetchGitHubProjects() {
    const username = CONFIG.github.username;
    const projectsContainer = document.getElementById("github-projects");
    if (!projectsContainer) return;

    // Show loading indicator
    this.showLoading(projectsContainer);

    try {
      // Check for cached data first
      const cachedData = this.checkCache();
      if (cachedData) {
        this.displayProjects(cachedData, projectsContainer);

        // Try to refresh cache in the background if it's getting old (over 12 hours)
        const cacheAge =
          Date.now() -
          JSON.parse(localStorage.getItem(CONFIG.github.cacheKey)).timestamp;
        if (cacheAge > CONFIG.github.cacheDuration / 2) {
          Utils.log("Cache getting old, refreshing in background...");
          this.fetchAndCacheRepos().catch((error) => {
            Utils.log(
              "Background cache refresh failed: " + error.message,
              "warn"
            );
          });
        }
        return;
      }

      // If no valid cache, fetch new data
      const repos = await this.fetchAndCacheRepos();
      this.displayProjects(repos, projectsContainer);
    } catch (error) {
      Utils.log("Error fetching repositories: " + error.message, "error");
      this.showError(projectsContainer, error.message);
    }
  },

  /**
   * Show loading indicator in the container
   * @param {HTMLElement} container - The container element
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
   * Show error message in the container
   * @param {HTMLElement} container - The container element
   * @param {String} message - The error message
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
   * Check if we have valid cached data
   * @returns {Array|null} The cached repositories or null if no valid cache
   */
  checkCache() {
    try {
      const cachedString = localStorage.getItem(CONFIG.github.cacheKey);
      if (!cachedString) return null;

      const cache = JSON.parse(cachedString);
      const isExpired =
        Date.now() - cache.timestamp > CONFIG.github.cacheDuration;

      if (isExpired) {
        Utils.log("Cache expired, will fetch fresh data");
        return null;
      }

      Utils.log(
        `Using cached repos from ${new Date(cache.timestamp).toLocaleString()}`
      );
      return cache.data;
    } catch (error) {
      Utils.log("Error reading cache: " + error.message, "warn");
      return null;
    }
  },

  /**
   * Fetch repositories from GitHub API and cache them
   * @returns {Promise<Array>} The fetched repositories
   */
  async fetchAndCacheRepos() {
    const username = CONFIG.github.username;

    Utils.log("Fetching repositories from GitHub API");

    // Should we exclude any repos?
    const shouldExcludeRepo = (repoName) => {
      if (CONFIG.github.excludedRepos.length === 0) return false;
      return CONFIG.github.excludedRepos.some((excluded) =>
        repoName.toLowerCase().includes(excluded.toLowerCase())
      );
    };

    // Fetch repos from GitHub API
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&per_page=${CONFIG.github.fetchLimit}`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        signal: AbortSignal.timeout(CONFIG.github.apiTimeout),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    let allRepos = await response.json();
    Utils.log(`Fetched ${allRepos.length} repos from GitHub API`);

    // Filter excluded repos
    allRepos = allRepos.filter((repo) => !shouldExcludeRepo(repo.name));

    // Separate featured repos from other repos
    let featuredRepoObjects = [];
    let otherRepos = [];

    if (CONFIG.github.featuredRepos.length > 0) {
      allRepos.forEach((repo) => {
        if (CONFIG.github.featuredRepos.includes(repo.name)) {
          featuredRepoObjects.push(repo);
        } else {
          otherRepos.push(repo);
        }
      });
    } else {
      otherRepos = allRepos;
    }

    // Sort other repos by size (code amount) first
    otherRepos.sort((a, b) => b.size - a.size);

    // Select repositories to analyze in detail (featured + top sized)
    const reposToAnalyze =
      CONFIG.github.featuredRepos.length > 0
        ? [
            ...featuredRepoObjects,
            ...otherRepos.slice(
              0,
              CONFIG.github.analyzeLimit - featuredRepoObjects.length
            ),
          ]
        : otherRepos.slice(0, CONFIG.github.analyzeLimit);

    // Get detailed stats for selected repositories
    const reposWithCommits = await Promise.all(
      reposToAnalyze.map(async (repo) => {
        try {
          // Get commit activity for the past year
          const statsResponse = await fetch(
            `https://api.github.com/repos/${username}/${repo.name}/stats/participation`
          );

          if (statsResponse.ok) {
            const stats = await statsResponse.json();
            const totalCommits = stats.all
              ? stats.all.reduce((sum, count) => sum + count, 0)
              : 0;
            return {
              ...repo,
              totalCommits,
              isFeatured: CONFIG.github.featuredRepos.includes(repo.name),
            };
          }
          return {
            ...repo,
            totalCommits: 0,
            isFeatured: CONFIG.github.featuredRepos.includes(repo.name),
          };
        } catch (error) {
          Utils.log(
            `Couldn't get commit data for ${repo.name}: ${error.message}`,
            "warn"
          );
          return {
            ...repo,
            totalCommits: 0,
            isFeatured: CONFIG.github.featuredRepos.includes(repo.name),
          };
        }
      })
    );

    // Calculate a score for each repository
    reposWithCommits.forEach((repo) => {
      // Featured repos get maximum score
      if (repo.isFeatured) {
        repo.score = Number.MAX_SAFE_INTEGER;
        return;
      }

      // Calculate recency score (higher for recently updated repos)
      const now = new Date();
      const updatedDate = new Date(repo.pushed_at);
      const ageInDays = (now - updatedDate) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - ageInDays);

      // Calculate weighted score using config weights
      repo.score =
        repo.size * CONFIG.github.weights.size +
        repo.totalCommits * CONFIG.github.weights.commits * 10 +
        repo.stargazers_count * CONFIG.github.weights.stars * 20 +
        recencyScore * CONFIG.github.weights.recency;
    });

    // Sort repositories - featured first, then by score
    reposWithCommits.sort((a, b) => {
      // Handle featured repos
      if (CONFIG.github.featuredRepos.length > 0) {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        if (a.isFeatured && b.isFeatured) {
          return (
            CONFIG.github.featuredRepos.indexOf(a.name) -
            CONFIG.github.featuredRepos.indexOf(b.name)
          );
        }
      }

      // Sort non-featured repos by score
      return b.score - a.score;
    });

    // Take top N repositories
    const repos = reposWithCommits.slice(0, CONFIG.github.displayLimit);

    // Cache the results
    try {
      localStorage.setItem(
        CONFIG.github.cacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: repos,
        })
      );
      Utils.log("Repository data cached successfully");
    } catch (cacheError) {
      Utils.log("Failed to cache repositories: " + cacheError.message, "warn");
    }

    return repos;
  },

  /**
   * Display repositories in the container
   * @param {Array} repos - The repositories to display
   * @param {HTMLElement} container - The container element
   */
  displayProjects(repos, container) {
    // Clear container
    container.innerHTML = "";

    if (!repos || repos.length === 0) {
      container.innerHTML = "<p>No repositories found.</p>";
      return;
    }

    // Display each repository
    repos.forEach((repo) => {
      const languageColor = this.getLanguageColor(repo.language);

      const projectHTML = `
        <div class="project-card">
          <div class="project-content">
            <div class="project-header">
              <h3 class="project-title">
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
              </h3>
              <div class="project-links">
                <a href="${
                  repo.html_url
                }" target="_blank" aria-label="GitHub Repository">
                  <i class="fab fa-github"></i>
                </a>
                ${
                  repo.homepage
                    ? `<a href="${repo.homepage}" target="_blank" aria-label="Live Demo">
                  <i class="fas fa-external-link-alt"></i></a>`
                    : ""
                }
              </div>
            </div>
            <p class="project-description">${
              repo.description || "No description available."
            }</p>
            <div class="project-footer">
              <div class="project-tech-stack">
                ${
                  repo.language
                    ? `<span class="tech-tag">
                    <span class="language-color" style="background-color: ${languageColor}"></span>
                    ${repo.language}
                  </span>`
                    : ""
                }
              </div>
              <div class="project-stats">
                <span class="project-stat"><i class="fas fa-star"></i> ${
                  repo.stargazers_count
                }</span>
                <span class="project-stat"><i class="fas fa-code-branch"></i> ${
                  repo.forks_count
                }</span>
              </div>
            </div>
          </div>
        </div>
      `;

      container.innerHTML += projectHTML;
    });

    // Add "View More" button after all project cards
    const username = CONFIG.github.username;
    const viewMoreHTML = `
      <div class="view-more-container">
        <a href="https://github.com/${username}?tab=repositories" target="_blank" class="view-more-button">
          <span>View More Projects</span>
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    `;
    container.innerHTML += viewMoreHTML;

    // Re-apply animation to newly added project cards
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: CONFIG.animation.threshold }
    );

    document.querySelectorAll(".project-card").forEach((card) => {
      observer.observe(card);
    });

    // Also observe the view more button for animation
    const viewMoreButton = document.querySelector(".view-more-container");
    if (viewMoreButton) {
      observer.observe(viewMoreButton);
    }
  },

  /**
   * Get the color associated with a programming language
   * @param {String} language - The programming language
   * @returns {String} The hex color code for the language
   */
  getLanguageColor(language) {
    const colors = {
      JavaScript: "#f1e05a",
      TypeScript: "#2b7489",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Python: "#3572A5",
      Java: "#b07219",
      "C#": "#178600",
      PHP: "#4F5D95",
      Ruby: "#701516",
      Go: "#00ADD8",
      Swift: "#ffac45",
      Kotlin: "#F18E33",
      Dart: "#00B4AB",
      Rust: "#dea584",
      Shell: "#89e051",
      "C++": "#f34b7d",
      C: "#555555",
    };

    return colors[language] || "#8257e5"; // Default purple color if not found
  },
};
