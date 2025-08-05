/* global */

/* istanbul ignore file */
import {Router} from "./Router.js";

window.addEventListener("load", () => {
  new Router();
  
  // Initialize keyboard shortcuts for themes
  document.addEventListener("keydown", (e) => {
    // Ctrl+Shift+T to cycle themes
    if (e.ctrlKey && e.shiftKey && e.key === "T") {
      e.preventDefault();
      const themeManager = getThemeManager();
      if (themeManager) {
        themeManager.cycleTheme();
      }
    }
    
    // Ctrl+Shift+D to toggle light/dark
    if (e.ctrlKey && e.shiftKey && e.key === "D") {
      e.preventDefault();
      const themeManager = getThemeManager();
      if (themeManager) {
        themeManager.toggleLightDark();
      }
    }
  });
});

/* eslint-disable func-names */
// Make sure the errors are shown during regression testing
window.onerror = function (msg, url, lineNo, columnNo, error) {
  console.log("JS Error:" + msg + ",error:" + error + ",url:" + url + "@" + lineNo + ":" + columnNo);
  if (error && error.stack) {
    console.log("Stack:" + error.stack);
  }
  return false;
};

// simple polyfill solution
if (!Object.fromEntries) {
  Object.fromEntries = function (pairs) {
    const obj = {};
    for (const pair of pairs) {
      obj[pair[0]] = pair[1];
    }
    return obj;
  }
}
/* eslint-enable func-names */
