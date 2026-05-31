document.addEventListener("DOMContentLoaded", () => {
    carregarRelatorioImpressao();
});

function buscarRelatorioSelecionado() {
    return JSON.parse(localStorage.getItem("relatorioSelecionado")) || null;
}

function buscarConfiguracoesSistema() {
    return JSON.parse(localStorage.getItem("configuracoesSistema")) || {};
}

function preencherTexto(id, valor, padrao = "Não informado") {
    const elemento = document.getElementById(id);

    if (!elemento) return;

    elemento.textContent = valor || padrao;
}

function formatarData(data) {
    if (!data) return "Não informado";

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function identificarCategoria(item) {
    if (item.chaveOrigem === "eventos") return "Evento";
    if (item.chaveOrigem === "solicitacoes") return "Solicitação";
    if (item.chaveOrigem === "producoes") return "Produção";
    if (item.chaveOrigem === "publicacoes") return "Publicação";

    return item.tipo || "Atividade";
}

function gerarNumeroRelatorio(item) {
    const ano = new Date().getFullYear();

    if (item.numeroRelatorio) {
        return item.numeroRelatorio;
    }

    if (item.id) {
        const numero = String(item.id).slice(-3);
        return `${numero.padStart(3, "0")}/${ano}`;
    }

    return `000/${ano}`;
}

function montarTextoPrincipal(item) {
    const titulo = item.titulo || item.eventoRelacionado || "atividade institucional";
    const tipo = item.tipo || identificarCategoria(item);
    const data = formatarData(item.data);
    const hora = item.hora || "horário não informado";
    const local = item.local || "local não informado";
    const responsavel = item.responsavel || "Departamento de Mídia";

    return `No dia ${data}, às ${hora}, foi realizada a atividade "${titulo}", classificada como ${tipo}, no local ${local}. A ação contou com acompanhamento do ${responsavel}, com o objetivo de registrar, organizar e apoiar a divulgação institucional das ações desenvolvidas pela Secretaria Municipal de Saúde.`;
}

function carregarRelatorioImpressao() {
    const relatorio = buscarRelatorioSelecionado();
    const configuracoes = buscarConfiguracoesSistema();

    if (!relatorio) {
        preencherTexto(
            "textoPrincipal",
            "Nenhuma atividade foi selecionada. Volte para a tela de relatórios e clique em Gerar Impressão."
        );

        return;
    }

    preencherTexto(
        "impNumeroRelatorio",
        gerarNumeroRelatorio(relatorio),
        "000/2026"
    );

    preencherTexto(
        "impTitulo",
        relatorio.titulo || relatorio.eventoRelacionado,
        "Atividade não selecionada"
    );

    preencherTexto(
        "impTipo",
        relatorio.tipo || identificarCategoria(relatorio),
        "Não informado"
    );

    preencherTexto(
        "impData",
        formatarData(relatorio.data),
        "Não informado"
    );

    preencherTexto(
        "impHora",
        relatorio.hora,
        "Não informado"
    );

    preencherTexto(
        "impLocal",
        relatorio.local,
        "Não informado"
    );

    preencherTexto(
        "impResponsavel",
        relatorio.responsavel,
        "Departamento de Mídia"
    );

    preencherTexto(
        "textoPrincipal",
        montarTextoPrincipal(relatorio)
    );

    preencherTexto(
        "impFotos",
        relatorio.quantidadeFotos || relatorio.fotos || "0"
    );

    preencherTexto(
        "impVideos",
        relatorio.quantidadeVideos || relatorio.videos || "0"
    );

    preencherTexto(
        "impArtes",
        relatorio.quantidadeArtes || relatorio.artes || "0"
    );

    preencherTexto(
        "impPlataforma",
        relatorio.plataforma,
        "Não informado"
    );

    preencherTexto(
        "impStatus",
        relatorio.status,
        "Não informado"
    );

    preencherTexto(
        "impDescricao",
        relatorio.descricao,
        "Nenhuma descrição informada."
    );

    preencherTexto(
        "assinaturaResponsavel",
        configuracoes.responsavelCobertura ||
        relatorio.responsavel ||
        "Responsável pela Atividade"
    );

    preencherTexto(
        "assinaturaCoordenacao",
        configuracoes.coordenadorMidia ||
        "Coordenação do Departamento de Mídia"
    );

    preencherTexto(
        "assinaturaSecretario",
        configuracoes.secretarioMunicipal ||
        "Secretário(a) Municipal de Saúde"
    );
}