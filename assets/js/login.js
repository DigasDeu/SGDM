import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

function mostrarErro(error){
    console.log("ERRO FIREBASE:", error.code, error.message);

    if(error.code === "auth/unauthorized-domain"){
        alert("Domínio não autorizado no Firebase. Adicione digasdeu.github.io em Authorized domains.");
    }
    else if(error.code === "auth/operation-not-allowed"){
        alert("Login Google não está ativado no Firebase Authentication.");
    }
    else if(error.code === "auth/popup-closed-by-user"){
        alert("Login cancelado antes de concluir.");
    }
    else if(error.code === "auth/invalid-api-key"){
        alert("Configuração do Firebase está incorreta. Verifique o firebase.js.");
    }
    else{
        alert("Erro: " + error.code);
    }
}

// LOGIN EMAIL
document.getElementById("loginBtn").addEventListener("click", () => {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if(email === "" || senha === ""){
        alert("Preencha email e senha.");
        return;
    }

    signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {

        const user = userCredential.user;

        localStorage.setItem("usuarioLogado", JSON.stringify({
            nome: user.displayName || "Usuário",
            email: user.email,
            foto: user.photoURL || "assets/img/user.png",
            login: true
        }));

        window.location.href = "dashboard.html";
    })
    .catch(mostrarErro);
});

// LOGIN GOOGLE
document.getElementById("googleLogin").addEventListener("click", () => {

    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
    .then((result) => {

        const user = result.user;

        localStorage.setItem("usuarioLogado", JSON.stringify({
            nome: user.displayName,
            email: user.email,
            foto: user.photoURL || "assets/img/user.png",
            login: true
        }));

        window.location.href = "dashboard.html";
    })
    .catch(mostrarErro);
});