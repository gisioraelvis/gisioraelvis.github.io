/**
 * SEO enhancement module
 */
import { CONFIG } from "../config.js";
import { Utils } from "../utils/utils.js";

export const SEO = {
  /**
   * Initialize SEO features
   */
  init() {
    this.injectStructuredData();
  },

  /**
   * Inject JSON-LD structured data into the document head
   */
  injectStructuredData() {
    try {
      // Check if structured data exists in config
      if (!CONFIG.seo || !CONFIG.seo.structuredData) {
        Utils.log("No structured data found in CONFIG", "warn");
        return;
      }

      // Create script element
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(CONFIG.seo.structuredData);

      // Add to document head
      document.head.appendChild(script);

      Utils.log("Structured data injected successfully", "info");
    } catch (error) {
      Utils.log(`Error injecting structured data: ${error.message}`, "error");
    }
  },
};
