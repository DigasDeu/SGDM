const modal =
document.getElementById("modalProducao");

const abrirModal =
document.getElementById("abrirModal");

const fecharModal =
document.getElementById("fecharModal");

const salvarProducao =
document.getElementById("salvarProducao");

const listaProducoes =
document.getElementById("listaProducoes");

const pesquisa =
document.getElementById("pesquisaProducao");

let filtroAtual = "Todos";

function buscarProducoes() {

    return JSON.parse(
        localStorage.getItem("producoes")
    ) || [];
}

function salvarProducoes(producoes) {

    localStorage.setItem(
        "producoes",
        JSON.stringify(producoes)
    );
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

function adicionarNotificacaoProducao(producao) {

    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo: "Nova Produção",
        descricao: `${producao.titulo} • ${producao.tipo}`,
        tipo: "Produção",
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    localStorage.setItem(
        "notificacoes",
        JSON.stringify(notificacoes)
    );
}

function adicionarNotificacaoExclusao(producao) {

    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo: "Produção excluída",
        descricao: `${producao.titulo} foi removida do sistema.`,
        tipo: "Produção",
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

if (salvarProducao) {

    salvarProducao.onclick = () => {

        const titulo =
        document.getElementById("titulo").value.trim();

        const eventoRelacionado =
        document.getElementById("eventoRelacionado")?.value.trim() || "";

        const tipo =
        document.getElementById("tipo").value;

        const data =
        document.getElementById("data").value;

        const hora =
        document.getElementById("hora").value;

        const local =
        document.getElementById("local").value.trim();

        const responsavel =
        document.getElementById("responsavel")?.value.trim() || "Departamento de Mídia";

        const quantidadeFotos =
        document.getElementById("quantidadeFotos")?.value || 0;

        const quantidadeVideos =
        document.getElementById("quantidadeVideos")?.value || 0;

        const quantidadeArtes =
        document.getElementById("quantidadeArtes")?.value || 0;

        const status =
        document.getElementById("status").value;

        const descricao =
        document.getElementById("descricao").value.trim();

        if (!titulo) {

            alert("Preencha o título da produção.");

            return;
        }

        const producoes =
        buscarProducoes();

        const novaProducao = {
            id: Date.now(),
            titulo,
            eventoRelacionado,
            tipo,
            data,
            hora,
            local,
            responsavel,
            quantidadeFotos,
            quantidadeVideos,
            quantidadeArtes,
            status,
            descricao,
            origem: "Produções"
        };

        producoes.push(novaProducao);

        salvarProducoes(producoes);

        adicionarNotificacaoProducao(novaProducao);

        carregarProducoes();

        modal.style.display = "none";

        limparFormularioProducao();
    };
}

function excluirProducao(id) {

    const confirmar =
    confirm("Tem certeza que deseja excluir esta produção?");

    if (!confirmar) return;

    let producoes =
    buscarProducoes();

    const itemExcluido =
    producoes.find(item => item.id === id);

    producoes =
    producoes.filter(item => item.id !== id);

    salvarProducoes(producoes);

    if (itemExcluido) {

        adicionarHistoricoExclusao(
            itemExcluido,
            "Produções"
        );

        adicionarNotificacaoExclusao(itemExcluido);
    }

    carregarProducoes();
}

function limparFormularioProducao() {

    const campos = [
        "titulo",
        "eventoRelacionado",
        "data",
        "hora",
        "local",
        "responsavel",
        "quantidadeFotos",
        "quantidadeVideos",
        "quantidadeArtes",
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

function carregarProducoes() {

    if (!listaProducoes) return;

    const producoes =
    buscarProducoes();

    listaProducoes.innerHTML = "";

    const termo =
    pesquisa ? pesquisa.value.toLowerCase() : "";

    const filtradas =
    producoes.filter(item => {

        const textoBusca =
        `
        ${item.titulo || ""}
        ${item.eventoRelacionado || ""}
        ${item.tipo || ""}
        ${item.data || ""}
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

        listaProducoes.innerHTML =
        `<p>Nenhuma produção encontrada.</p>`;

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

        listaProducoes.innerHTML += `
            <div class="producao-card event-card">

                <h3>${item.titulo}</h3>

                <div class="producao-info">

                    <p><strong>Evento/Demanda:</strong> ${item.eventoRelacionado || "Não informado"}</p>

                    <p><strong>Tipo:</strong> ${item.tipo}</p>

                    <p><strong>Data:</strong> ${item.data || "Não informada"}</p>

                    <p><strong>Hora:</strong> ${item.hora || "Não informada"}</p>

                    <p><strong>Local:</strong> ${item.local || "Não informado"}</p>

                    <p><strong>Responsável:</strong> ${item.responsavel}</p>

                    <p><strong>Fotos:</strong> ${item.quantidadeFotos || 0}</p>

                    <p><strong>Vídeos:</strong> ${item.quantidadeVideos || 0}</p>

                    <p><strong>Artes/Carrosséis:</strong> ${item.quantidadeArtes || 0}</p>

                </div>

                <p>${item.descricao || "Sem descrição."}</p>

                <span class="status ${statusClass}">
                    ${item.status}
                </span>

                <div class="card-actions">

                    <button class="delete-btn" onclick="excluirProducao(${item.id})">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}

if (pesquisa) {

    pesquisa.addEventListener(
        "input",
        carregarProducoes
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

        carregarProducoes();
    });
});

window.excluirProducao = excluirProducao;

carregarProducoes();