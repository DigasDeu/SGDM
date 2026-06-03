import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    buscarDocumentoPorId,
    listarDocumentos
} from "./db.js";

/* ==========================================
   AUTH - SGDM
   Proteção + integração com Firestore
========================================== */

function estaNaPastaPages() {
    return window.location.pathname.includes("/pages/");
}

function paginaAtualNome() {
    return window.location.pathname.split("/").pop();
}

function caminhoLogin() {
    return estaNaPastaPages() ? "../login.html" : "login.html";
}

function caminhoDashboard() {
    return estaNaPastaPages() ? "../dashboard.html" : "dashboard.html";
}

function caminhoCadastroFuncionario() {
    return estaNaPastaPages()
        ? "cadastro-funcionario.html"
        : "pages/cadastro-funcionario.html";
}

function caminhoCadastroLocal() {
    return estaNaPastaPages()
        ? "cadastro-local.html"
        : "pages/cadastro-local.html";
}

function caminhoSolicitacoes() {
    return estaNaPastaPages()
        ? "solicitacoes.html"
        : "pages/solicitacoes.html";
}

function caminhoAgenda() {
    return estaNaPastaPages()
        ? "agenda.html"
        : "pages/agenda.html";
}

function caminhoFotoPadrao() {
    return estaNaPastaPages()
        ? "../assets/img/user.png"
        : "assets/img/user.png";
}

function buscarUsuarioLocal() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || {};
}

function salvarUsuarioLocal(usuario) {
    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
    );
}

function salvarLista(chave, lista) {
    localStorage.setItem(
        chave,
        JSON.stringify(lista)
    );
}

/* ==========================================
   PÁGINAS E PERFIS
========================================== */

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

function perfilEquipeMidia(tipoAcesso) {
    return tipoAcesso === "Equipe de Mídia";
}

function paginaLivre() {
    const pagina = paginaAtualNome();

    return (
        pagina === "login.html" ||
        pagina === "cadastro.html" ||
        pagina === "index.html" ||
        pagina === ""
    );
}

function paginaCadastroFuncionario() {
    return paginaAtualNome() === "cadastro-funcionario.html";
}

function paginaCadastroLocal() {
    return paginaAtualNome() === "cadastro-local.html";
}

function paginaPermitidaParaRestrito() {
    const pagina = paginaAtualNome();

    const permitidas = [
        "solicitacoes.html",
        "agenda.html",
        "cadastro-funcionario.html",
        "cadastro-local.html"
    ];

    return permitidas.includes(pagina);
}

/* ==========================================
   FIRESTORE - FUNCIONÁRIO
========================================== */

async function buscarFuncionarioNoFirestore(user) {

    if (!user) return null;

    try {

        if (user.uid) {
            const funcionarioPorUid =
            await buscarDocumentoPorId(
                "funcionariosSistema",
                user.uid
            );

            if (funcionarioPorUid) {
                return funcionarioPorUid;
            }
        }

        const funcionarios =
        await listarDocumentos("funcionariosSistema");

        salvarLista(
            "funcionariosSistema",
            funcionarios
        );

        const funcionarioPorEmail =
        funcionarios.find(funcionario =>
            funcionario.email &&
            funcionario.email.toLowerCase() === String(user.email || "").toLowerCase()
        );

        return funcionarioPorEmail || null;

    } catch (error) {

        console.log(
            "Erro ao buscar funcionário no Firestore:",
            error
        );

        return null;
    }
}

/* ==========================================
   MONTAR USUÁRIO DO SISTEMA
========================================== */

async function montarUsuarioSistema(user) {

    const usuarioAntigo =
    buscarUsuarioLocal();

    const funcionarioSalvo =
    await buscarFuncionarioNoFirestore(user);

    const tipoAcesso =
    funcionarioSalvo?.tipoAcesso ||
    usuarioAntigo.tipoAcesso ||
    "";

    const ehEquipeMidia =
    tipoAcesso === "Equipe de Mídia" ||
    funcionarioSalvo?.equipeMidia === true ||
    usuarioAntigo.equipeMidia === true;

    const cadastroFuncionarioCompleto =
    Boolean(
        funcionarioSalvo?.cadastroFuncionarioCompleto ||
        usuarioAntigo.cadastroFuncionarioCompleto
    );

    const cadastroLocalCompleto =
    ehEquipeMidia
    ? true
    : Boolean(
        funcionarioSalvo?.cadastroLocalCompleto ||
        usuarioAntigo.cadastroLocalCompleto
    );

    return {
        ...usuarioAntigo,

        uid:
        user.uid,

        idFirebase:
        funcionarioSalvo?.idFirebase ||
        funcionarioSalvo?.uid ||
        user.uid,

        nome:
        funcionarioSalvo?.nome ||
        usuarioAntigo.nome ||
        user.displayName ||
        "Usuário",

        email:
        user.email ||
        funcionarioSalvo?.email ||
        usuarioAntigo.email ||
        "",

        foto:
        user.photoURL ||
        usuarioAntigo.foto ||
        caminhoFotoPadrao(),

        login:
        true,

        codigoFuncionario:
        funcionarioSalvo?.codigoFuncionario ||
        usuarioAntigo.codigoFuncionario ||
        "",

        telefone:
        funcionarioSalvo?.telefone ||
        usuarioAntigo.telefone ||
        "",

        cargos:
        funcionarioSalvo?.cargos ||
        usuarioAntigo.cargos ||
        [],

        cargoPrincipal:
        funcionarioSalvo?.cargoPrincipal ||
        usuarioAntigo.cargoPrincipal ||
        "",

        tipoAcesso,

        statusFuncionario:
        funcionarioSalvo?.statusFuncionario ||
        usuarioAntigo.statusFuncionario ||
        "Pendente",

        equipeMidia:
        ehEquipeMidia,

        unidade:
        funcionarioSalvo?.unidade ||
        usuarioAntigo.unidade ||
        "",

        tipoUnidade:
        funcionarioSalvo?.tipoUnidade ||
        usuarioAntigo.tipoUnidade ||
        "",

        localId:
        funcionarioSalvo?.localId ||
        usuarioAntigo.localId ||
        "",

        localFirebaseId:
        funcionarioSalvo?.localFirebaseId ||
        usuarioAntigo.localFirebaseId ||
        "",

        codigoLocal:
        funcionarioSalvo?.codigoLocal ||
        usuarioAntigo.codigoLocal ||
        "",

        localVinculado:
        funcionarioSalvo?.localVinculado ||
        usuarioAntigo.localVinculado ||
        "",

        unidadeVinculada:
        funcionarioSalvo?.unidadeVinculada ||
        usuarioAntigo.unidadeVinculada ||
        "",

        cadastroFuncionarioCompleto,
        cadastroLocalCompleto
    };
}

/* ==========================================
   CONTROLE DE FLUXO
========================================== */

function controlarFluxo(usuario) {

    if (!usuario) return;

    if (paginaLivre()) return;

    if (
        !usuario.cadastroFuncionarioCompleto &&
        !paginaCadastroFuncionario()
    ) {
        window.location.href =
        caminhoCadastroFuncionario();
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        !usuario.cadastroLocalCompleto &&
        !perfilEquipeMidia(usuario.tipoAcesso) &&
        !paginaCadastroLocal()
    ) {
        window.location.href =
        caminhoCadastroLocal();
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        usuario.cadastroLocalCompleto &&
        (
            paginaCadastroFuncionario() ||
            paginaCadastroLocal()
        )
    ) {
        if (perfilRestrito(usuario.tipoAcesso)) {
            window.location.href =
            caminhoSolicitacoes();
            return;
        }

        window.location.href =
        caminhoDashboard();
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        usuario.cadastroLocalCompleto &&
        perfilRestrito(usuario.tipoAcesso) &&
        !paginaPermitidaParaRestrito()
    ) {
        window.location.href =
        caminhoSolicitacoes();
        return;
    }
}

/* ==========================================
   ATUALIZAR DADOS NA TELA
========================================== */

function atualizarUsuarioNaTela(usuario) {

    const fotoUsuario =
    document.getElementById("fotoUsuario");

    if (fotoUsuario) {
        fotoUsuario.src =
        usuario.foto || caminhoFotoPadrao();
    }

    const nomeUsuario =
    document.getElementById("nomeUsuario");

    if (nomeUsuario) {
        nomeUsuario.textContent =
        usuario.nome || "Usuário";
    }

    const emailUsuario =
    document.getElementById("emailUsuario");

    if (emailUsuario) {
        emailUsuario.textContent =
        usuario.email || "";
    }

    const saudacaoUsuario =
    document.getElementById("saudacaoUsuario");

    if (saudacaoUsuario) {
        saudacaoUsuario.textContent =
        `Olá, ${usuario.nome || "Usuário"}`;
    }
}

/* ==========================================
   INICIALIZAÇÃO AUTH
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        if (!paginaLivre()) {
            window.location.href =
            caminhoLogin();
        }

        return;
    }

    const usuario =
    await montarUsuarioSistema(user);

    salvarUsuarioLocal(usuario);

    atualizarUsuarioNaTela(usuario);

    controlarFluxo(usuario);
});

/* ==========================================
   LOGOUT
========================================== */

window.logout = function () {

    signOut(auth)
    .then(() => {

        localStorage.removeItem("usuarioLogado");

        window.location.href =
        caminhoLogin();
    })
    .catch((error) => {

        console.log(error);

        alert("Erro ao sair do sistema.");
    });
};