// preloader.js - Manejo automático del preloader

document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  let pageLoaded = false;
  let minimumTimePassed = false;

  // ✅ Espera que la página termine de cargar
  window.addEventListener("load", () => {
    pageLoaded = true;
    checkAndHide();
  });

  // ⏱️ Espera mínimo 2.5s antes de ocultar
  setTimeout(() => {
    minimumTimePassed = true;
    checkAndHide();
  }, 2500);

  function checkAndHide() {
    if (pageLoaded && minimumTimePassed) {
      preloader.classList.add("hide");
      preloader.addEventListener("transitionend", function handler() {
        preloader.removeEventListener("transitionend", handler);
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, { once: true });
    }
  }
});

// 👇 Funciones públicas para mostrar/ocultar manualmente
window.showPreloader = function () {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.classList.remove("hide");
};

window.hidePreloader = function () {
  const preloader = document.getElementById("preloader");
  if (preloader) preloader.classList.add("hide");
};
