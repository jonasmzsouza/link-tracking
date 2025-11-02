/*
 * Tracker 2.1.0
 * JavaScript script for intelligent manipulation of links and forms on websites, 
 * preserving UTM parameters and removing irrelevant search parameters.
 * 
 * Modular class for tracking and manipulating links and forms.
 * Compatible with WordPress and projects that use ES6 modules.
 * 
 * https://github.com/jonasmzsouza/param-tracker
 *
 * Copyright (c) 2023 Jonas Souza
 * Released under the MIT license
 * 
 */
class ParamTracker {
  /**
   * @param {Object} customConfig - Custom client configuration
   */
  constructor(customConfig = {}) {
    const defaults = {
      acceptOrigins: [], // mandatory ["domain.com"]
      acceptFormIds: [], //track accepted forms
      ignorePathnames: [], //ignore tracker in specific pathnames
      ignoreClasses: [], //ignore links containing the classes
      ignoreProtocols: ["mailto:", "tel:"], //ignore links containing protocols
      dataItems: [], //ignore links containing data values in specific link attributes
      attributes: [], //specific link attributes
      includeParams: ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"],
      excludeParams: [], //remove search or filter parameters
    };

    if (!customConfig.acceptOrigins || customConfig.acceptOrigins.length === 0) {
      throw new Error(
        "ParamTracker: The 'acceptOrigins' property is mandatory in the configuration."
      );
    }

    // Merges and concatenates configurable arrays
    this.config = {
      ...defaults,
      ...customConfig,
      acceptOrigins: this.sanitizeStringArray(customConfig.acceptOrigins),
      acceptFormIds: this.sanitizeStringArray(customConfig.acceptFormIds || []),
      ignorePathnames: this.mergeUnique(defaults.ignorePathnames, customConfig.ignorePathnames),
      ignoreClasses: this.mergeUnique(defaults.ignoreClasses, customConfig.ignoreClasses),
      ignoreProtocols: this.mergeUnique(defaults.ignoreProtocols, customConfig.ignoreProtocols),
      dataItems: this.mergeUnique(defaults.dataItems, customConfig.dataItems),
      attributes: this.mergeUnique(defaults.attributes, customConfig.attributes),
      excludeParams: this.mergeUnique(defaults.excludeParams, customConfig.excludeParams),
    };

    // Starts automatically on DOM ready
    document.addEventListener("DOMContentLoaded", () => this.init());
  }

  /**
   * Initializes the tracker module
   * @returns {void}
   */
  init = () => {
    this.sanitizeLinks();
    this.bindLinkEvents();
    this.bindButtonEvents();
    this.restoreScrollHash();
  };

  /**
   * Ensures an array contains only unique, non-empty strings.
   * Removes invalid entries such as objects, numbers, null, undefined.
   * @param {Array<any>} arr
   * @returns {Array<string>}
   */
  sanitizeStringArray = (arr = []) => {
    if (!Array.isArray(arr)) return [];
    return [...new Set(
      arr
        .filter((item) => typeof item === "string" && item.trim() !== "")
        .map((item) => item.trim())
    )];
  };

  /**
   * Merges two arrays and sanitizes the result to unique, non-empty strings.
   * @param {Array<string>} defaultArr
   * @param {Array<string>} customArr
   * @returns {Array<string>}
   */
  mergeUnique = (defaultArr = [], customArr = []) => {
    return this.sanitizeStringArray([...defaultArr, ...customArr]);
  };

  /**
   * Sanitizes existing links in the HTML
   * @returns {void}
   */
  sanitizeLinks = () => {
    document.querySelectorAll("a[href]").forEach((link) => {
      if (!this.shouldHandleLink(link)) return;

      const url = new URL(link.href);
      const hash = url.hash || "";

      const sanitized = this.sanitizeAndMergeParams(
        url.origin + url.pathname,
        url.search,
        "",
        this.config.excludeParams
      );

      const finalHref = sanitized + hash;

      if (finalHref !== link.href) link.href = finalHref;
    });
  };

  /**
   * Check if the URL is a file
   * @param {*} url 
   * @return {bool}
   */
  isFileUrl = (url) => {
    const regex = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|mp3|mp4|avi|wmv|mov|txt|csv|jpe?g|png|gif|svg|webp)(\?.*)?$/i;
    try {
      const { pathname, search, hash } = new URL(url);
      const fullPath = pathname + search + hash;
      return regex.test(fullPath);
    } catch {
      return false;
    }
  }

  /**
   * Check whether the link should be manipulated
   * @param {HTMLElement} linkElement
   * @return {bool}
   */
  shouldHandleLink = (linkElement) => {
    const {
      ignoreClasses,
      ignoreProtocols,
      dataItems,
      attributes,
    } = this.config;

    const linkHref = linkElement.getAttribute("href") || "";

    // Ignore links with specified classes
    if (ignoreClasses.some((cls) => linkElement.classList.contains(cls)))
      return false;

    // Ignore links with specific protocols (mailto:, tel:, etc.)
    if (ignoreProtocols.some((p) => linkHref.startsWith(p))) return false;

    // Ignore file links
    if (isFileUrl(linkHref)) return false;

    // Ignore links that have specific attributes with values in dataItems
    for (const attr of attributes) {
      const val = linkElement.getAttribute(attr);
      if (val && dataItems.includes(val)) return false;
    }

    return true;
  };

  /**
   * Verify that the origin is accepted
   * Accepts both the main domain and subdomains (*.domain.com)
   * @param {String} origin 
   * @returns {bool}
   */
  isAcceptedOrigin = (origin) => {
    try {
      const { hostname } = new URL(origin);
      return this.config.acceptOrigins.some((baseDomain) => {
        const cleanDomain = baseDomain.trim().toLowerCase();
        return (
          hostname === cleanDomain || hostname.endsWith(`.${cleanDomain}`)
        );
      });
    } catch {
      return false;
    }
  };

  /**
   * Handle clicks on links.
   * Useful for checking whether the element's link is to the source website.
   * Call functions with specific responsibilities and redirect the link.
   * @param {Event} event 
   * @param {HTMLElement} linkElement 
   */
  handleLinkClick = (event, linkElement) => {
    const origin = linkElement.origin;
    const pathname = linkElement.pathname;
    const target = linkElement.getAttribute("target");
    const hash = linkElement.hash;
    const page = origin + pathname;

    if (
      this.isAcceptedOrigin(origin) &&
      !this.config.ignorePathnames.some((p) => pathname.includes(p))
    ) {
      const { href, isHashSymbolPresent } = this.generateHref(
        linkElement,
        origin,
        pathname,
        hash
      );
      this.handleLinkRedirect(event, isHashSymbolPresent, href, page, hash, target);
    }
  };

  /**
   * Performs a safe merge between the current page and link parameters,
   * preserving page UTMs when they exist and normalizing malformed queries.
   *
   * @param {string} baseUrl - e.g., ‘https://domain.com/page’
   * @param {string} rawLinkQuery - e.g., linkUrl.search (may be malformed)
   * @param {string} rawCurrentQuery - e.g.: window.location.search
   * @param {Array<string>} excludeParams - list of parameters to remove
   * @returns {string} final URL (baseUrl + ‘?’ + mergedParams) or baseUrl if empty
   */
  sanitizeAndMergeParams = (baseUrl, rawLinkQuery = "", rawCurrentQuery = "", excludeParams = []) => {
    try {
      const linkSearch = this.normalizeQueryString(rawLinkQuery);
      const currentSearch = new URLSearchParams(
        (rawCurrentQuery || "").replace(/^[?&]+/, "")
      );

      // First, add the link parameters to currentSearch,
      // but DO NOT overwrite UTMs that already exist in currentSearch.
      for (const [key, value] of linkSearch.entries()) {
        const lowerKey = key.toLowerCase();
        const isUtm = this.config.includeParams.includes(lowerKey);
        if (isUtm && currentSearch.has(key)) continue; // preserves currentSearch (does not overwrite)
        currentSearch.set(key, value); // otherwise, set (overwrites or adds)
      }

      // Remove unwanted parameters
      excludeParams.forEach((p) => currentSearch.delete(p));

      const finalQuery = currentSearch.toString();
      return finalQuery ? `${baseUrl}?${finalQuery}` : baseUrl;
    } catch (err) {
      console.error("[sanitizeAndMergeParams] erro:", err);
      return baseUrl;
    }
  };

  /**
   * Normalizes a potentially malformed query string that may contain
   * “??” or “&&”, params embedded in values (e.g., custom=example?utm_source=example), or %3F.
   * Returns a URLSearchParams with all pairs correctly extracted.
   * @param {string} rawQuery - e.g., “?custom=example?utm_source=example&utm_medium=example”
   * @returns {URLSearchParams}
   */
  normalizeQueryString = (rawQuery) => {
    let remaining = (rawQuery || "").replace(/^[?&]+/, "");
    const result = new URLSearchParams();

    while (remaining) {
      const [firstPart, rest] = remaining.split(/\?(.+)/s);
      const firstParams = new URLSearchParams(firstPart);
      for (const [k, v] of firstParams) result.append(k, v);
      if (!rest) break;
      remaining = rest;
    }

    // Extra treatment: also decodes values containing %3F encoded
    // and attempts to separate them in such cases. Example: custom=example%3Futm_source%3Dtest
    const entries = Array.from(result.entries());
    for (const [k, v] of entries) {
      if (v.includes("%3F") || v.includes("%3f")) {
        const decoded = decodeURIComponent(v);
        if (decoded.includes("?")) {
          const [valBefore, valAfter] = decoded.split(/\?(.+)/s);
          result.set(k, valBefore);
          const tail = new URLSearchParams(valAfter);
          for (const [tk, tv] of tail) if (!result.has(tk)) result.append(tk, tv);
        }
      }
    }

    return result;
  };

  /**
   * Updates generateHref to use sanitizeAndMergeParams,
   * preserving the hash (#) correctly.
   * @param {HTMLElement} linkElement
   * @param {String} origin
   * @param {String} pathname
   * @param {String} hash
   * @return {Object} { href: String, isHashSymbolPresent: bool }
   */
  generateHref = (linkElement, origin, pathname, hash) => {
    const { excludeParams } = this.config;
    const baseUrl = origin + pathname;
    const linkUrl = new URL(linkElement.href);
    const merged = this.sanitizeAndMergeParams(
      baseUrl,
      linkUrl.search,
      window.location.search,
      excludeParams
    );
    // Ensures that the hash is maintained (if it exists)
    const hasHash = !!hash;
    return { href: merged + (hasHash ? hash : ""), isHashSymbolPresent: hasHash };
  };

  /**
   * Redirects the link to different scenarios
   * @param {Event} event
   * @param {bool} isHashSymbolPresent
   * @param {String} href
   * @param {String} page
   * @param {String} hash
   * @param {String} target
   */
  handleLinkRedirect = (event, isHashSymbolPresent, href, page, hash, target) => {
    event.preventDefault();

    const current = window.location.origin + window.location.pathname;
    if (isHashSymbolPresent && page === current && hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    target === "_blank" ? window.open(href, "_blank") : (window.location.href = href);
  };

  /**
   * Removes search parameters from the URL.
   * Useful for post-search navigation on the site.
   * @param {String} search
   * @return {String}
   */
  removeURLParams = (search) => {
    const urlParams = new URLSearchParams(search);
    this.config.excludeParams.forEach((param) => urlParams.delete(param));
    return urlParams.toString() ? "?" + urlParams.toString() : "";
  };

  /**
   * Adds UTM parameters to the form before submission, avoiding duplicates.
   * @param {HTMLFormElement} formElement
   * @returns {void}
   */
  addParamsToForm = (formElement) => {
    if (!(formElement instanceof HTMLFormElement)) return;

    const locationHash = window.location.hash;
    const locationSearch = locationHash.includes("?")
      ? "?" + locationHash.split("?")[1]
      : window.location.search;

    if (!locationSearch) return;

    const urlParams = new URLSearchParams(this.removeURLParams(locationSearch));
    for (const [key, value] of urlParams) {
      // Avoid duplicating parameters if there is already a field with the same name and value.
      const existingInput = formElement.querySelector(
        `input[name="${CSS.escape(key)}"][value="${CSS.escape(value)}"]`
      );

      if (!existingInput) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        formElement.appendChild(input);
      }
    }
  };

  /**
   * Binds click events to links for tracking and manipulation
   * @returns {void}
   */
  bindLinkEvents = () => {
    document.addEventListener("click", (event) => {
      const linkElement = event.target.closest("a");
      if (!linkElement || !this.shouldHandleLink(linkElement)) return;
      this.handleLinkClick(event, linkElement);
    });
  };

  /**
   * Binds click events to buttons for form submission handling
   * @returns {void}
   */
  bindButtonEvents = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button, input[type='submit']");
      if (!button) return;

      const form = button.closest("form");
      if (!form) return;

      const isAcceptedForm = this.config.acceptFormIds.some((id) =>
        form.id.includes(id)
      );

      if (isAcceptedForm) {
        this.addParamsToForm(form);
      }
    });
  };

  /**
   * Restores scroll position for hash links on page load.
   * @returns {void}
   */
  restoreScrollHash = () => {
    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };
}

// Export universal (UMD / CommonJS / Browser global)
(function (global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(); // Node / CommonJS
  } else if (typeof define === "function" && define.amd) {
    define([], factory); // AMD
  } else {
    global.ParamTracker = factory().ParamTracker; // Browser global
  }
})(
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
      ? window
      : this,
  function () {
    return { ParamTracker };
  }
);

// Optional ESM export (for import)
export { ParamTracker };
