document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  const mainContent = document.getElementById("main-content");

  if (!preloader || !mainContent) return;

  let pageLoaded = false;
  let minimumTimePassed = false;

  window.addEventListener("load", () => {
    pageLoaded = true;
    checkAndHide();
  });

  setTimeout(() => {
    minimumTimePassed = true;
    checkAndHide();
  }, 2000); // 2 segundos

  function checkAndHide() {
    if (pageLoaded && minimumTimePassed) {
      preloader.classList.add("hide");

      // ⏳ Fallback en caso de que transitionend no ocurra
      const fallbackTimeout = setTimeout(() => {
        mainContent.classList.remove("d-none");
        preloader.remove?.();
      }, 300); // 1 segundo de seguridad

      preloader.addEventListener("transitionend", function handler() {
        preloader.removeEventListener("transitionend", handler);
        clearTimeout(fallbackTimeout); // Evitamos doble ejecución
        mainContent.classList.remove("d-none");
        preloader.remove?.();
      }, { once: true });
    }
  }
});

// 👇 Funciones públicas para mostrar/ocultar manualmente
window.showPreloader = function () {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.classList.remove("d-none", "hide");
};

window.hidePreloader = function () {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.classList.add("hide");
};
