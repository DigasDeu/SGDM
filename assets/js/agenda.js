const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();

let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

function salvarEventos() {
    localStorage.setItem("eventos", JSON.stringify(eventos));
}

function adicionarNotificacao(titulo, descricao) {

    const notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        titulo,
        descricao,
        data: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
}

function renderCalendar() {

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthYear.textContent = currentDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= lastDate; day++) {

        const cell = document.createElement("div");

        cell.classList.add("day");

        const dataCompleta =
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const possuiEvento = eventos.some(e => e.data === dataCompleta);

        cell.innerHTML = `
            <div class="day-number">${day}</div>
            ${possuiEvento ? '<div class="event-dot"></div>' : ''}
        `;

        cell.addEventListener("click", () => {
            mostrarEventos(dataCompleta);
        });

        calendar.appendChild(cell);
    }
}

function mostrarEventos(data) {

    const container = document.getElementById("eventosDia");

    const lista = eventos.filter(e => e.data === data);

    if (lista.length === 0) {
        container.innerHTML = "<p>Nenhum evento nesta data.</p>";
        return;
    }

    container.innerHTML = "";

    lista.forEach(evento => {

        container.innerHTML += `
            <div class="event-card">

                <strong>${evento.titulo}</strong>

                <p>${evento.hora}</p>

                <p>${evento.local}</p>

                <p>${evento.tipo}</p>

                <p>${evento.responsavel || "Departamento de Mídia"}</p>

            </div>
        `;
    });
}

document.getElementById("prevMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

const modal = document.getElementById("modalEvento");

document.getElementById("novoEventoBtn").onclick = () => {
    modal.style.display = "flex";
};

document.getElementById("cancelar").onclick = () => {
    modal.style.display = "none";
};

document.getElementById("eventoForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const novoEvento = {
        id: Date.now(),
        titulo: document.getElementById("titulo").value,
        tipo: document.getElementById("tipo").value,
        data: document.getElementById("data").value,
        hora: document.getElementById("hora").value,
        local: document.getElementById("local").value,
        responsavel: document.getElementById("responsavel")?.value || "Departamento de Mídia",
        descricao: document.getElementById("descricao").value,
        origem: "Agenda"
    };

    eventos.push(novoEvento);

    salvarEventos();

    adicionarNotificacao(
        "Novo evento agendado",
        `${novoEvento.titulo} em ${novoEvento.local} no dia ${novoEvento.data} às ${novoEvento.hora}`
    );

    renderCalendar();

    mostrarEventos(novoEvento.data);

    modal.style.display = "none";

    this.reset();
});

renderCalendar();