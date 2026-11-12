document.querySelectorAll("[data-ouvrir-viewer]").forEach((button) => {
  const viewer = document.getElementById(button.getAttribute("aria-controls"));
  if (!viewer) return;
  const backButton = document.querySelector('[data-fermer-viewer="' + viewer.id + '"]');
  if (!backButton) return;
  const status = document.createElement("p");
  status.className = "viewer-status";
  status.setAttribute("role", "status");
  status.hidden = true;
  backButton.after(status);

  function resetCamera() {
    viewer.cameraOrbit = "0deg 60deg 120%";
    if (viewer.loaded) viewer.jumpCameraToGoal();
  }

  button.addEventListener("click", () => {
    button.closest(".dish-card").classList.add("is-viewing-3d");
    button.hidden = true;
    viewer.hidden = false;
    backButton.hidden = false;
    status.hidden = false;
    status.textContent = viewer.loaded
      ? "Faites glisser pour tourner le plat. Utilisez deux doigts pour ajuster sa taille en réalité augmentée."
      : "Ouverture du modèle 3D…";
    resetCamera();
  });

  viewer.addEventListener("load", () => {
    resetCamera();
    status.textContent = "Faites glisser pour tourner le plat. Utilisez deux doigts pour ajuster sa taille en réalité augmentée.";
  });
  viewer.addEventListener("error", () => {
    status.textContent = "Le modèle 3D ne peut pas être chargé. Vous pouvez revenir à la photo.";
  });
  viewer.addEventListener("ar-status", (event) => {
    if (event.detail.status === "failed") {
      status.textContent = "La réalité augmentée n’a pas pu démarrer sur cet appareil. La vue 3D reste disponible.";
    } else if (event.detail.status === "session-started") {
      status.textContent = "Repérez une table avec la caméra, puis posez le plat sur la surface.";
    } else if (event.detail.status === "not-presenting") {
      resetCamera();
      status.textContent = "Faites glisser pour tourner le plat.";
    }
  });

  backButton.addEventListener("click", () => {
    button.closest(".dish-card").classList.remove("is-viewing-3d");
    viewer.hidden = true;
    backButton.hidden = true;
    status.hidden = true;
    button.hidden = false;
    button.focus({preventScroll:true});
  });
});