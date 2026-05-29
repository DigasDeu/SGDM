document.addEventListener("DOMContentLoaded", () => {

    const notificationBtn =
    document.getElementById("notificationBtn");

    const notificationDropdown =
    document.getElementById("notificationDropdown");

    const notificationList =
    document.getElementById("notificationList");

    const notificationCount =
    document.getElementById("notificationCount");

    if (
        !notificationBtn ||
        !notificationDropdown ||
        !notificationList ||
        !notificationCount
    ) {
        return;
    }

    notificationBtn.addEventListener("click", (event) => {

        event.stopPropagation();

        notificationDropdown.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {

        if (
            !notificationBtn.contains(event.target) &&
            !notificationDropdown.contains(event.target)
        ) {
            notificationDropdown.classList.remove("active");
        }
    });

    carregarNotificacoes();
});

function buscarDados(chave) {

    return JSON.parse(
        localStorage.getItem(chave)
    ) || [];
}

function salvarNotificacoes(notificacoes) {

    localStorage.setItem(
        "notificacoes",
        JSON.stringify(notificacoes)
    );
}

function criarNotificacao(titulo, descricao, tipo = "Sistema") {

    const notificacoes =
    buscarDados("notificacoes");

    notificacoes.unshift({
        id: Date.now(),
        titulo,
        descricao,
        tipo,
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    salvarNotificacoes(notificacoes);
}

function carregarNotificacoes() {

    const notificationList =
    document.getElementById("notificationList");

    const notificationCount =
    document.getElementById("notificationCount");

    if (!notificationList || !notificationCount) return;

    const notificacoesSalvas =
    buscarDados("notificacoes");

    const eventos =
    buscarDados("eventos");

    const solicitacoes =
    buscarDados("solicitacoes");

    const publicacoes =
    buscarDados("publicacoes");

    const producoes =
    buscarDados("producoes");

    let notificacoes = [...notificacoesSalvas];

    solicitacoes
    .filter(item => item.status === "Pendente")
    .forEach(item => {

        notificacoes.push({
            titulo: "Solicitação pendente",
            descricao: item.titulo || "Nova solicitação aguardando atendimento",
            tipo: "Solicitação",
            data: item.data || ""
        });
    });

    eventos
    .slice(-5)
    .forEach(item => {

        notificacoes.push({
            titulo: "Evento agendado",
            descricao: `${item.titulo || "Evento"} - ${item.data || "sem data"}`,
            tipo: "Agenda",
            data: item.hora || ""
        });
    });

    publicacoes
    .slice(-5)
    .forEach(item => {

        notificacoes.push({
            titulo: "Publicação registrada",
            descricao: `${item.titulo || "Publicação"} - ${item.plataforma || "Plataforma não informada"}`,
            tipo: "Publicação",
            data: item.data || ""
        });
    });

    producoes
    .slice(-5)
    .forEach(item => {

        notificacoes.push({
            titulo: "Produção registrada",
            descricao: `${item.titulo || "Produção"} - ${item.tipo || "Tipo não informado"}`,
            tipo: "Produção",
            data: item.data || ""
        });
    });

    const naoLidas =
    notificacoes.filter(item => item.lida === false || item.lida === undefined);

    notificationCount.textContent =
    notificacoes.length;

    if (notificacoes.length === 0) {

        notificationList.innerHTML =
        `<p class="empty-notification">Nenhuma notificação.</p>`;

        return;
    }

    notificationList.innerHTML = "";

    notificacoes
    .slice(0, 8)
    .forEach(item => {

        notificationList.innerHTML += `
            <div class="notification-item">

                <strong>${item.titulo}</strong>

                <p>${item.descricao}</p>

                <small>${item.tipo || ""} ${item.data ? "• " + item.data : ""}</small>

            </div>
        `;
    });
}

window.criarNotificacao = criarNotificacao;
window.carregarNotificacoes = carregarNotificacoes;