const modal =
document.getElementById("modalPublicacao");

const abrirModal =
document.getElementById("abrirModal");

const fecharModal =
document.getElementById("fecharModal");

const salvarPublicacao =
document.getElementById("salvarPublicacao");

const listaPublicacoes =
document.getElementById("listaPublicacoes");

const pesquisa =
document.getElementById("pesquisaPublicacao");

let filtroAtual = "Todos";

function buscarPublicacoes() {

    return JSON.parse(
        localStorage.getItem("publicacoes")
    ) || [];
}

function salvarPublicacoes(publicacoes) {

    localStorage.setItem(
        "publicacoes",
        JSON.stringify(publicacoes)
    );
}

function adicionarNotificacaoPublicacao(publicacao) {

    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo: "Nova Publicação",
        descricao: `${publicacao.titulo} • ${publicacao.plataforma}`,
        tipo: "Publicação",
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

if (salvarPublicacao) {

    salvarPublicacao.onclick = () => {

        const titulo =
        document.getElementById("titulo").value.trim();

        const eventoRelacionado =
        document.getElementById("eventoRelacionado")?.value.trim() || "";

        const descricao =
        document.getElementById("descricao").value.trim();

        const tipo =
        document.getElementById("tipo").value;

        const plataforma =
        document.getElementById("plataforma").value;

        const data =
        document.getElementById("data").value;

        const hora =
        document.getElementById("hora").value;

        const responsavel =
        document.getElementById("responsavel")?.value.trim() || "Departamento de Mídia";

        const linkPublicacao =
        document.getElementById("linkPublicacao")?.value.trim() || "";

        const status =
        document.getElementById("status").value;

        if (!titulo) {
            alert("Preencha o título da publicação.");
            return;
        }

        const publicacoes =
        buscarPublicacoes();

        const novaPublicacao = {
            id: Date.now(),
            titulo,
            eventoRelacionado,
            descricao,
            tipo,
            plataforma,
            data,
            hora,
            responsavel,
            linkPublicacao,
            status,
            origem: "Publicações"
        };

        publicacoes.push(novaPublicacao);

        salvarPublicacoes(publicacoes);

        adicionarNotificacaoPublicacao(novaPublicacao);

        carregarPublicacoes();

        modal.style.display = "none";

        limparFormularioPublicacao();
    };
}

function limparFormularioPublicacao() {

    const campos = [
        "titulo",
        "eventoRelacionado",
        "descricao",
        "data",
        "hora",
        "responsavel",
        "linkPublicacao"
    ];

    campos.forEach(id => {

        const campo =
        document.getElementById(id);

        if (campo) {
            campo.value = "";
        }
    });
}

function carregarPublicacoes() {

    if (!listaPublicacoes) return;

    const publicacoes =
    buscarPublicacoes();

    listaPublicacoes.innerHTML = "";

    const termo =
    pesquisa ? pesquisa.value.toLowerCase() : "";

    const filtradas =
    publicacoes.filter(item => {

        const textoBusca =
        `
        ${item.titulo || ""}
        ${item.eventoRelacionado || ""}
        ${item.tipo || ""}
        ${item.plataforma || ""}
        ${item.responsavel || ""}
        ${item.status || ""}
        `.toLowerCase();

        const matchPesquisa =
        textoBusca.includes(termo);

        const matchFiltro =
        filtroAtual === "Todos" ||
        item.status === filtroAtual;

        return matchPesquisa && matchFiltro;
    });

    if (filtradas.length === 0) {

        listaPublicacoes.innerHTML =
        `<p>Nenhuma publicação encontrada.</p>`;

        return;
    }

    filtradas
    .slice()
    .reverse()
    .forEach(item => {

        let statusClass = "";

        if (item.status === "Agendado") {
            statusClass = "agendado";
        }

        if (item.status === "Publicado") {
            statusClass = "publicado";
        }

        if (item.status === "Rascunho") {
            statusClass = "rascunho";
        }

        listaPublicacoes.innerHTML += `
            <div class="publicacao-card">

                <h3>${item.titulo}</h3>

                <div class="publicacao-info">

                    <p><strong>Evento/Produção:</strong> ${item.eventoRelacionado || "Não informado"}</p>

                    <p><strong>Tipo:</strong> ${item.tipo}</p>

                    <p><strong>Plataforma:</strong> ${item.plataforma}</p>

                    <p><strong>Data:</strong> ${item.data || "Não informada"}</p>

                    <p><strong>Hora:</strong> ${item.hora || "Não informada"}</p>

                    <p><strong>Responsável:</strong> ${item.responsavel}</p>

                </div>

                <p>${item.descricao || "Sem descrição."}</p>

                ${
                    item.linkPublicacao
                    ? `<p><a href="${item.linkPublicacao}" target="_blank">Ver publicação</a></p>`
                    : ""
                }

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
        carregarPublicacoes
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

        carregarPublicacoes();
    });
});

carregarPublicacoes();