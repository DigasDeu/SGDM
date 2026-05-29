function carregarCards() {

    const solicitacoes =
    JSON.parse(localStorage.getItem("solicitacoes")) || [];

    const eventos =
    JSON.parse(localStorage.getItem("eventos")) || [];

    const publicacoes =
    JSON.parse(localStorage.getItem("publicacoes")) || [];

    const producoes =
    JSON.parse(localStorage.getItem("producoes")) || [];

    const solicitacoesPendentes =
    solicitacoes.filter(item => item.status === "Pendente");

    const producoesAtivas =
    producoes.filter(item => item.status !== "Concluído");

    const publicacoesMes =
    publicacoes.filter(item => {

        if (!item.data) return true;

        const dataPublicacao = new Date(item.data);
        const hoje = new Date();

        return (
            dataPublicacao.getMonth() === hoje.getMonth() &&
            dataPublicacao.getFullYear() === hoje.getFullYear()
        );
    });

    const solicitacoesCount = document.getElementById("solicitacoes-count");
    const coberturasCount = document.getElementById("coberturas-count");
    const publicacoesCount = document.getElementById("publicacoes-count");
    const producoesCount = document.getElementById("producoes-count");

    if (solicitacoesCount) {
        solicitacoesCount.textContent = solicitacoesPendentes.length;
    }

    if (coberturasCount) {
        coberturasCount.textContent = eventos.length;
    }

    if (publicacoesCount) {
        publicacoesCount.textContent = publicacoesMes.length;
    }

    if (producoesCount) {
        producoesCount.textContent = producoesAtivas.length;
    }
}

document.addEventListener("DOMContentLoaded", carregarCards);