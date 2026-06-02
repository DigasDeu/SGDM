/* ==========================================
   PERMISSÕES E FLUXO DE ACESSO - SGDM
   Controle temporário via localStorage
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

function irParaPagina(pagina) {
    if (estaEmPastaPages()) {
        window.location.href = pagina;
    } else {
        window.location.href = `pages/${pagina}`;
    }
}

function irParaDashboard() {
    if (estaEmPastaPages()) {
        window.location.href = "../dashboard.html";
    } else {
        window.location.href = "dashboard.html";
    }
}

function irParaSolicitacoes() {
    if (estaEmPastaPages()) {
        window.location.href = "solicitacoes.html";
    } else {
        window.location.href = "pages/solicitacoes.html";
    }
}

function irParaAgenda() {
    if (estaEmPastaPages()) {
        window.location.href = "agenda.html";
    } else {
        window.location.href = "pages/agenda.html";
    }
}

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

function paginaPermitidaParaRestrito(pagina) {
    const paginasPermitidas = [
        "solicitacoes.html",
        "agenda.html",
        "cadastro-funcionario.html",
        "cadastro-local.html"
    ];

    return paginasPermitidas.includes(pagina);
}

function paginaCadastro(pagina) {
    return (
        pagina === "cadastro-funcionario.html" ||
        pagina === "cadastro-local.html"
    );
}

function verificarCadastroObrigatorio(usuario) {
    const pagina = paginaAtual();

    if (!usuario) return;

    if (perfilEquipeMidia(usuario.tipoAcesso)) {
        if (
            !usuario.cadastroFuncionarioCompleto &&
            pagina !== "cadastro-funcionario.html"
        ) {
            irParaPagina("cadastro-funcionario.html");
            return;
        }

        if (
            usuario.cadastroFuncionarioCompleto &&
            paginaCadastro(pagina)
        ) {
            irParaDashboard();
            return;
        }

        return;
    }

    if (
        !usuario.cadastroFuncionarioCompleto &&
        pagina !== "cadastro-funcionario.html"
    ) {
        irParaPagina("cadastro-funcionario.html");
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        !usuario.cadastroLocalCompleto &&
        pagina !== "cadastro-local.html"
    ) {
        irParaPagina("cadastro-local.html");
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        usuario.cadastroLocalCompleto &&
        paginaCadastro(pagina)
    ) {
        if (perfilRestrito(usuario.tipoAcesso)) {
            irParaSolicitacoes();
            return;
        }

        irParaDashboard();
    }
}

function protegerPaginasPorPerfil(usuario) {
    if (!usuario) return;

    const pagina = paginaAtual();

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
        if (!paginaPermitidaParaRestrito(pagina)) {
            alert("Seu perfil possui acesso somente às Solicitações e Agenda.");
            irParaSolicitacoes();
        }
    }
}

function ajustarMenuPorPerfil(usuario) {
    if (!usuario) return;

    if (perfilEquipeMidia(usuario.tipoAcesso)) {
        return;
    }

    if (!perfilRestrito(usuario.tipoAcesso)) {
        return;
    }

    const links = document.querySelectorAll(".sidebar-menu a, .bottom-nav a");

    links.forEach(link => {
        const href = link.getAttribute("href") || "";

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

function iniciarControleDeAcesso() {
    const usuario = buscarUsuarioLogado();

    if (!usuario) return;

    verificarCadastroObrigatorio(usuario);
    protegerPaginasPorPerfil(usuario);
    ajustarMenuPorPerfil(usuario);
}

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(iniciarControleDeAcesso, 300);
});