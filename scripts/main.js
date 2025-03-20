import { ThemeManager } from "./modules/theme.js";
import { Navigation } from "./modules/navigation.js";
import { Animations } from "./modules/animations.js";
import { ContentExpander } from "./modules/expander.js";
import { GitHubProjects } from "./modules/projects.js";
import { Utils } from "./utils.js";

// Initialize all modules when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  ThemeManager.init();
  Navigation.init();
  Animations.init();
  ContentExpander.init();
  GitHubProjects.init();
  Utils.setCopyrightYear();
  Utils.log("Website initialization complete", "info");
});
