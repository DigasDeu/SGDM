document.addEventListener("DOMContentLoaded", () => {

    carregarPerfilUsuario();

    carregarConfiguracoes();

    configurarEventos();

});

function carregarPerfilUsuario() {

    const usuario =
    JSON.parse(localStorage.getItem("usuarioLogado")) || {};

    const configuracoes =
    JSON.parse(localStorage.getItem("configuracoesSistema")) || {};

    const nomeConfig = document.getElementById("nomeConfig");
    const emailConfig = document.getElementById("emailConfig");
    const cargoConfig = document.getElementById("cargoConfig");

    const fotoPerfilConfig = document.getElementById("fotoPerfilConfig");
    const nomePerfilConfig = document.getElementById("nomePerfilConfig");
    const emailPerfilConfig = document.getElementById("emailPerfilConfig");

    if (nomeConfig) {
        nomeConfig.value = configuracoes.nome || usuario.nome || "";
    }

    if (emailConfig) {
        emailConfig.value = usuario.email || "";
    }

    if (cargoConfig) {
        cargoConfig.value = configuracoes.cargo || "";
    }

    if (fotoPerfilConfig) {
        fotoPerfilConfig.src =
        usuario.foto || "../assets/img/user.png";
    }

    if (nomePerfilConfig) {
        nomePerfilConfig.textContent =
        configuracoes.nome || usuario.nome || "Usuário";
    }

    if (emailPerfilConfig) {
        emailPerfilConfig.textContent =
        usuario.email || "email@usuario.com";
    }
}

function carregarConfiguracoes() {

    const config =
    JSON.parse(localStorage.getItem("configuracoesSistema")) || {};

    const modoEscuro =
    document.getElementById("modoEscuro");

    const notificacoesSolicitacoes =
    document.getElementById("notificacoesSolicitacoes");

    const notificacoesEventos =
    document.getElementById("notificacoesEventos");

    const notificacoesRelatorios =
    document.getElementById("notificacoesRelatorios");

    const coordenadorMidia =
    document.getElementById("coordenadorMidia");

    const secretarioMunicipal =
    document.getElementById("secretarioMunicipal");

    const responsavelCobertura =
    document.getElementById("responsavelCobertura");

    if (modoEscuro) {
        modoEscuro.checked = config.modoEscuro || false;
    }

    if (notificacoesSolicitacoes) {
        notificacoesSolicitacoes.checked =
        config.notificacoesSolicitacoes !== false;
    }

    if (notificacoesEventos) {
        notificacoesEventos.checked =
        config.notificacoesEventos !== false;
    }

    if (notificacoesRelatorios) {
        notificacoesRelatorios.checked =
        config.notificacoesRelatorios !== false;
    }

    if (coordenadorMidia) {
        coordenadorMidia.value =
        config.coordenadorMidia || "";
    }

    if (secretarioMunicipal) {
        secretarioMunicipal.value =
        config.secretarioMunicipal || "";
    }

    if (responsavelCobertura) {
        responsavelCobertura.value =
        config.responsavelCobertura || "";
    }

    aplicarModoEscuro(config.modoEscuro);
}

function configurarEventos() {

    const salvarPerfil =
    document.getElementById("salvarPerfil");

    const salvarRelatorioConfig =
    document.getElementById("salvarRelatorioConfig");

    const modoEscuro =
    document.getElementById("modoEscuro");

    if (salvarPerfil) {

        salvarPerfil.addEventListener("click", () => {

            const configAtual =
            JSON.parse(localStorage.getItem("configuracoesSistema")) || {};

            const nome =
            document.getElementById("nomeConfig").value;

            const cargo =
            document.getElementById("cargoConfig").value;

            const novaConfig = {
                ...configAtual,
                nome,
                cargo
            };

            localStorage.setItem(
                "configuracoesSistema",
                JSON.stringify(novaConfig)
            );

            const usuario =
            JSON.parse(localStorage.getItem("usuarioLogado")) || {};

            usuario.nome = nome || usuario.nome;

            localStorage.setItem(
                "usuarioLogado",
                JSON.stringify(usuario)
            );

            alert("Perfil salvo com sucesso.");

            carregarPerfilUsuario();
        });
    }

    if (salvarRelatorioConfig) {

        salvarRelatorioConfig.addEventListener("click", () => {

            const configAtual =
            JSON.parse(localStorage.getItem("configuracoesSistema")) || {};

            const novaConfig = {
                ...configAtual,

                coordenadorMidia:
                document.getElementById("coordenadorMidia").value,

                secretarioMunicipal:
                document.getElementById("secretarioMunicipal").value,

                responsavelCobertura:
                document.getElementById("responsavelCobertura").value
            };

            localStorage.setItem(
                "configuracoesSistema",
                JSON.stringify(novaConfig)
            );

            alert("Assinaturas dos relatórios salvas com sucesso.");
        });
    }

    if (modoEscuro) {

        modoEscuro.addEventListener("change", () => {

            const configAtual =
            JSON.parse(localStorage.getItem("configuracoesSistema")) || {};

            configAtual.modoEscuro = modoEscuro.checked;

            localStorage.setItem(
                "configuracoesSistema",
                JSON.stringify(configAtual)
            );

            aplicarModoEscuro(modoEscuro.checked);
        });
    }

    salvarPreferenciasNotificacao();
}

function salvarPreferenciasNotificacao() {

    const campos = [
        "notificacoesSolicitacoes",
        "notificacoesEventos",
        "notificacoesRelatorios"
    ];

    campos.forEach(campo => {

        const elemento =
        document.getElementById(campo);

        if (!elemento) return;

        elemento.addEventListener("change", () => {

            const configAtual =
            JSON.parse(localStorage.getItem("configuracoesSistema")) || {};

            configAtual[campo] = elemento.checked;

            localStorage.setItem(
                "configuracoesSistema",
                JSON.stringify(configAtual)
            );
        });
    });
}

function aplicarModoEscuro(ativo) {

    if (ativo) {
        document.body.classList.add("dark-mode");
    }
    else {
        document.body.classList.remove("dark-mode");
    }
}