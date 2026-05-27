function carregarNotificacoes(){

    const notificacoes =
    document.getElementById(
    "notificacoesSistema"
    );

    notificacoes.innerHTML =

    `
    <div class="event-item">

        <strong>Sistema iniciado</strong>

        <p>
        Dashboard operacional funcionando.
        </p>

    </div>
    `;
}