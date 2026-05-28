//
// VERIFICAR LOGIN
//

const usuario =
JSON.parse(
localStorage.getItem(
"usuarioLogado"
)
);

//
// BLOQUEAR ACESSO
//

if(
    !usuario ||
    usuario.login !== true
){

    window.location.href =
    "../login.html";
}

//
// CARREGAR USUÁRIO
//

function carregarUsuario(){

    //
    // FOTO
    //

    const foto =
    document.querySelector(
    ".sidebar-header img"
    );

    if(foto){

        foto.src =
        "../" + usuario.foto;
    }

    //
    // NOME
    //

    const nome =
    document.querySelector(
    ".sidebar-header h3"
    );

    if(nome){

        nome.textContent =
        usuario.nome;
    }

    //
    // EMAIL
    //

    const email =
    document.querySelector(
    ".sidebar-header p"
    );

    if(email){

        email.textContent =
        usuario.email;
    }
}

//
// LOGOUT
//

function logout(){

    localStorage.removeItem(
    "usuarioLogado"
    );

    window.location.href =
    "../login.html";
}

//
// INICIAR
//

document.addEventListener(
"DOMContentLoaded",
carregarUsuario
);