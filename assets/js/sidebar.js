document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.querySelector(".menu-btn");
    const overlay = document.getElementById("overlay");

    if (!sidebar || !menuBtn) return;

    menuBtn.addEventListener("click", () => {

        if (window.innerWidth <= 768) {

            sidebar.classList.toggle("active");

            if (overlay) {
                overlay.classList.toggle("active");
            }

        } else {

            sidebar.classList.toggle("collapsed");
        }
    });

    if (overlay) {

        overlay.addEventListener("click", () => {

            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        });
    }
});