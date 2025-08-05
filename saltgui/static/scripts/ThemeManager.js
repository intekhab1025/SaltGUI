/* eslint-disable no-unused-vars */

/**
 * SaltGUI Theme Manager
 * Handles theme switching, persistence, and auto-detection
 */
class ThemeManager {
  constructor() {
    this.themes = {
      light: {
        name: "Light",
        icon: "☀️"
      },
      dark: {
        name: "Dark", 
        icon: "🌙"
      },
      auto: {
        name: "Auto",
        icon: "🔄"
      },
      "high-contrast": {
        name: "High Contrast",
        icon: "⚫"
      }
    };

    this.currentTheme = "auto";
    this.mediaQuery = null;
    this.themeToggle = null;
    this.themeDropdown = null;

    this.init();
  }

  /**
   * Initialize the theme manager
   */
  init() {
    // Load saved theme preference
    this.loadThemePreference();
    
    // Apply initial theme
    this.applyTheme(this.currentTheme);
    
    // Set up media query listener for auto theme
    this.setupMediaQueryListener();
    
    // Listen for system theme changes
    this.watchSystemTheme();
    
    // Create theme toggle UI (simple approach)
    this.createThemeToggle();
  }

  /**
   * Load theme preference from localStorage
   */
  loadThemePreference() {
    const saved = localStorage.getItem("saltgui-theme");
    if (saved && this.themes[saved]) {
      this.currentTheme = saved;
    }
  }

  /**
   * Save theme preference to localStorage
   */
  saveThemePreference(theme) {
    localStorage.setItem("saltgui-theme", theme);
  }

  /**
   * Create the theme toggle button and dropdown
   */
  createThemeToggle() {
    const header = document.querySelector("header");
    if (!header) return;

    // Find the documentation element to insert before it
    const docuElement = header.querySelector(".docu");

    // Create theme selector container
    const themeSelector = document.createElement("div");
    themeSelector.className = "theme-selector";

    // Create toggle button
    this.themeToggle = document.createElement("button");
    this.themeToggle.className = "theme-toggle";
    this.themeToggle.setAttribute("aria-label", "Toggle theme");
    this.themeToggle.setAttribute("title", "Change theme");

    // Create dropdown
    this.themeDropdown = document.createElement("div");
    this.themeDropdown.className = "theme-dropdown";

    // Populate dropdown with theme options
    Object.keys(this.themes).forEach(themeKey => {
      const option = document.createElement("button");
      option.className = "theme-option";
      option.setAttribute("data-theme", themeKey);
      option.innerHTML = `${this.themes[themeKey].icon} ${this.themes[themeKey].name}`;
      
      option.addEventListener("click", (e) => {
        e.preventDefault();
        this.setTheme(themeKey);
        this.hideDropdown();
      });

      this.themeDropdown.appendChild(option);
    });

    // Toggle button click handler
    this.themeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!themeSelector.contains(e.target)) {
        this.hideDropdown();
      }
    });

    // Close dropdown on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideDropdown();
      }
    });

    // Assemble the components
    themeSelector.appendChild(this.themeToggle);
    themeSelector.appendChild(this.themeDropdown);
    
    // Insert before the documentation element if it exists, otherwise append to header
    if (docuElement) {
      header.insertBefore(themeSelector, docuElement);
    } else {
      header.appendChild(themeSelector);
    }

    // Update button display
    this.updateToggleButton();
  }

  /**
   * Update the toggle button text and icon
   */
  updateToggleButton() {
    if (!this.themeToggle) return;

    const theme = this.themes[this.currentTheme];
    this.themeToggle.innerHTML = `
      <span class="theme-toggle-icon">${theme.icon}</span>
      <span class="theme-toggle-text">${theme.name}</span>
    `;

    // Update active state in dropdown
    const options = this.themeDropdown.querySelectorAll(".theme-option");
    options.forEach(option => {
      option.classList.toggle("active", option.dataset.theme === this.currentTheme);
    });
  }

  /**
   * Toggle the theme dropdown visibility
   */
  toggleDropdown() {
    this.themeDropdown.classList.toggle("show");
  }

  /**
   * Hide the theme dropdown
   */
  hideDropdown() {
    this.themeDropdown.classList.remove("show");
  }

  /**
   * Set up media query listener for system theme detection
   */
  setupMediaQueryListener() {
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    }
  }

  /**
   * Watch for system theme changes
   */
  watchSystemTheme() {
    if (this.mediaQuery) {
      this.mediaQuery.addEventListener("change", () => {
        if (this.currentTheme === "auto") {
          this.applyTheme("auto");
        }
      });
    }
  }

  /**
   * Set the theme
   * @param {string} theme - Theme name
   */
  setTheme(theme) {
    if (!this.themes[theme]) {
      console.warn(`Unknown theme: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    this.saveThemePreference(theme);
    this.applyTheme(theme);
    this.updateToggleButton();

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent("themeChanged", {
      detail: { theme: this.getEffectiveTheme() }
    }));
  }

  /**
   * Apply the theme to the document
   * @param {string} theme - Theme name
   */
  applyTheme(theme) {
    const effectiveTheme = this.resolveAutoTheme(theme);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    
    // Store effective theme for other components
    document.documentElement.setAttribute("data-effective-theme", effectiveTheme);
  }

  /**
   * Resolve auto theme to actual theme based on system preference
   * @param {string} theme - Theme name
   * @returns {string} Resolved theme name
   */
  resolveAutoTheme(theme) {
    if (theme === "auto") {
      if (this.mediaQuery && this.mediaQuery.matches) {
        return "dark";
      }
      return "light";
    }
    return theme;
  }

  /**
   * Get the currently effective theme (resolving auto)
   * @returns {string} Effective theme name
   */
  getEffectiveTheme() {
    return this.resolveAutoTheme(this.currentTheme);
  }

  /**
   * Get the current theme setting
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Cycle to the next theme (for keyboard shortcuts)
   */
  cycleTheme() {
    const themeKeys = Object.keys(this.themes);
    const currentIndex = themeKeys.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    this.setTheme(themeKeys[nextIndex]);
  }

  /**
   * Check if dark mode is currently active
   * @returns {boolean} True if dark mode is active
   */
  isDarkMode() {
    const effective = this.getEffectiveTheme();
    return effective === "dark" || effective === "high-contrast";
  }

  /**
   * Toggle between light and dark themes
   */
  toggleLightDark() {
    const effective = this.getEffectiveTheme();
    this.setTheme(effective === "dark" ? "light" : "dark");
  }

  /**
   * Apply theme-specific configurations to other components
   */
  applyThemeToComponents() {
    // Update charts and visualizations if they exist
    if (window.chartInstances) {
      window.chartInstances.forEach(chart => {
        if (chart.updateTheme) {
          chart.updateTheme(this.getEffectiveTheme());
        }
      });
    }

    // Update syntax highlighting if present
    if (window.hljs) {
      const theme = this.isDarkMode() ? "dark" : "light";
      document.documentElement.setAttribute("data-hljs-theme", theme);
    }
  }

  /**
   * Get theme colors for programmatic use
   * @returns {object} Object containing theme colors
   */
  getThemeColors() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
      primary: computedStyle.getPropertyValue("--bg-primary").trim(),
      secondary: computedStyle.getPropertyValue("--bg-secondary").trim(),
      textPrimary: computedStyle.getPropertyValue("--text-primary").trim(),
      textSecondary: computedStyle.getPropertyValue("--text-secondary").trim(),
      brandPrimary: computedStyle.getPropertyValue("--brand-primary").trim(),
      success: computedStyle.getPropertyValue("--text-success").trim(),
      warning: computedStyle.getPropertyValue("--text-warning").trim(),
      danger: computedStyle.getPropertyValue("--text-danger").trim(),
      info: computedStyle.getPropertyValue("--text-info").trim()
    };
  }

  /**
   * Register a callback for theme changes
   * @param {Function} callback - Function to call when theme changes
   */
  onThemeChange(callback) {
    window.addEventListener("themeChanged", callback);
  }

  /**
   * Unregister a theme change callback
   * @param {Function} callback - Function to remove
   */
  offThemeChange(callback) {
    window.removeEventListener("themeChanged", callback);
  }

}

// Global theme manager instance
let themeManager = null;

/**
 * Initialize theme manager when DOM is ready
 */
function initThemeManager() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      themeManager = new ThemeManager();
    });
  } else {
    themeManager = new ThemeManager();
  }
}

/**
 * Get the global theme manager instance
 * @returns {ThemeManager} Theme manager instance
 */
function getThemeManager() {
  return themeManager;
}

// Auto-initialize
initThemeManager();

/* eslint-enable no-unused-vars */
