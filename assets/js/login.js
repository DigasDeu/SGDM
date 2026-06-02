import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

console.log("LOGIN.JS CARREGADO COM SUCESSO");

const loginBtn = document.getElementById("loginBtn");
const googleLogin = document.getElementById("googleLogin");
const loginForm = document.getElementById("loginForm");

console.log("BOTÃO LOGIN:", loginBtn);
console.log("BOTÃO GOOGLE:", googleLogin);
console.log("FORM LOGIN:", loginForm);

function salvarUsuario(usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function perfilRestrito(tipoAcesso) {
    return [
        "Gerente de Unidade",
        "Coordenador",
        "Secretaria",
        "Funcionário",
        "Solicitante"
    ].includes(tipoAcesso);
}

function buscarFuncionariosSistema() {
    return JSON.parse(localStorage.getItem("funcionariosSistema")) || [];
}

function buscarFuncionarioPorEmail(email) {
    const funcionarios = buscarFuncionariosSistema();

    return funcionarios.find(funcionario =>
        funcionario.email &&
        funcionario.email.toLowerCase() === String(email).toLowerCase()
    );
}

function montarUsuario(user) {
    const funcionario = buscarFuncionarioPorEmail(user.email);

    if (funcionario) {
        return {
            uid: user.uid,
            nome: funcionario.nome || user.displayName || "Usuário",
            email: user.email,
            foto: user.photoURL || "assets/img/user.png",
            login: true,

            codigoFuncionario: funcionario.codigoFuncionario || "",
            telefone: funcionario.telefone || "",
            cargos: funcionario.cargos || [],
            cargoPrincipal: funcionario.cargoPrincipal || "",
            tipoAcesso: funcionario.tipoAcesso || "",
            statusFuncionario: funcionario.statusFuncionario || "Pendente",
            equipeMidia: funcionario.tipoAcesso === "Equipe de Mídia",

            unidade: funcionario.unidade || "",
            tipoUnidade: funcionario.tipoUnidade || "",
            localId: funcionario.localId || "",

            cadastroFuncionarioCompleto: true,
            cadastroLocalCompleto:
                funcionario.tipoAcesso === "Equipe de Mídia"
                ? true
                : funcionario.cadastroLocalCompleto || false
        };
    }

    return {
        uid: user.uid,
        nome: user.displayName || "Usuário",
        email: user.email,
        foto: user.photoURL || "assets/img/user.png",
        login: true,

        codigoFuncionario: "",
        telefone: "",
        cargos: [],
        cargoPrincipal: "",
        tipoAcesso: "",
        statusFuncionario: "Pendente",
        equipeMidia: false,

        unidade: "",
        tipoUnidade: "",
        localId: "",

        cadastroFuncionarioCompleto: false,
        cadastroLocalCompleto: false
    };
}

function redirecionar(usuario) {
    console.log("USUÁRIO LOGADO:", usuario);

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

function mostrarErro(error) {
    console.error("ERRO FIREBASE COMPLETO:", error);

    if (error.code === "auth/invalid-api-key") {
        alert("Erro no firebase.js: API Key inválida.");
    }
    else if (error.code === "auth/unauthorized-domain") {
        alert("Domínio não autorizado no Firebase.");
    }
    else if (error.code === "auth/operation-not-allowed") {
        alert("Método de login não ativado no Firebase.");
    }
    else if (error.code === "auth/popup-closed-by-user") {
        alert("Login Google cancelado.");
    }
    else if (error.code === "auth/invalid-credential") {
        alert("E-mail ou senha incorretos.");
    }
    else {
        alert("Erro ao entrar: " + error.code);
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        console.log("CLICOU EM ENTRAR");

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        if (!email || !senha) {
            alert("Preencha e-mail e senha.");
            return;
        }

        try {
            loginBtn.disabled = true;
            loginBtn.textContent = "Entrando...";

            const userCredential = await signInWithEmailAndPassword(auth, email, senha);

            const usuario = montarUsuario(userCredential.user);

            salvarUsuario(usuario);

            redirecionar(usuario);

        } catch (error) {
            mostrarErro(error);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Entrar";
        }
    });
}
else if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        console.log("CLICOU EM ENTRAR SEM FORM");

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        if (!email || !senha) {
            alert("Preencha e-mail e senha.");
            return;
        }

        try {
            loginBtn.disabled = true;
            loginBtn.textContent = "Entrando...";

            const userCredential = await signInWithEmailAndPassword(auth, email, senha);

            const usuario = montarUsuario(userCredential.user);

            salvarUsuario(usuario);

            redirecionar(usuario);

        } catch (error) {
            mostrarErro(error);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = "Entrar";
        }
    });
}

if (googleLogin) {
    googleLogin.addEventListener("click", async () => {
        console.log("CLICOU EM GOOGLE");

        try {
            googleLogin.disabled = true;
            googleLogin.textContent = "Entrando...";

            const provider = new GoogleAuthProvider();

            const result = await signInWithPopup(auth, provider);

            const usuario = montarUsuario(result.user);

            salvarUsuario(usuario);

            redirecionar(usuario);

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