function buscarLista(chave) {
    return JSON.parse(
        localStorage.getItem(chave)
    ) || [];
}

function carregarDashboard() {

    const solicitacoes = buscarLista("solicitacoes");

    const eventos = buscarLista("eventos");

    const publicacoes = buscarLista("publicacoes");

    const producoes = buscarLista("producoes");

    atualizarCards(
        solicitacoes,
        eventos,
        publicacoes,
        producoes
    );

    carregarEventos(eventos);

    carregarDemandasHoje(eventos);

    carregarNotificacoesDashboard(
        solicitacoes,
        eventos,
        publicacoes,
        producoes
    );

    carregarAtividadesRecentes(
        eventos,
        solicitacoes,
        publicacoes,
        producoes
    );
}

function atualizarCards(
    solicitacoes,
    eventos,
    publicacoes,
    producoes
) {

    const solicitacoesCount =
    document.getElementById("solicitacoes-count");

    const coberturasCount =
    document.getElementById("coberturas-count");

    const publicacoesCount =
    document.getElementById("publicacoes-count");

    const producoesCount =
    document.getElementById("producoes-count");

    const solicitacoesPendentes =
    solicitacoes.filter(
        item => item.status === "Pendente"
    );

    const producoesAtivas =
    producoes.filter(
        item => item.status !== "Concluído"
    );

    const hoje = new Date();

    const publicacoesMes =
    publicacoes.filter(item => {

        if (!item.data) return true;

        const data = new Date(item.data);

        return (
            data.getMonth() === hoje.getMonth() &&
            data.getFullYear() === hoje.getFullYear()
        );
    });

    if (solicitacoesCount) {
        solicitacoesCount.textContent =
        solicitacoesPendentes.length;
    }

    if (coberturasCount) {
        coberturasCount.textContent =
        eventos.length;
    }

    if (publicacoesCount) {
        publicacoesCount.textContent =
        publicacoesMes.length;
    }

    if (producoesCount) {
        producoesCount.textContent =
        producoesAtivas.length;
    }
}

function carregarEventos(eventos) {

    const container =
    document.getElementById("listaEventos");

    if (!container) return;

    if (eventos.length === 0) {

        container.innerHTML =
        "<p>Nenhum evento cadastrado.</p>";

        return;
    }

    container.innerHTML = "";

    eventos
    .slice(-5)
    .reverse()
    .forEach(evento => {

        container.innerHTML += `
            <div class="event-card">

                <strong>${evento.titulo || "Evento sem título"}</strong>

                <p>${evento.data || "Sem data"} • ${evento.hora || "Sem horário"}</p>

                <p>${evento.local || "Local não informado"}</p>

            </div>
        `;
    });
}

function carregarDemandasHoje(eventos) {

    const container =
    document.getElementById("demandasHoje");

    if (!container) return;

    const hoje =
    new Date().toISOString().split("T")[0];

    const eventosHoje =
    eventos.filter(
        evento => evento.data === hoje
    );

    if (eventosHoje.length === 0) {

        container.innerHTML =
        "<p>Nenhuma atividade para hoje.</p>";

        return;
    }

    container.innerHTML = "";

    eventosHoje.forEach(evento => {

        container.innerHTML += `
            <div class="event-card">

                <strong>${evento.titulo || "Atividade sem título"}</strong>

                <p>${evento.hora || "Sem horário"}</p>

                <p>${evento.local || "Local não informado"}</p>

                <p>${evento.tipo || "Atividade"}</p>

            </div>
        `;
    });
}

/* ===============================
   NOTIFICAÇÕES DO DASHBOARD
================================ */

function carregarNotificacoesDashboard(
    solicitacoes,
    eventos,
    publicacoes,
    producoes
) {

    const container =
    document.getElementById("notificacoesSistema");

    if (!container) return;

    const notificacoesSalvas =
    buscarLista("notificacoes");

    const notificacoesAutomaticas =
    montarNotificacoesAutomaticas(
        solicitacoes,
        eventos,
        publicacoes,
        producoes
    );

    const notificacoes =
    [
        ...notificacoesSalvas,
        ...notificacoesAutomaticas
    ];

    container.innerHTML = "";

    if (notificacoes.length === 0) {

        container.innerHTML = `
            <div class="notification-empty-dashboard">
                <i class="far fa-bell"></i>

                <strong>Nenhuma notificação no momento</strong>

                <p>
                    Quando houver novas solicitações, eventos, produções ou publicações,
                    elas aparecerão aqui.
                </p>
            </div>
        `;

        return;
    }

    notificacoes
    .slice(0, 5)
    .forEach(item => {

        const visual =
        obterVisualNotificacao(item.tipo);

        container.innerHTML += `
            <div class="dashboard-notification ${visual.classe}">

                <div class="notification-icon-box">
                    <i class="fas ${visual.icone}"></i>
                </div>

                <div class="notification-content">

                    <div class="notification-top">

                        <strong>
                            ${item.titulo || "Notificação"}
                        </strong>

                        <span class="notification-type">
                            ${item.tipo || "Sistema"}
                        </span>

                    </div>

                    <p>
                        ${item.descricao || item.texto || "Sem descrição."}
                    </p>

                    <small>
                        <i class="far fa-clock"></i>
                        ${item.data || "Data não informada"}
                    </small>

                </div>

            </div>
        `;
    });

    if (notificacoes.length > 5) {

        container.innerHTML += `
            <div class="notification-more">
                +${notificacoes.length - 5} notificações adicionais
            </div>
        `;
    }
}

function montarNotificacoesAutomaticas(
    solicitacoes,
    eventos,
    publicacoes,
    producoes
) {

    const automaticas = [];

    solicitacoes
    .filter(item => item.status === "Pendente")
    .slice(-3)
    .forEach(item => {

        automaticas.push({
            id: `auto-solicitacao-${item.id}`,
            titulo: "Solicitação pendente",
            descricao: item.titulo || "Nova solicitação aguardando atendimento.",
            tipo: "Solicitação",
            data: item.data || "",
            automatica: true
        });
    });

    eventos
    .slice(-3)
    .forEach(item => {

        automaticas.push({
            id: `auto-evento-${item.id}`,
            titulo: "Evento agendado",
            descricao: `${item.titulo || "Evento"} • ${item.local || "Local não informado"}`,
            tipo: "Agenda",
            data: item.data || "",
            automatica: true
        });
    });

    producoes
    .slice(-3)
    .forEach(item => {

        automaticas.push({
            id: `auto-producao-${item.id}`,
            titulo: "Produção registrada",
            descricao: `${item.titulo || "Produção"} • ${item.tipo || "Tipo não informado"}`,
            tipo: "Produção",
            data: item.data || "",
            automatica: true
        });
    });

    publicacoes
    .slice(-3)
    .forEach(item => {

        automaticas.push({
            id: `auto-publicacao-${item.id}`,
            titulo: "Publicação registrada",
            descricao: `${item.titulo || "Publicação"} • ${item.plataforma || "Plataforma não informada"}`,
            tipo: "Publicação",
            data: item.data || "",
            automatica: true
        });
    });

    return automaticas;
}

function obterVisualNotificacao(tipo) {

    if (tipo === "Solicitação") {
        return {
            classe: "solicitacao",
            icone: "fa-file-lines"
        };
    }

    if (tipo === "Agenda") {
        return {
            classe: "agenda",
            icone: "fa-calendar-check"
        };
    }

    if (tipo === "Produção") {
        return {
            classe: "producao",
            icone: "fa-video"
        };
    }

    if (tipo === "Publicação") {
        return {
            classe: "publicacao",
            icone: "fa-bullhorn"
        };
    }

    if (tipo === "Relatório") {
        return {
            classe: "relatorio",
            icone: "fa-chart-line"
        };
    }

    return {
        classe: "sistema",
        icone: "fa-bell"
    };
}

/* ===============================
   ATIVIDADES RECENTES
================================ */

function carregarAtividadesRecentes(
    eventos,
    solicitacoes,
    publicacoes,
    producoes
) {

    const container =
    document.getElementById("atividadesRecentes");

    if (!container) return;

    const atividades = [];

    eventos.forEach(item => {
        atividades.push({
            tipo: "Evento Registrado",
            titulo: item.titulo,
            data: item.data
        });
    });

    solicitacoes.forEach(item => {
        atividades.push({
            tipo: "Solicitação Recebida",
            titulo: item.titulo,
            data: item.data
        });
    });

    publicacoes.forEach(item => {
        atividades.push({
            tipo: "Publicação Registrada",
            titulo: item.titulo,
            data: item.data
        });
    });

    producoes.forEach(item => {
        atividades.push({
            tipo: "Produção Registrada",
            titulo: item.titulo,
            data: item.data
        });
    });

    if (atividades.length === 0) {

        container.innerHTML =
        "<p>Nenhuma atividade recente.</p>";

        return;
    }

    container.innerHTML = "";

    atividades
    .slice(-6)
    .reverse()
    .forEach(item => {

        container.innerHTML += `
            <div class="event-card">

                <strong>${item.tipo}</strong>

                <p>${item.titulo || "Sem título"}</p>

                <small>${item.data || ""}</small>

            </div>
        `;
    });
}

/* ===============================
   INICIALIZAÇÃO
================================ */

document.addEventListener(
    "DOMContentLoaded",
    carregarDashboard
);