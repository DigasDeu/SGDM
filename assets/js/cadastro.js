import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const cadastroBtn = document.getElementById("cadastroBtn");

cadastroBtn.addEventListener("click", async () => {

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Preencha todos os campos.");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não conferem.");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    try {

        const userCredential =
        await createUserWithEmailAndPassword(auth, email, senha);

        const user = userCredential.user;

        await updateProfile(user, {
            displayName: nome
        });

        localStorage.setItem("usuarioLogado", JSON.stringify({
            nome: nome,
            email: user.email,
            foto: "../assets/img/user.png",
            uid: user.uid,
            login: true
        }));

        window.location.href = "../dashboard.html";

    } catch (error) {

        console.log("ERRO CADASTRO:", error.code, error.message);

        if (error.code === "auth/email-already-in-use") {
            alert("Este e-mail já está cadastrado. Clique em Entrar.");
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
    }
});