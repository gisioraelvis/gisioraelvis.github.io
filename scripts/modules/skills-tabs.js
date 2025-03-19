/**
 * SkillsTabs Module - Manages interactive skills category tabs and animations
 *
 * Handles tab interactions, skill indicator visualizations,
 * and intersection-based animations for skill elements.
 */
export class SkillsTabs {
  /**
   * Initialize all skill tab functionality
   */
  static init() {
    this.initTechStackTabs();
    this.setupSkillIndicators();
    this.setupIntersectionObservers();
  }

  /**
   * Initialize category tab switching functionality
   */
  static initTechStackTabs() {
    const categoryTabs = document.querySelectorAll(".skills-category-tab");

    categoryTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update active tab state
        this.updateTabStates(categoryTabs, tab);

        // Show corresponding content panel
        this.showTargetContent(tab);
      });
    });
  }

  /**
   * Update tab states when a tab is clicked
   * @param {NodeList} tabs - All category tabs
   * @param {Element} activeTab - The tab that was clicked
   */
  static updateTabStates(tabs, activeTab) {
    tabs.forEach((tab) => {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
    });

    activeTab.classList.add("active");
    activeTab.setAttribute("aria-selected", "true");
  }

  /**
   * Show the content panel associated with the selected tab
   * @param {Element} tab - The selected tab
   */
  static showTargetContent(tab) {
    const targetId = tab.getAttribute("aria-controls");
    const categories = document.querySelectorAll(".skills-main-category");

    categories.forEach((category) => {
      category.classList.remove("active");
    });

    document.getElementById(targetId)?.classList.add("active");
  }

  /**
   * Set up skill indicators with consistent color matching between
   * skill icons, borders, tooltips and legend
   */
  static setupSkillIndicators() {
    document.querySelectorAll(".skills-icons a").forEach((icon) => {
      const title = icon.getAttribute("title") || "";
      const percentageMatch = title.match(/(\d+)%/);

      if (!percentageMatch || !percentageMatch[1]) return;

      const percentage = parseInt(percentageMatch[1], 10);
      icon.style.setProperty("--skill-percentage", `${percentage}%`);

      // Remove any existing level classes first
      icon.classList.remove(
        "expert-level",
        "advanced-level",
        "intermediate-level",
        "beginner-level"
      );

      // Add proficiency level class based on percentage
      this.applyProficiencyClass(icon, percentage);

      // Make the conic gradient visible by default with subtle opacity
      icon.classList.add("with-indicator");
    });
  }

  /**
   * Apply the appropriate proficiency class based on percentage
   * @param {Element} element - The element to apply the class to
   * @param {number} percentage - The proficiency percentage
   */
  static applyProficiencyClass(element, percentage) {
    if (percentage >= 85) {
      element.classList.add("expert-level");
    } else if (percentage >= 75) {
      element.classList.add("advanced-level");
    } else if (percentage >= 65) {
      element.classList.add("intermediate-level");
    } else {
      element.classList.add("beginner-level");
    }
  }

  /**
   * Set up intersection observers for animating elements when they enter viewport
   */
  static setupIntersectionObservers() {
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

    // Observe skill categories and soft skill items
    document
      .querySelectorAll(".skills-category, .soft-skill-item")
      .forEach((element) => {
        skillsObserver.observe(element);
      });
  }
}
