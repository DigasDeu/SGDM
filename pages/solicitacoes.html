const modal = document.getElementById("modalSolicitacao");
const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const formSolicitacao = document.getElementById("formSolicitacao");
const listaSolicitacoes = document.getElementById("listaSolicitacoes");
const pesquisa = document.getElementById("pesquisaSolicitacao");

const localInput = document.getElementById("local");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const buscarEnderecoBtn = document.getElementById("buscarEndereco");
const usarLocalizacaoBtn = document.getElementById("usarLocalizacao");

let filtroAtual = "Todos";

let mapa = null;
let marcador = null;

function buscarSolicitacoes() {
    return JSON.parse(localStorage.getItem("solicitacoes")) || [];
}

function salvarSolicitacoes(solicitacoes) {
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
}

function iniciarMapaSolicitacao() {

    if (!document.getElementById("mapaSolicitacao")) return;

    const maues = [-3.3836, -57.7186];

    mapa = L.map("mapaSolicitacao").setView(maues, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(mapa);

    marcador = L.marker(maues, {
        draggable: true
    }).addTo(mapa);

    preencherCoordenadas(maues[0], maues[1]);

    marcador.on("dragend", () => {
        const posicao = marcador.getLatLng();
        preencherCoordenadas(posicao.lat, posicao.lng);
        buscarEnderecoPorCoordenadas(posicao.lat, posicao.lng);
    });

    mapa.on("click", (event) => {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;

        marcador.setLatLng([lat, lng]);
        preencherCoordenadas(lat, lng);
        buscarEnderecoPorCoordenadas(lat, lng);
    });

    setTimeout(() => {
        mapa.invalidateSize();
    }, 300);
}

function preencherCoordenadas(lat, lng) {
    latitudeInput.value = lat;
    longitudeInput.value = lng;
}

async function buscarEnderecoPorCoordenadas(lat, lng) {

    try {

        const resposta = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const dados = await resposta.json();

        if (dados.display_name) {
            localInput.value = dados.display_name;
        }

    } catch (error) {
        console.log("Erro ao buscar endereço:", error);
    }
}

async function buscarCoordenadasPorEndereco() {

    const endereco = localInput.value.trim();

    if (!endereco) {
        alert("Digite um endereço ou local para buscar.");
        return;
    }

    try {

        const resposta = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco + ", Maués, Amazonas, Brasil")}`
        );

        const dados = await resposta.json();

        if (!dados.length) {
            alert("Local não encontrado. Tente escrever o endereço de outra forma.");
            return;
        }

        const resultado = dados[0];

        const lat = parseFloat(resultado.lat);
        const lng = parseFloat(resultado.lon);

        mapa.setView([lat, lng], 17);
        marcador.setLatLng([lat, lng]);

        preencherCoordenadas(lat, lng);

        localInput.value = resultado.display_name;

    } catch (error) {
        console.log("Erro ao buscar local:", error);
        alert("Erro ao buscar localização.");
    }
}

function usarMinhaLocalizacao() {

    if (!navigator.geolocation) {
        alert("Seu navegador não permite acessar localização.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {

            const lat = posicao.coords.latitude;
            const lng = posicao.coords.longitude;

            mapa.setView([lat, lng], 17);
            marcador.setLatLng([lat, lng]);

            preencherCoordenadas(lat, lng);
            buscarEnderecoPorCoordenadas(lat, lng);
        },
        () => {
            alert("Não foi possível obter sua localização.");
        }
    );
}

function adicionarHistoricoExclusao(item, origem) {

    const historico = JSON.parse(localStorage.getItem("historicoExclusoes")) || [];

    historico.unshift({
        id: Date.now(),
        origem,
        item,
        dataExclusao: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem("historicoExclusoes", JSON.stringify(historico));
}

function adicionarNotificacaoSolicitacao(solicitacao) {

    const notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo: "Nova Solicitação",
        descricao: `${solicitacao.titulo} • ${solicitacao.data || "Sem data"} • ${solicitacao.local || "Local não informado"}`,
        tipo: "Solicitação",
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
}

function adicionarNotificacaoExclusao(solicitacao) {

    const notificacoes = JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo: "Solicitação excluída",
        descricao: `${solicitacao.titulo} foi removida do sistema.`,
        tipo: "Solicitação",
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    localStorage.setItem("notificacoes", JSON.stringify(notificacoes));
}

if (abrirModal) {

    abrirModal.onclick = () => {

        modal.style.display = "flex";

        setTimeout(() => {

            if (!mapa) {
                iniciarMapaSolicitacao();
            } else {
                mapa.invalidateSize();
            }

        }, 300);
    };
}

if (fecharModal) {

    fecharModal.onclick = () => {
        modal.style.display = "none";
    };
}

if (buscarEnderecoBtn) {
    buscarEnderecoBtn.onclick = buscarCoordenadasPorEndereco;
}

if (usarLocalizacaoBtn) {
    usarLocalizacaoBtn.onclick = usarMinhaLocalizacao;
}

if (formSolicitacao) {

    formSolicitacao.addEventListener("submit", (event) => {

        event.preventDefault();

        const titulo = document.getElementById("titulo").value.trim();
        const solicitante = document.getElementById("solicitante").value.trim();
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;
        const local = document.getElementById("local").value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const responsavel = document.getElementById("responsavel")?.value.trim() || "Departamento de Mídia";
        const prioridade = document.getElementById("prioridade").value;
        const status = document.getElementById("status").value;

        let descricao = document.getElementById("descricao").value.trim();

        if (!titulo || !solicitante || !data || !hora || !local || !latitude || !longitude || !prioridade) {
            alert("Preencha todos os campos obrigatórios e marque a localização no mapa.");
            return;
        }

        if (!descricao) {
            descricao =
            `A ação "${titulo}" ocorrerá no dia ${data}, às ${hora}, no local ${local}, sob responsabilidade de ${responsavel}, conforme solicitação do setor ${solicitante}.`;
        }

        const solicitacoes = buscarSolicitacoes();

        const novaSolicitacao = {
            id: Date.now(),
            titulo,
            solicitante,
            data,
            hora,
            local,
            latitude,
            longitude,
            responsavel,
            prioridade,
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
    });
}

function excluirSolicitacao(id) {

    const confirmar = confirm("Tem certeza que deseja excluir esta solicitação?");

    if (!confirmar) return;

    let solicitacoes = buscarSolicitacoes();

    const itemExcluido = solicitacoes.find(item => item.id === id);

    solicitacoes = solicitacoes.filter(item => item.id !== id);

    salvarSolicitacoes(solicitacoes);

    if (itemExcluido) {
        adicionarHistoricoExclusao(itemExcluido, "Solicitações");
        adicionarNotificacaoExclusao(itemExcluido);
    }

    carregarSolicitacoes();
}

function limparFormularioSolicitacao() {

    const campos = [
        "titulo",
        "solicitante",
        "data",
        "hora",
        "local",
        "latitude",
        "longitude",
        "responsavel",
        "prioridade",
        "descricao"
    ];

    campos.forEach(id => {

        const campo = document.getElementById(id);

        if (campo) {
            campo.value = "";
        }
    });

    const status = document.getElementById("status");

    if (status) {
        status.value = "Pendente";
    }
}

function carregarSolicitacoes() {

    if (!listaSolicitacoes) return;

    const solicitacoes = buscarSolicitacoes();

    listaSolicitacoes.innerHTML = "";

    const termo = pesquisa ? pesquisa.value.toLowerCase() : "";

    const filtradas = solicitacoes.filter(item => {

        const textoBusca = `
        ${item.titulo || ""}
        ${item.solicitante || ""}
        ${item.data || ""}
        ${item.hora || ""}
        ${item.local || ""}
        ${item.responsavel || ""}
        ${item.prioridade || ""}
        ${item.status || ""}
        ${item.descricao || ""}
        `.toLowerCase();

        const matchPesquisa = textoBusca.includes(termo);

        const matchFiltro =
        filtroAtual === "Todos" ||
        item.status === filtroAtual;

        return matchPesquisa && matchFiltro;
    });

    if (filtradas.length === 0) {
        listaSolicitacoes.innerHTML = `<p>Nenhuma solicitação encontrada.</p>`;
        return;
    }

    filtradas
    .slice()
    .reverse()
    .forEach(item => {

        let statusClass = "";

        if (item.status === "Pendente") statusClass = "pendente";
        if (item.status === "Andamento") statusClass = "andamento";
        if (item.status === "Concluído") statusClass = "concluido";

        const linkMapa =
        item.latitude && item.longitude
        ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
        : "#";

        listaSolicitacoes.innerHTML += `
            <div class="solicitacao-card">

                <h3>${item.titulo}</h3>

                <div class="solicitacao-info">

                    <p><strong>Solicitante:</strong> ${item.solicitante}</p>

                    <p><strong>Data:</strong> ${item.data || "Não informada"}</p>

                    <p><strong>Hora:</strong> ${item.hora || "Não informada"}</p>

                    <p><strong>Local:</strong> ${item.local || "Não informado"}</p>

                    <p><strong>Prioridade:</strong> ${item.prioridade || "Não informada"}</p>

                    <p><strong>Responsável:</strong> ${item.responsavel || "Departamento de Mídia"}</p>

                    ${
                        item.latitude && item.longitude
                        ? `<p><strong>Coordenadas:</strong> ${item.latitude}, ${item.longitude}</p>`
                        : ""
                    }

                </div>

                <p>${item.descricao || "Sem descrição."}</p>

                <span class="status ${statusClass}">
                    ${item.status}
                </span>

                <div class="card-actions">

                    ${
                        item.latitude && item.longitude
                        ? `
                        <a href="${linkMapa}" target="_blank" class="map-link">
                            <i class="fas fa-location-dot"></i>
                            Abrir no Maps
                        </a>
                        `
                        : ""
                    }

                    <button class="delete-btn" onclick="excluirSolicitacao(${item.id})">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}

if (pesquisa) {
    pesquisa.addEventListener("input", carregarSolicitacoes);
}

document.querySelectorAll(".filtro-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document
        .querySelectorAll(".filtro-btn")
        .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        filtroAtual = btn.dataset.status;

        carregarSolicitacoes();
    });
});

window.excluirSolicitacao = excluirSolicitacao;

carregarSolicitacoes();