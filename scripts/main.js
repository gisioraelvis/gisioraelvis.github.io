/**
 * Robust module loader with error handling
 * Prevents individual module failures from breaking the entire application
 *
 * @param {function} importFn - Dynamic import function for the module
 * @param {string} moduleName - Name of the module for logging
 * @returns {Promise<Object>} - The loaded module or a fallback object
 */
const loadModule = async (importFn, moduleName) => {
  try {
    return await importFn();
  } catch (error) {
    console.error(`Failed to load ${moduleName} module:`, error);
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

/**
 * Initialize application modules with prioritized loading strategy
 * Core modules first, enhanced features async, non-critical features lazy-loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // First load critical utilities
    const { Utils } = await loadModule(() => import("./utils.js"), "Utils");
    Utils.log("Starting application initialization", "info");

    // Pre-check for configs.js existence
    const configModule = await loadModule(
      () => import("./configs.js"),
      "CONFIGS"
    );
    if (!configModule.CONFIGS) {
      throw new Error("CONFIGS module not found or invalid");
    }
    Utils.log("Configuration module loaded successfully", "info");

    // Load and initialize core UI modules immediately
    const { ThemeManager } = await loadModule(
      () => import("./modules/theme.js"),
      "ThemeManager"
    );
    const { Navigation } = await loadModule(
      () => import("./modules/navigation.js"),
      "Navigation"
    );

    // Initialize core UI immediately
    ThemeManager.init();
    Navigation.init();
    Utils.setCopyrightYear();
    Utils.lazyLoadImages();
    Utils.log("Core UI initialized", "info");

    // Load and initialize enhancement features asynchronously
    Promise.all([
      loadModule(() => import("./modules/animations.js"), "Animations").then(
        ({ Animations }) => Animations.init()
      ),
      loadModule(() => import("./modules/expander.js"), "ContentExpander").then(
        ({ ContentExpander }) => ContentExpander.init()
      ),
      loadModule(() => import("./modules/projects.js"), "GitHubProjects").then(
        ({ GitHubProjects }) => GitHubProjects.init()
      ),
    ]).catch((err) => {
      Utils.log(
        `Enhancement features initialization error: ${err.message}`,
        "warn"
      );
    });

    // Lazy load non-critical modules with a delay
    setTimeout(() => {
      Utils.log("Initializing non-critical modules", "info");
      loadModule(() => import("./modules/analytics.js"), "Analytics")
        .then(({ Analytics }) => Analytics.init())
        .catch((err) => {
          Utils.log(`Analytics initialization error: ${err.message}`, "warn");
        });
    }, 1000); // 1 second delay to prioritize core functionality

    Utils.log("Website initialization sequence completed", "info");
  } catch (error) {
    console.error("Critical initialization error:", error);
    // Perform minimal fallback initialization for essential functionality
    try {
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
    } catch (fallbackError) {
      console.error("Fallback initialization failed:", fallbackError);
    }
  }
});
