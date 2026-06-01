const formLocal =
document.getElementById("formLocal");

const voltarBtn =
document.getElementById("voltarBtn");

const limparBtn =
document.getElementById("limparBtn");

const pesquisaLocal =
document.getElementById("pesquisaLocal");

const listaLocais =
document.getElementById("listaLocais");

let mapaCadastroLocal = null;
let marcadorCadastroLocal = null;

function buscarLista(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function normalizarSigla(sigla) {
    return String(sigla || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 4);
}

function normalizarTextoCodigo(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 4);
}

function obterPrefixoCodigo(classificacaoLocal, tipoRegistro, siglaLocal, unidadeVinculada) {

    const sigla =
    normalizarSigla(siglaLocal);

    const siglaUnidade =
    normalizarTextoCodigo(unidadeVinculada);

    if (classificacaoLocal === "Unidade base") {

        if (tipoRegistro === "UBS") {
            return `UBS${sigla || "XX"}`;
        }

        if (tipoRegistro === "UBS Fluvial") {
            return `UBSF${sigla || "FL"}`;
        }

        if (tipoRegistro === "Hospital") {
            return `HOSP${sigla || "SAU"}`;
        }

        if (tipoRegistro === "Centro Especializado") {
            return `CENT${sigla || "ESP"}`;
        }

        if (tipoRegistro === "Setor Administrativo") {
            return `ADM${sigla || "SEMS"}`;
        }

        if (tipoRegistro === "Unidade de saúde") {
            return `UNID${sigla || "SAU"}`;
        }

        return `UNID${sigla || "SAU"}`;
    }

    if (classificacaoLocal === "Setor de unidade") {
        return `SET${sigla || siglaUnidade || "UNID"}`;
    }

    if (classificacaoLocal === "Local vinculado") {

        if (tipoRegistro === "Domicílio urbano") {
            return "DOMURB";
        }

        if (tipoRegistro === "Propriedade urbana") {
            return "PROPURB";
        }

        if (tipoRegistro === "Domicílio e propriedade") {
            return "DOMPROP";
        }

        if (tipoRegistro === "Prédio público") {
            return "PREDPUB";
        }

        if (tipoRegistro === "Local de ação") {
            return "LOCACAO";
        }

        if (tipoRegistro === "Ponto de apoio") {
            return "APOIO";
        }

        return `LOC${sigla || siglaUnidade || ""}`;
    }

    if (tipoRegistro === "UBS") {
        return `UBS${sigla || "XX"}`;
    }

    if (tipoRegistro === "Domicílio urbano") {
        return "DOMURB";
    }

    if (tipoRegistro === "Propriedade urbana") {
        return "PROPURB";
    }

    if (tipoRegistro === "Domicílio e propriedade") {
        return "DOMPROP";
    }

    return `LOC${sigla || ""}`;
}

function gerarCodigoLocal() {

    const classificacaoLocal =
    document.getElementById("classificacaoLocal").value;

    const tipoRegistro =
    document.getElementById("tipoRegistro").value;

    const siglaLocal =
    document.getElementById("siglaLocal").value;

    const unidadeVinculada =
    document.getElementById("unidadeVinculada").value;

    const locais =
    buscarLista("locaisSistema");

    const ano =
    new Date().getFullYear();

    const prefixo =
    obterPrefixoCodigo(
        classificacaoLocal,
        tipoRegistro,
        siglaLocal,
        unidadeVinculada
    );

    const quantidadeComMesmoPrefixo =
    locais.filter(local =>
        local.codigoLocal &&
        local.codigoLocal.startsWith(`${prefixo}-${ano}`)
    ).length;

    const proximoNumero =
    quantidadeComMesmoPrefixo + 1;

    const numeroFormatado =
    String(proximoNumero).padStart(4, "0");

    return `${prefixo}-${ano}-${numeroFormatado}`;
}

function atualizarCodigoLocal() {

    const codigoLocal =
    document.getElementById("codigoLocal");

    const classificacaoLocal =
    document.getElementById("classificacaoLocal").value;

    const tipoRegistro =
    document.getElementById("tipoRegistro").value;

    if (!codigoLocal || !classificacaoLocal || !tipoRegistro) {
        if (codigoLocal) codigoLocal.value = "";
        return;
    }

    codigoLocal.value =
    gerarCodigoLocal();
}

function iniciarMapaCadastroLocal() {

    const mapaElemento =
    document.getElementById("mapaCadastroLocal");

    if (!mapaElemento) return;

    if (typeof L === "undefined") {
        console.log("Leaflet não carregou.");
        return;
    }

    const maues =
    [-3.3836, -57.7186];

    mapaCadastroLocal =
    L.map("mapaCadastroLocal", {
        dragging:true,
        tap:false,
        scrollWheelZoom:false
    }).setView(maues, 15);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:"© OpenStreetMap",
            maxZoom:19
        }
    ).addTo(mapaCadastroLocal);

    marcadorCadastroLocal =
    L.marker(maues, {
        draggable:true
    }).addTo(mapaCadastroLocal);

    preencherCoordenadas(
        maues[0],
        maues[1]
    );

    mapaCadastroLocal.on("click", (event) => {

        const lat =
        event.latlng.lat;

        const lng =
        event.latlng.lng;

        marcadorCadastroLocal.setLatLng([lat, lng]);

        preencherCoordenadas(lat, lng);

        buscarEnderecoPorCoordenadas(lat, lng);
    });

    marcadorCadastroLocal.on("dragend", () => {

        const posicao =
        marcadorCadastroLocal.getLatLng();

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
        mapaCadastroLocal.invalidateSize();
    }, 400);
}

function preencherCoordenadas(lat, lng) {

    const latitudeLocal =
    document.getElementById("latitudeLocal");

    const longitudeLocal =
    document.getElementById("longitudeLocal");

    if (latitudeLocal) {
        latitudeLocal.value = lat;
    }

    if (longitudeLocal) {
        longitudeLocal.value = lng;
    }
}

async function buscarEnderecoPorCoordenadas(lat, lng) {

    try {

        const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

        const resposta =
        await fetch(url, {
            headers:{
                "Accept":"application/json"
            }
        });

        const dados =
        await resposta.json();

        if (!dados.address) return;

        const endereco =
        document.getElementById("enderecoLocal");

        const bairro =
        document.getElementById("bairroLocal");

        const numero =
        document.getElementById("numeroLocal");

        const referencia =
        document.getElementById("referenciaLocal");

        if (endereco && dados.address.road) {
            endereco.value = dados.address.road;
        }

        if (bairro) {
            bairro.value =
            dados.address.suburb ||
            dados.address.neighbourhood ||
            dados.address.city_district ||
            bairro.value;
        }

        if (numero && dados.address.house_number) {
            numero.value =
            dados.address.house_number;
        }

        if (referencia && dados.display_name) {
            referencia.value =
            dados.display_name;
        }

    } catch (error) {
        console.log("Erro ao buscar endereço:", error);
    }
}

async function buscarLocalNoMapa() {

    const buscaMapa =
    document.getElementById("buscaMapa");

    const endereco =
    buscaMapa.value.trim();

    if (!endereco) {
        alert("Digite um endereço, bairro ou ponto de referência.");
        return;
    }

    if (!mapaCadastroLocal || !marcadorCadastroLocal) {
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
            headers:{
                "Accept":"application/json"
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

        mapaCadastroLocal.setView(
            [lat, lng],
            17
        );

        marcadorCadastroLocal.setLatLng(
            [lat, lng]
        );

        preencherCoordenadas(
            lat,
            lng
        );

        buscarEnderecoPorCoordenadas(
            lat,
            lng
        );

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

    if (!mapaCadastroLocal || !marcadorCadastroLocal) {
        alert("Mapa ainda não carregou.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (posicao) => {

            const lat =
            posicao.coords.latitude;

            const lng =
            posicao.coords.longitude;

            mapaCadastroLocal.setView(
                [lat, lng],
                17
            );

            marcadorCadastroLocal.setLatLng(
                [lat, lng]
            );

            preencherCoordenadas(
                lat,
                lng
            );

            buscarEnderecoPorCoordenadas(
                lat,
                lng
            );
        },
        () => {
            alert("Não foi possível obter sua localização.");
        }
    );
}

function validarVinculo(classificacaoLocal, unidadeVinculada) {

    if (
        classificacaoLocal === "Setor de unidade" &&
        !unidadeVinculada
    ) {
        alert("Setor de unidade precisa ter uma unidade vinculada.");
        return false;
    }

    if (
        classificacaoLocal === "Local vinculado" &&
        !unidadeVinculada
    ) {
        alert("Local vinculado precisa informar a unidade de referência.");
        return false;
    }

    return true;
}

function salvarLocal(event) {

    event.preventDefault();

    const codigoLocal =
    document.getElementById("codigoLocal").value.trim();

    const classificacaoLocal =
    document.getElementById("classificacaoLocal").value;

    const tipoRegistro =
    document.getElementById("tipoRegistro").value;

    const nomeLocal =
    document.getElementById("nomeLocal").value.trim();

    const siglaLocal =
    document.getElementById("siglaLocal").value.trim();

    const statusLocal =
    document.getElementById("statusLocal").value;

    const zonaLocal =
    document.getElementById("zonaLocal").value;

    const responsavelLocal =
    document.getElementById("responsavelLocal").value.trim();

    const telefoneResponsavel =
    document.getElementById("telefoneResponsavel").value.trim();

    const unidadeVinculada =
    document.getElementById("unidadeVinculada").value;

    const endereco =
    document.getElementById("enderecoLocal").value.trim();

    const bairro =
    document.getElementById("bairroLocal").value.trim();

    const numero =
    document.getElementById("numeroLocal").value.trim();

    const complemento =
    document.getElementById("complementoLocal").value.trim();

    const referencia =
    document.getElementById("referenciaLocal").value.trim();

    const latitude =
    document.getElementById("latitudeLocal").value;

    const longitude =
    document.getElementById("longitudeLocal").value;

    const observacoes =
    document.getElementById("observacoesLocal").value.trim();

    if (
        !codigoLocal ||
        !classificacaoLocal ||
        !tipoRegistro ||
        !nomeLocal ||
        !endereco ||
        !bairro
    ) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    if (!validarVinculo(classificacaoLocal, unidadeVinculada)) {
        return;
    }

    const locais =
    buscarLista("locaisSistema");

    const codigoExiste =
    locais.some(local =>
        local.codigoLocal === codigoLocal
    );

    if (codigoExiste) {
        alert("Este código de local já existe. Altere o tipo/sigla ou atualize a página.");
        return;
    }

    const novoLocal = {
        id: Date.now(),

        codigoLocal,
        classificacaoLocal,
        tipoRegistro,

        ehUnidadeBase:
        classificacaoLocal === "Unidade base",

        ehSetorUnidade:
        classificacaoLocal === "Setor de unidade",

        ehLocalVinculado:
        classificacaoLocal === "Local vinculado",

        nomeLocal,
        nome: nomeLocal,
        siglaLocal: normalizarSigla(siglaLocal),

        responsavelLocal,
        telefoneResponsavel,

        unidadeVinculada,

        endereco,
        bairro,
        numero,
        complemento,
        referencia,

        zona: zonaLocal,
        latitude,
        longitude,

        status: statusLocal,
        observacoes,

        origem: "Cadastro de Local",
        criadoEm: new Date().toLocaleString("pt-BR"),
        atualizadoEm: new Date().toLocaleString("pt-BR")
    };

    locais.push(novoLocal);

    salvarLista("locaisSistema", locais);

    const usuarioLogado =
    JSON.parse(localStorage.getItem("usuarioLogado")) || {};

    const usuarioAtualizado = {
        ...usuarioLogado,
        cadastroLocalCompleto: true,
        localId: novoLocal.id,
        codigoLocal: novoLocal.codigoLocal,
        localVinculado: novoLocal.nomeLocal || novoLocal.nome,
        unidadeVinculada:
        novoLocal.unidadeVinculada || novoLocal.nomeLocal
    };

    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuarioAtualizado)
    );

    alert(
        `Local cadastrado com sucesso!\nCódigo: ${codigoLocal}`
    );

    window.location.href = "agenda.html";
}

function carregarLocais() {

    if (!listaLocais) return;

    const locais =
    buscarLista("locaisSistema");

    const termo =
    pesquisaLocal
    ? pesquisaLocal.value.toLowerCase()
    : "";

    const filtrados =
    locais.filter(local => {

        const texto =
        `
        ${local.codigoLocal || ""}
        ${local.classificacaoLocal || ""}
        ${local.tipoRegistro || ""}
        ${local.nomeLocal || local.nome || ""}
        ${local.siglaLocal || ""}
        ${local.responsavelLocal || ""}
        ${local.telefoneResponsavel || ""}
        ${local.unidadeVinculada || ""}
        ${local.endereco || ""}
        ${local.bairro || ""}
        ${local.referencia || ""}
        ${local.status || ""}
        `.toLowerCase();

        return texto.includes(termo);
    });

    if (filtrados.length === 0) {
        listaLocais.innerHTML =
        `<p>Nenhum local cadastrado.</p>`;
        return;
    }

    listaLocais.innerHTML = "";

    filtrados
    .slice()
    .reverse()
    .forEach(local => {

        const statusClass =
        local.status === "Ativo"
        ? "status-ativo"
        : local.status === "Pendente"
        ? "status-pendente"
        : local.status === "A inaugurar"
        ? "status-inaugurar"
        : "status-inativo";

        const mapaLink =
        local.latitude && local.longitude
        ? `https://www.google.com/maps?q=${local.latitude},${local.longitude}`
        : "";

        listaLocais.innerHTML += `
            <div class="local-item">

                <span class="local-code">
                    ${local.codigoLocal || "Sem código"}
                </span>

                <h3>${local.nomeLocal || local.nome || "Local sem nome"}</h3>

                <p><strong>Classificação:</strong> ${local.classificacaoLocal || "Não informada"}</p>

                <p><strong>Tipo:</strong> ${local.tipoRegistro || "Não informado"}</p>

                <p><strong>Bairro:</strong> ${local.bairro || "Não informado"}</p>

                <p><strong>Endereço:</strong> ${local.endereco || "Não informado"} ${local.numero || ""}</p>

                <p><strong>Responsável:</strong> ${local.responsavelLocal || "Não informado"}</p>

                <p><strong>Unidade vinculada:</strong> ${local.unidadeVinculada || "Não informada"}</p>

                <span class="local-status ${statusClass}">
                    ${local.status || "Não informado"}
                </span>

                <div class="local-actions-card">

                    ${
                        mapaLink
                        ? `
                        <a href="${mapaLink}" target="_blank" class="local-btn map">
                            <i class="fas fa-map-location-dot"></i>
                            Mapa
                        </a>
                        `
                        : ""
                    }

                    <button class="local-btn delete" onclick="excluirLocal(${local.id})">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}

function excluirLocal(id) {

    const confirmar =
    confirm("Tem certeza que deseja excluir este local?");

    if (!confirmar) return;

    let locais =
    buscarLista("locaisSistema");

    locais =
    locais.filter(local => local.id !== id);

    salvarLista("locaisSistema", locais);

    carregarLocais();
}

function limparFormulario() {

    formLocal.reset();

    atualizarCodigoLocal();

    const latitude =
    document.getElementById("latitudeLocal");

    const longitude =
    document.getElementById("longitudeLocal");

    if (latitude) latitude.value = "";
    if (longitude) longitude.value = "";
}

if (formLocal) {
    formLocal.addEventListener("submit", salvarLocal);
}

if (voltarBtn) {
    voltarBtn.addEventListener("click", () => {
        window.location.href = "../dashboard.html";
    });
}

if (limparBtn) {
    limparBtn.addEventListener("click", limparFormulario);
}

if (pesquisaLocal) {
    pesquisaLocal.addEventListener("input", carregarLocais);
}

const classificacaoLocal =
document.getElementById("classificacaoLocal");

const tipoRegistro =
document.getElementById("tipoRegistro");

const siglaLocal =
document.getElementById("siglaLocal");

const unidadeVinculada =
document.getElementById("unidadeVinculada");

if (classificacaoLocal) {
    classificacaoLocal.addEventListener("change", atualizarCodigoLocal);
}

if (tipoRegistro) {
    tipoRegistro.addEventListener("change", atualizarCodigoLocal);
}

if (siglaLocal) {
    siglaLocal.addEventListener("input", atualizarCodigoLocal);
}

if (unidadeVinculada) {
    unidadeVinculada.addEventListener("change", atualizarCodigoLocal);
}

const buscarEndereco =
document.getElementById("buscarEndereco");

const usarLocalizacao =
document.getElementById("usarLocalizacao");

if (buscarEndereco) {
    buscarEndereco.addEventListener("click", buscarLocalNoMapa);
}

if (usarLocalizacao) {
    usarLocalizacao.addEventListener("click", usarMinhaLocalizacao);
}

window.excluirLocal = excluirLocal;

document.addEventListener("DOMContentLoaded", () => {
    atualizarCodigoLocal();
    iniciarMapaCadastroLocal();
    carregarLocais();
});