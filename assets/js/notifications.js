import {
    adicionarDocumento,
    excluirDocumento,
    observarColecao
} from "./db.js";

/* ==========================================
   NOTIFICAÇÕES - FIRESTORE + LOCALSTORAGE
========================================== */

let notificacoesOnline = [];

document.addEventListener("DOMContentLoaded", () => {

    const notificationBtn =
    document.getElementById("notificationBtn");

    const notificationDropdown =
    document.getElementById("notificationDropdown");

    if (
        !notificationBtn ||
        !notificationDropdown
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

    iniciarEscutaNotificacoesFirestore();
});

/* ==========================================
   LOCALSTORAGE
========================================== */

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

/* ==========================================
   FIRESTORE
========================================== */

function iniciarEscutaNotificacoesFirestore() {

    try {

        observarColecao("notificacoes", (dados) => {

            notificacoesOnline =
            dados;

            salvarDados(
                "notificacoes",
                dados
            );

            carregarNotificacoes();
        });

    } catch (error) {

        console.log(
            "Erro ao observar notificações:",
            error
        );
    }
}

/* ==========================================
   CRIAR NOTIFICAÇÃO
========================================== */

async function criarNotificacao(
    titulo,
    descricao,
    tipo = "Sistema"
) {

    const notificacoes =
    buscarDados("notificacoes");

    const novaNotificacao = {
        id: Date.now(),
        titulo,
        descricao,
        tipo,
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    };

    notificacoes.unshift(novaNotificacao);

    salvarDados(
        "notificacoes",
        notificacoes
    );

    try {

        const idFirebase =
        await adicionarDocumento(
            "notificacoes",
            novaNotificacao
        );

        novaNotificacao.idFirebase =
        idFirebase;

    } catch (error) {

        console.log(
            "Erro ao salvar notificação no Firestore:",
            error
        );
    }

    carregarNotificacoes();
}

/* ==========================================
   NOTIFICAÇÕES AUTOMÁTICAS
========================================== */

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
            id: `solicitacao-${item.idFirebase || item.id}`,
            titulo: "Solicitação pendente",
            descricao:
            item.titulo ||
            "Nova solicitação aguardando atendimento",

            tipo: "Solicitação",
            data: item.data || "",
            automatica: true
        });
    });

    eventos
    .slice(-5)
    .forEach(item => {

        automaticas.push({
            id: `evento-${item.idFirebase || item.id}`,
            titulo: "Evento agendado",
            descricao:
            `${item.titulo || "Evento"} - ${item.data || "sem data"}`,

            tipo: "Agenda",
            data: item.hora || "",
            automatica: true
        });
    });

    publicacoes
    .slice(-5)
    .forEach(item => {

        automaticas.push({
            id: `publicacao-${item.idFirebase || item.id}`,
            titulo: "Publicação registrada",
            descricao:
            `${item.titulo || "Publicação"} - ${item.plataforma || "Plataforma não informada"}`,

            tipo: "Publicação",
            data: item.data || "",
            automatica: true
        });
    });

    producoes
    .slice(-5)
    .forEach(item => {

        automaticas.push({
            id: `producao-${item.idFirebase || item.id}`,
            titulo: "Produção registrada",
            descricao:
            `${item.titulo || "Produção"} - ${item.tipo || "Tipo não informado"}`,

            tipo: "Produção",
            data: item.data || "",
            automatica: true
        });
    });

    return automaticas;
}

/* ==========================================
   CARREGAR NOTIFICAÇÕES
========================================== */

function carregarNotificacoes() {

    const notificationList =
    document.getElementById("notificationList");

    const notificationCount =
    document.getElementById("notificationCount");

    if (!notificationList || !notificationCount) return;

    const notificacoesSalvas =
    notificacoesOnline.length > 0
    ? notificacoesOnline
    : buscarDados("notificacoes");

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
                Limpar notificações locais
            </button>
        </div>
    `;

    notificacoes
    .slice(0, 10)
    .forEach(item => {

        const idAcao =
        item.idFirebase || item.id;

        notificationList.innerHTML += `
            <div class="notification-item">

                <div>

                    <strong>${item.titulo || "Notificação"}</strong>

                    <p>${item.descricao || "Sem descrição."}</p>

                    <small>
                        ${item.tipo || "Sistema"}
                        ${item.data ? " • " + item.data : ""}
                    </small>

                </div>

                ${
                    item.automatica
                    ? ""
                    : `
                    <button class="delete-notification-btn" onclick="excluirNotificacao('${idAcao}')">
                        <i class="fas fa-times"></i>
                    </button>
                    `
                }

            </div>
        `;
    });
}

/* ==========================================
   EXCLUIR NOTIFICAÇÃO
========================================== */

async function excluirNotificacao(id) {

    let notificacoes =
    buscarDados("notificacoes");

    const itemExcluido =
    notificacoes.find(item =>
        String(item.id) === String(id) ||
        String(item.idFirebase) === String(id)
    );

    notificacoes =
    notificacoes.filter(item =>
        String(item.id) !== String(id) &&
        String(item.idFirebase) !== String(id)
    );

    salvarDados(
        "notificacoes",
        notificacoes
    );

    if (itemExcluido && itemExcluido.idFirebase) {

        try {

            await excluirDocumento(
                "notificacoes",
                itemExcluido.idFirebase
            );

        } catch (error) {

            console.log(
                "Erro ao excluir notificação no Firestore:",
                error
            );
        }
    }

    carregarNotificacoes();
}

/* ==========================================
   LIMPAR NOTIFICAÇÕES LOCAIS
========================================== */

function limparNotificacoes() {

    const confirmar =
    confirm("Deseja limpar as notificações locais?");

    if (!confirmar) return;

    localStorage.removeItem("notificacoes");

    notificacoesOnline = [];

    carregarNotificacoes();
}

/* ==========================================
   FUNÇÕES GLOBAIS
========================================== */

window.criarNotificacao =
criarNotificacao;

window.carregarNotificacoes =
carregarNotificacoes;

window.excluirNotificacao =
excluirNotificacao;

window.limparNotificacoes =
limparNotificacoes;