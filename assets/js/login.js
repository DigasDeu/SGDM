import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ==========================================
   LOGIN - SGDM
========================================== */

const loginForm =
document.getElementById("loginForm");

const loginBtn =
document.getElementById("loginBtn");

const googleLogin =
document.getElementById("googleLogin");

function buscarUsuarioLocal() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || {};
}

function salvarUsuarioLogado(usuario) {
    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
    );
}

function buscarFuncionariosSistema() {
    return JSON.parse(localStorage.getItem("funcionariosSistema")) || [];
}

function buscarFuncionarioPorEmail(email) {

    const funcionarios =
    buscarFuncionariosSistema();

    return funcionarios.find(funcionario =>
        funcionario.email &&
        funcionario.email.toLowerCase() === String(email).toLowerCase()
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
        !usuario.cadastroLocalCompleto &&
        usuario.tipoAcesso !== "Equipe de Mídia"
    ) {
        window.location.href = "pages/cadastro-local.html";
        return;
    }

    if (perfilRestrito(usuario.tipoAcesso)) {
        window.location.href = "pages/solicitacoes.html";
        return;
    }

    window.location.href = "dashboard.html";
}

function montarUsuarioSistema(user) {

    const usuarioAntigo =
    buscarUsuarioLocal();

    const funcionario =
    buscarFuncionarioPorEmail(user.email);

    if (funcionario) {

        return {
            ...usuarioAntigo,

            uid: user.uid,
            nome: funcionario.nome || user.displayName || "Usuário",
            email: user.email,
            foto: user.photoURL || usuarioAntigo.foto || "assets/img/user.png",
            login: true,

            codigoFuncionario: funcionario.codigoFuncionario || "",
            telefone: funcionario.telefone || "",
            cargos: funcionario.cargos || [],
            cargoPrincipal: funcionario.cargoPrincipal || "",
            tipoAcesso: funcionario.tipoAcesso || "",
            statusFuncionario: funcionario.statusFuncionario || "Pendente",

            equipeMidia:
            funcionario.equipeMidia ||
            funcionario.tipoAcesso === "Equipe de Mídia",

            unidade: funcionario.unidade || "",
            tipoUnidade: funcionario.tipoUnidade || "",
            localId: funcionario.localId || usuarioAntigo.localId || "",

            codigoLocal: usuarioAntigo.codigoLocal || "",
            localVinculado: usuarioAntigo.localVinculado || "",
            unidadeVinculada: usuarioAntigo.unidadeVinculada || "",

            cadastroFuncionarioCompleto:
            funcionario.cadastroFuncionarioCompleto || true,

            cadastroLocalCompleto:
            funcionario.tipoAcesso === "Equipe de Mídia"
            ? true
            : usuarioAntigo.cadastroLocalCompleto ||
              funcionario.cadastroLocalCompleto ||
              false
        };
    }

    return {
        ...usuarioAntigo,

        uid: user.uid,
        nome: user.displayName || usuarioAntigo.nome || "Usuário",
        email: user.email,
        foto: user.photoURL || usuarioAntigo.foto || "assets/img/user.png",
        login: true,

        codigoFuncionario: usuarioAntigo.codigoFuncionario || "",
        telefone: usuarioAntigo.telefone || "",
        cargos: usuarioAntigo.cargos || [],
        cargoPrincipal: usuarioAntigo.cargoPrincipal || "",
        tipoAcesso: usuarioAntigo.tipoAcesso || "",
        statusFuncionario: usuarioAntigo.statusFuncionario || "Pendente",

        equipeMidia: usuarioAntigo.equipeMidia || false,

        unidade: usuarioAntigo.unidade || "",
        tipoUnidade: usuarioAntigo.tipoUnidade || "",
        localId: usuarioAntigo.localId || "",

        codigoLocal: usuarioAntigo.codigoLocal || "",
        localVinculado: usuarioAntigo.localVinculado || "",
        unidadeVinculada: usuarioAntigo.unidadeVinculada || "",

        cadastroFuncionarioCompleto:
        usuarioAntigo.cadastroFuncionarioCompleto || false,

        cadastroLocalCompleto:
        usuarioAntigo.cadastroLocalCompleto || false
    };
}

function mostrarErro(error) {

    console.log("ERRO FIREBASE:", error.code, error.message);

    if (error.code === "auth/unauthorized-domain") {
        alert("Domínio não autorizado no Firebase. Adicione seu domínio em Authentication > Settings > Authorized domains.");
    }
    else if (error.code === "auth/operation-not-allowed") {
        alert("Esse método de login não está ativado no Firebase Authentication.");
    }
    else if (error.code === "auth/popup-closed-by-user") {
        alert("Login cancelado antes de concluir.");
    }
    else if (error.code === "auth/invalid-api-key") {
        alert("Configuração do Firebase incorreta. Verifique o arquivo firebase.js.");
    }
    else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
    ) {
        alert("E-mail ou senha incorretos.");
    }
    else {
        alert("Erro ao entrar: " + error.code);
    }
}

/* LOGIN COM E-MAIL E SENHA */

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const emailInput =
        document.getElementById("email");

        const senhaInput =
        document.getElementById("senha");

        const email =
        emailInput ? emailInput.value.trim() : "";

        const senha =
        senhaInput ? senhaInput.value : "";

        if (!email || !senha) {
            alert("Preencha e-mail e senha.");
            return;
        }

        try {

            loginBtn.disabled = true;
            loginBtn.textContent = "Entrando...";

            const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );

            const user =
            userCredential.user;

            const usuarioSistema =
            montarUsuarioSistema(user);

            salvarUsuarioLogado(usuarioSistema);

            definirRotaInicial(usuarioSistema);

        } catch (error) {

            mostrarErro(error);

        } finally {

            loginBtn.disabled = false;
            loginBtn.textContent = "Entrar";
        }
    });
}

/* LOGIN COM GOOGLE */

if (googleLogin) {

    googleLogin.addEventListener("click", async () => {

        try {

            googleLogin.disabled = true;
            googleLogin.innerHTML = `
                Entrando...
            `;

            const provider =
            new GoogleAuthProvider();

            const result =
            await signInWithPopup(
                auth,
                provider
            );

            const user =
            result.user;

            const usuarioSistema =
            montarUsuarioSistema(user);

            salvarUsuarioLogado(usuarioSistema);

            definirRotaInicial(usuarioSistema);

        } catch (error) {

            mostrarErro(error);

        } finally {

            googleLogin.disabled = false;
            googleLogin.innerHTML = `
                <img src="assets/img/google.png" alt="Google">
                Entrar com Google
            `;
        }
    });
}