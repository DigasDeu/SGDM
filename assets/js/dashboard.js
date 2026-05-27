function carregarDashboard(){

    const solicitacoes =
    JSON.parse(
        localStorage.getItem("solicitacoes")
    ) || [];

    const eventos =
    JSON.parse(
        localStorage.getItem("eventos")
    ) || [];

    const publicacoes =
    JSON.parse(
        localStorage.getItem("publicacoes")
    ) || [];

    const producoes =
    JSON.parse(
        localStorage.getItem("producoes")
    ) || [];

    // CARDS

    document.getElementById(
        "solicitacoes-count"
    ).textContent =
    solicitacoes.filter(
        s => s.status === "Pendente"
    ).length;

    document.getElementById(
        "coberturas-count"
    ).textContent =
    eventos.length;

    document.getElementById(
        "publicacoes-count"
    ).textContent =
    publicacoes.length;

    document.getElementById(
        "producoes-count"
    ).textContent =
    producoes.filter(
        p => p.status !== "Concluído"
    ).length;

    // FUNÇÕES

    carregarEventos(eventos);

    carregarDemandasHoje(eventos);

    carregarNotificacoes(
        solicitacoes,
        eventos,
        publicacoes
    );

    carregarAtividadesRecentes(
        eventos,
        solicitacoes
    );
}

//
// EVENTOS
//

function carregarEventos(eventos){

    const container =
    document.getElementById("listaEventos");

    if(!container) return;

    if(eventos.length === 0){

        container.innerHTML =
        "<p>Nenhum evento cadastrado.</p>";

        return;
    }

    container.innerHTML = "";

    eventos
    .slice(0,5)
    .forEach(evento=>{

        container.innerHTML +=

        `
        <div class="event-card">

            <strong>${evento.titulo}</strong>

            <p>
            ${evento.data} • ${evento.hora}
            </p>

            <p>${evento.local}</p>

        </div>
        `;
    });
}

//
// DEMANDAS DO DIA
//

function carregarDemandasHoje(eventos){

    const container =
    document.getElementById("demandasHoje");

    if(!container) return;

    const hoje =
    new Date()
    .toISOString()
    .split("T")[0];

    const eventosHoje =
    eventos.filter(
        e => e.data === hoje
    );

    if(eventosHoje.length === 0){

        container.innerHTML =
        "<p>Nenhuma atividade para hoje.</p>";

        return;
    }

    container.innerHTML = "";

    eventosHoje.forEach(evento=>{

        container.innerHTML +=

        `
        <div class="event-card">

            <strong>${evento.titulo}</strong>

            <p>${evento.hora}</p>

            <p>${evento.local}</p>

        </div>
        `;
    });
}

//
// NOTIFICAÇÕES
//

function carregarNotificacoes(
    solicitacoes,
    eventos,
    publicacoes
){

    const container =
    document.getElementById(
        "notificacoesSistema"
    );

    if(!container) return;

    container.innerHTML = "";

    // NOTIFICAÇÃO SOLICITAÇÕES

    if(solicitacoes.length > 0){

        container.innerHTML +=

        `
        <div class="event-card">

            <strong>
            Nova Solicitação
            </strong>

            <p>
            Existem
            ${solicitacoes.length}
            solicitações registradas.
            </p>

        </div>
        `;
    }

    // NOTIFICAÇÃO EVENTOS

    if(eventos.length > 0){

        container.innerHTML +=

        `
        <div class="event-card">

            <strong>
            Eventos Agendados
            </strong>

            <p>
            ${eventos.length}
            eventos cadastrados.
            </p>

        </div>
        `;
    }

    // NOTIFICAÇÃO PUBLICAÇÕES

    if(publicacoes.length > 0){

        container.innerHTML +=

        `
        <div class="event-card">

            <strong>
            Publicações
            </strong>

            <p>
            ${publicacoes.length}
            publicações realizadas.
            </p>

        </div>
        `;
    }

    // VAZIO

    if(
        solicitacoes.length === 0 &&
        eventos.length === 0 &&
        publicacoes.length === 0
    ){

        container.innerHTML =

        `
        <p>
        Nenhuma notificação.
        </p>
        `;
    }
}

//
// ATIVIDADES RECENTES
//

function carregarAtividadesRecentes(
    eventos,
    solicitacoes
){

    const container =
    document.getElementById(
        "atividadesRecentes"
    );

    if(!container) return;

    container.innerHTML = "";

    // EVENTOS

    eventos
    .slice(-3)
    .reverse()
    .forEach(evento=>{

        container.innerHTML +=

        `
        <div class="event-card">

            <strong>
            Evento Registrado
            </strong>

            <p>
            ${evento.titulo}
            </p>

        </div>
        `;
    });

    // SOLICITAÇÕES

    solicitacoes
    .slice(-3)
    .reverse()
    .forEach(solicitacao=>{

        container.innerHTML +=

        `
        <div class="event-card">

            <strong>
            Solicitação Recebida
            </strong>

            <p>
            ${solicitacao.titulo}
            </p>

        </div>
        `;
    });

    if(
        eventos.length === 0 &&
        solicitacoes.length === 0
    ){

        container.innerHTML =

        `
        <p>
        Nenhuma atividade recente.
        </p>
        `;
    }
}

//
// INICIALIZAÇÃO
//

document.addEventListener(
    "DOMContentLoaded",
    carregarDashboard
);