document.querySelectorAll("[data-ouvrir-viewer]").forEach((button) => {
  button.addEventListener("click", () => {
    const viewer = document.getElementById(button.getAttribute("aria-controls"));
    const backButton = document.querySelector(`[data-fermer-viewer="${viewer.id}"]`);

    button.hidden = true;
    viewer.hidden = false;
    backButton.hidden = false;
  });
});

document.querySelectorAll("[data-fermer-viewer]").forEach((button) => {
  button.addEventListener("click", () => {
    const viewer = document.getElementById(button.dataset.fermerViewer);
    const preview = document.querySelector(`[aria-controls="${viewer.id}"]`);

    viewer.hidden = true;
    button.hidden = true;
    preview.hidden = false;
  });
});
