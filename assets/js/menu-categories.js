const categoryTabs = [...document.querySelectorAll('.subcat-nav [role="tab"]')];

if (categoryTabs.length) {
  const panels = categoryTabs.map((tab) =>
    document.getElementById(tab.getAttribute("aria-controls"))
  );

  function showCategory(id, updateUrl = false) {
    const selectedIndex = panels.findIndex((panel) => panel.id === id);
    const activeIndex = selectedIndex < 0 ? 0 : selectedIndex;

    categoryTabs.forEach((tab, index) => {
      const active = index === activeIndex;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[index].hidden = !active;
    });

    if (updateUrl && location.hash !== "#" + panels[activeIndex].id) {
      history.pushState(null, "", "#" + panels[activeIndex].id);
    }
  }

  categoryTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      showCategory(tab.getAttribute("aria-controls"), true);
    });

    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % categoryTabs.length;
      else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + categoryTabs.length) % categoryTabs.length;
      } else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = categoryTabs.length - 1;
      else return;

      event.preventDefault();
      const nextTab = categoryTabs[nextIndex];
      showCategory(nextTab.getAttribute("aria-controls"), true);
      nextTab.focus();
      nextTab.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  });

  function showCategoryFromUrl() {
    const category = location.hash.slice(1);
    showCategory(category === "entrees" ? "sashimi" : category);
  }

  window.addEventListener("popstate", showCategoryFromUrl);
  window.addEventListener("hashchange", showCategoryFromUrl);
  showCategoryFromUrl();
}