/**
 * General utility functions
 */
export const Utils = {
  /**
   * Debounce function to limit how often a function can be called
   * @param {Function} func - The function to debounce
   * @param {number} wait - The debounce wait time in ms
   * @returns {Function} - The debounced function
   */
  debounce(func, wait = 300) {
    let timeout;

    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Log messages with different levels
   * @param {string} message - The message to log
   * @param {string} level - The log level (info, warn, error)
   */
  log(message, level = "info") {
    const prefix = "📝 Portfolio:";

    switch (level.toLowerCase()) {
      case "warn":
        console.warn(`${prefix} ${message}`);
        break;
      case "error":
        console.error(`${prefix} ${message}`);
        break;
      case "info":
      default:
        console.info(`${prefix} ${message}`);
        break;
    }
  },

  /**
   * Set the current year in the copyright element
   */
  setCopyrightYear() {
    const copyrightElement = document.getElementById("copyright-year");
    if (copyrightElement) {
      copyrightElement.textContent = new Date().getFullYear();
    }
  },
};
