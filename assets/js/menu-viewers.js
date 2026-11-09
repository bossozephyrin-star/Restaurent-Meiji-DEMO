const viewers = document.querySelectorAll("model-viewer");

for (const viewer of viewers) {
  viewer.addEventListener(
    "load",
    async () => {
      try {
        const preview = await viewer.toBlob({
          mimeType: "image/webp",
          qualityArgument: 0.88,
          idealAspect: true,
        });
        viewer.poster = URL.createObjectURL(preview);
        viewer.setAttribute("reveal", "manual");
        viewer.showPoster();
      } catch (error) {
        console.warn("Aperçu du modèle 3D indisponible.", error);
      }
    },
    { once: true },
  );
}
