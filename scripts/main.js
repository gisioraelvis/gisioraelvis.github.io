/**
 * Initialize modules with prioritized loading strategy
 * Core modules first, enhanced features async, non-critical features lazy-loaded
 *
 * Loading sequence:
 * 1. Critical utilities and configuration
 * 2. Core UI components (immediate initialization)
 * 3. Enhancement features (parallel async loading)
 * 4. Non-critical modules (delayed lazy loading)
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Track initialization performance
  const initStart = performance.now();

  try {
    // ===== STAGE 1: Load critical utilities and configuration =====
    const { Utils } = await loadModule(() => import("./utils.js"), "Utils", {
      critical: true,
    });

    Utils.log("Starting website initialization...", "info");

    // Pre-check for configs.js existence
    const configModule = await loadModule(
      () => import("./configs.js"),
      "CONFIGS",
      { critical: true }
    );

    if (!configModule.CONFIGS) {
      throw new Error("CONFIGS module not found or invalid");
    }

    Utils.log("Configuration module loaded successfully", "info");

    // ===== STAGE 2: Load and initialize core UI modules immediately =====
    const [{ ThemeManager }, { Navigation }] = await Promise.all([
      loadModule(() => import("./modules/theme.js"), "ThemeManager", {
        critical: true,
      }),
      loadModule(() => import("./modules/navigation.js"), "Navigation", {
        critical: true,
      }),
    ]);

    // Initialize core UI components in order of visual importance
    ThemeManager.init();
    Navigation.init();
    Utils.setCopyrightYear();
    Utils.lazyLoadImages();

    Utils.log("Core UI initialized", "info");

    // ===== STAGE 3: Load and initialize enhancement features asynchronously =====
    // Use Promise.allSettled to ensure all modules are attempted regardless of individual failures
    Promise.allSettled([
      loadModule(() => import("./modules/animations.js"), "Animations").then(
        ({ Animations }) => {
          Animations.init();
          return "Animations initialized";
        }
      ),
      loadModule(() => import("./modules/expander.js"), "ContentExpander").then(
        ({ ContentExpander }) => {
          ContentExpander.init();
          return "ContentExpander initialized";
        }
      ),
      loadModule(() => import("./modules/projects.js"), "GitHubProjects").then(
        ({ GitHubProjects }) => {
          GitHubProjects.init();
          return "GitHubProjects initialized";
        }
      ),
    ]).then((results) => {
      // Log success/failure status for each enhancement feature
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          Utils.log(`Enhancement success: ${result.value}`, "info");
        } else {
          Utils.log(`Enhancement failed: ${result.reason}`, "warn");
        }
      });
    });

    // ===== STAGE 4: Lazy load non-critical modules with adaptive delay =====
    // Adjust delay based on whether the page appears to have loaded quickly
    const initialLoadTime = performance.now() - initStart;
    const lazyLoadDelay = initialLoadTime > 800 ? 1500 : 1000; // Adaptive delay

    setTimeout(() => {
      Utils.log(
        `Initializing non-critical modules (after ${lazyLoadDelay}ms delay)`,
        "info"
      );

      loadModule(() => import("./modules/analytics.js"), "Analytics")
        .then(({ Analytics }) => Analytics.init())
        .then(() => Utils.log("Analytics initialization complete", "info"))
        .catch((err) =>
          Utils.log(`Analytics initialization error: ${err.message}`, "warn")
        );
    }, lazyLoadDelay);

    const totalInitTime = performance.now() - initStart;
    Utils.log(
      `Website initialization sequence completed in ${totalInitTime.toFixed(
        2
      )}ms`,
      "info"
    );
  } catch (error) {
    console.error("Critical initialization error:", error);

    // Perform minimal fallback initialization for essential functionality
    try {
      // Update copyright year
      document.getElementById("copyright-year").textContent =
        new Date().getFullYear();

      // Attempt to enable minimal theme functionality
      const themeToggle = document.getElementById("themeToggle");
      if (themeToggle) {
        themeToggle.addEventListener("click", () => {
          document.body.classList.toggle("dark");
          document.body.classList.toggle("light");
        });
      }

      // Basic error notification for users
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        const errorNotice = document.createElement("div");
        errorNotice.className = "error-notice";
        errorNotice.setAttribute("role", "alert");
        errorNotice.innerHTML = `
          <p>Some features may be unavailable. Please try refreshing the page.</p>
        `;
        mainContent.prepend(errorNotice);

        // Auto-remove after 8 seconds
        setTimeout(() => errorNotice.remove(), 8000);
      }
    } catch (fallbackError) {
      console.error("Fallback initialization failed:", fallbackError);
    }
  }
});

/**
 * Advanced module loader with comprehensive error handling and performance optimization
 * Prevents individual module failures from affecting the entire application
 *
 * @param {function} importFn - Dynamic import function for the module
 * @param {string} moduleName - Name of the module for logging
 * @param {Object} options - Additional options for module loading
 * @param {boolean} [options.critical=false] - Whether the module is critical for application function
 * @param {number} [options.timeout=5000] - Timeout in ms for module loading (prevents long-hanging imports)
 * @returns {Promise<Object>} - The loaded module or a fallback object
 */
const loadModule = async (importFn, moduleName, options = {}) => {
  const { critical = false, timeout = 5000 } = options;

  // Create a promise that rejects after the timeout period
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error(`Module ${moduleName} load timed out after ${timeout}ms`)
        ),
      timeout
    );
  });

  try {
    // Race the module loading against the timeout
    const module = await Promise.race([importFn(), timeoutPromise]);
    return module;
  } catch (error) {
    const errorMessage = `Failed to load ${moduleName} module: ${
      error.message || "Unknown error"
    }`;

    // Log error with appropriate severity based on module criticality
    if (critical) {
      console.error(errorMessage, error);
    } else {
      console.warn(errorMessage);
    }

    // Return a fallback module with empty functions to prevent null reference errors
    return {
      [moduleName.replace(/^./, (c) => c.toLowerCase())]: {
        init: () =>
          console.warn(
            `${moduleName} initialization skipped due to loading failure`
          ),
      },
    };
  }
};
