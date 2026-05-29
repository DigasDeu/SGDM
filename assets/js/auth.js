import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function estaNaPastaPages() {
    return window.location.pathname.includes("/pages/");
}

function caminhoLogin() {
    return estaNaPastaPages() ? "../login.html" : "login.html";
}

function caminhoDashboard() {
    return estaNaPastaPages() ? "../dashboard.html" : "dashboard.html";
}

function caminhoFotoPadrao() {
    return estaNaPastaPages() ? "../assets/img/user.png" : "assets/img/user.png";
}

onAuthStateChanged(auth, (user) => {

    const paginaAtual = window.location.pathname;

    const paginaLivre =
        paginaAtual.includes("login.html") ||
        paginaAtual.includes("cadastro.html") ||
        paginaAtual.endsWith("/") ||
        paginaAtual.includes("index.html");

    if (!user) {

        if (!paginaLivre) {
            window.location.href = caminhoLogin();
        }

        return;
    }

    const usuario = {
        nome: user.displayName || "Usuário",
        email: user.email || "",
        foto: user.photoURL || caminhoFotoPadrao(),
        uid: user.uid,
        login: true
    };

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    atualizarUsuarioNaTela(usuario);
});

function atualizarUsuarioNaTela(usuario) {

    const fotoUsuario = document.getElementById("fotoUsuario");

    if (fotoUsuario) {
        fotoUsuario.src = usuario.foto || caminhoFotoPadrao();
    }

    const nomeUsuario = document.getElementById("nomeUsuario");

    if (nomeUsuario) {
        nomeUsuario.textContent = usuario.nome;
    }

    const emailUsuario = document.getElementById("emailUsuario");

    if (emailUsuario) {
        emailUsuario.textContent = usuario.email;
    }

    const saudacaoUsuario = document.getElementById("saudacaoUsuario");

    if (saudacaoUsuario) {
        saudacaoUsuario.textContent = `Olá, ${usuario.nome}`;
    }
}

window.logout = function () {

    signOut(auth)
    .then(() => {

        localStorage.removeItem("usuarioLogado");

        window.location.href = caminhoLogin();
    })
    .catch((error) => {

        console.log(error);

        alert("Erro ao sair do sistema.");
    });
};