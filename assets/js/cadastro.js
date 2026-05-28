document
.getElementById(
"cadastroBtn"
)
.addEventListener(
"click",
()=>{

    const nome =
    document
    .getElementById(
    "nome"
    ).value;

    const email =
    document
    .getElementById(
    "email"
    ).value;

    const senha =
    document
    .getElementById(
    "senha"
    ).value;

    //
    // VALIDAÇÃO
    //

    if(
        nome === "" ||
        email === "" ||
        senha === ""
    ){

        alert(
        "Preencha todos os campos."
        );

        return;
    }

    //
    // PEGAR USUÁRIOS
    //

    const usuarios =
    JSON.parse(
        localStorage.getItem(
        "usuarios"
        )
    ) || [];

    //
    // VERIFICAR EMAIL
    //

    const existe =
    usuarios.find(
        usuario =>
        usuario.email === email
    );

    if(existe){

        alert(
        "Este email já está cadastrado."
        );

        return;
    }

    //
    // NOVO USUÁRIO
    //

    const novoUsuario = {

        nome:nome,

        email:email,

        senha:senha,

        foto:"assets/img/user.png"
    };

    //
    // SALVAR
    //

    usuarios.push(
    novoUsuario
    );

    localStorage.setItem(
    "usuarios",
    JSON.stringify(
    usuarios
    )
    );

    //
    // LOGIN AUTOMÁTICO
    //

    localStorage.setItem(
    "usuarioLogado",

    JSON.stringify({

        nome:nome,

        email:email,

        foto:"assets/img/user.png",

        login:true
    })
    );

    //
    // REDIRECIONAR
    //

    window.location.href =
    "../dashboard.html";
});