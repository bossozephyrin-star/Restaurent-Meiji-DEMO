const menu = document.querySelector("[data-menu-layout]");
const layoutButtons = [...document.querySelectorAll(".layout-switch [data-layout]")];
if (menu && layoutButtons.length) {
  const preferenceKey = "meiji-menu-layout";
  function setLayout(value) {
    const layout = value === "list" ? "list" : "grid";
    menu.dataset.menuLayout = layout;
    layoutButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.layout === layout));
    });
  }
  let savedLayout = window.matchMedia("(max-width: 43.99rem)").matches ? "list" : "grid";
  try { savedLayout = localStorage.getItem(preferenceKey) || savedLayout; } catch {}
  setLayout(savedLayout);
  layoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setLayout(button.dataset.layout);
      try { localStorage.setItem(preferenceKey, menu.dataset.menuLayout); } catch {}
    });
  });
}
