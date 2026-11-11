(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (document.documentElement.classList.contains("door-arrival")) {
    try {
      sessionStorage.removeItem("meiji-menu-transition");
    } catch {}

    if (reducedMotion) {
      document.documentElement.classList.remove("door-arrival");
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => document.documentElement.classList.add("door-open"));
      });
      window.setTimeout(() => {
        document.documentElement.classList.remove("door-arrival", "door-open");
      }, 1050);
    }
  }

  const menuLink = document.querySelector("[data-menu-transition]");
  if (!menuLink) return;

  menuLink.addEventListener("click", (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reducedMotion) return;

    event.preventDefault();
    try {
      sessionStorage.setItem("meiji-menu-transition", "1");
    } catch {}

    document.documentElement.classList.add("door-departure");
    window.setTimeout(() => window.location.assign(menuLink.href), 680);
  });
})();
