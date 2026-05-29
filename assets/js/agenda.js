const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();

let eventos = JSON.parse(localStorage.getItem("eventos")) || [];

function salvarEventos() {
    localStorage.setItem("eventos", JSON.stringify(eventos));
}

function adicionarHistoricoExclusao(item, origem) {

    const historico =
    JSON.parse(localStorage.getItem("historicoExclusoes")) || [];

    historico.unshift({
        id: Date.now(),
        origem,
        item,
        dataExclusao: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem(
        "historicoExclusoes",
        JSON.stringify(historico)
    );
}

function adicionarNotificacao(titulo, descricao) {

    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo,
        descricao,
        tipo: "Agenda",
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    localStorage.setItem(
        "notificacoes",
        JSON.stringify(notificacoes)
    );
}

function renderCalendar() {

    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthYear.textContent =
    currentDate.toLocaleDateString("pt-BR", {
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

        const possuiEvento =
        eventos.some(evento => evento.data === dataCompleta);

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

    const container =
    document.getElementById("eventosDia");

    const lista =
    eventos.filter(evento => evento.data === data);

    if (lista.length === 0) {

        container.innerHTML =
        "<p>Nenhum evento nesta data.</p>";

        return;
    }

    container.innerHTML = "";

    lista.forEach(evento => {

        container.innerHTML += `
            <div class="event-card">

                <strong>${evento.titulo}</strong>

                <p><strong>Horário:</strong> ${evento.hora || "Não informado"}</p>

                <p><strong>Local:</strong> ${evento.local || "Não informado"}</p>

                <p><strong>Tipo:</strong> ${evento.tipo || "Evento"}</p>

                <p><strong>Responsável:</strong> ${evento.responsavel || "Departamento de Mídia"}</p>

                <p>${evento.descricao || "Sem descrição."}</p>

                <div class="card-actions">

                    <button class="delete-btn" onclick="excluirEvento(${evento.id})">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}

function excluirEvento(id) {

    const confirmar =
    confirm("Tem certeza que deseja excluir este evento da agenda?");

    if (!confirmar) return;

    const itemExcluido =
    eventos.find(evento => evento.id === id);

    eventos =
    eventos.filter(evento => evento.id !== id);

    salvarEventos();

    if (itemExcluido) {

        adicionarHistoricoExclusao(
            itemExcluido,
            "Agenda"
        );

        adicionarNotificacao(
            "Evento excluído",
            `${itemExcluido.titulo} foi removido da agenda.`
        );
    }

    renderCalendar();

    const hoje =
    new Date().toISOString().split("T")[0];

    mostrarEventos(hoje);
}

document.getElementById("prevMonth").onclick = () => {

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();
};

document.getElementById("nextMonth").onclick = () => {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();
};

const modal =
document.getElementById("modalEvento");

document.getElementById("novoEventoBtn").onclick = () => {

    modal.style.display = "flex";
};

document.getElementById("cancelar").onclick = () => {

    modal.style.display = "none";
};

document
.getElementById("eventoForm")
.addEventListener("submit", function (event) {

    event.preventDefault();

    const novoEvento = {
        id: Date.now(),

        titulo:
        document.getElementById("titulo").value,

        tipo:
        document.getElementById("tipo").value,

        data:
        document.getElementById("data").value,

        hora:
        document.getElementById("hora").value,

        local:
        document.getElementById("local").value,

        responsavel:
        document.getElementById("responsavel")?.value || "Departamento de Mídia",

        descricao:
        document.getElementById("descricao").value,

        origem:
        "Agenda"
    };

    eventos.push(novoEvento);

    salvarEventos();

    adicionarNotificacao(
        "Novo evento agendado",
        `${novoEvento.titulo} em ${novoEvento.local}, no dia ${novoEvento.data} às ${novoEvento.hora}.`
    );

    renderCalendar();

    mostrarEventos(novoEvento.data);

    modal.style.display = "none";

    this.reset();
});

window.excluirEvento = excluirEvento;

renderCalendar();