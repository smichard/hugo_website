(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    siteNav.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  var expandButtons = document.querySelectorAll(".expand__button");
  expandButtons.forEach(function (btn) {
    var content = document.getElementById(btn.getAttribute("aria-controls"));
    if (!content) return;

    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      content.hidden = isOpen;
      content.style.maxHeight = isOpen ? null : content.scrollHeight + "px";
      btn.classList.toggle("expand__button--open", !isOpen);
    });
  });

  var themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    var colorPreference = window.matchMedia("(prefers-color-scheme: dark)");

    var isDarkTheme = function () {
      var current = document.documentElement.getAttribute("data-theme");
      return current ? current === "dark" : colorPreference.matches;
    };

    var updateThemeToggle = function () {
      var isDark = isDarkTheme();
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    };

    updateThemeToggle();

    themeToggle.addEventListener("click", function () {
      var root = document.documentElement;
      var next = isDarkTheme() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateThemeToggle();
    });

    colorPreference.addEventListener("change", function () {
      if (!document.documentElement.getAttribute("data-theme")) updateThemeToggle();
    });
  }
})();
