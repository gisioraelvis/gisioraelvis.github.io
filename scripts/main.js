/**
 * Main entry point, imports all modules
 */
import { ThemeManager } from "./modules/theme.js";
import { Animations } from "./modules/animations.js";
import { ContentExpander } from "./modules/expander.js";
import { GitHubProjects } from "./modules/github-projects.js";
import { SEO } from "./modules/seo.js";
import { Utils } from "./utils.js";

/**
 * Initialize all modules when the DOM is loaded
 */
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  Animations.init();
  ContentExpander.init();
  GitHubProjects.init();
  SEO.init();
  Utils.setCopyrightYear();

  Utils.log("Website initialization complete", "info");
});
