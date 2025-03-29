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
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Time constants in milliseconds (defined once for efficiency)
  _TIME_UNITS: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000,
  },

  // Format text templates (defined once to avoid recreation)
  _TIME_LABELS: {
    short: {
      now: "now",
      second: "s",
      seconds: "s",
      minute: "m",
      minutes: "m",
      hour: "h",
      hours: "h",
      day: "d",
      days: "d",
      week: "w",
      weeks: "w",
      month: "mo",
      months: "mo",
      year: "y",
      years: "y",
      ago: "",
      in: "",
    },
    long: {
      now: "just now",
      second: "second",
      seconds: "seconds",
      minute: "minute",
      minutes: "minutes",
      hour: "hour",
      hours: "hours",
      day: "day",
      days: "days",
      week: "week",
      weeks: "weeks",
      month: "month",
      months: "months",
      year: "year",
      years: "years",
      ago: "ago",
      in: "in",
    },
  },

  /**
   * Format elapsed time in human-readable format
   * @param {Date|number|string} dateTime - Date object, timestamp, or date string
   * @param {Object} options - Formatting options
   * @param {boolean} options.relative - If true, returns relative time (e.g. "2 days ago")
   * @param {boolean} options.short - If true, uses shorter format (e.g. "2d" vs "2 days")
   * @param {boolean} options.includeSeconds - Include seconds in output
   * @param {Date|number} options.now - Reference date for comparison (defaults to current time)
   * @returns {string} - Formatted time string
   */
  formatTimeElapsed(dateTime, options = {}) {
    try {
      const {
        relative = true,
        short = false,
        includeSeconds = true,
        now = new Date(),
      } = options;

      // Convert inputs to Date objects
      const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
      const reference = now instanceof Date ? now : new Date(now);

      // Validate date objects
      if (isNaN(date.getTime()) || isNaN(reference.getTime())) {
        throw new Error("Invalid date format");
      }

      const diffMs = Math.abs(reference - date);
      const isPast = date < reference;
      const units = short ? this._TIME_LABELS.short : this._TIME_LABELS.long;

      // Handle "just now" case
      if (diffMs < this._TIME_UNITS.SECOND && includeSeconds) {
        return units.now;
      }

      // Determine the appropriate time unit and value
      let value, unit;
      const { SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR } = this._TIME_UNITS;

      if (diffMs < MINUTE) {
        if (!includeSeconds) return units.now;
        value = Math.floor(diffMs / SECOND);
        unit = value === 1 ? units.second : units.seconds;
      } else if (diffMs < HOUR) {
        value = Math.floor(diffMs / MINUTE);
        unit = value === 1 ? units.minute : units.minutes;
      } else if (diffMs < DAY) {
        value = Math.floor(diffMs / HOUR);
        unit = value === 1 ? units.hour : units.hours;
      } else if (diffMs < WEEK) {
        value = Math.floor(diffMs / DAY);
        unit = value === 1 ? units.day : units.days;
      } else if (diffMs < MONTH) {
        value = Math.floor(diffMs / WEEK);
        unit = value === 1 ? units.week : units.weeks;
      } else if (diffMs < YEAR) {
        value = Math.floor(diffMs / MONTH);
        unit = value === 1 ? units.month : units.months;
      } else {
        value = Math.floor(diffMs / YEAR);
        unit = value === 1 ? units.year : units.years;
      }

      // Format the output
      if (relative) {
        const suffix = short ? "" : isPast ? ` ${units.ago}` : ` ${units.in}`;
        const prefix = short && !isPast ? "+" : "";
        return `${prefix}${value}${short ? unit : ` ${unit}`}${suffix}`;
      }
      return short ? `${value}${unit}` : `${value} ${unit}`;
    } catch (error) {
      this.log(`Time formatting error: ${error.message}`, "error");
      return "unknown time";
    }
  },

  /**
   * Format a date into various standard formats
   * @param {Date|number|string} date - Date to format
   * @param {string} format - Format type (short, medium, long, full, time, datetime, etc.)
   * @returns {string} - Formatted date string
   */
  formatDate(date, format = "medium") {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);

      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date");
      }

      // Format-specific options
      const formatOptions = {
        short: {},
        medium: { month: "short", day: "numeric", year: "numeric" },
        long: { month: "long", day: "numeric", year: "numeric" },
        full: {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        },
        time: { hour: "numeric", minute: "2-digit", hour12: true },
        "full-datetime": {
          dateStyle: "full",
          timeStyle: "short",
        },
      };

      switch (format.toLowerCase()) {
        case "short":
        case "medium":
        case "long":
        case "full":
          return dateObj.toLocaleDateString(undefined, formatOptions[format]);
        case "time":
          return dateObj.toLocaleTimeString(undefined, formatOptions.time);
        case "datetime":
          return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString(
            undefined,
            formatOptions.time
          )}`;
        case "full-datetime":
          try {
            // Modern browsers support combined date/time formatting
            return dateObj.toLocaleString(
              undefined,
              formatOptions["full-datetime"]
            );
          } catch (e) {
            // Fallback for older browsers
            return `${dateObj.toLocaleDateString(
              undefined,
              formatOptions.full
            )} ${dateObj.toLocaleTimeString(undefined, formatOptions.time)}`;
          }
        case "iso":
          return dateObj.toISOString();
        case "relative":
          return this.formatTimeElapsed(dateObj);
        default:
          return dateObj.toLocaleDateString();
      }
    } catch (error) {
      this.log(`Date formatting error: ${error.message}`, "error");
      return "Invalid date";
    }
  },

  /**
   * Log messages with different levels
   * @param {string} message - The message to log
   * @param {string} level - The log level (info, warn, error)
   */
  log(message, level = "info") {
    const prefix = "📝 Portfolio:";
    const console_fn =
      level === "error"
        ? console.error
        : level === "warn"
        ? console.warn
        : console.info;
    console_fn(`${prefix} ${message}`);
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

  /**
   * Initialize lazy loading for images to improve page performance
   * Uses native browser support with fallback for older browsers
   * @param {Object} options - Configuration options
   * @param {string} options.selector - CSS selector for lazy images (default: 'img[loading="lazy"]')
   * @param {string} options.rootMargin - Margin around root for IntersectionObserver (default: '50px 0px')
   * @param {number} options.threshold - Visibility threshold to trigger loading (default: 0.01)
   */
  lazyLoadImages(options = {}) {
    try {
      const {
        selector = 'img[loading="lazy"]',
        rootMargin = "50px 0px",
        threshold = 0.01,
      } = options;

      // Exit early if native lazy loading is supported
      if ("loading" in HTMLImageElement.prototype) {
        this.log("Using native image lazy loading", "info");
        return;
      }

      // Fallback for browsers without native support
      const lazyImages = document.querySelectorAll(selector);
      if (!lazyImages.length) {
        this.log("No lazy-loaded images found", "info");
        return;
      }

      this.log(
        `Setting up IntersectionObserver for ${lazyImages.length} images`,
        "info"
      );

      // Create observer to watch for images entering viewport
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const src = img.dataset.src || img.getAttribute("data-src");

              if (src) {
                img.src = src;
                img.removeAttribute("data-src");
                this.log(`Lazy loaded image: ${src.split("/").pop()}`, "info");
              }

              // Stop observing this image once loaded
              obs.unobserve(img);
            }
          });
        },
        { rootMargin, threshold }
      );

      // Start observing all lazy images
      lazyImages.forEach((img) => observer.observe(img));
    } catch (error) {
      this.log(`Lazy loading setup error: ${error.message}`, "error");
    }
  },
};
