const formFuncionario =
document.getElementById("formFuncionario");

const voltarBtn =
document.getElementById("voltarBtn");

function buscarLista(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function buscarUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || {};
}

function salvarUsuarioLogado(usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function gerarCodigoFuncionario() {

    const funcionarios =
    buscarLista("funcionariosSistema");

    const ano =
    new Date().getFullYear();

    const proximoNumero =
    funcionarios.length + 1;

    const numeroFormatado =
    String(proximoNumero).padStart(4, "0");

    return `SEMSA-${ano}-${numeroFormatado}`;
}

function preencherCodigoFuncionario() {

    const codigoFuncionario =
    document.getElementById("codigoFuncionario");

    if (!codigoFuncionario) return;

    if (!codigoFuncionario.value) {
        codigoFuncionario.value =
        gerarCodigoFuncionario();
    }
}

function preencherDadosUsuarioLogado() {

    const usuario =
    buscarUsuarioLogado();

    const nomeFuncionario =
    document.getElementById("nomeFuncionario");

    const emailFuncionario =
    document.getElementById("emailFuncionario");

    if (nomeFuncionario && usuario.nome) {
        nomeFuncionario.value = usuario.nome;
    }

    if (emailFuncionario && usuario.email) {
        emailFuncionario.value = usuario.email;
    }
}

function obterCargosSelecionados() {

    const checkboxes =
    document.querySelectorAll(
        'input[name="cargosFuncionario"]:checked'
    );

    return Array.from(checkboxes).map(
        checkbox => checkbox.value
    );
}

function gerarLocalVinculado(
    unidade,
    tipoUnidade
) {

    const locais =
    buscarLista("locaisSistema");

    const localExistente =
    locais.find(local =>
        local.nome &&
        local.nome.toLowerCase() === unidade.toLowerCase()
    );

    if (localExistente) {
        return localExistente;
    }

    const novoLocal = {
        id: Date.now(),
        nome: unidade,
        nomeLocal: unidade,
        tipo: tipoUnidade || "Unidade de Saúde",
        tipoRegistro: tipoUnidade || "Unidade de Saúde",
        classificacaoLocal: "Unidade base",
        zona: "Urbana",
        endereco: "",
        bairroComunidade: "",
        referencia: "",
        latitude: "",
        longitude: "",
        status: "Ativo",
        criadoEm: new Date().toLocaleString("pt-BR")
    };

    locais.push(novoLocal);

    salvarLista("locaisSistema", locais);

    return novoLocal;
}

function validarCargoPrincipal(cargos, cargoPrincipal) {

    if (!cargoPrincipal) return false;

    if (cargos.length === 0) return false;

    return cargos.includes(cargoPrincipal);
}

function salvarCadastroFuncionario(event) {

    event.preventDefault();

    const usuarioAtual =
    buscarUsuarioLogado();

    const codigoFuncionario =
    document.getElementById("codigoFuncionario").value.trim();

    const nome =
    document.getElementById("nomeFuncionario").value.trim();

    const email =
    document.getElementById("emailFuncionario").value.trim();

    const telefone =
    document.getElementById("telefoneFuncionario").value.trim();

    const matricula =
    document.getElementById("matriculaFuncionario").value.trim();

    const cargos =
    obterCargosSelecionados();

    const cargoPrincipal =
    document.getElementById("cargoPrincipal").value;

    const tipoAcesso =
    document.getElementById("tipoAcesso").value;

    const statusFuncionario =
    document.getElementById("statusFuncionario").value;

    const conselho =
    document.getElementById("conselhoProfissional").value;

    const numeroRegistro =
    document.getElementById("numeroRegistro").value.trim();

    const especialidade =
    document.getElementById("especialidade").value.trim();

    const responsavelTecnico =
    document.getElementById("responsavelTecnico").value;

    const unidade =
    document.getElementById("unidadeFuncionario").value;

    const tipoUnidade =
    document.getElementById("tipoUnidade").value;

    const observacoes =
    document.getElementById("observacoesFuncionario").value.trim();

    if (
        !codigoFuncionario ||
        !nome ||
        !email ||
        !telefone ||
        !cargoPrincipal ||
        !tipoAcesso ||
        !unidade
    ) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    if (cargos.length === 0) {
        alert("Selecione pelo menos um cargo ou função.");
        return;
    }

    if (!validarCargoPrincipal(cargos, cargoPrincipal)) {
        alert("O cargo principal precisa estar marcado na lista de cargos/funções.");
        return;
    }

    const funcionarios =
    buscarLista("funcionariosSistema");

    const codigoExiste =
    funcionarios.some(funcionario =>
        funcionario.codigoFuncionario === codigoFuncionario
    );

    if (codigoExiste) {
        alert("Este código institucional já existe. Atualize a página para gerar outro código.");
        return;
    }

    const emailExiste =
    funcionarios.some(funcionario =>
        funcionario.email &&
        funcionario.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExiste) {
        alert("Este e-mail já está vinculado a outro funcionário.");
        return;
    }

    const localVinculado =
    gerarLocalVinculado(
        unidade,
        tipoUnidade
    );

    const funcionario = {
        id: Date.now(),

        codigoFuncionario,

        nome,
        email,
        telefone,
        matricula,

        cargos,
        cargoPrincipal,

        tipoAcesso,
        statusFuncionario,

        identificacaoProfissional: {
            conselho,
            numeroRegistro,
            especialidade,
            responsavelTecnico:
            responsavelTecnico === "Sim"
        },

        unidade,
        tipoUnidade,
        localId: localVinculado.id,

        observacoes,

        cadastroFuncionarioCompleto: true,
        cadastroLocalCompleto: false,

        criadoEm: new Date().toLocaleString("pt-BR"),
        atualizadoEm: new Date().toLocaleString("pt-BR")
    };

    funcionarios.push(funcionario);

    salvarLista("funcionariosSistema", funcionarios);

    const usuarioAtualizado = {
        ...usuarioAtual,

        nome,
        email,
        telefone,

        codigoFuncionario,

        cargos,
        cargoPrincipal,

        tipoAcesso,
        statusFuncionario,

        unidade,
        tipoUnidade,
        localId: localVinculado.id,

        cadastroFuncionarioCompleto: true,
        cadastroLocalCompleto: false
    };

    salvarUsuarioLogado(usuarioAtualizado);

    alert(
        `Funcionário cadastrado com sucesso!\nCódigo: ${codigoFuncionario}`
    );

    window.location.href = "cadastro-local.html";
}

if (formFuncionario) {
    formFuncionario.addEventListener(
        "submit",
        salvarCadastroFuncionario
    );
}

if (voltarBtn) {
    voltarBtn.addEventListener("click", () => {
        window.location.href = "../dashboard.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    preencherCodigoFuncionario();
    preencherDadosUsuarioLogado();
});