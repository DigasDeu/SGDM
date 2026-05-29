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

    mapa = L.map("mapaSolicitacao", {
        dragging: false,
        tap: false,
        scrollWheelZoom: false,
        touchZoom: true,
        doubleClickZoom: true,
        zoomControl: true
    }).setView(maues, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(mapa);

    marcador = L.marker(maues, {
        draggable: false
    }).addTo(mapa);

    preencherCoordenadas(maues[0], maues[1]);

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

function pegarEquipeCobertura() {
    const selecionados =
    document.querySelectorAll('input[name="equipeCobertura"]:checked');

    return Array.from(selecionados).map(item => item.value);
}

function pegarAnexos() {
    const input = document.getElementById("anexos");

    if (!input || !input.files.length) return [];

    return Array.from(input.files).map(file => ({
        nome: file.name,
        tipo: file.type,
        tamanho: file.size
    }));
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

    localStorage.setItem("historicoExclusoes", JSON.stringify(historico));
}

function adicionarNotificacao(titulo, descricao, tipo = "Sistema") {
    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo,
        descricao,
        tipo,
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
        const setor = document.getElementById("setor").value.trim();
        const contato = document.getElementById("contato").value.trim();
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;
        const local = document.getElementById("local").value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const equipeCobertura = pegarEquipeCobertura();
        const prioridade = document.getElementById("prioridade").value;
        const status = document.getElementById("status").value;
        const anexos = pegarAnexos();

        let descricao = document.getElementById("descricao").value.trim();

        if (
            !titulo ||
            !solicitante ||
            !setor ||
            !data ||
            !hora ||
            !local ||
            !latitude ||
            !longitude ||
            !prioridade
        ) {
            alert("Preencha todos os campos obrigatórios e marque a localização no mapa.");
            return;
        }

        if (!descricao) {
            descricao =
            `A ação "${titulo}" ocorrerá no dia ${data}, às ${hora}, no local ${local}, conforme solicitação de ${solicitante}, setor ${setor}.`;
        }

        const solicitacoes = buscarSolicitacoes();

        const novaSolicitacao = {
            id: Date.now(),
            titulo,
            solicitante,
            setor,
            contato,
            data,
            hora,
            local,
            latitude,
            longitude,
            equipeCobertura,
            prioridade,
            status,
            descricao,
            anexos,
            origem: "Solicitações",
            criadoEm: new Date().toLocaleString("pt-BR")
        };

        solicitacoes.push(novaSolicitacao);

        salvarSolicitacoes(solicitacoes);

        adicionarNotificacao(
            "Nova Solicitação",
            `${novaSolicitacao.titulo} • ${novaSolicitacao.data || "Sem data"} • ${novaSolicitacao.local || "Local não informado"}`,
            "Solicitação"
        );

        carregarSolicitacoes();

        modal.style.display = "none";

        limparFormularioSolicitacao();
    });
}

function gerarEventoAgenda(id) {
    const solicitacoes =
    JSON.parse(localStorage.getItem("solicitacoes")) || [];

    const eventos =
    JSON.parse(localStorage.getItem("eventos")) || [];

    const solicitacao =
    solicitacoes.find(item => item.id === id);

    if (!solicitacao) {
        alert("Solicitação não encontrada.");
        return;
    }

    const eventoExistente =
    eventos.find(evento => evento.solicitacaoId === id);

    if (eventoExistente) {
        alert("Essa solicitação já foi enviada para a agenda.");
        return;
    }

    const novoEvento = {
        id: Date.now(),
        solicitacaoId: solicitacao.id,
        titulo: solicitacao.titulo,
        tipo: "Cobertura de Mídia",
        data: solicitacao.data,
        hora: solicitacao.hora,
        local: solicitacao.local,
        latitude: solicitacao.latitude || "",
        longitude: solicitacao.longitude || "",
        responsavel: solicitacao.equipeCobertura && solicitacao.equipeCobertura.length
            ? solicitacao.equipeCobertura.join(", ")
            : "Departamento de Mídia",
        descricao: solicitacao.descricao || "",
        origem: "Solicitação"
    };

    eventos.push(novoEvento);

    localStorage.setItem("eventos", JSON.stringify(eventos));

    adicionarNotificacao(
        "Evento gerado pela solicitação",
        `${novoEvento.titulo} foi enviado para a agenda.`,
        "Agenda"
    );

    alert("Evento enviado para a agenda com sucesso.");
}

function excluirSolicitacao(id) {
    const confirmar =
    confirm("Tem certeza que deseja excluir esta solicitação?");

    if (!confirmar) return;

    let solicitacoes = buscarSolicitacoes();

    const itemExcluido =
    solicitacoes.find(item => item.id === id);

    solicitacoes =
    solicitacoes.filter(item => item.id !== id);

    salvarSolicitacoes(solicitacoes);

    if (itemExcluido) {
        adicionarHistoricoExclusao(itemExcluido, "Solicitações");

        adicionarNotificacao(
            "Solicitação excluída",
            `${itemExcluido.titulo} foi removida do sistema.`,
            "Solicitação"
        );
    }

    carregarSolicitacoes();
}

function limparFormularioSolicitacao() {
    if (formSolicitacao) {
        formSolicitacao.reset();
    }

    latitudeInput.value = "";
    longitudeInput.value = "";

    const status = document.getElementById("status");

    if (status) {
        status.value = "Pendente";
    }
}

function carregarSolicitacoes() {
    if (!listaSolicitacoes) return;

    const solicitacoes = buscarSolicitacoes();

    listaSolicitacoes.innerHTML = "";

    const termo =
    pesquisa ? pesquisa.value.toLowerCase() : "";

    const filtradas =
    solicitacoes.filter(item => {
        const textoBusca =
        `
        ${item.titulo || ""}
        ${item.solicitante || ""}
        ${item.setor || ""}
        ${item.contato || ""}
        ${item.data || ""}
        ${item.hora || ""}
        ${item.local || ""}
        ${item.equipeCobertura ? item.equipeCobertura.join(" ") : ""}
        ${item.prioridade || ""}
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

        if (item.status === "Pendente") statusClass = "pendente";
        if (item.status === "Andamento") statusClass = "andamento";
        if (item.status === "Concluído") statusClass = "concluido";

        const linkMapa =
        item.latitude && item.longitude
        ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
        : "#";

        const equipe =
        item.equipeCobertura && item.equipeCobertura.length
        ? item.equipeCobertura.join(", ")
        : "Não definida";

        const anexos =
        item.anexos && item.anexos.length
        ? item.anexos.map(anexo => anexo.nome).join(", ")
        : "Nenhum anexo";

        listaSolicitacoes.innerHTML += `
            <div class="solicitacao-card">

                <h3>${item.titulo}</h3>

                <div class="solicitacao-info">

                    <p><strong>Solicitante:</strong> ${item.solicitante}</p>

                    <p><strong>Setor:</strong> ${item.setor || "Não informado"}</p>

                    <p><strong>Contato:</strong> ${item.contato || "Não informado"}</p>

                    <p><strong>Data:</strong> ${item.data || "Não informada"}</p>

                    <p><strong>Hora:</strong> ${item.hora || "Não informada"}</p>

                    <p><strong>Local:</strong> ${item.local || "Não informado"}</p>

                    <p><strong>Equipe da Cobertura:</strong> ${equipe}</p>

                    <p><strong>Prioridade:</strong> ${item.prioridade || "Não informada"}</p>

                    <p><strong>Anexos:</strong> ${anexos}</p>

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

                    <button class="agenda-btn" onclick="gerarEventoAgenda(${item.id})">
                        <i class="fas fa-calendar-plus"></i>
                        Gerar Evento
                    </button>

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

document
.querySelectorAll(".filtro-btn")
.forEach(btn => {
    btn.addEventListener("click", () => {
        document
        .querySelectorAll(".filtro-btn")
        .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        filtroAtual = btn.dataset.status;

        carregarSolicitacoes();
    });
});

window.gerarEventoAgenda = gerarEventoAgenda;
window.excluirSolicitacao = excluirSolicitacao;

carregarSolicitacoes();