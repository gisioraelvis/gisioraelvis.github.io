/**
 * SkillsTabs Module
 * Handles interactive category tabs and animations for the Tech Stack section
 */
export class SkillsTabs {
  /**
   * Initialize the skills section functionality
   */
  static init() {
    this.initTechStackTabs();
    this.setupSkillIndicators();
    this.setupIntersectionObservers();
  }

  /**
   * Set up the tab system for tech stack categories
   */
  static initTechStackTabs() {
    // Get all tech stack category tabs
    const categoryTabs = document.querySelectorAll(".skills-category-tab");

    // Add click event listeners to each tab
    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update tab states
        categoryTabs.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        // Show corresponding category content
        const targetId = tab.getAttribute("aria-controls");
        const categories = document.querySelectorAll(".skills-main-category");

        categories.forEach((category) => {
          category.classList.remove("active");
        });

        document.getElementById(targetId).classList.add("active");
      });
    });
  }

  /**
   * Set up circular skill level indicators for tech skills
   */
  static setupSkillIndicators() {
    // Add circular progress indicators for skill levels
    document.querySelectorAll(".skills-icons a").forEach((icon) => {
      const title = icon.getAttribute("title") || "";
      const percentageMatch = title.match(/(\d+)%/);

      if (percentageMatch && percentageMatch[1]) {
        const percentage = parseInt(percentageMatch[1], 10);
        icon.style.setProperty("--skill-percentage", `${percentage}%`);
      }
    });
  }

  /**
   * Set up intersection observers for animation elements when they come into view
   */
  static setupIntersectionObservers() {
    // Create observer for skills categories
    const skillsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            skillsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    // Observe all skill categories
    document.querySelectorAll(".skills-category").forEach((category) => {
      skillsObserver.observe(category);
    });

    // Observe all soft skill items
    document.querySelectorAll(".soft-skill-item").forEach((item) => {
      skillsObserver.observe(item);
    });
  }
}
