(function () {
  "use strict";

  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var expandButtons = document.querySelectorAll(".expand__button");
  expandButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var content = btn.nextElementSibling;
      var isOpen = content.style.maxHeight;
      content.style.maxHeight = isOpen ? null : content.scrollHeight + "px";
      btn.classList.toggle("expand__button--open", !isOpen);
    });
  });

  var themeToggle = document.getElementById("theme-toggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var root = document.documentElement;
      var current = root.getAttribute("data-theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var currentlyDark = current ? current === "dark" : prefersDark;
      var next = currentlyDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
})();
