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
      preloader.addEventListener("transitionend", function handler() {
        preloader.removeEventListener("transitionend", handler);
        if (preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
        mainContent.classList.remove("d-none"); // ⬅️ ¡Mostramos contenido ahora!
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
