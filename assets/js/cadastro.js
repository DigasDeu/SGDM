import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.getElementById("cadastroBtn").addEventListener("click", () => {

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha")?.value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos.");
        return;
    }

    if (confirmarSenha !== undefined && senha !== confirmarSenha) {
        alert("As senhas não conferem.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {

        const user = userCredential.user;

        return updateProfile(user, {
            displayName: nome
        }).then(() => user);
    })
    .then((user) => {

        localStorage.setItem("usuarioLogado", JSON.stringify({
            nome: nome,
            email: user.email,
            foto: "../assets/img/user.png",
            uid: user.uid,
            login: true
        }));

        window.location.href = "../dashboard.html";
    })
    .catch((error) => {

        console.log(error);

        if (error.code === "auth/email-already-in-use") {
            alert("Este e-mail já está cadastrado.");
        }
        else if (error.code === "auth/invalid-email") {
            alert("E-mail inválido.");
        }
        else if (error.code === "auth/weak-password") {
            alert("Senha fraca. Use pelo menos 6 caracteres.");
        }
        else {
            alert("Erro ao cadastrar: " + error.code);
        }
    });
});