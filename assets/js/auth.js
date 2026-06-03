import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    buscarDocumentoPorId,
    listarDocumentos,
    salvarDocumentoComId
} from "./db.js";

/* ==========================================
   AUTH - SGDM
   Reconhece usuário pelo Gmail no Firestore
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

function caminhoFotoPadrao() {
    return estaNaPastaPages()
        ? "../assets/img/user.png"
        : "assets/img/user.png";
}

function buscarUsuarioLocal() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || {};
}

function salvarUsuarioLocal(usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function normalizarEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function gerarIdPorEmail(email) {
    return normalizarEmail(email).replace(/[^a-z0-9]/g, "_");
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
   BUSCAR FUNCIONÁRIO NO FIRESTORE
========================================== */

async function buscarFuncionarioNoFirestore(user) {

    if (!user) return null;

    const emailLogin =
    normalizarEmail(user.email);

    try {

        /*
           1. Primeiro tenta pelo UID do Firebase.
        */
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

        /*
           2. Depois tenta pelo ID gerado a partir do e-mail.
        */
        if (emailLogin) {

            const idEmail =
            gerarIdPorEmail(emailLogin);

            const funcionarioPorEmailId =
            await buscarDocumentoPorId(
                "funcionariosSistema",
                idEmail
            );

            if (funcionarioPorEmailId) {
                return funcionarioPorEmailId;
            }
        }

        /*
           3. Por último lista todos e procura pelo campo email.
           Isso corrige cadastros antigos que foram salvos com outro ID.
        */
        const funcionarios =
        await listarDocumentos("funcionariosSistema");

        salvarLista(
            "funcionariosSistema",
            funcionarios
        );

        const funcionarioPorEmail =
        funcionarios.find(funcionario =>
            normalizarEmail(funcionario.email) === emailLogin
        );

        if (funcionarioPorEmail) {
            return funcionarioPorEmail;
        }

        return null;

    } catch (error) {

        console.log(
            "Erro ao buscar funcionário no Firestore:",
            error
        );

        return null;
    }
}

/* ==========================================
   CORRIGIR / SINCRONIZAR CADASTRO
========================================== */

async function sincronizarFuncionarioComUid(user, funcionario) {

    if (!user || !funcionario) return;

    try {

        const ehEquipeMidia =
        funcionario.tipoAcesso === "Equipe de Mídia" ||
        funcionario.equipeMidia === true;

        const funcionarioCorrigido = {
            ...funcionario,

            uid: user.uid,
            idFirebase: user.uid,

            email:
            normalizarEmail(funcionario.email || user.email),

            nome:
            funcionario.nome || user.displayName || "Usuário",

            foto:
            user.photoURL || funcionario.foto || "",

            cadastroFuncionarioCompleto:
            true,

            cadastroLocalCompleto:
            ehEquipeMidia
            ? true
            : Boolean(funcionario.cadastroLocalCompleto),

            equipeMidia:
            ehEquipeMidia,

            atualizadoEm:
            new Date().toLocaleString("pt-BR")
        };

        await salvarDocumentoComId(
            "funcionariosSistema",
            user.uid,
            funcionarioCorrigido
        );

    } catch (error) {

        console.log(
            "Não foi possível sincronizar funcionário com UID:",
            error
        );
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

    /*
       Se encontrou funcionário pelo Gmail, o sistema considera
       que o cadastro funcional existe.
    */
    const encontrouCadastro =
    Boolean(funcionarioSalvo);

    const tipoAcesso =
    funcionarioSalvo?.tipoAcesso ||
    usuarioAntigo.tipoAcesso ||
    "";

    const ehEquipeMidia =
    tipoAcesso === "Equipe de Mídia" ||
    funcionarioSalvo?.equipeMidia === true ||
    usuarioAntigo.equipeMidia === true;

    const cadastroFuncionarioCompleto =
    encontrouCadastro
    ? true
    : Boolean(usuarioAntigo.cadastroFuncionarioCompleto);

    const cadastroLocalCompleto =
    ehEquipeMidia
    ? true
    : Boolean(
        funcionarioSalvo?.cadastroLocalCompleto ||
        usuarioAntigo.cadastroLocalCompleto
    );

    const usuarioSistema = {
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
        normalizarEmail(
            user.email ||
            funcionarioSalvo?.email ||
            usuarioAntigo.email
        ),

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

    /*
       Se achou cadastro pelo e-mail, salva uma cópia pelo UID.
       Assim no próximo login fica mais rápido e não perde reconhecimento.
    */
    if (funcionarioSalvo) {
        await sincronizarFuncionarioComUid(
            user,
            usuarioSistema
        );
    }

    return usuarioSistema;
}

/* ==========================================
   CONTROLE DE FLUXO
========================================== */

function controlarFluxo(usuario) {

    if (!usuario) return;

    if (paginaLivre()) return;

    /*
       Só manda para cadastro funcionário se realmente
       não encontrou cadastro nenhum.
    */
    if (
        !usuario.cadastroFuncionarioCompleto &&
        !paginaCadastroFuncionario()
    ) {
        window.location.href =
        caminhoCadastroFuncionario();
        return;
    }

    /*
       Equipe de Mídia não precisa cadastro local.
    */
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

    /*
       Se entrou em cadastro mesmo já estando completo,
       joga para a página correta.
    */
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

    /*
       Perfis restritos só acessam Solicitações e Agenda.
    */
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
   ATUALIZAR USUÁRIO NA TELA
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

        sessionStorage.removeItem("authPronto");

        if (!paginaLivre()) {
            window.location.href =
            caminhoLogin();
        }

        return;
    }

    sessionStorage.removeItem("authPronto");

    const usuario =
    await montarUsuarioSistema(user);

    salvarUsuarioLocal(usuario);

    atualizarUsuarioNaTela(usuario);

    sessionStorage.setItem("authPronto", "true");

    controlarFluxo(usuario);
});

/* ==========================================
   LOGOUT
========================================== */

window.logout = function () {

    signOut(auth)
    .then(() => {

        localStorage.removeItem("usuarioLogado");
        sessionStorage.removeItem("authPronto");

        window.location.href =
        caminhoLogin();
    })
    .catch((error) => {

        console.log(error);

        alert("Erro ao sair do sistema.");
    });
};