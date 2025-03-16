import { CONFIGS } from "../configs.js";

/**
 * Content expansion module for "Show More" functionality
 */
export const ContentExpander = {
  /**
   * Initialize show more functionality for all sections
   */
  init() {
    this.addShowMoreFunctionality(
      ".timeline",
      ".timeline-item",
      CONFIGS.showMore.initialItems.experience,
      "experience"
    );

    this.addShowMoreFunctionality(
      ".certifications-grid",
      ".certification-item",
      CONFIGS.showMore.initialItems.education,
      "education"
    );

    this.addShowMoreFunctionality(
      ".projects-grid",
      ".project-card",
      CONFIGS.showMore.initialItems.projects,
      "projects"
    );

    // Add soft skills to the standard pattern
    this.addShowMoreFunctionality(
      ".soft-skills-grid",
      ".soft-skill-item",
      CONFIGS.showMore.initialItems.softSkills,
      "skills"
    );
  },

  /**
   * Adds "Show More" functionality to sections that may grow over time
   * @param {string} containerSelector - The selector for the container element
   * @param {string} itemSelector - The selector for the items to paginate
   * @param {number} initialCount - Number of items to show initially
   * @param {string} sectionId - The ID of the section for targeting the button container
   */
  addShowMoreFunctionality(
    containerSelector,
    itemSelector,
    initialCount,
    sectionId
  ) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const items = container.querySelectorAll(itemSelector);
    if (items.length <= initialCount) return; // Don't add pagination if not needed

    // Create button container if it doesn't exist
    let buttonContainer = document.querySelector(
      `#${sectionId} .show-more-container`
    );

    if (!buttonContainer) {
      buttonContainer = document.createElement("div");
      buttonContainer.className = "show-more-container";
      container.parentNode.insertBefore(buttonContainer, container.nextSibling);
    } else {
      // Clear any existing content in button container
      buttonContainer.innerHTML = "";
    }

    // Create show more button
    const showMoreBtn = document.createElement("button");
    showMoreBtn.className = "show-more-btn";
    showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';
    buttonContainer.appendChild(showMoreBtn);

    // Hide items beyond the initial count
    let isExpanded = false;
    items.forEach((item, index) => {
      if (index >= initialCount) {
        item.classList.add("hidden-item");
      } else {
        // Remove hidden-item class for items that should be initially visible
        item.classList.remove("hidden-item");
      }
    });

    // Add click event to toggle visibility
    showMoreBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;

      items.forEach((item, index) => {
        if (index >= initialCount) {
          if (isExpanded) {
            item.classList.remove("hidden-item");
            item.classList.add("show-item");
          } else {
            item.classList.remove("show-item");
            item.classList.add("hidden-item");
          }
        }
      });

      // Update button text
      if (isExpanded) {
        showMoreBtn.innerHTML = 'Show Less <i class="fas fa-chevron-up"></i>';
      } else {
        showMoreBtn.innerHTML = 'Show More <i class="fas fa-chevron-down"></i>';

        // Scroll back to the last visible item
        if (items[initialCount - 1]) {
          items[initialCount - 1].scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }
    });
  },
};
