/**
 * General utility functions
 */
export const Utils = {
  /**
   * Safely access nested object properties
   * @param {Object} obj - The object to access
   * @param {String} path - The path to the property (e.g. "a.b.c")
   * @param {*} defaultValue - Default value if path doesn't exist
   * @returns {*} The value at the path or the default value
   */
  getNestedValue(obj, path, defaultValue = null) {
    return path
      .split(".")
      .reduce((o, p) => (o && o[p] !== undefined ? o[p] : defaultValue), obj);
  },

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
