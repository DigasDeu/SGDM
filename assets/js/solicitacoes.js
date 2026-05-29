const modal =
document.getElementById("modalSolicitacao");

const abrirModal =
document.getElementById("abrirModal");

const fecharModal =
document.getElementById("fecharModal");

const salvarSolicitacao =
document.getElementById("salvarSolicitacao");

const listaSolicitacoes =
document.getElementById("listaSolicitacoes");

const pesquisa =
document.getElementById("pesquisaSolicitacao");

let filtroAtual = "Todos";

function buscarSolicitacoes() {

    return JSON.parse(
        localStorage.getItem("solicitacoes")
    ) || [];
}

function salvarSolicitacoes(solicitacoes) {

    localStorage.setItem(
        "solicitacoes",
        JSON.stringify(solicitacoes)
    );
}

function adicionarNotificacaoSolicitacao(solicitacao) {

    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo: "Nova Solicitação",
        descricao: `${solicitacao.titulo} • ${solicitacao.data || "Sem data"} • ${solicitacao.local || "Local não informado"}`,
        tipo: "Solicitação",
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    localStorage.setItem(
        "notificacoes",
        JSON.stringify(notificacoes)
    );
}

if (abrirModal) {

    abrirModal.onclick = () => {
        modal.style.display = "flex";
    };
}

if (fecharModal) {

    fecharModal.onclick = () => {
        modal.style.display = "none";
    };
}

if (salvarSolicitacao) {

    salvarSolicitacao.onclick = () => {

        const titulo =
        document.getElementById("titulo").value.trim();

        const solicitante =
        document.getElementById("solicitante").value.trim();

        const data =
        document.getElementById("data").value;

        const hora =
        document.getElementById("hora").value;

        const local =
        document.getElementById("local").value.trim();

        const responsavel =
        document.getElementById("responsavel")?.value.trim() || "Departamento de Mídia";

        const status =
        document.getElementById("status").value;

        let descricao =
        document.getElementById("descricao").value.trim();

        if (!titulo || !solicitante) {

            alert("Preencha título e solicitante.");

            return;
        }

        if (!descricao) {

            descricao =
            `A ação "${titulo}" ocorrerá no dia ${data || "não informado"}, às ${hora || "horário não informado"}, no local ${local || "não informado"}, sob responsabilidade de ${responsavel}, conforme solicitação do setor ${solicitante}.`;
        }

        const solicitacoes =
        buscarSolicitacoes();

        const novaSolicitacao = {
            id: Date.now(),
            titulo,
            solicitante,
            data,
            hora,
            local,
            responsavel,
            status,
            descricao,
            origem: "Solicitações"
        };

        solicitacoes.push(novaSolicitacao);

        salvarSolicitacoes(solicitacoes);

        adicionarNotificacaoSolicitacao(novaSolicitacao);

        carregarSolicitacoes();

        modal.style.display = "none";

        limparFormularioSolicitacao();
    };
}

function limparFormularioSolicitacao() {

    const campos = [
        "titulo",
        "solicitante",
        "data",
        "hora",
        "local",
        "responsavel",
        "descricao"
    ];

    campos.forEach(id => {

        const campo =
        document.getElementById(id);

        if (campo) {
            campo.value = "";
        }
    });
}

function carregarSolicitacoes() {

    if (!listaSolicitacoes) return;

    const solicitacoes =
    buscarSolicitacoes();

    listaSolicitacoes.innerHTML = "";

    const termo =
    pesquisa ? pesquisa.value.toLowerCase() : "";

    const filtradas =
    solicitacoes.filter(item => {

        const textoBusca =
        `
        ${item.titulo || ""}
        ${item.solicitante || ""}
        ${item.data || ""}
        ${item.hora || ""}
        ${item.local || ""}
        ${item.responsavel || ""}
        ${item.status || ""}
        ${item.descricao || ""}
        `.toLowerCase();

        const matchPesquisa =
        textoBusca.includes(termo);

        const matchFiltro =
        filtroAtual === "Todos" ||
        item.status === filtroAtual;

        return matchPesquisa && matchFiltro;
    });

    if (filtradas.length === 0) {

        listaSolicitacoes.innerHTML =
        `<p>Nenhuma solicitação encontrada.</p>`;

        return;
    }

    filtradas
    .slice()
    .reverse()
    .forEach(item => {

        let statusClass = "";

        if (item.status === "Pendente") {
            statusClass = "pendente";
        }

        if (item.status === "Andamento") {
            statusClass = "andamento";
        }

        if (item.status === "Concluído") {
            statusClass = "concluido";
        }

        listaSolicitacoes.innerHTML += `
            <div class="solicitacao-card">

                <h3>${item.titulo}</h3>

                <div class="solicitacao-info">

                    <p><strong>Solicitante:</strong> ${item.solicitante}</p>

                    <p><strong>Data:</strong> ${item.data || "Não informada"}</p>

                    <p><strong>Hora:</strong> ${item.hora || "Não informada"}</p>

                    <p><strong>Local:</strong> ${item.local || "Não informado"}</p>

                    <p><strong>Responsável:</strong> ${item.responsavel || "Departamento de Mídia"}</p>

                </div>

                <p>${item.descricao || "Sem descrição."}</p>

                <span class="status ${statusClass}">
                    ${item.status}
                </span>

            </div>
        `;
    });
}

if (pesquisa) {

    pesquisa.addEventListener(
        "input",
        carregarSolicitacoes
    );
}

document
.querySelectorAll(".filtro-btn")
.forEach(btn => {

    btn.addEventListener("click", () => {

        document
        .querySelectorAll(".filtro-btn")
        .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        filtroAtual =
        btn.dataset.status;

        carregarSolicitacoes();
    });
});

carregarSolicitacoes();