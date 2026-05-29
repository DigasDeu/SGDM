const modal = document.getElementById("modalSolicitacao");
const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const formSolicitacao = document.getElementById("formSolicitacao");
const listaSolicitacoes = document.getElementById("listaSolicitacoes");
const pesquisa = document.getElementById("pesquisaSolicitacao");

let filtroAtual = "Todos";

let mapaSolicitacao = null;
let marcadorSolicitacao = null;
let geocoder = null;

function buscarSolicitacoes() {
    return JSON.parse(localStorage.getItem("solicitacoes")) || [];
}

function salvarSolicitacoes(solicitacoes) {
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
}

function buscarLista(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function adicionarNotificacao(titulo, descricao, tipo = "Solicitação") {
    const notificacoes = buscarLista("notificacoes");

    notificacoes.unshift({
        id: Date.now(),
        titulo,
        descricao,
        tipo,
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    salvarLista("notificacoes", notificacoes);
}

function adicionarHistoricoExclusao(item, origem) {
    const historico = buscarLista("historicoExclusoes");

    historico.unshift({
        id: Date.now(),
        origem,
        item,
        dataExclusao: new Date().toLocaleString("pt-BR")
    });

    salvarLista("historicoExclusoes", historico);
}

/* GOOGLE MAPS */

function iniciarMapaSolicitacao() {
    const mapaElemento = document.getElementById("mapaSolicitacao");

    if (!mapaElemento || !window.google) return;

    const maues = {
        lat: -3.3836,
        lng: -57.7186
    };

    geocoder = new google.maps.Geocoder();

    mapaSolicitacao = new google.maps.Map(mapaElemento, {
        center: maues,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });

    marcadorSolicitacao = new google.maps.Marker({
        position: maues,
        map: mapaSolicitacao,
        draggable: true
    });

    preencherCoordenadas(maues.lat, maues.lng);

    mapaSolicitacao.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        marcadorSolicitacao.setPosition(event.latLng);
        preencherCoordenadas(lat, lng);
        buscarEnderecoPorCoordenadas(lat, lng);
    });

    marcadorSolicitacao.addListener("dragend", () => {
        const posicao = marcadorSolicitacao.getPosition();

        const lat = posicao.lat();
        const lng = posicao.lng();

        preencherCoordenadas(lat, lng);
        buscarEnderecoPorCoordenadas(lat, lng);
    });
}

function preencherCoordenadas(lat, lng) {
    const latitude = document.getElementById("latitude");
    const longitude = document.getElementById("longitude");

    if (latitude) latitude.value = lat;
    if (longitude) longitude.value = lng;
}

function buscarEnderecoPorCoordenadas(lat, lng) {
    if (!geocoder) return;

    geocoder.geocode(
        {
            location: {
                lat,
                lng
            }
        },
        (results, status) => {
            if (status === "OK" && results[0]) {
                document.getElementById("local").value =
                results[0].formatted_address;
            }
        }
    );
}

function buscarLocalNoMapa() {
    const endereco = document.getElementById("local").value.trim();

    if (!endereco) {
        alert("Digite o local para buscar no mapa.");
        return;
    }

    if (!geocoder || !mapaSolicitacao || !marcadorSolicitacao) {
        alert("Mapa ainda não carregou.");
        return;
    }

    geocoder.geocode(
        {
            address: `${endereco}, Maués, Amazonas, Brasil`
        },
        (results, status) => {
            if (status === "OK" && results[0]) {
                const posicao = results[0].geometry.location;

                mapaSolicitacao.setCenter(posicao);
                mapaSolicitacao.setZoom(17);

                marcadorSolicitacao.setPosition(posicao);

                preencherCoordenadas(posicao.lat(), posicao.lng());

                document.getElementById("local").value =
                results[0].formatted_address;
            } else {
                alert("Local não encontrado. Tente escrever de outra forma.");
            }
        }
    );
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

            const localAtual = {
                lat,
                lng
            };

            mapaSolicitacao.setCenter(localAtual);
            mapaSolicitacao.setZoom(17);

            marcadorSolicitacao.setPosition(localAtual);

            preencherCoordenadas(lat, lng);
            buscarEnderecoPorCoordenadas(lat, lng);
        },
        () => {
            alert("Não foi possível obter sua localização.");
        }
    );
}

/* MODAL */

if (abrirModal) {
    abrirModal.addEventListener("click", () => {
        modal.classList.add("active");

        setTimeout(() => {
            if (mapaSolicitacao) {
                google.maps.event.trigger(mapaSolicitacao, "resize");
            }
        }, 300);
    });
}

if (fecharModal) {
    fecharModal.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });
}

const buscarEnderecoBtn = document.getElementById("buscarEndereco");
const usarLocalizacaoBtn = document.getElementById("usarLocalizacao");

if (buscarEnderecoBtn) {
    buscarEnderecoBtn.addEventListener("click", buscarLocalNoMapa);
}

if (usarLocalizacaoBtn) {
    usarLocalizacaoBtn.addEventListener("click", usarMinhaLocalizacao);
}

/* FORM */

if (formSolicitacao) {
    formSolicitacao.addEventListener("submit", (event) => {
        event.preventDefault();

        const titulo = document.getElementById("titulo").value.trim();
        const solicitante = document.getElementById("solicitante").value.trim();
        const contato = document.getElementById("contato").value.trim();
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;
        const local = document.getElementById("local").value.trim();
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;
        const status = document.getElementById("status").value;
        const responsavel = document.getElementById("responsavel").value.trim();

        let descricao = document.getElementById("descricao").value.trim();

        if (!titulo || !solicitante || !data || !hora || !local || !latitude || !longitude) {
            alert("Preencha os campos obrigatórios e marque a localização no mapa.");
            return;
        }

        if (!descricao) {
            descricao =
            `A solicitação "${titulo}" ocorrerá no dia ${data}, às ${hora}, no local ${local}.`;
        }

        const solicitacoes = buscarSolicitacoes();

        const novaSolicitacao = {
            id: Date.now(),
            titulo,
            solicitante,
            contato,
            data,
            hora,
            local,
            latitude,
            longitude,
            status,
            responsavel: responsavel || "Departamento de Mídia",
            descricao,
            origem: "Solicitações",
            criadoEm: new Date().toLocaleString("pt-BR")
        };

        solicitacoes.push(novaSolicitacao);

        salvarSolicitacoes(solicitacoes);

        adicionarNotificacao(
            "Nova Solicitação",
            `${novaSolicitacao.titulo} • ${novaSolicitacao.data} • ${novaSolicitacao.local}`,
            "Solicitação"
        );

        carregarSolicitacoes();

        formSolicitacao.reset();

        modal.classList.remove("active");
    });
}

/* GERAR EVENTO NA AGENDA */

function gerarEventoAgenda(id) {
    const solicitacoes = buscarSolicitacoes();
    const eventos = buscarLista("eventos");

    const solicitacao = solicitacoes.find(item => item.id === id);

    if (!solicitacao) {
        alert("Solicitação não encontrada.");
        return;
    }

    const jaExiste = eventos.some(evento => evento.solicitacaoId === id);

    if (jaExiste) {
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
        latitude: solicitacao.latitude,
        longitude: solicitacao.longitude,
        responsavel: solicitacao.responsavel || "Departamento de Mídia",
        descricao: solicitacao.descricao || "",
        origem: "Solicitação",
        status: "Pendente",
        criadoEm: new Date().toLocaleString("pt-BR")
    };

    eventos.push(novoEvento);

    salvarLista("eventos", eventos);

    adicionarNotificacao(
        "Evento gerado pela solicitação",
        `${novoEvento.titulo} foi enviado para a agenda.`,
        "Agenda"
    );

    alert("Evento enviado para a agenda com sucesso.");
}

/* EXCLUIR */

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

/* LISTAGEM */

function carregarSolicitacoes() {
    if (!listaSolicitacoes) return;

    const solicitacoes = buscarSolicitacoes();
    const termo = pesquisa ? pesquisa.value.toLowerCase() : "";

    const filtradas = solicitacoes.filter(item => {
        const texto = `
            ${item.titulo || ""}
            ${item.solicitante || ""}
            ${item.contato || ""}
            ${item.data || ""}
            ${item.hora || ""}
            ${item.local || ""}
            ${item.status || ""}
            ${item.responsavel || ""}
            ${item.descricao || ""}
        `.toLowerCase();

        const matchPesquisa = texto.includes(termo);

        const matchFiltro =
        filtroAtual === "Todos" ||
        item.status === filtroAtual;

        return matchPesquisa && matchFiltro;
    });

    if (filtradas.length === 0) {
        listaSolicitacoes.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    Nenhuma solicitação encontrada.
                </td>
            </tr>
        `;
        return;
    }

    listaSolicitacoes.innerHTML = "";

    filtradas
    .slice()
    .reverse()
    .forEach(item => {

        const statusClass =
        item.status === "Pendente"
        ? "status-pendente"
        : item.status === "Andamento"
        ? "status-andamento"
        : "status-concluido";

        const linkMapa =
        item.latitude && item.longitude
        ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
        : "#";

        listaSolicitacoes.innerHTML += `
            <tr>
                <td>
                    ${item.titulo}
                    <span class="sol-subtext">
                        ${item.responsavel || "Departamento de Mídia"}
                    </span>
                </td>

                <td>
                    ${item.solicitante}
                    <span class="sol-subtext">
                        ${item.contato || "Sem contato"}
                    </span>
                </td>

                <td>
                    ${item.data || "Sem data"}
                    <span class="sol-subtext">
                        ${item.hora || "Sem horário"}
                    </span>
                </td>

                <td>
                    ${item.local || "Não informado"}
                </td>

                <td>
                    <span class="badge-status ${statusClass}">
                        ${item.status}
                    </span>
                </td>

                <td>
                    <div class="action-group">

                        <button class="action-btn agenda" onclick="gerarEventoAgenda(${item.id})" title="Enviar para agenda">
                            <i class="fas fa-calendar-plus"></i>
                        </button>

                        ${
                            item.latitude && item.longitude
                            ? `
                            <a class="action-btn map" href="${linkMapa}" target="_blank" title="Abrir no Maps">
                                <i class="fas fa-location-dot"></i>
                            </a>
                            `
                            : ""
                        }

                        <button class="action-btn delete" onclick="excluirSolicitacao(${item.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>

                    </div>
                </td>
            </tr>
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

window.iniciarMapaSolicitacao = iniciarMapaSolicitacao;
window.gerarEventoAgenda = gerarEventoAgenda;
window.excluirSolicitacao = excluirSolicitacao;

carregarSolicitacoes();