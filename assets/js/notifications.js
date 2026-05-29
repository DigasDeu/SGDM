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

function salvarDados(chave, dados) {

    localStorage.setItem(
        chave,
        JSON.stringify(dados)
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

    salvarDados("notificacoes", notificacoes);

    carregarNotificacoes();
}

function montarNotificacoesAutomaticas() {

    const eventos =
    buscarDados("eventos");

    const solicitacoes =
    buscarDados("solicitacoes");

    const publicacoes =
    buscarDados("publicacoes");

    const producoes =
    buscarDados("producoes");

    let automaticas = [];

    solicitacoes
    .filter(item => item.status === "Pendente")
    .forEach(item => {

        automaticas.push({
            id: `solicitacao-${item.id}`,
            titulo: "Solicitação pendente",
            descricao: item.titulo || "Nova solicitação aguardando atendimento",
            tipo: "Solicitação",
            data: item.data || "",
            automatica: true
        });
    });

    eventos
    .slice(-5)
    .forEach(item => {

        automaticas.push({
            id: `evento-${item.id}`,
            titulo: "Evento agendado",
            descricao: `${item.titulo || "Evento"} - ${item.data || "sem data"}`,
            tipo: "Agenda",
            data: item.hora || "",
            automatica: true
        });
    });

    publicacoes
    .slice(-5)
    .forEach(item => {

        automaticas.push({
            id: `publicacao-${item.id}`,
            titulo: "Publicação registrada",
            descricao: `${item.titulo || "Publicação"} - ${item.plataforma || "Plataforma não informada"}`,
            tipo: "Publicação",
            data: item.data || "",
            automatica: true
        });
    });

    producoes
    .slice(-5)
    .forEach(item => {

        automaticas.push({
            id: `producao-${item.id}`,
            titulo: "Produção registrada",
            descricao: `${item.titulo || "Produção"} - ${item.tipo || "Tipo não informado"}`,
            tipo: "Produção",
            data: item.data || "",
            automatica: true
        });
    });

    return automaticas;
}

function carregarNotificacoes() {

    const notificationList =
    document.getElementById("notificationList");

    const notificationCount =
    document.getElementById("notificationCount");

    if (!notificationList || !notificationCount) return;

    const notificacoesSalvas =
    buscarDados("notificacoes");

    const notificacoesAutomaticas =
    montarNotificacoesAutomaticas();

    const notificacoes =
    [
        ...notificacoesSalvas,
        ...notificacoesAutomaticas
    ];

    notificationCount.textContent =
    notificacoes.length;

    if (notificacoes.length === 0) {

        notificationList.innerHTML =
        `<p class="empty-notification">Nenhuma notificação.</p>`;

        return;
    }

    notificationList.innerHTML = `
        <div class="notification-actions">
            <button onclick="limparNotificacoes()" class="clear-notifications-btn">
                Limpar notificações
            </button>
        </div>
    `;

    notificacoes
    .slice(0, 10)
    .forEach(item => {

        notificationList.innerHTML += `
            <div class="notification-item">

                <div>

                    <strong>${item.titulo}</strong>

                    <p>${item.descricao}</p>

                    <small>
                        ${item.tipo || ""}
                        ${item.data ? " • " + item.data : ""}
                    </small>

                </div>

                ${
                    item.automatica
                    ? ""
                    : `
                    <button class="delete-notification-btn" onclick="excluirNotificacao(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                    `
                }

            </div>
        `;
    });
}

function excluirNotificacao(id) {

    let notificacoes =
    buscarDados("notificacoes");

    notificacoes =
    notificacoes.filter(item => item.id !== id);

    salvarDados("notificacoes", notificacoes);

    carregarNotificacoes();
}

function limparNotificacoes() {

    const confirmar =
    confirm("Deseja limpar as notificações salvas?");

    if (!confirmar) return;

    localStorage.removeItem("notificacoes");

    carregarNotificacoes();
}

window.criarNotificacao = criarNotificacao;

window.carregarNotificacoes = carregarNotificacoes;

window.excluirNotificacao = excluirNotificacao;

window.limparNotificacoes = limparNotificacoes;