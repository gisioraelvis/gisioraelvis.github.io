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
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
  const rgbValues = hexToRgb(primaryColor);
  if (rgbValues) {
    document.documentElement.style.setProperty('--primary-color-rgb', `${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}`);
  }

  // Handle soft skills toggle
  const softSkillsToggle = document.getElementById('soft-skills-toggle');
  if (softSkillsToggle) {
    softSkillsToggle.addEventListener('click', function() {
      const hiddenItems = document.querySelectorAll('.soft-skill-item.hidden-item');
      const isExpanded = this.getAttribute('aria-expanded') === 'true';

      hiddenItems.forEach(item => {
        if (!isExpanded) {
          item.classList.add('show-item');
        } else {
          item.classList.remove('show-item');
        }
      });

      this.setAttribute('aria-expanded', !isExpanded);
      this.innerHTML = isExpanded ? 'Show More <i class="fas fa-chevron-down"></i>' : 'Show Less <i class="fas fa-chevron-up"></i>';
    });
  }

  // Handle theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.toggle('dark', savedTheme === 'dark');
      themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }
  }
});

// Helper function to convert hex colors to RGB
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

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
