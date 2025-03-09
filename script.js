/**
 * Portfolio Website JavaScript
 * This file contains all the interactive functionality for the portfolio site
 * including theme toggling, animations, GitHub project fetching, and more.
 * 
 * @version 2.0.0
 * @author Elvis Gisiora
 */

/**
 * Application-wide namespace to prevent global scope pollution
 */
const PortfolioApp = {};

/**
 * Configuration object for site-wide settings
 */
PortfolioApp.CONFIG = {
  github: {
    username: "gisioraelvis",
    cacheDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    cacheKey: "github_repos_cache",
    fetchLimit: 50,
    analyzeLimit: 15,
    displayLimit: 6,
    apiTimeout: 10000, // 10 seconds
    // Add repositories you want to exclude from display
    excludedRepos: [
      // Example: "test-repo", "playground", "learning"
    ],
    // Add repositories you want to showcase at the top
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
    // Language colors for project display
    languageColors: {
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
    }
  },
  animation: {
    threshold: 0.1, // Intersection observer threshold
    scrollOffset: 80, // Offset for smooth scrolling
    animationDelay: 100, // Base delay for animations in ms
  },
  showMore: {
    initialItems: {
      experience: 2, // Initial number of timeline items to show
      education: 4, // Initial number of certification items to show
      projects: 4, // Initial number of project items to show
    },
  },
  accessibility: {
    reduceMotion: false, // Set to true to disable animations for users with reduced motion preference
    highContrast: false, // Set to true for high contrast mode
  },
  theme: {
    defaultTheme: "dark", // Default theme when no preference is stored
    storageKey: "theme", // Local storage key for theme preference
    transitionDuration: 300, // Theme transition duration in ms
  }
};

/**
 * Site-wide utility functions
 */
PortfolioApp.Utils = {
  /**
   * Safely access nested object properties
   * @param {Object} obj - The object to access
   * @param {String} path - The path to the property (e.g. "a.b.c")
   * @param {*} defaultValue - Default value if path doesn't exist
   * @returns {*} The value at the path or the default value
   */
  getNestedValue(obj, path, defaultValue = null) {
    return path
      .split(".")
      .reduce((o, p) => (o && o[p] !== undefined ? o[p] : defaultValue), obj);
  },

  /**
   * Debounce function to limit how often a function can be called
   * @param {Function} func - The function to debounce
   * @param {Number} wait - Time to wait in milliseconds
   * @returns {Function} The debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function to limit execution rate
   * @param {Function} func - The function to throttle
   * @param {Number} limit - Minimum time between executions in ms
   * @returns {Function} The throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Log a message with consistent formatting
   * @param {String} message - Message to log
   * @param {String} type - Log type (log, warn, error, info)
   */
  log(message, type = "log") {
    if (typeof console === 'undefined') return;
    const prefix = "📂 Portfolio:";
    console[type](`${prefix} ${message}`);
  },
  /**
   * Set up navbar scroll effect
   */
  setupNavbarScroll() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    });
  },

  /**
   * Set up active nav link highlighting
   */
  setupActiveNavLink() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");
    if (!sections.length || !navLinks.length) return;

    const highlightNavLink = Utils.debounce(() => {
      const scrollPosition = window.scrollY;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active");
            }
          });
        }
      });
    }, 50); // Debounce to improve performance

    window.addEventListener("scroll", highlightNavLink);
  },

  /**
   * Set up smooth scrolling for anchor links
   */
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - CONFIG.animation.scrollOffset,
            behavior: "smooth",
          });
        }
      });
    });
  },

  /**
   * Set up parallax effects for badges
   */
  setupParallaxEffects() {
    const badges = document.querySelectorAll(".badge");
    if (!badges.length) return;

    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      badges.forEach((badge) => {
        const speed = 20;
        const xOffset = (x - 0.5) * speed;
        const yOffset = (y - 0.5) * speed;

        badge.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    });
  },

  /**
   * Set up CSS animation styles
   */
  setupAnimationStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .about-card, .timeline-item, .certification-item, .skill-category, .project-card {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      
      .animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .timeline-item:nth-child(1) { transition-delay: 0.1s; }
      .timeline-item:nth-child(2) { transition-delay: 0.2s; }
      .timeline-item:nth-child(3) { transition-delay: 0.3s; }
      
      .about-card:nth-child(1) { transition-delay: 0.1s; }
      .about-card:nth-child(2) { transition-delay: 0.2s; }
      .about-card:nth-child(3) { transition-delay: 0.3s; }
      
      .certification-item:nth-child(n) { transition-delay: calc(0.1s * var(--n)); }
      
      .skill-category:nth-child(1) { transition-delay: 0.1s; }
      .skill-category:nth-child(2) { transition-delay: 0.2s; }
      .skill-category:nth-child(3) { transition-delay: 0.3s; }
      .skill-category:nth-child(4) { transition-delay: 0.4s; }
      
      .hidden-item {
        display: none;
        opacity: 0;
        transform: translateY(20px);
      }
      
      .show-item {
        display: block;
        animation: fadeInUp 0.5s forwards;
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  },
};

/**
 * Animation controller for handling element animations
 */
const AnimationController = {
  /**
   * Initialize animations for elements
   */
  init() {
    // Set up intersection observer for animations
    this.setupIntersectionObserver();

    // Initial check for elements in view
    this.checkElementsInView();

    // Recheck on scroll and load
    window.addEventListener("load", this.checkElementsInView.bind(this));
    window.addEventListener(
      "scroll",
      Utils.debounce(this.checkElementsInView.bind(this), 50)
    );
  },

  /**
   * Setup intersection observer for animations
   */
  setupIntersectionObserver() {
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

    document
      .querySelectorAll(
        ".about-card, .timeline-item, .certification-item, .skill-category, .project-card"
      )
      .forEach((el) => {
        observer.observe(el);
      });
  },

  /**
   * Check if elements are in view and animate them
   */
  checkElementsInView() {
    const animateElements = document.querySelectorAll(
      ".about-card, .timeline-item, .certification-item, .skill-category"
    );

    animateElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("animate-in");
      }
    });
  },
};

/**
 * Content expansion module for "Show More" functionality
 */
const ContentExpander = {
  /**
   * Initialize show more functionality for all sections
   */
  init() {
    this.addShowMoreFunctionality(
      ".timeline",
      ".timeline-item",
      CONFIG.showMore.initialItems.experience,
      "experience"
    );

    this.addShowMoreFunctionality(
      ".certifications-grid",
      ".certification-item",
      CONFIG.showMore.initialItems.education,
      "education"
    );

    this.addShowMoreFunctionality(
      ".projects-grid",
      ".project-card",
      CONFIG.showMore.initialItems.projects,
      "projects"
    );
  },

  /**
   * Adds "Show More" functionality to sections that may grow over time
   * @param {string} containerSelector - The selector for the container element
   * @param {string} itemSelector - The selector for the items to paginate
   * @param {number} initialCount - Number of items to show initially
   * @param {string} sectionId - The ID of the section for targeting the button container
   */
  addShowMoreFunctionality(
    containerSelector,
    itemSelector,
    initialCount,
    sectionId
  ) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (items.length <= initialCount) return; // Don't add pagination if not needed

    // Create button container if it doesn't exist
    let buttonContainer = document.querySelector(
      `#${sectionId} .show-more-container`
    );

    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.className = "show-more-container";
      container.parentNode.insertBefore(buttonContainer, container.nextSibling);
    }

    // Create show more button
    const showMoreBtn = document.createElement("button");
    showMoreBtn.className = "show-more-btn";
    showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';
    buttonContainer.appendChild(showMoreBtn);

    // Hide items beyond the initial count
    let isExpanded = false;
    items.forEach((item, index) => {
      if (index >= initialCount) {
        item.classList.add("hidden-item");
      }
    });

    // Add click event to toggle visibility
    showMoreBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;

      items.forEach((item, index) => {
        if (index >= initialCount) {
          if (isExpanded) {
            item.classList.remove("hidden-item");
            item.classList.add("show-item");
          } else {
            item.classList.remove("show-item");
            item.classList.add("hidden-item");
          }
        }
      });

      // Update button text
      if (isExpanded) {
        showMoreBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
      } else {
        showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';

        // Scroll back to the last visible item
        if (items[initialCount - 1]) {
          items[initialCount - 1].scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }
    });
  },
};

/**
 * GitHub repository fetching and display module
 */
const GitHubProjects = {
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

/**
 * Initialize everything when the DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all modules
  ThemeManager.init();
  UIEffects.init();
  AnimationController.init();
  ContentExpander.init();
  GitHubProjects.init();

  // Log initialization complete
  Utils.log("Website initialization complete", "info");
});
