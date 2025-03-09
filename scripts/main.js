/**
 * Main entry point for the portfolio website
 * Imports and initializes all modules
 */
import { ThemeManager } from "./modules/theme.js";
import { UIEffects } from "./modules/ui-effects.js";
import { AnimationController } from "./modules/animation.js";
import { ContentExpander } from "./modules/content.js";
import { GitHubProjects } from "./modules/github-projects.js";
import { Utils } from "./utils/utils.js";

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

  // Set copyright year
  Utils.setCopyrightYear();

  // Log initialization complete
  Utils.log("Website initialization complete", "info");
});
