/**
 * Analytics Module
 *
 * Manages integration with analytics services:
 * - Google Analytics (GA4)
 * - Google Search Console verification
 * - Microsoft Clarity
 *
 * Features:
 * - Respects user privacy (Do Not Track)
 * - Error handling and logging
 * - Custom event tracking
 */
export const Analytics = {
  /**
   * Initialize analytics services
   * @returns {void}
   */
  init() {
    try {
      // Check if user has opted out of tracking
      if (this.shouldRespectPrivacy()) {
        Utils.log("Analytics disabled due to privacy settings", "info");
        return;
      }

      // Initialize each service
      this.initGoogleAnalytics();
      this.initSearchConsole();
      this.initMicrosoftClarity();
      this.setupEventTracking();

      Utils.log("Analytics services initialized", "info");
    } catch (error) {
      Utils.log(`Analytics initialization failed: ${error.message}`, "error");
    }
  },

  /**
   * Initialize Google Analytics (GA4)
   * @private
   */
  initGoogleAnalytics() {
    const gaId = CONFIGS.analytics?.gaId;

    if (!gaId) {
      Utils.log("Google Analytics ID not configured", "warn");
      return;
    }

    // Load GA script asynchronously
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize the dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", gaId, {
      anonymize_ip: true,
      cookie_flags: "SameSite=None;Secure",
    });
  },

  /**
   * Add Google Search Console verification
   * @private
   */
  initSearchConsole() {
    // First check if we have an explicit verification ID
    const verificationId = CONFIGS.analytics?.searchConsoleId;

    // If verification ID exists and isn't the placeholder, use meta tag approach
    if (verificationId && verificationId !== "XXXXXXXXXX") {
      this.addSearchConsoleMetaTag(verificationId);
      return;
    }

    // If GA is configured, we can use the GA connection for verification
    // No additional code needed as GA script presence is sufficient
    const gaId = CONFIGS.analytics?.gaId;
    if (gaId) {
      Utils.log(
        "Using Google Analytics for Search Console verification",
        "info"
      );
    } else {
      Utils.log("No Search Console verification method available", "warn");
    }
  },

  /**
   * Helper method to add Search Console meta tag when explicit verification is needed
   * @param {string} verificationId - Google Search Console verification ID
   * @private
   */
  addSearchConsoleMetaTag(verificationId) {
    // Check if meta tag already exists
    let metaTag = document.querySelector(
      'meta[name="google-site-verification"]'
    );

    if (metaTag) {
      metaTag.content = verificationId;
    } else {
      metaTag = document.createElement("meta");
      metaTag.name = "google-site-verification";
      metaTag.content = verificationId;
      document.head.appendChild(metaTag);
    }

    Utils.log("Search Console meta verification tag added", "info");
  },

  /**
   * Initialize Microsoft Clarity
   * @private
   */
  initMicrosoftClarity() {
    const clarityId = CONFIGS.analytics?.clarityId;

    if (!clarityId) {
      Utils.log("Microsoft Clarity ID not configured", "warn");
      return;
    }

    (function (c, l, a, r, i, t, y) {
      c[a] =
        c[a] ||
        function () {
          (c[a].q = c[a].q || []).push(arguments);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", clarityId);
  },

  /**
   * Set up custom event tracking
   * @private
   */
  setupEventTracking() {
    if (!window.gtag) return;

    // Track outbound links
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      const isExternal =
        link.hostname !== window.location.hostname &&
        !link.hostname.includes("github.io");

      if (isExternal) {
        this.trackEvent({
          category: "outbound",
          action: "click",
          label: link.href,
        });
      }
    });

    // Track section visibility
    if (CONFIGS.analytics?.trackSections) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const section = entry.target.id || "unnamed-section";
              this.trackEvent({
                category: "section",
                action: "view",
                label: section,
              });
              // Unobserve after first view to prevent duplicate events
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.7 }
      );

      // Observe all sections
      document.querySelectorAll("section[id]").forEach((section) => {
        observer.observe(section);
      });
    }
  },

  /**
   * Track a custom event
   * @param {Object} params - Event parameters
   * @param {string} params.category - Event category
   * @param {string} params.action - Event action
   * @param {string} params.label - Event label (optional)
   * @param {Object} params.value - Event value (optional)
   * @returns {void}
   */
  trackEvent({ category, action, label, value }) {
    if (!window.gtag) return;

    try {
      const eventParams = {
        event_category: category,
        non_interaction: action === "view",
      };

      if (label) eventParams.event_label = label;
      if (value) eventParams.value = value;

      window.gtag("event", action, eventParams);
    } catch (error) {
      Utils.log(`Event tracking error: ${error.message}`, "error");
    }
  },

  /**
   * Check if user privacy settings should be respected
   * @private
   * @returns {boolean} True if analytics should be disabled
   */
  shouldRespectPrivacy() {
    if (!CONFIGS.analytics?.respectDnt) return false;

    return (
      navigator.doNotTrack === "1" ||
      navigator.doNotTrack === "yes" ||
      window.doNotTrack === "1" ||
      navigator.globalPrivacyControl === true
    );
  },
};
