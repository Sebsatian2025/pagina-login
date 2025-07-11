// Fragmento dentro del return de EditorMVP.js (solo parte relevante)
ctxMenu.show && ReactDOM.createPortal(
  React.createElement(
    "div",
    { className: "ctx-menu", style: { left: ctxMenu.x, top: ctxMenu.y } },
    ctxMenu.type === "text" &&
      React.createElement(
        "button",
        {
          onClick: () => {
            console.log("🧪 Click en botón EDITAR TEXTO");
            onChangeRichText(ctxMenu, uid, hideMenu);
          }
        },
        "Editar texto"
      ),
    ctxMenu.type === "image" &&
      React.createElement(
        "button",
        { onClick: () => onChangeImage(ctxMenu, uid, hideMenu) },
        "Cambiar imagen"
      ),
    ctxMenu.type === "link" &&
      React.createElement(
        "button",
        { onClick: () => onChangeLink(ctxMenu, uid, hideMenu) },
        "Cambiar link"
      )
  ),
  document.body
)
