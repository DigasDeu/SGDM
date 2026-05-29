const listaRelatorios =
document.getElementById("listaRelatorios");

const pesquisaRelatorio =
document.getElementById("pesquisaRelatorio");

const tipoRelatorio =
document.getElementById("tipoRelatorio");

const atualizarRelatorios =
document.getElementById("atualizarRelatorios");

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

function adicionarNotificacaoExclusao(item, origem) {

    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo: `${origem} excluído`,
        descricao: `${item.titulo || "Registro"} foi removido do sistema.`,
        tipo: origem,
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    localStorage.setItem(
        "notificacoes",
        JSON.stringify(notificacoes)
    );
}

function montarAtividades() {

    const eventos =
    buscarLista("eventos")
    .map(item => ({
        ...item,
        categoria: "Eventos",
        chave: "eventos"
    }));

    const solicitacoes =
    buscarLista("solicitacoes")
    .map(item => ({
        ...item,
        categoria: "Solicitações",
        chave: "solicitacoes"
    }));

    const producoes =
    buscarLista("producoes")
    .map(item => ({
        ...item,
        categoria: "Produções",
        chave: "producoes"
    }));

    const publicacoes =
    buscarLista("publicacoes")
    .map(item => ({
        ...item,
        categoria: "Publicações",
        chave: "publicacoes"
    }));

    return [
        ...eventos,
        ...solicitacoes,
        ...producoes,
        ...publicacoes
    ];
}

function atualizarResumo() {

    const totalEventos =
    document.getElementById("totalEventos");

    const totalSolicitacoes =
    document.getElementById("totalSolicitacoes");

    const totalProducoes =
    document.getElementById("totalProducoes");

    const totalPublicacoes =
    document.getElementById("totalPublicacoes");

    if (totalEventos) {
        totalEventos.textContent =
        buscarLista("eventos").length;
    }

    if (totalSolicitacoes) {
        totalSolicitacoes.textContent =
        buscarLista("solicitacoes").length;
    }

    if (totalProducoes) {
        totalProducoes.textContent =
        buscarLista("producoes").length;
    }

    if (totalPublicacoes) {
        totalPublicacoes.textContent =
        buscarLista("publicacoes").length;
    }
}

function carregarRelatorios() {

    if (!listaRelatorios) return;

    atualizarResumo();

    const termo =
    pesquisaRelatorio
    ? pesquisaRelatorio.value.toLowerCase()
    : "";

    const tipoSelecionado =
    tipoRelatorio
    ? tipoRelatorio.value
    : "Todos";

    let atividades =
    montarAtividades();

    atividades =
    atividades.filter(item => {

        const textoBusca =
        `
        ${item.titulo || ""}
        ${item.eventoRelacionado || ""}
        ${item.tipo || ""}
        ${item.local || ""}
        ${item.responsavel || ""}
        ${item.solicitante || ""}
        ${item.plataforma || ""}
        ${item.status || ""}
        ${item.descricao || ""}
        ${item.categoria || ""}
        `.toLowerCase();

        const matchPesquisa =
        textoBusca.includes(termo);

        const matchTipo =
        tipoSelecionado === "Todos" ||
        item.categoria === tipoSelecionado;

        return matchPesquisa && matchTipo;
    });

    if (atividades.length === 0) {

        listaRelatorios.innerHTML =
        `<p>Nenhuma atividade encontrada.</p>`;

        return;
    }

    listaRelatorios.innerHTML = "";

    atividades
    .slice()
    .reverse()
    .forEach(item => {

        listaRelatorios.innerHTML += `
            <div class="relatorio-card event-card">

                <h3>${item.titulo || "Atividade sem título"}</h3>

                <p><strong>Categoria:</strong> ${item.categoria}</p>

                <p><strong>Tipo:</strong> ${item.tipo || "Não informado"}</p>

                <p><strong>Data:</strong> ${item.data || "Não informada"}</p>

                <p><strong>Horário:</strong> ${item.hora || "Não informado"}</p>

                <p><strong>Local:</strong> ${item.local || "Não informado"}</p>

                <p><strong>Responsável:</strong> ${item.responsavel || "Departamento de Mídia"}</p>

                <p>${item.descricao || "Sem descrição."}</p>

                <div class="card-actions">

                    <button class="restore-btn" onclick="gerarRelatorioImpressao('${item.chave}', ${item.id})">
                        <i class="fas fa-print"></i>
                        Gerar Impressão
                    </button>

                    <button class="delete-btn" onclick="excluirRegistroRelatorio('${item.chave}', ${item.id}, '${item.categoria}')">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}

function gerarRelatorioImpressao(chave, id) {

    const lista =
    buscarLista(chave);

    const item =
    lista.find(registro => registro.id === id);

    if (!item) {
        alert("Registro não encontrado.");
        return;
    }

    localStorage.setItem(
        "relatorioSelecionado",
        JSON.stringify({
            ...item,
            chaveOrigem: chave
        })
    );

    window.location.href =
    "relatorio-impressao.html";
}

function excluirRegistroRelatorio(chave, id, origem) {

    const confirmar =
    confirm(`Tem certeza que deseja excluir este registro de ${origem}?`);

    if (!confirmar) return;

    let lista =
    buscarLista(chave);

    const itemExcluido =
    lista.find(item => item.id === id);

    lista =
    lista.filter(item => item.id !== id);

    salvarLista(chave, lista);

    if (itemExcluido) {

        adicionarHistoricoExclusao(
            itemExcluido,
            origem
        );

        adicionarNotificacaoExclusao(
            itemExcluido,
            origem
        );
    }

    carregarRelatorios();
}

if (pesquisaRelatorio) {

    pesquisaRelatorio.addEventListener(
        "input",
        carregarRelatorios
    );
}

if (tipoRelatorio) {

    tipoRelatorio.addEventListener(
        "change",
        carregarRelatorios
    );
}

if (atualizarRelatorios) {

    atualizarRelatorios.addEventListener(
        "click",
        carregarRelatorios
    );
}

window.gerarRelatorioImpressao = gerarRelatorioImpressao;

window.excluirRegistroRelatorio = excluirRegistroRelatorio;

carregarRelatorios();