/**
 * Main entry point, imports all modules
 */
import { ThemeManager } from "./modules/theme.js";
import { Animations } from "./modules/animations.js";
import { GitHubProjects } from "./modules/github-projects.js";
import { Utils } from "./utils.js";

/**
 * Initialize all modules when the DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  Animations.init();
  GitHubProjects.init();
  Utils.setCopyrightYear();

  Utils.log("Website initialization complete", "info");
});
