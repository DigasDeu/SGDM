import { auth } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const formCadastro =
document.getElementById("formCadastro");

const cadastroBtn =
document.getElementById("cadastroBtn");

function salvarUsuarioLogado(usuario) {
    localStorage.setItem(
        "usuarioLogado",
        JSON.stringify(usuario)
    );
}

function limparTexto(valor) {
    return String(valor || "").trim();
}

function validarCampos(nome, email, senha, confirmarSenha) {

    if (!nome || !email || !senha || !confirmarSenha) {
        alert("Preencha todos os campos.");
        return false;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não conferem.");
        return false;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres.");
        return false;
    }

    return true;
}

async function cadastrarUsuario(event) {

    event.preventDefault();

    const nome =
    limparTexto(document.getElementById("nome").value);

    const email =
    limparTexto(document.getElementById("email").value);

    const senha =
    document.getElementById("senha").value;

    const confirmarSenha =
    document.getElementById("confirmarSenha").value;

    if (!validarCampos(nome, email, senha, confirmarSenha)) {
        return;
    }

    if (cadastroBtn) {
        cadastroBtn.disabled = true;
        cadastroBtn.textContent = "Criando conta...";
    }

    try {

        const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            senha
        );

        const user =
        userCredential.user;

        await updateProfile(user, {
            displayName: nome
        });

        const usuarioSistema = {
            uid: user.uid,
            nome: nome,
            email: user.email,
            foto: "../assets/img/user.png",

            login: true,

            codigoFuncionario: "",
            tipoAcesso: "",
            cargos: [],
            cargoPrincipal: "",
            unidade: "",
            localId: "",
            codigoLocal: "",

            cadastroFuncionarioCompleto: false,
            cadastroLocalCompleto: false,

            criadoEm: new Date().toLocaleString("pt-BR")
        };

        salvarUsuarioLogado(usuarioSistema);

        alert("Conta criada com sucesso. Agora complete seu cadastro funcional.");

        window.location.href =
        "cadastro-funcionario.html";

    } catch (error) {

        console.log(
            "ERRO CADASTRO:",
            error.code,
            error.message
        );

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

    } finally {

        if (cadastroBtn) {
            cadastroBtn.disabled = false;
            cadastroBtn.textContent = "Criar Conta";
        }
    }
}

if (formCadastro) {
    formCadastro.addEventListener(
        "submit",
        cadastrarUsuario
    );
}