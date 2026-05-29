document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
    document.querySelector(".menu-btn");

    const sidebar =
    document.getElementById("sidebar");

    const overlay =
    document.getElementById("overlay");

    if (!menuBtn || !sidebar || !overlay) {
        return;
    }

    function abrirSidebar() {

        sidebar.classList.add("active");

        overlay.classList.add("active");
    }

    function fecharSidebar() {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");
    }

    menuBtn.addEventListener("click", abrirSidebar);

    overlay.addEventListener("click", fecharSidebar);

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            fecharSidebar();
        }
    });

});