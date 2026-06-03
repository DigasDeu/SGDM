import {
    observarColecao
} from "./db.js";

/* ===============================
   DADOS GLOBAIS
================================ */

let solicitacoesOnline = [];
let eventosOnline = [];
let notificacoesOnline = [];
let funcionariosOnline = [];

/* ===============================
   LOCALSTORAGE
================================ */

function buscarLista(chave) {
    return JSON.parse(
        localStorage.getItem(chave)
    ) || [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(
        chave,
        JSON.stringify(lista)
    );
}

function buscarUsuarioLogado() {
    return JSON.parse(
        localStorage.getItem("usuarioLogado")
    ) || {};
}

/* ===============================
   FIRESTORE
================================ */

function iniciarEscutasFirestore() {

    try {
        observarColecao("solicitacoes", (dados) => {

            solicitacoesOnline = dados;

            salvarLista("solicitacoes", dados);

            carregarDashboard();
        });
    } catch (error) {
        console.log("Erro ao observar solicitações:", error);
    }

    try {
        observarColecao("eventos", (dados) => {

            eventosOnline = dados;

            salvarLista("eventos", dados);

            carregarDashboard();
        });
    } catch (error) {
        console.log("Erro ao observar eventos:", error);
    }

    try {
        observarColecao("notificacoes", (dados) => {

            notificacoesOnline = dados;

            salvarLista("notificacoes", dados);

            carregarDashboard();
        });
    } catch (error) {
        console.log("Erro ao observar notificações:", error);
    }

    try {
        observarColecao("funcionariosSistema", (dados) => {

            funcionariosOnline = dados;

            salvarLista("funcionariosSistema", dados);

            carregarDashboard();
        });
    } catch (error) {
        console.log("Erro ao observar funcionários:", error);
    }
}

/* ===============================
   EQUIPE DE MÍDIA - SOMENTE CADASTRADOS
================================ */

function removerDuplicadosEquipe(equipe) {

    const equipeFinal = [];

    equipe.forEach(pessoa => {

        const emailPessoa =
        String(pessoa.email || "").toLowerCase();

        const codigoPessoa =
        String(pessoa.codigoFuncionario || "").toLowerCase();

        const nomePessoa =
        String(pessoa.nome || "").toLowerCase();

        const jaExiste =
        equipeFinal.some(item => {

            const emailItem =
            String(item.email || "").toLowerCase();

            const codigoItem =
            String(item.codigoFuncionario || "").toLowerCase();

            const nomeItem =
            String(item.nome || "").toLowerCase();

            return (
                (
                    emailPessoa &&
                    emailItem &&
                    emailPessoa === emailItem
                ) ||
                (
                    codigoPessoa &&
                    codigoItem &&
                    codigoPessoa === codigoItem
                ) ||
                (
                    nomePessoa &&
                    nomeItem &&
                    nomePessoa === nomeItem
                )
            );
        });

        if (!jaExiste) {
            equipeFinal.push(pessoa);
        }
    });

    return equipeFinal;
}

function buscarEquipeMidia() {

    const funcionarios =
    funcionariosOnline.length > 0
    ? funcionariosOnline
    : buscarLista("funcionariosSistema");

    const usuarioLogado =
    buscarUsuarioLogado();

    let equipe =
    funcionarios.filter(funcionario =>
        funcionario.cadastroFuncionarioCompleto === true &&
        (
            funcionario.tipoAcesso === "Equipe de Mídia" ||
            funcionario.equipeMidia === true
        ) &&
        funcionario.statusFuncionario !== "Inativo" &&
        funcionario.statusFuncionario !== "Bloqueado"
    );

    if (
        usuarioLogado &&
        usuarioLogado.cadastroFuncionarioCompleto === true &&
        (
            usuarioLogado.tipoAcesso === "Equipe de Mídia" ||
            usuarioLogado.equipeMidia === true
        )
    ) {
        const existeUsuario =
        equipe.some(pessoa =>
            pessoa.email &&
            usuarioLogado.email &&
            pessoa.email.toLowerCase() === usuarioLogado.email.toLowerCase()
        );

        if (!existeUsuario) {
            equipe.push({
                id: usuarioLogado.uid || Date.now(),
                uid: usuarioLogado.uid || "",
                codigoFuncionario: usuarioLogado.codigoFuncionario || "",
                nome: usuarioLogado.nome || "Usuário da Mídia",
                email: usuarioLogado.email || "",
                telefone: usuarioLogado.telefone || "",
                cargos: usuarioLogado.cargos || [],
                cargoPrincipal: usuarioLogado.cargoPrincipal || "",
                tipoAcesso: "Equipe de Mídia",
                statusFuncionario: usuarioLogado.statusFuncionario || "Ativo",
                equipeMidia: true,
                unidade: "Departamento de Mídia",
                tipoUnidade: "Setor Administrativo",
                cadastroFuncionarioCompleto: true,
                cadastroLocalCompleto: true
            });
        }
    }

    return removerDuplicadosEquipe(equipe);
}

/* ===============================
   DASHBOARD PRINCIPAL
================================ */

function carregarDashboard() {

    const solicitacoes =
    solicitacoesOnline.length > 0
    ? solicitacoesOnline
    : buscarLista("solicitacoes");

    const eventos =
    eventosOnline.length > 0
    ? eventosOnline
    : buscarLista("eventos");

    const publicacoes =
    buscarLista("publicacoes");

    const producoes =
    buscarLista("producoes");

    atualizarCards(
        solicitacoes,
        eventos,
        publicacoes,
        producoes
    );

    carregarPautasResponsaveis(
        solicitacoes,
        eventos
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

/* ===============================
   CARDS
================================ */

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

    const hoje =
    new Date();

    const publicacoesMes =
    publicacoes.filter(item => {

        if (!item.data) return true;

        const data =
        new Date(item.data);

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

/* ===============================
   RESPONSÁVEIS PELAS PAUTAS
================================ */

function mesmoResponsavel(item, pessoa) {

    const pessoaId =
    String(
        pessoa.idFirebase ||
        pessoa.id ||
        pessoa.uid ||
        pessoa.email ||
        ""
    );

    const pessoaEmail =
    String(pessoa.email || "").toLowerCase();

    const pessoaNome =
    String(pessoa.nome || "").toLowerCase();

    const itemResponsavelId =
    String(item.responsavelId || "");

    const itemResponsavelEmail =
    String(item.responsavelEmail || "").toLowerCase();

    const itemResponsavelNome =
    String(item.responsavel || "").toLowerCase();

    return (
        (
            pessoaId &&
            itemResponsavelId &&
            pessoaId === itemResponsavelId
        ) ||
        (
            pessoaEmail &&
            itemResponsavelEmail &&
            pessoaEmail === itemResponsavelEmail
        ) ||
        (
            pessoaNome &&
            itemResponsavelNome &&
            pessoaNome === itemResponsavelNome
        )
    );
}

function carregarPautasResponsaveis(
    solicitacoes,
    eventos
) {

    const container =
    document.getElementById("pautasResponsaveis");

    if (!container) return;

    const equipe =
    buscarEquipeMidia();

    if (equipe.length === 0) {

        container.innerHTML =
        "<p>Nenhuma pessoa da mídia cadastrada.</p>";

        return;
    }

    container.innerHTML = "";

    equipe.forEach(pessoa => {

        const totalSolicitacoes =
        solicitacoes.filter(item =>
            mesmoResponsavel(item, pessoa)
        ).length;

        const solicitacoesPendentes =
        solicitacoes.filter(item =>
            mesmoResponsavel(item, pessoa) &&
            item.status === "Pendente"
        ).length;

        const totalEventos =
        eventos.filter(item =>
            mesmoResponsavel(item, pessoa)
        ).length;

        const hoje =
        new Date().toISOString().split("T")[0];

        const eventosProximos =
        eventos.filter(item =>
            mesmoResponsavel(item, pessoa) &&
            item.data &&
            item.data >= hoje
        ).length;

        const totalPautas =
        totalSolicitacoes + totalEventos;

        container.innerHTML += `
            <div class="event-card">

                <strong>${pessoa.nome || "Sem nome"}</strong>

                <p>
                    <strong>Solicitações:</strong>
                    ${totalSolicitacoes}
                    ${
                        solicitacoesPendentes > 0
                        ? `• ${solicitacoesPendentes} pendente(s)`
                        : ""
                    }
                </p>

                <p>
                    <strong>Agendamentos:</strong>
                    ${totalEventos}
                    ${
                        eventosProximos > 0
                        ? `• ${eventosProximos} próximo(s)`
                        : ""
                    }
                </p>

                <p>
                    <strong>Total de pautas:</strong>
                    ${totalPautas}
                </p>

            </div>
        `;
    });
}

/* ===============================
   PRÓXIMOS EVENTOS
================================ */

function carregarEventos(eventos) {

    const container =
    document.getElementById("listaEventos");

    if (!container) return;

    if (eventos.length === 0) {

        container.innerHTML =
        "<p>Nenhum evento cadastrado.</p>";

        return;
    }

    const eventosOrdenados =
    eventos
    .slice()
    .sort((a, b) => {

        const dataA =
        `${a.data || ""} ${a.hora || ""}`;

        const dataB =
        `${b.data || ""} ${b.hora || ""}`;

        return dataA.localeCompare(dataB);
    });

    container.innerHTML = "";

    eventosOrdenados
    .slice(0, 5)
    .forEach(evento => {

        container.innerHTML += `
            <div class="event-card">

                <strong>${evento.titulo || "Evento sem título"}</strong>

                <p>
                    ${evento.data || "Sem data"}
                    •
                    ${evento.hora || "Sem horário"}
                </p>

                <p>
                    ${evento.local || "Local não informado"}
                </p>

                <small>
                    Responsável:
                    ${evento.responsavel || "Não definido"}
                </small>

            </div>
        `;
    });
}

/* ===============================
   DEMANDAS DE HOJE
================================ */

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

                <small>
                    Responsável:
                    ${evento.responsavel || "Não definido"}
                </small>

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
    notificacoesOnline.length > 0
    ? notificacoesOnline
    : buscarLista("notificacoes");

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
            id: `auto-solicitacao-${item.idFirebase || item.id}`,
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
            id: `auto-evento-${item.idFirebase || item.id}`,
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
            id: `auto-producao-${item.idFirebase || item.id}`,
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
            id: `auto-publicacao-${item.idFirebase || item.id}`,
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

document.addEventListener("DOMContentLoaded", () => {

    carregarDashboard();

    iniciarEscutasFirestore();
});