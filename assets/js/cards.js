function carregarCards(){

    const solicitacoes =
    JSON.parse(
    localStorage.getItem("solicitacoes")
    ) || [];

    const eventos =
    JSON.parse(
    localStorage.getItem("eventos")
    ) || [];

    const publicacoes =
    JSON.parse(
    localStorage.getItem("publicacoes")
    ) || [];

    const producoes =
    JSON.parse(
    localStorage.getItem("producoes")
    ) || [];

    document.getElementById(
    "solicitacoes-count"
    ).textContent =
    solicitacoes.length;

    document.getElementById(
    "coberturas-count"
    ).textContent =
    eventos.length;

    document.getElementById(
    "publicacoes-count"
    ).textContent =
    publicacoes.length;

    document.getElementById(
    "producoes-count"
    ).textContent =
    producoes.length;
}