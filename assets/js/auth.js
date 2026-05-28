import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

    if (!user) {

        if (
            !window.location.pathname.includes("login.html") &&
            !window.location.pathname.includes("cadastro.html") &&
            !window.location.pathname.includes("index.html")
        ) {
            window.location.href = "login.html";
        }

        return;
    }

    const usuario = {
        nome: user.displayName || "Usuário",
        email: user.email || "",
        foto: user.photoURL || "assets/img/user.png",
        uid: user.uid,
        login: true
    };

    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
    );

    atualizarUsuarioNaTela(usuario);
});

function atualizarUsuarioNaTela(usuario) {

    const fotoUsuario = document.getElementById("fotoUsuario");

    if (fotoUsuario) {
        fotoUsuario.src = usuario.foto;
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

        window.location.href = "login.html";
    })
    .catch((error) => {

        console.log(error);

        alert("Erro ao sair do sistema.");
    });
};