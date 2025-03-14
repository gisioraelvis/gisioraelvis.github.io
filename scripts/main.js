/**
 * Main entry point for the portfolio website
 * Imports and initializes all modules
 */
import { ThemeManager } from "./modules/theme.js";
import { UIEffects } from "./modules/ui-effects.js";
import { AnimationController } from "./modules/animation.js";
import { ContentExpander } from "./modules/content.js";
import { GitHubProjects } from "./modules/github-projects.js";
import { SEO } from "./modules/seo.js";
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
  SEO.init();
  Utils.setCopyrightYear();

  Utils.log("Website initialization complete", "info");

  // Extract RGB values from primary color for use in proficiency backgrounds
  const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--primary-color")
    .trim();
  const rgbValues = hexToRgb(primaryColor);
  if (rgbValues) {
    document.documentElement.style.setProperty(
      "--primary-color-rgb",
      `${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}`
    );
  }
});

// Helper function to convert hex colors to RGB
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace("#", "");

  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Parse the values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Check if parsing was successful
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}
