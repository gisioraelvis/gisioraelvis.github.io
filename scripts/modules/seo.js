/**
 * SEO enhancement module
 */
import { CONFIGS } from "../configs.js";
import { Utils } from "../utils.js";

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
      // Check if structured data exists in configs
      if (!CONFIGS.seo || !CONFIGS.seo.structuredData) {
        Utils.log("No structured data found in configs", "warn");
        return;
      }

      // Create script element
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(CONFIGS.seo.structuredData);

      // Add to document head
      document.head.appendChild(script);

      Utils.log("Structured data injected successfully", "info");
    } catch (error) {
      Utils.log(`Error injecting structured data: ${error.message}`, "error");
    }
  },
};
