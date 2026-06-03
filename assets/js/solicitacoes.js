import {
    adicionarDocumento,
    excluirDocumento,
    observarColecao
} from "./db.js";

const modal = document.getElementById("modalSolicitacao");
const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const formSolicitacao = document.getElementById("formSolicitacao");
const listaSolicitacoes = document.getElementById("listaSolicitacoes");
const pesquisa = document.getElementById("pesquisaSolicitacao");

let filtroAtual = "Todos";

let mapaSolicitacao = null;
let marcadorSolicitacao = null;

let solicitacoesOnline = [];
let funcionariosOnline = [];

/* ==========================================
   LOCALSTORAGE
========================================== */

function buscarLista(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function buscarUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || {};
}

function buscarSolicitacoes() {
    if (solicitacoesOnline.length > 0) {
        return solicitacoesOnline;
    }

    return buscarLista("solicitacoes");
}

function salvarSolicitacoes(solicitacoes) {
    salvarLista("solicitacoes", solicitacoes);
}

/* ==========================================
   FIRESTORE - TEMPO REAL
========================================== */

function iniciarEscutaSolicitacoesFirestore() {
    try {
        observarColecao("solicitacoes", (dados) => {
            solicitacoesOnline = dados;

            salvarLista("solicitacoes", dados);

            carregarSolicitacoes();
        });
    }
    catch (error) {
        console.log("Erro ao observar solicitações no Firestore:", error);
    }
}

function iniciarEscutaFuncionariosFirestore() {
    try {
        observarColecao("funcionariosSistema", (dados) => {
            funcionariosOnline = dados;

            salvarLista("funcionariosSistema", dados);

            carregarResponsaveisMidia();
        });
    }
    catch (error) {
        console.log("Erro ao observar funcionários no Firestore:", error);
    }
}

/* ==========================================
   EQUIPE DE MÍDIA - SOMENTE CADASTRADOS
========================================== */

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

function carregarResponsaveisMidia() {

    const selectResponsavel =
    document.getElementById("responsavel");

    if (!selectResponsavel) return;

    const equipe =
    buscarEquipeMidia();

    selectResponsavel.innerHTML = `
        <option value="">Selecione o responsável pela cobertura</option>
    `;

    if (equipe.length === 0) {
        selectResponsavel.innerHTML += `
            <option value="" disabled>
                Nenhuma pessoa da mídia cadastrada
            </option>
        `;
        return;
    }

    equipe.forEach(pessoa => {

        const idPessoa =
        pessoa.idFirebase ||
        pessoa.id ||
        pessoa.uid ||
        pessoa.email ||
        "";

        selectResponsavel.innerHTML += `
            <option
                value="${idPessoa}"
                data-nome="${pessoa.nome || ""}"
                data-email="${pessoa.email || ""}">
                ${pessoa.nome || "Sem nome"}
            </option>
        `;
    });
}

function obterResponsavelSelecionado() {

    const selectResponsavel =
    document.getElementById("responsavel");

    if (!selectResponsavel) {
        return {
            id: "",
            nome: "",
            email: ""
        };
    }

    const option =
    selectResponsavel.options[selectResponsavel.selectedIndex];

    return {
        id: selectResponsavel.value || "",
        nome: option ? option.dataset.nome || "" : "",
        email: option ? option.dataset.email || "" : ""
    };
}

/* ==========================================
   NOTIFICAÇÕES E HISTÓRICO
========================================== */

function adicionarNotificacao(titulo, descricao, tipo = "Solicitação") {

    const notificacoes =
    buscarLista("notificacoes");

    const novaNotificacao = {
        id: Date.now(),
        titulo,
        descricao,
        tipo,
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    };

    notificacoes.unshift(novaNotificacao);

    salvarLista("notificacoes", notificacoes);

    adicionarDocumento("notificacoes", novaNotificacao)
    .catch(error => {
        console.log("Erro ao salvar notificação no Firestore:", error);
    });
}

function adicionarHistoricoExclusao(item, origem) {

    const historico =
    buscarLista("historicoExclusoes");

    const novoHistorico = {
        id: Date.now(),
        origem,
        item,
        dataExclusao: new Date().toLocaleString("pt-BR")
    };

    historico.unshift(novoHistorico);

    salvarLista("historicoExclusoes", historico);
}

/* ==========================================
   MODAL
========================================== */

function abrirModalSolicitacao() {

    if (!modal) return;

    modal.classList.add("active");

    carregarResponsaveisMidia();

    setTimeout(() => {

        if (!mapaSolicitacao) {
            iniciarMapaSolicitacao();
        }
        else {
            mapaSolicitacao.invalidateSize();
        }

    }, 300);
}

function fecharModalSolicitacao() {

    if (!modal) return;

    modal.classList.remove("active");
}

if (abrirModal) {
    abrirModal.addEventListener("click", () => {
        abrirModalSolicitacao();
    });
}

if (fecharModal) {
    fecharModal.addEventListener("click", () => {
        fecharModalSolicitacao();
    });
}

if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            fecharModalSolicitacao();
        }
    });
}

/* ==========================================
   MAPA GRATUITO - LEAFLET + OPENSTREETMAP
========================================== */

function iniciarMapaSolicitacao() {

    const mapaElemento =
    document.getElementById("mapaSolicitacao");

    if (!mapaElemento) return;

    if (typeof L === "undefined") {
        console.log("Leaflet ainda não carregou.");
        return;
    }

    const maues = [-3.3836, -57.7186];

    mapaSolicitacao =
    L.map("mapaSolicitacao", {
        dragging: true,
        tap: false,
        scrollWheelZoom: false
    }).setView(maues, 15);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "© OpenStreetMap",
            maxZoom: 19
        }
    ).addTo(mapaSolicitacao);

    marcadorSolicitacao =
    L.marker(maues, {
        draggable: true
    }).addTo(mapaSolicitacao);

    preencherCoordenadas(
        maues[0],
        maues[1]
    );

    mapaSolicitacao.on("click", (event) => {

        const lat = event.latlng.lat;
        const lng = event.latlng.lng;

        marcadorSolicitacao.setLatLng([lat, lng]);

        preencherCoordenadas(lat, lng);

        buscarEnderecoPorCoordenadas(lat, lng);
    });

    marcadorSolicitacao.on("dragend", () => {

        const posicao =
        marcadorSolicitacao.getLatLng();

        preencherCoordenadas(
            posicao.lat,
            posicao.lng
        );

        buscarEnderecoPorCoordenadas(
            posicao.lat,
            posicao.lng
        );
    });

    setTimeout(() => {
        mapaSolicitacao.invalidateSize();
    }, 500);
}

function preencherCoordenadas(lat, lng) {

    const latitude =
    document.getElementById("latitude");

    const longitude =
    document.getElementById("longitude");

    if (latitude) {
        latitude.value = lat;
    }

    if (longitude) {
        longitude.value = lng;
    }
}

async function buscarEnderecoPorCoordenadas(lat, lng) {

    const local =
    document.getElementById("local");

    try {

        const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

        const resposta =
        await fetch(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        const dados =
        await resposta.json();

        if (dados.display_name && local) {
            local.value = dados.display_name;
        }

    } catch (error) {
        console.log("Erro ao buscar endereço:", error);
    }
}

async function buscarLocalNoMapa() {

    const local =
    document.getElementById("local");

    if (!local) return;

    const endereco =
    local.value.trim();

    if (!endereco) {
        alert("Digite o local para buscar no mapa.");
        return;
    }

    if (!mapaSolicitacao || !marcadorSolicitacao) {
        alert("Mapa ainda não carregou.");
        return;
    }

    try {

        const query =
        encodeURIComponent(`${endereco}, Maués, Amazonas, Brasil`);

        const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${query}&limit=1`;

        const resposta =
        await fetch(url, {
            headers: {
                "Accept": "application/json"
            }
        });

        const dados =
        await resposta.json();

        if (!dados.length) {
            alert("Local não encontrado. Tente escrever de outra forma.");
            return;
        }

        const resultado =
        dados[0];

        const lat =
        parseFloat(resultado.lat);

        const lng =
        parseFloat(resultado.lon);

        mapaSolicitacao.setView([lat, lng], 17);

        marcadorSolicitacao.setLatLng([lat, lng]);

        preencherCoordenadas(lat, lng);

        local.value =
        resultado.display_name;

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

    if (!mapaSolicitacao || !marcadorSolicitacao) {
        alert("Mapa ainda não carregou.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {

            const lat =
            posicao.coords.latitude;

            const lng =
            posicao.coords.longitude;

            mapaSolicitacao.setView([lat, lng], 17);

            marcadorSolicitacao.setLatLng([lat, lng]);

            preencherCoordenadas(lat, lng);

            buscarEnderecoPorCoordenadas(lat, lng);
        },
        () => {
            alert("Não foi possível obter sua localização.");
        }
    );
}

const buscarEnderecoBtn =
document.getElementById("buscarEndereco");

const usarLocalizacaoBtn =
document.getElementById("usarLocalizacao");

if (buscarEnderecoBtn) {
    buscarEnderecoBtn.addEventListener("click", buscarLocalNoMapa);
}

if (usarLocalizacaoBtn) {
    usarLocalizacaoBtn.addEventListener("click", usarMinhaLocalizacao);
}

/* ==========================================
   FORMULÁRIO
========================================== */

if (formSolicitacao) {

    formSolicitacao.addEventListener("submit", async (event) => {

        event.preventDefault();

        const titulo =
        document.getElementById("titulo").value.trim();

        const solicitante =
        document.getElementById("solicitante").value.trim();

        const contato =
        document.getElementById("contato").value.trim();

        const data =
        document.getElementById("data").value;

        const hora =
        document.getElementById("hora").value;

        const local =
        document.getElementById("local").value.trim();

        const latitude =
        document.getElementById("latitude").value;

        const longitude =
        document.getElementById("longitude").value;

        const status =
        document.getElementById("status").value;

        const responsavelSelecionado =
        obterResponsavelSelecionado();

        const responsavel =
        responsavelSelecionado.nome;

        let descricao =
        document.getElementById("descricao").value.trim();

        if (
            !titulo ||
            !solicitante ||
            !data ||
            !hora ||
            !local ||
            !latitude ||
            !longitude
        ) {
            alert("Preencha os campos obrigatórios e marque a localização no mapa.");
            return;
        }

        if (!responsavel) {
            alert("Selecione o responsável pela cobertura.");
            return;
        }

        if (!descricao) {
            descricao =
            `A solicitação "${titulo}" ocorrerá no dia ${data}, às ${hora}, no local ${local}.`;
        }

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

            responsavel: responsavel || "Não definido",
            responsavelId: responsavelSelecionado.id || "",
            responsavelEmail: responsavelSelecionado.email || "",

            descricao,
            origem: "Solicitações",
            criadoEm: new Date().toLocaleString("pt-BR")
        };

        try {

            const idFirebase =
            await adicionarDocumento(
                "solicitacoes",
                novaSolicitacao
            );

            novaSolicitacao.idFirebase =
            idFirebase;

            const solicitacoes =
            buscarLista("solicitacoes");

            solicitacoes.push(novaSolicitacao);

            salvarSolicitacoes(solicitacoes);

            adicionarNotificacao(
                "Nova Solicitação",
                `${novaSolicitacao.titulo} • ${novaSolicitacao.data} • Responsável: ${novaSolicitacao.responsavel}`,
                "Solicitação"
            );

            carregarSolicitacoes();

            formSolicitacao.reset();

            carregarResponsaveisMidia();

            const latitudeInput =
            document.getElementById("latitude");

            const longitudeInput =
            document.getElementById("longitude");

            if (latitudeInput) {
                latitudeInput.value = "";
            }

            if (longitudeInput) {
                longitudeInput.value = "";
            }

            fecharModalSolicitacao();

            alert("Solicitação salva no banco de dados com sucesso.");

        } catch (error) {

            console.log("Erro ao salvar solicitação no Firestore:", error);

            alert("Erro ao salvar no banco de dados. Verifique as regras do Firestore.");
        }
    });
}

/* ==========================================
   GERAR EVENTO NA AGENDA
========================================== */

async function gerarEventoAgenda(id) {

    const solicitacoes =
    buscarSolicitacoes();

    const eventos =
    buscarLista("eventos");

    const solicitacao =
    solicitacoes.find(item =>
        String(item.id) === String(id) ||
        String(item.idFirebase) === String(id)
    );

    if (!solicitacao) {
        alert("Solicitação não encontrada.");
        return;
    }

    const jaExiste =
    eventos.some(evento =>
        String(evento.solicitacaoId) === String(solicitacao.id) ||
        String(evento.solicitacaoFirebaseId || "") === String(solicitacao.idFirebase || "")
    );

    if (jaExiste) {
        alert("Essa solicitação já foi enviada para a agenda.");
        return;
    }

    const novoEvento = {
        id: Date.now(),

        solicitacaoId: solicitacao.id || "",
        solicitacaoFirebaseId: solicitacao.idFirebase || "",

        titulo: solicitacao.titulo,
        tipo: "Cobertura de Mídia",

        data: solicitacao.data,
        hora: solicitacao.hora,
        local: solicitacao.local,
        latitude: solicitacao.latitude,
        longitude: solicitacao.longitude,

        responsavel: solicitacao.responsavel || "Não definido",
        responsavelId: solicitacao.responsavelId || "",
        responsavelEmail: solicitacao.responsavelEmail || "",

        descricao: solicitacao.descricao || "",
        origem: "Solicitação",
        status: "Pendente",
        criadoEm: new Date().toLocaleString("pt-BR")
    };

    try {

        const idFirebase =
        await adicionarDocumento(
            "eventos",
            novoEvento
        );

        novoEvento.idFirebase =
        idFirebase;

        eventos.push(novoEvento);

        salvarLista("eventos", eventos);

        adicionarNotificacao(
            "Evento gerado pela solicitação",
            `${novoEvento.titulo} foi enviado para a agenda. Responsável: ${novoEvento.responsavel}`,
            "Agenda"
        );

        alert("Evento enviado para a agenda e salvo no banco de dados com sucesso.");

    } catch (error) {

        console.log("Erro ao salvar evento no Firestore:", error);

        alert("Erro ao enviar para agenda no banco de dados.");
    }
}

/* ==========================================
   EXCLUIR
========================================== */

async function excluirSolicitacao(id) {

    const confirmar =
    confirm("Tem certeza que deseja excluir esta solicitação?");

    if (!confirmar) return;

    let solicitacoes =
    buscarSolicitacoes();

    const itemExcluido =
    solicitacoes.find(item =>
        String(item.id) === String(id) ||
        String(item.idFirebase) === String(id)
    );

    if (!itemExcluido) {
        alert("Solicitação não encontrada.");
        return;
    }

    solicitacoes =
    solicitacoes.filter(item =>
        String(item.id) !== String(id) &&
        String(item.idFirebase) !== String(id)
    );

    salvarSolicitacoes(solicitacoes);

    if (itemExcluido.idFirebase) {
        try {
            await excluirDocumento(
                "solicitacoes",
                itemExcluido.idFirebase
            );
        }
        catch (error) {
            console.log("Erro ao excluir no Firestore:", error);
        }
    }

    adicionarHistoricoExclusao(
        itemExcluido,
        "Solicitações"
    );

    adicionarNotificacao(
        "Solicitação excluída",
        `${itemExcluido.titulo} foi removida do sistema.`,
        "Solicitação"
    );

    carregarSolicitacoes();
}

/* ==========================================
   LISTAGEM
========================================== */

function carregarSolicitacoes() {

    if (!listaSolicitacoes) return;

    const solicitacoes =
    buscarSolicitacoes();

    const termo =
    pesquisa ? pesquisa.value.toLowerCase() : "";

    const filtradas =
    solicitacoes.filter(item => {

        const texto = `
            ${item.titulo || ""}
            ${item.solicitante || ""}
            ${item.contato || ""}
            ${item.data || ""}
            ${item.hora || ""}
            ${item.local || ""}
            ${item.status || ""}
            ${item.responsavel || ""}
            ${item.responsavelEmail || ""}
            ${item.descricao || ""}
        `.toLowerCase();

        const matchPesquisa =
        texto.includes(termo);

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

        const idAcao =
        item.idFirebase || item.id;

        listaSolicitacoes.innerHTML += `
            <tr>

                <td>
                    ${item.titulo}
                    <span class="sol-subtext">
                        Responsável: ${item.responsavel || "Não definido"}
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

                        <button class="action-btn agenda" onclick="gerarEventoAgenda('${idAcao}')" title="Enviar para agenda">
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

                        <button class="action-btn delete" onclick="excluirSolicitacao('${idAcao}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>

                    </div>
                </td>

            </tr>
        `;
    });
}

/* ==========================================
   FILTROS
========================================== */

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

        filtroAtual =
        btn.dataset.status;

        carregarSolicitacoes();
    });
});

/* ==========================================
   FUNÇÕES GLOBAIS
========================================== */

window.gerarEventoAgenda = gerarEventoAgenda;
window.excluirSolicitacao = excluirSolicitacao;

/* ==========================================
   INICIALIZAÇÃO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    carregarResponsaveisMidia();

    carregarSolicitacoes();

    iniciarEscutaFuncionariosFirestore();

    iniciarEscutaSolicitacoesFirestore();
});