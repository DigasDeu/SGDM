import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ==========================================
   LOGIN - SGDM
   Fluxo com cadastro de funcionário/local
========================================== */

const loginBtn =
document.getElementById("loginBtn");

const googleLogin =
document.getElementById("googleLogin");

function buscarUsuarioSalvo() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || {};
}

function buscarFuncionariosSistema() {
    return JSON.parse(localStorage.getItem("funcionariosSistema")) || [];
}

function salvarUsuarioLogado(usuario) {
    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
    );
}

function buscarCadastroFuncionarioPorEmail(email) {
    const funcionarios =
    buscarFuncionariosSistema();

    return funcionarios.find(funcionario =>
        funcionario.email &&
        funcionario.email.toLowerCase() === email.toLowerCase()
    );
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

function definirRotaInicial(usuario) {

    if (!usuario.cadastroFuncionarioCompleto) {
        window.location.href = "pages/cadastro-funcionario.html";
        return;
    }

    if (
        usuario.cadastroFuncionarioCompleto &&
        !usuario.cadastroLocalCompleto
    ) {
        window.location.href = "pages/cadastro-local.html";
        return;
    }

    if (perfilRestrito(usuario.tipoAcesso)) {
        window.location.href = "pages/agenda.html";
        return;
    }

    window.location.href = "dashboard.html";
}

function montarUsuarioLogado(user) {

    const usuarioAnterior =
    buscarUsuarioSalvo();

    const funcionarioCadastrado =
    buscarCadastroFuncionarioPorEmail(user.email);

    if (funcionarioCadastrado) {

        return {
            ...usuarioAnterior,

            uid: user.uid,
            nome:
            funcionarioCadastrado.nome ||
            user.displayName ||
            "Usuário",

            email: user.email,

            foto:
            user.photoURL ||
            usuarioAnterior.foto ||
            "assets/img/user.png",

            login: true,

            codigoFuncionario:
            funcionarioCadastrado.codigoFuncionario || "",

            telefone:
            funcionarioCadastrado.telefone || "",

            cargos:
            funcionarioCadastrado.cargos || [],

            cargoPrincipal:
            funcionarioCadastrado.cargoPrincipal || "",

            tipoAcesso:
            funcionarioCadastrado.tipoAcesso || "",

            statusFuncionario:
            funcionarioCadastrado.statusFuncionario || "Pendente",

            unidade:
            funcionarioCadastrado.unidade || "",

            tipoUnidade:
            funcionarioCadastrado.tipoUnidade || "",

            localId:
            funcionarioCadastrado.localId || "",

            cadastroFuncionarioCompleto:
            funcionarioCadastrado.cadastroFuncionarioCompleto || true,

            cadastroLocalCompleto:
            usuarioAnterior.cadastroLocalCompleto || false,

            codigoLocal:
            usuarioAnterior.codigoLocal || "",

            localVinculado:
            usuarioAnterior.localVinculado || "",

            unidadeVinculada:
            usuarioAnterior.unidadeVinculada || ""
        };
    }

    return {
        ...usuarioAnterior,

        uid: user.uid,

        nome:
        user.displayName ||
        usuarioAnterior.nome ||
        "Usuário",

        email: user.email,

        foto:
        user.photoURL ||
        usuarioAnterior.foto ||
        "assets/img/user.png",

        login: true,

        codigoFuncionario:
        usuarioAnterior.codigoFuncionario || "",

        telefone:
        usuarioAnterior.telefone || "",

        cargos:
        usuarioAnterior.cargos || [],

        cargoPrincipal:
        usuarioAnterior.cargoPrincipal || "",

        tipoAcesso:
        usuarioAnterior.tipoAcesso || "",

        statusFuncionario:
        usuarioAnterior.statusFuncionario || "Pendente",

        unidade:
        usuarioAnterior.unidade || "",

        tipoUnidade:
        usuarioAnterior.tipoUnidade || "",

        localId:
        usuarioAnterior.localId || "",

        codigoLocal:
        usuarioAnterior.codigoLocal || "",

        localVinculado:
        usuarioAnterior.localVinculado || "",

        unidadeVinculada:
        usuarioAnterior.unidadeVinculada || "",

        cadastroFuncionarioCompleto:
        usuarioAnterior.cadastroFuncionarioCompleto || false,

        cadastroLocalCompleto:
        usuarioAnterior.cadastroLocalCompleto || false
    };
}

function mostrarErro(error) {

    console.log(
        "ERRO FIREBASE:",
        error.code,
        error.message
    );

    if (error.code === "auth/unauthorized-domain") {
        alert("Domínio não autorizado no Firebase. Adicione digasdeu.github.io em Authorized domains.");
    }
    else if (error.code === "auth/operation-not-allowed") {
        alert("Login Google não está ativado no Firebase Authentication.");
    }
    else if (error.code === "auth/popup-closed-by-user") {
        alert("Login cancelado antes de concluir.");
    }
    else if (error.code === "auth/invalid-api-key") {
        alert("Configuração do Firebase está incorreta. Verifique o firebase.js.");
    }
    else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
    ) {
        alert("E-mail ou senha incorretos.");
    }
    else {
        alert("Erro: " + error.code);
    }
}

/* LOGIN COM E-MAIL E SENHA */

if (loginBtn) {

    loginBtn.addEventListener("click", () => {

        const email =
        document.getElementById("email").value.trim();

        const senha =
        document.getElementById("senha").value;

        if (email === "" || senha === "") {
            alert("Preencha email e senha.");
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = "Entrando...";

        signInWithEmailAndPassword(
            auth,
            email,
            senha
        )
        .then((userCredential) => {

            const user =
            userCredential.user;

            const usuarioSistema =
            montarUsuarioLogado(user);

            salvarUsuarioLogado(usuarioSistema);

            definirRotaInicial(usuarioSistema);
        })
        .catch(mostrarErro)
        .finally(() => {
            loginBtn.disabled = false;
            loginBtn.textContent = "Entrar";
        });
    });
}

/* LOGIN COM GOOGLE */

if (googleLogin) {

    googleLogin.addEventListener("click", () => {

        const provider =
        new GoogleAuthProvider();

        googleLogin.disabled = true;
        googleLogin.textContent = "Entrando com Google...";

        signInWithPopup(
            auth,
            provider
        )
        .then((result) => {

            const user =
            result.user;

            const usuarioSistema =
            montarUsuarioLogado(user);

            salvarUsuarioLogado(usuarioSistema);

            definirRotaInicial(usuarioSistema);
        })
        .catch(mostrarErro)
        .finally(() => {
            googleLogin.disabled = false;
            googleLogin.textContent = "Entrar com Google";
        });
    });
}