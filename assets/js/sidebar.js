//
// ELEMENTOS
//

const menuBtn =
document.querySelector(
".menu-btn"
);

const sidebar =
document.getElementById(
"sidebar"
);

const overlay =
document.getElementById(
"overlay"
);

//
// ABRIR MENU
//

function abrirSidebar(){

    sidebar.classList.add(
    "active"
    );

    overlay.classList.add(
    "active"
    );
}

//
// FECHAR MENU
//

function fecharSidebar(){

    sidebar.classList.remove(
    "active"
    );

    overlay.classList.remove(
    "active"
    );
}

//
// EVENTOS
//

menuBtn.addEventListener(
"click",
abrirSidebar
);

overlay.addEventListener(
"click",
fecharSidebar
);

//
// FECHAR COM ESC
//

document.addEventListener(
"keydown",
(event)=>{

    if(event.key === "Escape"){

        fecharSidebar();
    }
});