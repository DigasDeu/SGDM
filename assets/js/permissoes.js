/* ==========================================
   PERMISSÕES - SGDM
   Usa usuarioLogado já montado pelo auth.js
========================================== */

function buscarUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || null;
}

function paginaAtual() {
    return window.location.pathname.split("/").pop();
}

function estaEmPastaPages() {
    return window.location.pathname.includes("/pages/");
}

function caminhoDashboard() {
    return estaEmPastaPages()
        ? "../dashboard.html"
        : "dashboard.html";
}

function caminhoSolicitacoes() {
    return estaEmPastaPages()
        ? "solicitacoes.html"
        : "pages/solicitacoes.html";
}

function caminhoCadastroFuncionario() {
    return estaEmPastaPages()
        ? "cadastro-funcionario.html"
        : "pages/cadastro-funcionario.html";
}

function caminhoCadastroLocal() {
    return estaEmPastaPages()
        ? "cadastro-local.html"
        : "pages/cadastro-local.html";
}

/* ==========================================
   PERFIS
========================================== */

function perfilEquipeMidia(tipoAcesso) {
    return tipoAcesso === "Equipe de Mídia";
}

function perfilRestrito(tipoAcesso) {
    const perfisRestritos = [
        "Gerente de Unidade",
        "Coordenador",
        "Secretaria",
        "Funcionário",
        "Solicitante"
    ];

    return perfisRestritos.includes(tipoAcesso);
}

function paginaCadastro() {
    const pagina = paginaAtual();

    return (
        pagina === "cadastro-funcionario.html" ||
        pagina === "cadastro-local.html"
    );
}

function paginaPermitidaParaRestrito() {
    const pagina = paginaAtual();

    const permitidas = [
        "solicitacoes.html",
        "agenda.html",
        "cadastro-funcionario.html",
        "cadastro-local.html"
    ];

    return permitidas.includes(pagina);
}

/* ==========================================
   CONTROLE DE CADASTRO
========================================== */

function verificarCadastroObrigatorio(usuario) {

    if (!usuario) return;

    const pagina = paginaAtual();

    if (
        !usuario.cadastroFuncionarioCompleto &&
        pagina !== "cadastro-funcionario.html"
    ) {
        window.location.href = caminhoCadastroFuncionario();
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        !usuario.cadastroLocalCompleto &&
        !perfilEquipeMidia(usuario.tipoAcesso) &&
        pagina !== "cadastro-local.html"
    ) {
        window.location.href = caminhoCadastroLocal();
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        usuario.cadastroLocalCompleto &&
        paginaCadastro()
    ) {
        if (perfilRestrito(usuario.tipoAcesso)) {
            window.location.href = caminhoSolicitacoes();
            return;
        }

        window.location.href = caminhoDashboard();
    }
}

/* ==========================================
   BLOQUEIO POR PERFIL
========================================== */

function protegerPaginasPorPerfil(usuario) {

    if (!usuario) return;

    if (
        !usuario.cadastroFuncionarioCompleto ||
        !usuario.cadastroLocalCompleto
    ) {
        return;
    }

    if (perfilEquipeMidia(usuario.tipoAcesso)) {
        return;
    }

    if (perfilRestrito(usuario.tipoAcesso)) {

        if (!paginaPermitidaParaRestrito()) {
            alert("Seu perfil possui acesso somente às Solicitações e Agenda.");
            window.location.href = caminhoSolicitacoes();
        }
    }
}

/* ==========================================
   AJUSTE DO MENU
========================================== */

function ajustarMenuPorPerfil(usuario) {

    if (!usuario) return;

    if (perfilEquipeMidia(usuario.tipoAcesso)) {
        return;
    }

    if (!perfilRestrito(usuario.tipoAcesso)) {
        return;
    }

    const links =
    document.querySelectorAll(".sidebar-menu a, .bottom-nav a");

    links.forEach(link => {

        const href =
        link.getAttribute("href") || "";

        const permitido =
            href.includes("solicitacoes.html") ||
            href.includes("agenda.html") ||
            href.includes("cadastro-funcionario.html") ||
            href.includes("cadastro-local.html") ||
            href.includes("#");

        if (!permitido) {
            link.style.display = "none";
        }
    });
}

/* ==========================================
   INICIALIZAÇÃO
========================================== */

function iniciarPermissoes() {

    const usuario =
    buscarUsuarioLogado();

    if (!usuario) return;

    verificarCadastroObrigatorio(usuario);

    protegerPaginasPorPerfil(usuario);

    ajustarMenuPorPerfil(usuario);
}

/*
   Espera o auth.js terminar de buscar o Firestore
   e montar o usuarioLogado.
*/
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(iniciarPermissoes, 1200);
});