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

                <strong>${evento.titulo}</strong>

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

                <strong>${evento.titulo}</strong>

                <p>${evento.hora || "Sem horário"}</p>

                <p>${evento.local || "Local não informado"}</p>

                <p>${evento.tipo || "Atividade"}</p>

            </div>
        `;
    });
}

function carregarNotificacoesDashboard(
    solicitacoes,
    eventos,
    publicacoes,
    producoes
) {

    const container =
    document.getElementById("notificacoesSistema");

    if (!container) return;

    container.innerHTML = "";

    const notificacoes =
    buscarLista("notificacoes");

    if (notificacoes.length > 0) {

        notificacoes
        .slice(0, 5)
        .forEach(item => {

            container.innerHTML += `
                <div class="event-card">

                    <strong>${item.titulo || "Notificação"}</strong>

                    <p>${item.descricao || item.texto || ""}</p>

                    <small>${item.data || ""}</small>

                </div>
            `;
        });

        return;
    }

    if (solicitacoes.length > 0) {

        container.innerHTML += `
            <div class="event-card">

                <strong>Solicitações Registradas</strong>

                <p>Existem ${solicitacoes.length} solicitações no sistema.</p>

            </div>
        `;
    }

    if (eventos.length > 0) {

        container.innerHTML += `
            <div class="event-card">

                <strong>Eventos Agendados</strong>

                <p>${eventos.length} eventos cadastrados.</p>

            </div>
        `;
    }

    if (publicacoes.length > 0) {

        container.innerHTML += `
            <div class="event-card">

                <strong>Publicações</strong>

                <p>${publicacoes.length} publicações registradas.</p>

            </div>
        `;
    }

    if (producoes.length > 0) {

        container.innerHTML += `
            <div class="event-card">

                <strong>Produções</strong>

                <p>${producoes.length} produções registradas.</p>

            </div>
        `;
    }

    if (
        solicitacoes.length === 0 &&
        eventos.length === 0 &&
        publicacoes.length === 0 &&
        producoes.length === 0
    ) {

        container.innerHTML =
        "<p>Nenhuma notificação.</p>";
    }
}

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

document.addEventListener(
    "DOMContentLoaded",
    carregarDashboard
);